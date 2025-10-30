const { getConnection } = require('../db/connection');
const cloudinary = require('../config/CloudinaryConfig');

const getComics = async (req, res) => {
    try {
        const connection = getConnection();
        const [rows] = await connection.execute(`
            SELECT c.id, c.title, c.author, c.coverImageUrl, c.status, c.isDigital, c.price, 
                   (IFNULL(c.viewCount, 0) + (SELECT SUM(IFNULL(ch.viewCount, 0)) FROM chapters ch WHERE ch.comicId = c.id)) AS viewCount, 
                   (SELECT AVG(r.rating) FROM reviews r WHERE r.comicId = c.id) AS averageRating,
                   c.updatedAt, GROUP_CONCAT(g.name SEPARATOR ', ') AS genres
            FROM comics c
            LEFT JOIN comic_genres cg ON c.id = cg.comicId
            LEFT JOIN genres g ON cg.genreId = g.id
            GROUP BY c.id
            ORDER BY c.updatedAt DESC
            LIMIT 50
        `);
        res.json(rows);
    } catch (error) {
        console.error("Get comics error:", error);
        res.status(500).json({ error: 'Failed to fetch comics' });
    }
};

const getComicById = async (req, res) => {
    try {
        const comicId = req.params.id;
        if (!comicId) return res.status(400).json({ error: 'Comic ID is required.' });

        const connection = getConnection();

        await connection.execute(
            'UPDATE comics SET viewCount = IFNULL(viewCount, 0) + 1 WHERE id = ?',
            [comicId]
        );

        const [comicRows] = await connection.execute(`
            SELECT c.*, GROUP_CONCAT(g.name SEPARATOR ', ') AS genres,
                   (SELECT SUM(IFNULL(ch.viewCount, 0)) FROM chapters ch WHERE ch.comicId = c.id) AS totalChapterViews,
                   (SELECT AVG(r.rating) FROM reviews r WHERE r.comicId = c.id) AS averageRating
            FROM comics c
            LEFT JOIN comic_genres cg ON c.id = cg.comicId
            LEFT JOIN genres g ON cg.genreId = g.id
            WHERE c.id = ?
            GROUP BY c.id
        `, [comicId]);

        if (comicRows.length === 0) return res.status(404).json({ error: 'Comic not found' });

        const [chapterRows] = await connection.execute(
            'SELECT id, chapterNumber, title, price, createdAt, IFNULL(viewCount, 0) AS viewCount FROM chapters WHERE comicId = ? ORDER BY chapterNumber ASC',
            [comicId]
        );

        const comicData = comicRows[0];
        
        const totalChapterViews = parseInt(comicData.totalChapterViews) || 0;
        comicData.viewCount = (parseInt(comicData.viewCount) || 0) + totalChapterViews; 
        comicData.averageRating = parseFloat(comicData.averageRating) || 0;
        delete comicData.totalChapterViews;

        comicData.chapters = chapterRows;
        res.json(comicData);
    } catch (error) {
        console.error("Get comic by ID error:", error);
        res.status(500).json({ error: 'Failed to fetch comic details' });
    }
};

const addComic = async (req, res) => {
    const { title, author, description, coverImageUrl, status, isDigital, price, genreIds } = req.body;
    if (!title || !coverImageUrl) return res.status(400).json({ error: 'Title and Cover Image URL are required.' });

    const connection = getConnection();
    try {
        await connection.beginTransaction();
        const [comicResult] = await connection.execute(
            'INSERT INTO comics (title, author, description, coverImageUrl, status, isDigital, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, author || null, description || null, coverImageUrl, status || 'Ongoing', isDigital !== undefined ? isDigital : true, price || 0]
        );
        const newComicId = comicResult.insertId;

        if (Array.isArray(genreIds) && genreIds.length > 0) {
            const genreValues = genreIds.map(genreId => [newComicId, genreId]);
            await connection.query('INSERT INTO comic_genres (comicId, genreId) VALUES ?', [genreValues]);
        }
        await connection.commit();
        res.status(201).json({ message: 'Comic added successfully', comicId: newComicId });
    } catch (error) {
        await connection.rollback();
        console.error("Add comic error:", error);
        res.status(500).json({ error: 'Failed to add comic' });
    }
};

