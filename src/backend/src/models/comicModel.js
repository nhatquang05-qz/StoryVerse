const { getConnection } = require('../db/connection');

// --- GENRE OPERATIONS ---
const getAllGenresRaw = async () => {
    const connection = getConnection();
    const [rows] = await connection.execute('SELECT id, name FROM genres ORDER BY name');
    return rows;
};

// --- COMIC CRUD OPERATIONS ---
const createComicRaw = async (title, author, description, coverImageUrl, status, isDigital, price) => {
    const connection = getConnection();
    const [result] = await connection.execute(
        'INSERT INTO comics (title, author, description, coverImageUrl, status, isDigital, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [title, author || null, description || null, coverImageUrl, status || 'Ongoing', isDigital ? 1 : 0, price || 0]
    );
    return result.insertId;
};

const updateComicRaw = async (id, title, author, description, coverImageUrl, status, isDigital, price) => {
    const connection = getConnection();
    await connection.execute(
        'UPDATE comics SET title = ?, author = ?, description = ?, coverImageUrl = ?, status = ?, isDigital = ?, price = ? WHERE id = ?',
        [title, author || null, description || null, coverImageUrl, status || 'Ongoing', isDigital ? 1 : 0, price || 0, id]
    );
};

const deleteComicRaw = async (id) => {
    const connection = getConnection();
    
    // Xóa khỏi bảng stats
    await connection.execute('DELETE FROM daily_comic_stats WHERE comic_id = ?', [id]);
    
    // (Code cũ)
    await connection.execute('DELETE FROM reviews WHERE comicId = ?', [id]);
    await connection.execute('DELETE FROM comic_genres WHERE comicId = ?', [id]);
    await connection.execute('DELETE FROM chapters WHERE comicId = ?', [id]);
    const [result] = await connection.execute('DELETE FROM comics WHERE id = ?', [id]);
    return result.affectedRows;
};

// --- COMIC GENRE OPERATIONS ---
const deleteComicGenresRaw = async (comicId) => {
    const connection = getConnection();
    await connection.execute('DELETE FROM comic_genres WHERE comicId = ?', [comicId]);
};

const insertComicGenresRaw = async (genreValues) => {
    const connection = getConnection();
    if (genreValues.length > 0) {
        await connection.query(
            'INSERT INTO comic_genres (comicId, genreId) VALUES ?',
            [genreValues]
        );
    }
};

// --- COMIC READ OPERATIONS ---
const getComicListRaw = async () => {
    const connection = getConnection();
    const [rows] = await connection.execute(
        `SELECT 
            c.id, c.title, c.coverImageUrl, c.status, c.isDigital, c.price, c.author, c.viewCount, c.createdAt, c.updatedAt,
            COALESCE(
                (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', g.id, 'name', g.name)) 
                 FROM genres g 
                 JOIN comic_genres cg ON g.id = cg.genreId 
                 WHERE cg.comicId = c.id),
                '[]'
            ) AS genres,
            (SELECT AVG(rating) FROM reviews WHERE comicId = c.id) AS averageRating,
            (SELECT COUNT(id) FROM reviews WHERE comicId = c.id) AS totalReviews
         FROM comics c`
    );
    return rows;
};

const getComicDetailRaw = async (id) => {
    const connection = getConnection();
    const [rows] = await connection.execute(
        `SELECT 
            c.id, c.title, c.author, c.description, c.coverImageUrl, c.status, c.isDigital, c.price, c.viewCount, c.createdAt, c.updatedAt,
            COALESCE(
                (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', g.id, 'name', g.name)) 
                 FROM genres g 
                 JOIN comic_genres cg ON g.id = cg.genreId 
                 WHERE cg.comicId = c.id),
                '[]'
            ) AS genres,
            (SELECT AVG(rating) FROM reviews WHERE comicId = c.id) AS averageRating,
            (SELECT COUNT(id) FROM reviews WHERE comicId = c.id) AS totalReviews
         FROM comics c 
         WHERE c.id = ?`,
        [id]
    );
    return rows.length > 0 ? rows[0] : null;
};

const getComicChaptersRaw = async (comicId) => {
    const connection = getConnection();
    const [rows] = await connection.execute(
        'SELECT id, chapterNumber, title, price, createdAt, viewCount FROM chapters WHERE comicId = ? ORDER BY chapterNumber ASC',
        [comicId]
    );
    return rows;
};

const incrementComicViewCount = async (id) => {
    const connection = getConnection();   
    await connection.execute('UPDATE comics SET viewCount = viewCount + 1 WHERE id = ?', [id]);    
    try {
        await connection.execute(
            `INSERT INTO daily_comic_stats (comic_id, view_date, daily_view_count) 
             VALUES (?, CURDATE(), 1)
             ON DUPLICATE KEY UPDATE daily_view_count = daily_view_count + 1`,
            [id]
        );
    } catch (logError) {
        console.error('Failed to log daily comic view:', logError.message);
    }
};

