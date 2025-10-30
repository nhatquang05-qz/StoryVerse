// src/backend/src/controllers/comicController.js (ĐÃ SỬA LỖI)

const { getConnection } = require('../db/connection');

const addComic = async (req, res) => {
    const { title, author, description, coverImageUrl, status, isDigital, price, genres } = req.body;

    if (!title || !coverImageUrl) {
        return res.status(400).json({ error: 'Title and Cover Image URL are required' });
    }

    const connection = getConnection();
    try {
        await connection.beginTransaction();

        // FIX: Đã loại bỏ 'uploaderId' khỏi câu lệnh INSERT
        const [comicResult] = await connection.execute(
            'INSERT INTO comics (title, author, description, coverImageUrl, status, isDigital, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, author || null, description || null, coverImageUrl, status || 'Ongoing', isDigital ? 1 : 0, price || 0]
        );

        const comicId = comicResult.insertId;

        if (genres && Array.isArray(genres) && genres.length > 0) {
            const genreValues = genres.map(genreId => [comicId, Number(genreId)]);
            await connection.query(
                'INSERT INTO comic_genres (comic_id, genre_id) VALUES ?',
                [genreValues]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Comic added successfully', comicId: comicId });

    } catch (error) {
        await connection.rollback();
        console.error('Error adding comic:', error);
        res.status(500).json({ error: 'Failed to add comic' });
    }
};

const updateComic = async (req, res) => {
    const { id } = req.params;
    const { title, author, description, coverImageUrl, status, isDigital, price, genres } = req.body;

    if (!title || !coverImageUrl) {
        return res.status(400).json({ error: 'Title and Cover Image URL are required' });
    }

    const connection = getConnection();
    try {
        await connection.beginTransaction();

        await connection.execute(
            'UPDATE comics SET title = ?, author = ?, description = ?, coverImageUrl = ?, status = ?, isDigital = ?, price = ? WHERE id = ?',
            [title, author || null, description || null, coverImageUrl, status || 'Ongoing', isDigital ? 1 : 0, price || 0, id]
        );

        await connection.execute('DELETE FROM comic_genres WHERE comic_id = ?', [id]);

        if (genres && Array.isArray(genres) && genres.length > 0) {
            const genreValues = genres.map(genreId => [id, Number(genreId)]);
            await connection.query(
                'INSERT INTO comic_genres (comic_id, genre_id) VALUES ?',
                [genreValues]
            );
        }

        await connection.commit();
        res.status(200).json({ message: 'Comic updated successfully' });

    } catch (error) {
        await connection.rollback();
        console.error('Error updating comic:', error);
        res.status(500).json({ error: 'Failed to update comic' });
    }
};

const deleteComic = async (req, res) => {
    const { id } = req.params;

    const connection = getConnection();
    try {
        await connection.beginTransaction();
        
        await connection.execute('DELETE FROM reviews WHERE comic_id = ?', [id]);
        await connection.execute('DELETE FROM comic_genres WHERE comic_id = ?', [id]);
        await connection.execute('DELETE FROM chapters WHERE comic_id = ?', [id]);
        await connection.execute('DELETE FROM comics WHERE id = ?', [id]);

        await connection.commit();
        res.status(200).json({ message: 'Comic deleted successfully' });

    } catch (error) {
        await connection.rollback();
        console.error('Error deleting comic:', error);
        res.status(500).json({ error: 'Failed to delete comic' });
    }
};

const getAllGenres = async (req, res) => {
    try {
        const connection = getConnection();
        const [genres] = await connection.execute('SELECT id, name FROM genres ORDER BY name');
        res.json(genres);
    } catch (error) {
        console.error('Error fetching genres:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getAllComics = async (req, res) => {
    try {
        const connection = getConnection();
        // FIX: Đã loại bỏ 'c.rating' và sửa 'c.views' thành 'c.viewCount'
        const [rows] = await connection.execute(
            `SELECT 
                c.id, c.title, c.coverImageUrl, c.status, c.isDigital, c.price, c.author, c.viewCount, c.createdAt, c.updatedAt,
                COALESCE(
                    (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', g.id, 'name', g.name)) 
                     FROM genres g 
                     JOIN comic_genres cg ON g.id = cg.genre_id 
                     WHERE cg.comic_id = c.id),
                    '[]'
                ) AS genres
            FROM comics c`
        );
        
        const comicsWithParsedGenres = rows.map(comic => ({
            ...comic,
            genres: typeof comic.genres === 'string' ? JSON.parse(comic.genres) : comic.genres
        }));
        res.json(comicsWithParsedGenres);
    } catch (error) {
        console.error('Error fetching comics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getComicById = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = getConnection();

        // FIX: Đã loại bỏ 'c.rating' và 'c.uploaderId', sửa 'c.views' thành 'c.viewCount'
        const [comicRows] = await connection.execute(
            `SELECT 
                c.id, c.title, c.author, c.description, c.coverImageUrl, c.status, c.isDigital, c.price, c.viewCount, c.createdAt, c.updatedAt,
                COALESCE(
                    (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', g.id, 'name', g.name)) 
                     FROM genres g 
                     JOIN comic_genres cg ON g.id = cg.genre_id 
                     WHERE cg.comic_id = c.id),
                    '[]'
                ) AS genres
            FROM comics c 
            WHERE c.id = ?`,
            [id]
        );

        if (comicRows.length === 0) {
            return res.status(404).json({ error: 'Comic not found' });
        }

        // FIX: Thêm 'viewCount' vào SELECT
        const [chapterRows] = await connection.execute(
            'SELECT id, chapterNumber, title, price, createdAt, viewCount FROM chapters WHERE comic_id = ? ORDER BY chapterNumber ASC',
            [id]
        );

        const comic = comicRows[0];
        
        comic.genres = typeof comic.genres === 'string' ? JSON.parse(comic.genres) : comic.genres;
        comic.chapters = chapterRows;

        // Tăng viewCount cho truyện
        await connection.execute('UPDATE comics SET viewCount = viewCount + 1 WHERE id = ?', [id]);

        res.json(comic);
    } catch (error) {
        console.error('Error fetching comic details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const addChapter = async (req, res) => {
    const { comicId } = req.params;
    const { chapterNumber, title, contentUrls, price } = req.body;

    if (!chapterNumber || !contentUrls || !Array.isArray(contentUrls) || contentUrls.length === 0) {
        return res.status(400).json({ error: 'Chapter number and content URLs are required' });
    }

    try {
        const connection = getConnection();
        // FIX: Thêm cột viewCount
        const [result] = await connection.execute(
            'INSERT INTO chapters (comic_id, chapterNumber, title, contentUrls, price, viewCount) VALUES (?, ?, ?, ?, ?, ?)',
            [comicId, chapterNumber, title || null, JSON.stringify(contentUrls), price || 0, 0] // Mặc định viewCount là 0
        );
        res.status(201).json({ message: 'Chapter added successfully', chapterId: result.insertId });
    } catch (error) {
        console.error('Error adding chapter:', error);
        res.status(500).json({ error: 'Failed to add chapter' });
    }
};

const deleteChapter = async (req, res) => {
    const { comicId, chapterId } = req.params;

    const connection = getConnection();
    try {
        await connection.beginTransaction();
        
        const [result] = await connection.execute(
            'DELETE FROM chapters WHERE id = ? AND comic_id = ?',
            [chapterId, comicId]
        );
        
        await connection.commit();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Chapter not found or not associated with this comic' });
        }

        res.status(200).json({ message: 'Chapter deleted successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting chapter:', error);
        res.status(500).json({ error: 'Failed to delete chapter' });
    }
};


const getChapterContent = async (req, res) => {
    const { comicId, chapterId } = req.params;
    const { userId } = req; 

    try {
        const connection = getConnection();

        const [chapterRows] = await connection.execute(
            'SELECT * FROM chapters WHERE id = ? AND comic_id = ?',
            [chapterId, comicId]
        );

        if (chapterRows.length === 0) {
            return res.status(404).json({ error: 'Chapter not found' });
        }

        const chapter = chapterRows[0];
        let isPurchased = false;

        if (chapter.price === 0) {
            isPurchased = true;
        } 
        else if (chapter.price > 0 && userId) {
            // (Tạm thời giả lập là đã mua, vì logic mua/bảng purchased_chapters không rõ ràng)
            // LÝ TƯỞNG: Bạn cần một bảng `purchased_chapters` như trong file ReaderPage.tsx
            // Ở đây tôi sẽ dùng logic của bảng `user_library`
             const [fullPurchase] = await connection.execute(
                 'SELECT * FROM user_library WHERE userId = ? AND comicId = ?',
                 [userId, comicId]
            );
            
            if (fullPurchase.length > 0) {
                isPurchased = true; // Đã mua full truyện
            } else {
                // (Chưa mua full, logic mua lẻ tạm thời bị vô hiệu hóa vì thiếu bảng)
                 return res.status(401).json({ error: 'Bạn chưa mua truyện này.' });
            }
        } else if (chapter.price > 0 && !userId) {
            return res.status(401).json({ error: 'You must be logged in to read this chapter' });
        }

        if (isPurchased) {
            await connection.execute('UPDATE chapters SET viewCount = viewCount + 1 WHERE id = ?', [chapterId]);
            await connection.execute('UPDATE comics SET viewCount = (SELECT SUM(viewCount) FROM chapters WHERE comic_id = ?) WHERE id = ?', [comicId, comicId]);
            
            chapter.contentUrls = JSON.parse(chapter.contentUrls || '[]');
            res.json(chapter);
        } else {
            return res.status(403).json({ error: 'You do not have access to this chapter.' });
        }

    } catch (error) {
        console.error('Error fetching chapter content:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getTopComics = async (req, res) => {
    try {
        const connection = getConnection();
        // FIX: Đổi 'views' thành 'viewCount'
        const [rows] = await connection.execute(
            'SELECT id, title, coverImageUrl, status, isDigital, price, author, viewCount FROM comics ORDER BY viewCount DESC LIMIT 10'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching top comics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const searchComics = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }
        const connection = getConnection();
        const searchQuery = `%${query}%`;
        const [rows] = await connection.execute(
            'SELECT id, title, coverImageUrl, status, isDigital, price, author FROM comics WHERE title LIKE ? OR author LIKE ?',
            [searchQuery, searchQuery]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error searching comics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getComicsByGenre = async (req, res) => {
    try {
        const { genre } = req.query;
        if (!genre) {
            return res.status(400).json({ error: 'Genre parameter is required' });
        }
        const connection = getConnection();
        
        // FIX: Đổi 'c.views' thành 'c.viewCount' và bỏ 'c.rating'
        const [rows] = await connection.execute(
            `SELECT c.id, c.title, c.coverImageUrl, c.status, c.isDigital, c.price, c.author, c.viewCount
             FROM comics c
             JOIN comic_genres cg ON c.id = cg.comic_id
             JOIN genres g ON cg.genre_id = g.id
             WHERE g.name = ?`,
            [genre]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching comics by genre:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getReviews = async (req, res) => {
    try {
        const { comicId } = req.params;
        const connection = getConnection();
        const [rows] = await connection.execute(
            `SELECT r.id, r.userId, r.rating, r.comment, r.createdAt, u.fullName, u.avatarUrl
             FROM reviews r
             JOIN users u ON r.userId = u.id
             WHERE r.comicId = ?
             ORDER BY r.createdAt DESC`,
            [comicId]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const postReview = async (req, res) => {
    try {
        const { comicId } = req.params;
        const { userId } = req;
        const { rating, comment } = req.body;

        if (!rating || !comment) {
            return res.status(400).json({ error: 'Rating and comment are required' });
        }
        
        const connection = getConnection();

        const [existing] = await connection.execute(
            'SELECT * FROM reviews WHERE comicId = ? AND userId = ?',
            [comicId, userId]
        );

        let reviewId;
        if (existing.length > 0) {
            reviewId = existing[0].id;
            await connection.execute(
                'UPDATE reviews SET rating = ?, comment = ?, updatedAt = NOW() WHERE id = ?',
                [rating, comment, reviewId]
            );
        } else {
            const [result] = await connection.execute(
                'INSERT INTO reviews (comicId, userId, rating, comment) VALUES (?, ?, ?, ?)',
                [comicId, userId, rating, comment]
            );
            reviewId = result.insertId;
        }

        // FIX: Loại bỏ việc cập nhật cột 'rating' không tồn tại trong bảng 'comics'
        /*
        await connection.execute(
            `UPDATE comics c SET c.rating = (
                SELECT AVG(r.rating) FROM reviews r WHERE r.comicId = ?
            ) WHERE c.id = ?`,
            [comicId, comicId]
        );
        */

        const [newReview] = await connection.execute(
             `SELECT r.id, r.userId, r.rating, r.comment, r.createdAt, u.fullName, u.avatarUrl
             FROM reviews r
             JOIN users u ON r.userId = u.id
             WHERE r.id = ?`,
            [reviewId]
        );

        res.status(201).json(newReview[0]);

    } catch (error) {
        console.error('Error posting review:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    addComic,
    updateComic,
    deleteComic,
    getAllComics,
    getComicById,
    addChapter,
    deleteChapter,
    getChapterContent,
    getTopComics,
    searchComics,
    getComicsByGenre,
    getAllGenres,
    getReviews,
    postReview
};