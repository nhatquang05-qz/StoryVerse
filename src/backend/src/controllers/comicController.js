const { getConnection } = require('../db/connection');

const addComic = async (req, res) => {
    const { title, author, description, coverImageUrl, status, isDigital, price, genres } = req.body;
    const { userId } = req;

    if (!title || !coverImageUrl) {
        return res.status(400).json({ error: 'Title and Cover Image URL are required' });
    }

    const connection = getConnection();
    try {
        await connection.beginTransaction();

        const [comicResult] = await connection.execute(
            'INSERT INTO comics (title, author, description, coverImageUrl, status, isDigital, price, uploaderId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title, author || null, description || null, coverImageUrl, status || 'Ongoing', isDigital, price || 0, userId]
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
    const { userId } = req; 

    if (!title || !coverImageUrl) {
        return res.status(400).json({ error: 'Title and Cover Image URL are required' });
    }

    const connection = getConnection();
    try {
        await connection.beginTransaction();

        await connection.execute(
            'UPDATE comics SET title = ?, author = ?, description = ?, coverImageUrl = ?, status = ?, isDigital = ?, price = ? WHERE id = ?',
            [title, author || null, description || null, coverImageUrl, status || 'Ongoing', isDigital, price || 0, id]
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
    const { userId } = req; 

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
        const [rows] = await connection.execute(
            `SELECT 
                c.id, c.title, c.coverImageUrl, c.status, c.isDigital, c.price, c.author, c.views, c.rating, c.createdAt, c.updatedAt,
                (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', g.id, 'name', g.name)) 
                 FROM genres g 
                 JOIN comic_genres cg ON g.id = cg.genre_id 
                 WHERE cg.comic_id = c.id) AS genres
            FROM comics c`
        );
        res.json(rows);
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
                c.id, c.title, c.author, c.description, c.coverImageUrl, c.status, c.isDigital, c.price, c.views, c.rating, c.uploaderId, c.createdAt, c.updatedAt,
                (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', g.id, 'name', g.name)) 
                 FROM genres g 
                 JOIN comic_genres cg ON g.id = cg.genre_id 
                 WHERE cg.comic_id = c.id) AS genres
            FROM comics c 
            WHERE c.id = ?`,
            [id]
        );

        if (comicRows.length === 0) {
            return res.status(404).json({ error: 'Comic not found' });
        }

        const [chapterRows] = await connection.execute(
            'SELECT id, chapterNumber, title, price, createdAt FROM chapters WHERE comic_id = ? ORDER BY chapterNumber ASC',
            [id]
        );

        const comic = comicRows[0];
        comic.chapters = chapterRows;

        await connection.execute('UPDATE comics SET views = views + 1 WHERE id = ?', [id]);

        res.json(comic);
    } catch (error) {
        console.error('Error fetching comic details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const addChapter = async (req, res) => {
    const { comicId } = req.params;
    const { chapterNumber, title, contentUrls, price } = req.body;
    const { userId } = req;

    if (!chapterNumber || !contentUrls || !Array.isArray(contentUrls) || contentUrls.length === 0) {
        return res.status(400).json({ error: 'Chapter number and content URLs are required' });
    }

    try {
        const connection = getConnection();
        const [result] = await connection.execute(
            'INSERT INTO chapters (comic_id, chapterNumber, title, contentUrls, price) VALUES (?, ?, ?, ?, ?)',
            [comicId, chapterNumber, title || null, JSON.stringify(contentUrls), price || 0]
        );
        res.status(201).json({ message: 'Chapter added successfully', chapterId: result.insertId });
    } catch (error) {
        console.error('Error adding chapter:', error);
        res.status(500).json({ error: 'Failed to add chapter' });
    }
};

const deleteChapter = async (req, res) => {
    const { comicId, chapterId } = req.params;
    const { userId } = req;

    const connection = getConnection();
    try {
        const [result] = await connection.execute(
            'DELETE FROM chapters WHERE id = ? AND comic_id = ?',
            [chapterId, comicId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Chapter not found or not associated with this comic' });
        }

        res.status(200).json({ message: 'Chapter deleted successfully' });
    } catch (error) {
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

        if (chapter.price > 0 && userId) {
            const [purchaseRows] = await connection.execute(
                'SELECT * FROM purchased_chapters WHERE user_id = ? AND chapter_id = ?',
                [userId, chapterId]
            );

            const [userRows] = await connection.execute(
                'SELECT coins FROM users WHERE id = ?',
                [userId]
            );

            if (purchaseRows.length === 0) {
                if (userRows.length === 0 || userRows[0].coins < chapter.price) {
                    return res.status(402).json({ error: 'Not enough coins to purchase this chapter' });
                }

                await connection.beginTransaction();
                try {
                    await connection.execute(
                        'UPDATE users SET coins = coins - ? WHERE id = ?',
                        [chapter.price, userId]
                    );
                    await connection.execute(
                        'INSERT INTO purchased_chapters (user_id, chapter_id, price) VALUES (?, ?, ?)',
                        [userId, chapterId, chapter.price]
                    );
                    await connection.commit();
                } catch (txError) {
                    await connection.rollback();
                    throw txError;
                }
            }
        } else if (chapter.price > 0 && !userId) {
            return res.status(401).json({ error: 'You must be logged in to read this chapter' });
        }
        
        chapter.contentUrls = JSON.parse(chapter.contentUrls);
        res.json(chapter);

    } catch (error) {
        console.error('Error fetching chapter content:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getTopComics = async (req, res) => {
    try {
        const connection = getConnection();
        const [rows] = await connection.execute(
            'SELECT id, title, coverImageUrl, status, isDigital, price, author, views FROM comics ORDER BY views DESC LIMIT 10'
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
        
        const [rows] = await connection.execute(
            `SELECT c.id, c.title, c.coverImageUrl, c.status, c.isDigital, c.price, c.author, c.views, c.rating
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
    getAllGenres
};