const getTopViewedComicsRaw = async () => {
    const connection = getConnection();
    const [rows] = await connection.execute(`
        SELECT 
            c.id, c.title, c.author, c.coverImageUrl, c.viewCount,
            GROUP_CONCAT(g.name SEPARATOR ', ') AS genres
        FROM comics c
        LEFT JOIN comic_genres cg ON c.id = cg.comicId
        LEFT JOIN genres g ON cg.genreId = g.id
        WHERE c.isDigital = 1
        GROUP BY c.id
        ORDER BY c.viewCount DESC
        LIMIT 10
    `);
    return rows;
};

const getTopRatedComicsRaw = async () => {
    const connection = getConnection();
    const [rows] = await connection.execute(`
        SELECT 
            c.id, c.title, c.author, c.coverImageUrl, 
            AVG(r.rating) as avgRating,
            GROUP_CONCAT(g.name SEPARATOR ', ') AS genres
        FROM comics c
        LEFT JOIN reviews r ON c.id = r.comicId
        LEFT JOIN comic_genres cg ON c.id = cg.comicId
        LEFT JOIN genres g ON cg.genreId = g.id
        WHERE c.isDigital = 1
        GROUP BY c.id
        ORDER BY avgRating DESC
        LIMIT 5
    `);
    return rows;
};

// --- CHAPTER CRUD OPERATIONS ---
const createChapterRaw = async (comicId, chapterNumber, title, contentUrlsJson, price) => {
    const connection = getConnection();
    const [result] = await connection.execute(
        'INSERT INTO chapters (comicId, chapterNumber, title, contentUrls, price, viewCount) VALUES (?, ?, ?, ?, ?, ?)',
        [comicId, chapterNumber, title || null, contentUrlsJson, price || 0, 0]
    );
    return result.insertId;
};

const deleteChapterRaw = async (comicId, chapterId) => {
    const connection = getConnection();
    const [result] = await connection.execute(
        'DELETE FROM chapters WHERE id = ? AND comicId = ?',
        [chapterId, comicId]
    );
    return result.affectedRows;
};

// --- CHAPTER CONTENT & UNLOCK OPERATIONS ---
const getChapterRaw = async (comicId, chapterId) => {
    const connection = getConnection();
    const [rows] = await connection.execute(
        'SELECT * FROM chapters WHERE id = ? AND comicId = ?',
        [chapterId, comicId]
    );
    return rows.length > 0 ? rows[0] : null;
};

const findFullPurchase = async (userId, comicId) => {
    const connection = getConnection();
    const [rows] = await connection.execute(
        'SELECT 1 FROM user_library WHERE userId = ? AND comicId = ?',
        [userId, comicId]
    );
    return rows.length > 0;
};

const findUnlockedChapter = async (userId, chapterId) => {
    const connection = getConnection();
    const [rows] = await connection.execute(
        'SELECT 1 FROM user_unlocked_chapters WHERE userId = ? AND chapterId = ?',
        [userId, chapterId]
    );
    return rows.length > 0;
};

const incrementChapterViewCount = async (comicId, chapterId) => {
    const connection = getConnection();
    await connection.execute('UPDATE chapters SET viewCount = viewCount + 1 WHERE id = ?', [chapterId]);
    await connection.execute('UPDATE comics SET viewCount = (SELECT SUM(viewCount) FROM chapters WHERE comicId = ?) WHERE id = ?', [comicId, comicId]);
    try {
        await connection.execute(
            `INSERT INTO daily_comic_stats (comic_id, view_date, daily_view_count) 
             VALUES (?, CURDATE(), 1)
             ON DUPLICATE KEY UPDATE daily_view_count = daily_view_count + 1`,
            [comicId] 
        );
    } catch (logError) {
        console.error('Failed to log daily chapter view:', logError.message);
    }
};

const findChapterForUnlock = async (chapterId) => {
    const connection = getConnection();
    const [rows] = await connection.execute('SELECT price, comicId FROM chapters WHERE id = ?', [chapterId]);
    return rows.length > 0 ? rows[0] : null;
};

const insertUnlockedChapter = async (userId, chapterId) => {
    const connection = getConnection();
    await connection.execute('INSERT INTO user_unlocked_chapters (userId, chapterId) VALUES (?, ?)', [userId, chapterId]);
};

// --- STATS/SEARCH OPERATIONS ---

