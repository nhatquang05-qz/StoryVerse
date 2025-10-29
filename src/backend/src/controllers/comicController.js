const { getConnection } = require('../db/connection');
const cloudinary = require('../config/CloudinaryConfig');

const getComics = async (req, res) => {
    try {
        const connection = getConnection();
        const [rows] = await connection.execute(`
            SELECT c.id, c.title, c.author, c.coverImageUrl, c.status, c.isDigital, c.price, c.viewCount, c.updatedAt, GROUP_CONCAT(g.name SEPARATOR ', ') AS genres
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

        const [comicRows] = await connection.execute(`
            SELECT c.*, GROUP_CONCAT(g.name SEPARATOR ', ') AS genres
            FROM comics c
            LEFT JOIN comic_genres cg ON c.id = cg.comicId
            LEFT JOIN genres g ON cg.genreId = g.id
            WHERE c.id = ?
            GROUP BY c.id
        `, [comicId]);

        if (comicRows.length === 0) return res.status(404).json({ error: 'Comic not found' });

        const [chapterRows] = await connection.execute(
            'SELECT id, chapterNumber, title, price, createdAt FROM chapters WHERE comicId = ? ORDER BY chapterNumber ASC',
            [comicId]
        );

        const comicData = comicRows[0];
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
        
        // *** BẮT ĐẦU SỬA LỖI ***
        // Câu query cơ bản (luôn có 2 placeholder)
        let sqlQuery = `
            SELECT c.id, c.title, c.author, c.coverImageUrl, c.status, c.isDigital, c.price, c.viewCount, c.updatedAt, GROUP_CONCAT(g.name SEPARATOR ', ') AS genres
            FROM comics c
            LEFT JOIN comic_genres cg ON c.id = cg.comicId
            LEFT JOIN genres g ON cg.genreId = g.id
            WHERE c.title LIKE ? OR c.author LIKE ?
            GROUP BY c.id
            ORDER BY c.updatedAt DESC
        `;

        // Mảng params (luôn có 2 giá trị)
        const params = [searchQuery, searchQuery];

        // Nếu có limit, nối thẳng chuỗi LIMIT vào.
        // Điều này an toàn VÌ chúng ta đã dùng parseInt() để đảm bảo nó là SỐ.
        if (limit && !isNaN(parseInt(limit))) {
            sqlQuery += ` LIMIT ${parseInt(limit)}`; 
            // Không .push() vào mảng params nữa
        }
        // *** KẾT THÚC SỬA LỖI ***

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

module.exports = {
    getComics,
    getComicById,
    addComic,
    getChapterContent,
    addChapter,
    searchComics
};