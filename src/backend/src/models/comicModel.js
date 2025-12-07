const { getConnection } = require('../db/connection');

const FS_CONDITION = `
    FROM flash_sale_items fsi 
    JOIN flash_sales fs ON fsi.flashSaleId = fs.id 
    WHERE fsi.comicId = c.id 
    AND fs.status != 'ENDED' 
    AND fs.startTime <= NOW() 
    AND fs.endTime >= NOW() 
    ORDER BY fs.endTime ASC 
    LIMIT 1
`;

const FLASH_SALE_PRICE_QUERY = `(SELECT fsi.salePrice ${FS_CONDITION})`;
const FLASH_SALE_SOLD_QUERY  = `(SELECT fsi.soldQuantity ${FS_CONDITION})`;
const FLASH_SALE_LIMIT_QUERY = `(SELECT fsi.quantityLimit ${FS_CONDITION})`;

const SELECT_FLASH_SALE_FIELDS = `
    ${FLASH_SALE_PRICE_QUERY} AS flashSalePrice,
    ${FLASH_SALE_SOLD_QUERY} AS flashSaleSold,
    ${FLASH_SALE_LIMIT_QUERY} AS flashSaleLimit
`;

const getAllGenresRaw = async () => {
    const connection = getConnection();
    const [rows] = await connection.execute('SELECT id, name FROM genres ORDER BY name');
    return rows;
};

const createComicRaw = async (comicData) => {
    const connection = getConnection();
    const { title, author, description, coverImageUrl, status, isDigital, price, genres } = comicData;
    const safeTitle = title || null;
    const safeAuthor = author || null;
    const safeDescription = description || null;
    const safeCover = coverImageUrl || null;
    const safeStatus = status || 'Ongoing';
    const safeIsDigital = isDigital ? 1 : 0;
    const safePrice = price || 0;

    const [result] = await connection.execute(
        'INSERT INTO comics (title, author, description, coverImageUrl, status, isDigital, price, viewCount, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())',
        [safeTitle, safeAuthor, safeDescription, safeCover, safeStatus, safeIsDigital, safePrice]
    );
    const newComicId = result.insertId;

    if (genres && Array.isArray(genres) && genres.length > 0) {
        const genreValues = genres.map(gId => [newComicId, gId]);
        await connection.query(
            'INSERT INTO comic_genres (comicId, genreId) VALUES ?',
            [genreValues]
        );
    }

    return newComicId;
};

const updateComicRaw = async (id, comicData) => {
    const connection = getConnection();
    const { title, author, description, coverImageUrl, status, isDigital, price, genres } = comicData;

    const safeTitle = title || null;
    const safeAuthor = author || null;
    const safeDescription = description || null;
    const safeCover = coverImageUrl || null;
    const safeStatus = status || 'Ongoing';
    const safeIsDigital = isDigital ? 1 : 0;
    const safePrice = price || 0;

    await connection.execute(
        'UPDATE comics SET title = ?, author = ?, description = ?, coverImageUrl = ?, status = ?, isDigital = ?, price = ?, updatedAt = NOW() WHERE id = ?',
        [safeTitle, safeAuthor, safeDescription, safeCover, safeStatus, safeIsDigital, safePrice, id]
    );

    if (genres !== undefined) {
        await connection.execute('DELETE FROM comic_genres WHERE comicId = ?', [id]);

        if (Array.isArray(genres) && genres.length > 0) {
            const genreValues = genres.map(gId => [id, gId]);
            await connection.query(
                'INSERT INTO comic_genres (comicId, genreId) VALUES ?',
                [genreValues]
            );
        }
    }
};

const deleteComicRaw = async (id) => {
    const connection = getConnection();
    
    await connection.execute('DELETE FROM user_wishlist WHERE comicId = ?', [id]);
    await connection.execute(
        'DELETE FROM user_unlocked_chapters WHERE chapterId IN (SELECT id FROM chapters WHERE comicId = ?)', 
        [id]
    );

    try {
        await connection.execute('DELETE FROM daily_comic_stats WHERE comic_id = ?', [id]);
    } catch (error) {
        
    }

    await connection.execute('DELETE FROM reviews WHERE comicId = ?', [id]);
    await connection.execute('DELETE FROM comic_genres WHERE comicId = ?', [id]);
    await connection.execute('DELETE FROM chapters WHERE comicId = ?', [id]);
    
    const [result] = await connection.execute('DELETE FROM comics WHERE id = ?', [id]);
    return result.affectedRows;
};

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