const getTopComicsRaw = async (startDate, endDate) => {
    const connection = getConnection();
    
    if (startDate && endDate) {
        const [rows] = await connection.execute(
            `SELECT 
                c.id, c.title, c.coverImageUrl, c.status, c.isDigital, c.price, c.author,
                c.viewCount, -- Lấy TỔNG VIEW (để hiển thị)
                (SELECT AVG(rating) FROM reviews WHERE comicId = c.id) AS averageRating,
                (SELECT COUNT(id) FROM reviews WHERE comicId = c.id) AS totalReviews,
                SUM(s.daily_view_count) AS periodViewCount -- Chỉ dùng để SẮP XẾP
            FROM daily_comic_stats s
            JOIN comics c ON s.comic_id = c.id
            WHERE 
                s.view_date >= ? AND s.view_date < ?
            GROUP BY c.id -- Group by ID của truyện
            ORDER BY periodViewCount DESC -- Sắp xếp theo view của Ngày/Tuần/Tháng
            LIMIT 10`,
            [startDate, endDate]
        );

        return rows;
    }

    const [rows] = await connection.execute(
        `SELECT 
            c.id, c.title, c.coverImageUrl, c.status, c.isDigital, c.price, c.author, c.viewCount,
            (SELECT AVG(rating) FROM reviews WHERE comicId = c.id) AS averageRating,
            (SELECT COUNT(id) FROM reviews WHERE comicId = c.id) AS totalReviews
        FROM comics c
        ORDER BY c.viewCount DESC 
        LIMIT 10`
    );
    return rows;
};

const searchComicsRaw = async (searchQuery) => {
    const connection = getConnection();
    const [rows] = await connection.execute(
        `SELECT 
            c.id, c.title, c.coverImageUrl, c.status, c.isDigital, c.price, c.author, c.viewCount,
            (SELECT AVG(rating) FROM reviews WHERE comicId = c.id) AS averageRating,
            (SELECT COUNT(id) FROM reviews WHERE comicId = c.id) AS totalReviews
         FROM comics c
         LEFT JOIN comic_genres cg ON c.id = cg.comicId
         LEFT JOIN genres g ON cg.genreId = g.id
         WHERE 
            c.title LIKE ? 
            OR c.author LIKE ? 
            OR g.name LIKE ?
         GROUP BY c.id
         LIMIT 20`,
        [searchQuery, searchQuery, searchQuery]
    );
    return rows;
};

const getComicsByGenreRaw = async (genre) => {
    const connection = getConnection();
    const [rows] = await connection.execute(
        `SELECT 
            c.id, c.title, c.coverImageUrl, c.status, c.isDigital, c.price, c.author, c.viewCount,
            (SELECT AVG(rating) FROM reviews WHERE comicId = c.id) AS averageRating,
            (SELECT COUNT(id) FROM reviews WHERE comicId = c.id) AS totalReviews
         FROM comics c
         JOIN comic_genres cg ON c.id = cg.comicId
         JOIN genres g ON cg.genreId = g.id
         WHERE g.name = ?`,
        [genre]
    );
    return rows;
};

// --- REVIEW OPERATIONS ---
const getReviewsRaw = async (comicId) => {
    const connection = getConnection();
    const [rows] = await connection.execute(
        `SELECT r.id, r.userId, r.rating, r.comment, r.createdAt, u.fullName, u.avatarUrl
         FROM reviews r
         JOIN users u ON r.userId = u.id
         WHERE r.comicId = ?
         ORDER BY r.createdAt DESC`,
        [comicId]
    );
    return rows;
};

const findExistingReview = async (comicId, userId) => {
    const connection = getConnection();
    const [rows] = await connection.execute(
        'SELECT * FROM reviews WHERE comicId = ? AND userId = ?',
        [comicId, userId]
    );
    return rows.length > 0 ? rows[0] : null;
};

const updateReviewRaw = async (id, rating, comment) => {
    const connection = getConnection();
    await connection.execute(
        'UPDATE reviews SET rating = ?, comment = ?, updatedAt = NOW() WHERE id = ?',
        [rating, comment, id]
    );
};

const insertReviewRaw = async (comicId, userId, rating, comment) => {
    const connection = getConnection();
    const [result] = await connection.execute(
        'INSERT INTO reviews (comicId, userId, rating, comment) VALUES (?, ?, ?, ?)',
        [comicId, userId, rating, comment]
    );
    return result.insertId;
};

const getReviewByIdRaw = async (reviewId) => {
    const connection = getConnection();
    const [rows] = await connection.execute(
         `SELECT r.id, r.userId, r.rating, r.comment, r.createdAt, u.fullName, u.avatarUrl
         FROM reviews r
         JOIN users u ON r.userId = u.id
         WHERE r.id = ?`,
        [reviewId]
    );
    return rows.length > 0 ? rows[0] : null;
};


module.exports = {
    getAllGenresRaw,
    createComicRaw, updateComicRaw, deleteComicRaw,
    deleteComicGenresRaw, insertComicGenresRaw,
    getComicListRaw, getComicDetailRaw, getComicChaptersRaw, incrementComicViewCount,
    getTopViewedComicsRaw, getTopRatedComicsRaw,
    createChapterRaw, deleteChapterRaw, 
    getChapterRaw, findFullPurchase, findUnlockedChapter, incrementChapterViewCount, findChapterForUnlock, insertUnlockedChapter,
    getTopComicsRaw, searchComicsRaw, getComicsByGenreRaw,
    getReviewsRaw, findExistingReview, updateReviewRaw, insertReviewRaw, getReviewByIdRaw,
};