const searchComics = async (req, res) => {
    try {
        const { q, limit } = req.query; 

        if (!q) {
            return res.json([]); 
        }

        const connection = getConnection();
        
        const searchQuery = `%${q}%`; 
        
        let sqlQuery = `
            SELECT c.id, c.title, c.author, c.coverImageUrl, c.status, c.isDigital, c.price, 
                   (IFNULL(c.viewCount, 0) + (SELECT SUM(IFNULL(ch.viewCount, 0)) FROM chapters ch WHERE ch.comicId = c.id)) AS viewCount, 
                   (SELECT AVG(r.rating) FROM reviews r WHERE r.comicId = c.id) AS averageRating,
                   c.updatedAt, GROUP_CONCAT(g.name SEPARATOR ', ') AS genres
            FROM comics c
            LEFT JOIN comic_genres cg ON c.id = cg.comicId
            LEFT JOIN genres g ON cg.genreId = g.id
            WHERE c.title LIKE ? OR c.author LIKE ?
            GROUP BY c.id
            ORDER BY c.updatedAt DESC
        `;

        const params = [searchQuery, searchQuery];

        if (limit && !isNaN(parseInt(limit))) {
            sqlQuery += ` LIMIT ${parseInt(limit)}`; 
        }

        const [rows] = await connection.execute(sqlQuery, params);
        
        res.json(rows);

    } catch (error) {
        console.error("Search comics error:", error);
        res.status(500).json({ error: 'Failed to search comics' });
    }
};