const getComicCountRaw = async () => {
    const connection = getConnection();
    const [rows] = await connection.execute('SELECT COUNT(*) as total FROM comics');
    return rows[0].total;
};

const getComicListRaw = async (limit, offset) => {
    const connection = getConnection();
    const limitInt = Number(limit) || 20;
    const offsetInt = Number(offset) || 0;

    const [rows] = await connection.query(
        `SELECT 
            c.id, c.title, c.coverImageUrl, c.status, c.isDigital, c.price, c.author, 
            c.viewCount, c.createdAt, c.updatedAt,
            ${SELECT_FLASH_SALE_FIELDS},
            (
                SELECT COALESCE(SUM(oi.quantity), 0) 
                FROM order_items oi 
                JOIN orders o ON oi.orderId = o.id 
                WHERE oi.comicId = c.id 
                AND o.status IN ('PAID', 'PROCESSING', 'COMPLETED', 'DELIVERED')
            ) AS soldCount,
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
         ORDER BY c.updatedAt DESC
         LIMIT ? OFFSET ?`, 
        [limitInt, offsetInt]
    );
    return rows;
};

const getComicDetailRaw = async (id) => {
    const connection = getConnection();
    const [rows] = await connection.execute(
        `SELECT 
            c.id, c.title, c.author, c.description, c.coverImageUrl, c.status, c.isDigital, c.price, 
            c.viewCount, c.createdAt, c.updatedAt,
            ${SELECT_FLASH_SALE_FIELDS},
            (
                SELECT COALESCE(SUM(oi.quantity), 0) 
                FROM order_items oi 
                JOIN orders o ON oi.orderId = o.id 
                WHERE oi.comicId = c.id 
                AND o.status IN ('PAID', 'PROCESSING', 'COMPLETED', 'DELIVERED')
            ) AS soldCount,
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
        
    }
};

const incrementSoldCount = async (comicId, quantity) => {
    const connection = getConnection();
    try {
        await connection.execute(
            'UPDATE comics SET soldCount = soldCount + ? WHERE id = ?', 
            [quantity, comicId]
        );
    } catch (e) {
    }
};

const getTopViewedComicsRaw = async () => {
    const connection = getConnection();
    const [rows] = await connection.execute(`
        SELECT 
            c.id, c.title, c.author, c.coverImageUrl, c.viewCount, c.price,
            ${SELECT_FLASH_SALE_FIELDS},
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
            c.id, c.title, c.author, c.coverImageUrl, c.price,
            ${SELECT_FLASH_SALE_FIELDS},
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

const createChapterRaw = async (comicId, chapterData) => {
    const connection = getConnection();
    const { chapterNumber, title, contentUrls, price } = chapterData;

    let contentJson;
    if (typeof contentUrls === 'string') {
        contentJson = contentUrls;
    } else {
        contentJson = JSON.stringify(contentUrls || []);
    }

    const safeTitle = title && title.trim() !== '' ? title : null;
    const safePrice = price || 0;

    const [result] = await connection.execute(
        'INSERT INTO chapters (comicId, chapterNumber, title, contentUrls, price, viewCount, createdAt) VALUES (?, ?, ?, ?, ?, 0, NOW())',
        [comicId, chapterNumber, safeTitle, contentJson, safePrice]
    );
    
    await connection.execute('UPDATE comics SET updatedAt = NOW() WHERE id = ?', [comicId]);
    return result.insertId;
};

const deleteChapterRaw = async (comicId, chapterId) => {
    const connection = getConnection();
    await connection.execute('DELETE FROM user_unlocked_chapters WHERE chapterId = ?', [chapterId]);
    const [result] = await connection.execute(
        'DELETE FROM chapters WHERE id = ? AND comicId = ?',
        [chapterId, comicId]
    );
    return result.affectedRows;
};

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
    try {
        const [rows] = await connection.execute(
            'SELECT 1 FROM user_library WHERE userId = ? AND comicId = ?',
            [userId, comicId]
        );
        return rows.length > 0;
    } catch (e) { return false; }
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
    } catch (logError) {}
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

const getTopComicsRaw = async (startDate, endDate) => {
    const connection = getConnection();
    if (startDate && endDate) {
        try {
            const [rows] = await connection.execute(
                `SELECT 
                    c.id, c.title, c.coverImageUrl, c.status, c.isDigital, c.price, c.author,
                    c.viewCount,
                    ${SELECT_FLASH_SALE_FIELDS},
                    (SELECT AVG(rating) FROM reviews WHERE comicId = c.id) AS averageRating,
                    (SELECT COUNT(id) FROM reviews WHERE comicId = c.id) AS totalReviews,
                    SUM(s.daily_view_count) AS periodViewCount
                FROM daily_comic_stats s
                JOIN comics c ON s.comic_id = c.id
                WHERE s.view_date >= ? AND s.view_date < ?
                GROUP BY c.id
                ORDER BY periodViewCount DESC
                LIMIT 10`,
                [startDate, endDate]
            );
            return rows;
        } catch (e) { }
    }
    const [rows] = await connection.execute(
        `SELECT 
            c.id, c.title, c.coverImageUrl, c.status, c.isDigital, c.price, c.author, c.viewCount,
            ${SELECT_FLASH_SALE_FIELDS},
            (SELECT AVG(rating) FROM reviews WHERE comicId = c.id) AS averageRating,
            (SELECT COUNT(id) FROM reviews WHERE comicId = c.id) AS totalReviews
        FROM comics c
        ORDER BY c.viewCount DESC 
        LIMIT 10`
    );
    return rows;
};

const searchComicsRaw = async (searchQuery, limit, offset) => {
    const connection = getConnection();
    const limitInt = Number(limit) || 20;
    const offsetInt = Number(offset) || 0;

    const [rows] = await connection.query(
        `SELECT 
            c.id, c.title, c.coverImageUrl, c.status, c.isDigital, c.price, c.author, 
            c.viewCount,
            ${SELECT_FLASH_SALE_FIELDS},
            (
                SELECT COALESCE(SUM(oi.quantity), 0) 
                FROM order_items oi 
                JOIN orders o ON oi.orderId = o.id 
                WHERE oi.comicId = c.id 
                AND o.status IN ('PAID', 'PROCESSING', 'COMPLETED', 'DELIVERED')
            ) AS soldCount,
            (SELECT AVG(rating) FROM reviews WHERE comicId = c.id) AS averageRating,
            (SELECT COUNT(id) FROM reviews WHERE comicId = c.id) AS totalReviews
         FROM comics c
         LEFT JOIN comic_genres cg ON c.id = cg.comicId
         LEFT JOIN genres g ON cg.genreId = g.id
         WHERE c.title LIKE ? OR c.author LIKE ? OR g.name LIKE ?
         GROUP BY c.id
         LIMIT ? OFFSET ?`,
        [searchQuery, searchQuery, searchQuery, limitInt, offsetInt]
    );
    return rows;
};

const getSearchComicsCountRaw = async (searchQuery) => {
    const connection = getConnection();
    const [rows] = await connection.execute(
        `SELECT COUNT(DISTINCT c.id) as total
         FROM comics c
         LEFT JOIN comic_genres cg ON c.id = cg.comicId
         LEFT JOIN genres g ON cg.genreId = g.id
         WHERE c.title LIKE ? OR c.author LIKE ? OR g.name LIKE ?`,
        [searchQuery, searchQuery, searchQuery]
    );
    return rows[0].total;
};

const getComicsByGenreRaw = async (genre, limit, offset) => {
    const connection = getConnection();
    const limitInt = Number(limit) || 20;
    const offsetInt = Number(offset) || 0;
    
    const [rows] = await connection.query(
        `SELECT 
            c.id, c.title, c.coverImageUrl, c.status, c.isDigital, c.price, c.author, 
            c.viewCount,
            ${SELECT_FLASH_SALE_FIELDS},
            (
                SELECT COALESCE(SUM(oi.quantity), 0) 
                FROM order_items oi 
                JOIN orders o ON oi.orderId = o.id 
                WHERE oi.comicId = c.id 
                AND o.status IN ('PAID', 'PROCESSING', 'COMPLETED', 'DELIVERED')
            ) AS soldCount,
            (SELECT AVG(rating) FROM reviews WHERE comicId = c.id) AS averageRating,
            (SELECT COUNT(id) FROM reviews WHERE comicId = c.id) AS totalReviews
         FROM comics c
         JOIN comic_genres cg ON c.id = cg.comicId
         JOIN genres g ON cg.genreId = g.id
         WHERE g.name = ?
         LIMIT ? OFFSET ?`,
        [genre, limitInt, offsetInt]
    );
    return rows;
};

const getComicsByGenreCountRaw = async (genre) => {
    const connection = getConnection();
    const [rows] = await connection.execute(
        `SELECT COUNT(DISTINCT c.id) as total
         FROM comics c
         JOIN comic_genres cg ON c.id = cg.comicId
         JOIN genres g ON cg.genreId = g.id
         WHERE g.name = ?`,
        [genre]
    );
    return rows[0].total;
};

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
    const [rows] = await connection.execute('SELECT * FROM reviews WHERE comicId = ? AND userId = ?', [comicId, userId]);
    return rows.length > 0 ? rows[0] : null;
};

