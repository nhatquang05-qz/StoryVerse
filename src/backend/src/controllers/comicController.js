const { getConnection } = require('../db/connection');
const { BASE_EXP_PER_COIN, EXP_RATE_REDUCTION_FACTOR, MIN_EXP_PER_COIN } = require('../utils/constants');

const addComic = async (req, res) => {
    const { title, author, description, coverImageUrl, status, isDigital, price, genres } = req.body;

    if (!title || !coverImageUrl) {
        return res.status(400).json({ error: 'Title and Cover Image URL are required' });
    }

    const connection = getConnection();
    try {
        await connection.beginTransaction();

        const [comicResult] = await connection.execute(
            'INSERT INTO comics (title, author, description, coverImageUrl, status, isDigital, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, author || null, description || null, coverImageUrl, status || 'Ongoing', isDigital ? 1 : 0, price || 0]
        );

        const comicId = comicResult.insertId;

        if (genres && Array.isArray(genres) && genres.length > 0) {
            const genreValues = genres.map(genreId => [comicId, Number(genreId)]);
            await connection.query(
                'INSERT INTO comic_genres (comicId, genreId) VALUES ?',
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

        await connection.execute('DELETE FROM comic_genres WHERE comicId = ?', [id]);

        if (genres && Array.isArray(genres) && genres.length > 0) {
            const genreValues = genres.map(genreId => [id, Number(genreId)]);
            await connection.query(
                'INSERT INTO comic_genres (comicId, genreId) VALUES ?',
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
        
        await connection.execute('DELETE FROM reviews WHERE comicId = ?', [id]);
        await connection.execute('DELETE FROM comic_genres WHERE comicId = ?', [id]);
        await connection.execute('DELETE FROM chapters WHERE comicId = ?', [id]);
        
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
        
        const comicsWithParsedGenres = rows.map(comic => ({
            ...comic,
            genres: typeof comic.genres === 'string' ? JSON.parse(comic.genres) : comic.genres,
            averageRating: parseFloat(comic.averageRating) || 0,
            totalReviews: parseInt(comic.totalReviews) || 0
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

        const [comicRows] = await connection.execute(
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

        if (comicRows.length === 0) {
            return res.status(404).json({ error: 'Comic not found' });
        }

        const [chapterRows] = await connection.execute(
            'SELECT id, chapterNumber, title, price, createdAt, viewCount FROM chapters WHERE comicId = ? ORDER BY chapterNumber ASC',
            [id]
        );

        const comic = comicRows[0];
        
        comic.genres = typeof comic.genres === 'string' ? JSON.parse(comic.genres) : comic.genres;
        comic.chapters = chapterRows;
        comic.averageRating = parseFloat(comic.averageRating) || 0;
        comic.totalReviews = parseInt(comic.totalReviews) || 0;

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
        const [result] = await connection.execute(
            'INSERT INTO chapters (comicId, chapterNumber, title, contentUrls, price, viewCount) VALUES (?, ?, ?, ?, ?, ?)',
            [comicId, chapterNumber, title || null, JSON.stringify(contentUrls), price || 0, 0]
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
            'DELETE FROM chapters WHERE id = ? AND comicId = ?',
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
            'SELECT * FROM chapters WHERE id = ? AND comicId = ?',
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
            const [fullPurchase] = await connection.execute(
                 'SELECT 1 FROM user_library WHERE userId = ? AND comicId = ?',
                 [userId, comicId]
            );
            
            if (fullPurchase.length > 0) {
                isPurchased = true;
            } else {
                const [unlockedChapter] = await connection.execute(
                    'SELECT 1 FROM user_unlocked_chapters WHERE userId = ? AND chapterId = ?',
                    [userId, chapter.id]
                );
                if (unlockedChapter.length > 0) {
                    isPurchased = true;
                }
            }
        } else if (chapter.price > 0 && !userId) {
            return res.status(401).json({ error: 'You must be logged in to read this chapter' });
        }

        if (isPurchased) {
            await connection.execute('UPDATE chapters SET viewCount = viewCount + 1 WHERE id = ?', [chapterId]);
            await connection.execute('UPDATE comics SET viewCount = (SELECT SUM(viewCount) FROM chapters WHERE comicId = ?) WHERE id = ?', [comicId, comicId]);
            
            chapter.contentUrls = chapter.contentUrls || [];

            res.json(chapter);
        } else {
            return res.status(403).json({ error: 'You do not have access to this chapter.' });
        }

    } catch (error) {
        console.error('Error fetching chapter content:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const unlockChapter = async (req, res) => {
    const { userId } = req;
    const { chapterId } = req.body;

    if (!chapterId) {
        return res.status(400).json({ error: 'chapterId is required.' });
    }

    const connection = getConnection();
    try {
        await connection.beginTransaction();

        const [chapterRows] = await connection.execute('SELECT price, comicId FROM chapters WHERE id = ?', [chapterId]);
        if (chapterRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Chapter not found.' });
        }
        const chapterPrice = parseInt(chapterRows[0].price);
        const comicId = chapterRows[0].comicId;

        const [userRows] = await connection.execute('SELECT coinBalance, level, exp FROM users WHERE id = ? FOR UPDATE', [userId]);
        if (userRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'User not found.' });
        }
        
        let { coinBalance, level, exp } = userRows[0];
        coinBalance = parseInt(coinBalance);
        level = parseInt(level);
        exp = parseFloat(exp);
        const initialLevel = level;

        if (chapterPrice === 0) {
             const [existingFreeUnlock] = await connection.execute('SELECT 1 FROM user_unlocked_chapters WHERE userId = ? AND chapterId = ?', [userId, chapterId]);
             if (existingFreeUnlock.length === 0) {
                 await connection.execute('INSERT INTO user_unlocked_chapters (userId, chapterId, comicId) VALUES (?, ?, ?)', [userId, chapterId, comicId]);
             }
             await connection.commit();
             return res.json({ message: 'Chapter is free and unlocked.', level, exp, coinBalance, levelUpOccurred: false });
        }

        if (coinBalance < chapterPrice) {
            await connection.rollback();
            return res.status(400).json({ error: 'Số dư Xu không đủ. Vui lòng nạp thêm Xu.' });
        }

        const [existingUnlock] = await connection.execute('SELECT 1 FROM user_unlocked_chapters WHERE userId = ? AND chapterId = ?', [userId, chapterId]);
        if (existingUnlock.length > 0) {
            await connection.commit();
            return res.json({ message: 'Chapter already unlocked.', level, exp, coinBalance, levelUpOccurred: false });
        }

        await connection.execute('INSERT INTO user_unlocked_chapters (userId, chapterId, comicId) VALUES (?, ?, ?)', [userId, chapterId, comicId]);

        const newCoinBalance = coinBalance - chapterPrice;
        
        let currentLevel = level;
        let currentExp = exp;
        let coinsToProcess = chapterPrice; 

        while (coinsToProcess > 0) {
            const modifier = Math.pow(EXP_RATE_REDUCTION_FACTOR, currentLevel - 1);
            const expPerCoinThisLevel = BASE_EXP_PER_COIN * modifier;
            if (expPerCoinThisLevel < MIN_EXP_PER_COIN) {
                coinsToProcess = 0;
                break;
            }
            const expNeededForNextLevel = 100.0 - currentExp;
            if (expNeededForNextLevel < 1e-9) {
                 currentLevel += 1;
                 currentExp = 0;
                 continue;
            }
            const coinsNeededForNextLevel = expNeededForNextLevel / expPerCoinThisLevel;
            if (coinsToProcess >= coinsNeededForNextLevel) {
                coinsToProcess -= coinsNeededForNextLevel;
                currentLevel += 1;
                currentExp = 0;
            } else {
                currentExp += coinsToProcess * expPerCoinThisLevel;
                coinsToProcess = 0;
            }
        }
        currentExp = Math.min(100, Math.max(0, currentExp));

        await connection.execute(
            'UPDATE users SET coinBalance = ?, level = ?, exp = ? WHERE id = ?',
            [newCoinBalance, currentLevel, currentExp.toFixed(2), userId]
        );

        await connection.commit();

        res.json({
            level: currentLevel,
            exp: currentExp,
            coinBalance: newCoinBalance,
            levelUpOccurred: currentLevel > initialLevel
        });

    } catch (error) {
        await connection.rollback();
        console.error('Unlock chapter error:', error);
        res.status(500).json({ error: 'Failed to unlock chapter' });
    }
};

const getTopComics = async (req, res) => {
    try {
        const connection = getConnection();
        const [rows] = await connection.execute(
            `SELECT 
                c.id, c.title, c.coverImageUrl, c.status, c.isDigital, c.price, c.author, c.viewCount,
                (SELECT AVG(rating) FROM reviews WHERE comicId = c.id) AS averageRating,
                (SELECT COUNT(id) FROM reviews WHERE comicId = c.id) AS totalReviews
            FROM comics c
            ORDER BY c.viewCount DESC 
            LIMIT 10`
        );
        const comicsWithRating = rows.map(comic => ({
            ...comic,
            averageRating: parseFloat(comic.averageRating) || 0,
            totalReviews: parseInt(comic.totalReviews) || 0
        }));
        res.json(comicsWithRating);
    } catch (error) {
        console.error('Error fetching top comics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const searchComics = async (req, res) => {
    try {
        const { q } = req.query;
        const query = q;
        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }
        const connection = getConnection();
        const searchQuery = `%${query}%`;
        
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
        
        const comicsWithRating = rows.map(comic => ({
            ...comic,
            averageRating: parseFloat(comic.averageRating) || 0,
            totalReviews: parseInt(comic.totalReviews) || 0
        }));
        res.json(comicsWithRating);
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
        const comicsWithRating = rows.map(comic => ({
            ...comic,
            averageRating: parseFloat(comic.averageRating) || 0,
            totalReviews: parseInt(comic.totalReviews) || 0
        }));
        res.json(comicsWithRating);
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
    postReview,
    unlockChapter
};