const getChapterContent = async (req, res) => {
     const { comicId, chapterNumber } = req.params;
     const userId = req.userId; 
     if (!comicId || !chapterNumber) return res.status(400).json({ error: 'Comic ID and Chapter Number are required.' });

     const connection = getConnection();
    try {
        await connection.execute(
            'UPDATE chapters SET viewCount = IFNULL(viewCount, 0) + 1 WHERE comicId = ? AND chapterNumber = ?',
            [comicId, chapterNumber]
        );
        
        const [chapterRows] = await connection.execute(
            'SELECT id, price, contentUrls FROM chapters WHERE comicId = ? AND chapterNumber = ?',
            [comicId, chapterNumber]
        );
        if (chapterRows.length === 0) return res.status(404).json({ error: 'Chapter not found' });

        const chapter = chapterRows[0];
        
        let contentUrlsArray = [];
        const rawContent = chapter.contentUrls;

        if (Array.isArray(rawContent)) {
            contentUrlsArray = rawContent;
        } else if (rawContent && typeof rawContent === 'string') {
            try {
                contentUrlsArray = JSON.parse(rawContent);
            } catch (e1) {
                console.warn("Lỗi parse JSON (lần 1), thử thay thế single quotes:", rawContent);
                try {
                    const correctedJson = rawContent.replace(/'/g, '"');
                    contentUrlsArray = JSON.parse(correctedJson);
                } catch (e2) {
                    console.error("Lỗi parse JSON (lần 2), thử xử lý như string đơn lẻ:", e2.message);
                    if (rawContent.trim().startsWith('http')) {
                        contentUrlsArray = [rawContent.trim()];
                    } else {
                        console.error("Không thể phân tích contentUrls:", rawContent);
                        contentUrlsArray = []; 
                    }
                }
            }
        }
        
        if (!Array.isArray(contentUrlsArray)) {
            console.warn("Dữ liệu contentUrls sau khi xử lý không phải là mảng, ép về mảng rỗng.");
            contentUrlsArray = [];
        }

        res.json({
            chapterId: chapter.id,
            comicId: parseInt(comicId),
            chapterNumber: parseFloat(chapterNumber),
            contentUrls: contentUrlsArray
        });
    } catch (error) {
        console.error("Get chapter content error:", error);
        res.status(500).json({ error: 'Failed to fetch chapter content' });
    }
};

const addChapter = async (req, res) => {
    const { comicId } = req.params;
    const { chapterNumber, title, contentUrls, price } = req.body;

    if (!comicId) return res.status(400).json({ error: 'Comic ID is required.' });
    if (!chapterNumber || !Array.isArray(contentUrls) || contentUrls.length === 0) {
        return res.status(400).json({ error: 'Chapter number and content URLs (array) are required.' });
    }

    const connection = getConnection();
    try {
        const [comicRows] = await connection.execute('SELECT id FROM comics WHERE id = ?', [comicId]);
        if (comicRows.length === 0) return res.status(404).json({ error: 'Comic not found.' });

        await connection.execute(
            'INSERT INTO chapters (comicId, chapterNumber, title, contentUrls, price) VALUES (?, ?, ?, ?, ?)',
            [comicId, chapterNumber, title || null, JSON.stringify(contentUrls), price !== undefined ? price : 0]
        );
         await connection.execute(
             'UPDATE comics SET updatedAt = NOW() WHERE id = ?',
             [comicId]
         );
        res.status(201).json({ message: 'Chapter added successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: `Chapter number ${chapterNumber} already exists.` });
        }
        console.error("Add chapter error:", error);
        res.status(500).json({ error: 'Failed to add chapter' });
    }
};

const getReviews = async (req, res) => {
    try {
        const { comicId } = req.params;
        const connection = getConnection();
        const [rows] = await connection.execute(
            `SELECT r.id, r.userId, r.comicId, r.rating, r.comment, r.createdAt, u.fullName, u.avatarUrl 
             FROM reviews r
             JOIN users u ON r.userId = u.id
             WHERE r.comicId = ?
             ORDER BY r.createdAt DESC`,
            [comicId]
        );
        res.json(rows);
    } catch (error) {
        console.error("Get reviews error:", error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};

const addReview = async (req, res) => {
    try {
        const { comicId } = req.params;
        const { userId } = req;
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating (1-5) is required.' });
        }
        if (!comment || comment.trim().length < 3) {
            return res.status(400).json({ error: 'Comment (min 3 chars) is required.' });
        }

        const connection = getConnection();
        
        const [existingReview] = await connection.execute(
            'SELECT id FROM reviews WHERE comicId = ? AND userId = ?',
            [comicId, userId]
        );

        let result;
        if (existingReview.length > 0) {
            // User has already reviewed, update it
            const [updateResult] = await connection.execute(
                'UPDATE reviews SET rating = ?, comment = ?, updatedAt = NOW() WHERE id = ?',
                [rating, comment, existingReview[0].id]
            );
            result = { insertId: existingReview[0].id }; 
        } else {
            // New review
            const [insertResult] = await connection.execute(
                'INSERT INTO reviews (comicId, userId, rating, comment) VALUES (?, ?, ?, ?)',
                [comicId, userId, rating, comment]
            );
            result = insertResult;
        }

        const [newReviewRows] = await connection.execute(
            `SELECT r.id, r.userId, r.comicId, r.rating, r.comment, r.createdAt, u.fullName, u.avatarUrl 
             FROM reviews r
             JOIN users u ON r.userId = u.id
             WHERE r.id = ?`,
            [result.insertId]
        );

        res.status(201).json(newReviewRows[0]);
    } catch (error) {
        console.error("Add review error:", error);
        res.status(500).json({ error: 'Failed to add review' });
    }
};

const getTopRatedComics = async (req, res) => {
    try {
        const connection = getConnection();
        
        const [rows] = await connection.execute(`
            SELECT 
                c.id, 
                c.title, 
                c.coverImageUrl, 
                (IFNULL(c.viewCount, 0) + (SELECT SUM(IFNULL(ch.viewCount, 0)) FROM chapters ch WHERE ch.comicId = c.id)) AS totalViewCount, 
                AVG(r.rating) AS averageRating
            FROM comics c
            LEFT JOIN reviews r ON c.id = r.comicId
            WHERE c.isDigital = 1
            GROUP BY c.id
            ORDER BY averageRating DESC, totalViewCount DESC
            LIMIT 5
        `);
        
        res.json(rows);
    } catch (error) {
        console.error("Get top rated comics error:", error);
        res.status(500).json({ error: 'Failed to fetch top rated comics' });
    }
};

module.exports = {
    getComics,
    getComicById,
    addComic,
    getChapterContent,
    addChapter,
    searchComics,
    getReviews,
    addReview,
    getTopRatedComics
};