const updateReviewRaw = async (id, rating, comment) => {
    const connection = getConnection();
    await connection.execute('UPDATE reviews SET rating = ?, comment = ?, updatedAt = NOW() WHERE id = ?', [rating, comment, id]);
};

const insertReviewRaw = async (comicId, userId, rating, comment) => {
    const connection = getConnection();
    const [result] = await connection.execute('INSERT INTO reviews (comicId, userId, rating, comment) VALUES (?, ?, ?, ?)', [comicId, userId, rating, comment]);
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

const getDigitalComicsRankingRaw = async (startDate, endDate) => {
    const connection = getConnection();
    const [rows] = await connection.execute(
        `SELECT 
            c.id, c.title, c.coverImageUrl, c.isDigital,
            SUM(s.daily_view_count) AS totalViews
        FROM daily_comic_stats s
        JOIN comics c ON s.comic_id = c.id
        WHERE c.isDigital = 1 AND s.view_date >= ? AND s.view_date < ?
        GROUP BY c.id
        ORDER BY totalViews DESC
        LIMIT 20`, 
        [startDate, endDate]
    );
    return rows;
};

const getPhysicalComicsRankingRaw = async (startDate, endDate) => {
    const connection = getConnection();
    // Dùng orders để tính Total Purchases trong kỳ (Day, Week, Month)
    const [rows] = await connection.execute(
        `SELECT 
            c.id, c.title, c.coverImageUrl, c.isDigital,
            SUM(oi.quantity) AS totalPurchases
        FROM order_items oi
        JOIN orders o ON oi.orderId = o.id
        JOIN comics c ON oi.comicId = c.id
        WHERE c.isDigital = 0 AND o.status IN ('COMPLETED', 'DELIVERED') AND o.createdAt >= ? AND o.createdAt < ?
        GROUP BY c.id
        ORDER BY totalPurchases DESC
        LIMIT 20`,
        [startDate, endDate]
    );
    return rows;
};

module.exports = {
    getAllGenresRaw,
    createComicRaw, updateComicRaw, deleteComicRaw,
    deleteComicGenresRaw, insertComicGenresRaw,
    getComicListRaw, getComicCountRaw,
    getComicDetailRaw, getComicChaptersRaw, incrementComicViewCount,
    getTopViewedComicsRaw, getTopRatedComicsRaw,
    createChapterRaw, deleteChapterRaw, 
    getChapterRaw, findFullPurchase, findUnlockedChapter, incrementChapterViewCount, findChapterForUnlock, insertUnlockedChapter,
    getTopComicsRaw, 
    searchComicsRaw, getSearchComicsCountRaw,
    getComicsByGenreRaw, getComicsByGenreCountRaw,
    getReviewsRaw, findExistingReview, updateReviewRaw, insertReviewRaw, getReviewByIdRaw,
    incrementSoldCount, getDigitalComicsRankingRaw, getPhysicalComicsRankingRaw
};