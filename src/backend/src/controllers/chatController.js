const { getConnection } = require('../db/connection');

const formatMessage = (row) => ({
    id: row.id,
    userId: String(row.userId),
    userName: row.userName,
    avatarUrl: row.avatarUrl,
    timestamp: new Date(row.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    message: row.message,
    userLevel: row.level,
    imageUrl: row.imageUrl,
    stickerUrl: row.stickerUrl,
    likes: row.likes ? row.likes.split(',') : [],
    replyTo: row.replyToMessageId,
    replyToAuthor: row.replyToAuthor,
});

const getMessagesQuery = `
    SELECT 
        m.id, m.userId, m.message, m.imageUrl, m.stickerUrl, m.createdAt, m.replyToMessageId,
        u.fullName AS userName, u.avatarUrl, u.level,
        ru.fullName AS replyToAuthor,
        (SELECT GROUP_CONCAT(l.userId) FROM chat_message_likes l WHERE l.messageId = m.id) AS likes
    FROM chat_messages m
    JOIN users u ON m.userId = u.id
    LEFT JOIN chat_messages r ON m.replyToMessageId = r.id
    LEFT JOIN users ru ON r.userId = ru.id
`;

const getGlobalMessages = async (req, res) => {
    try {
        const connection = getConnection();
        const [rows] = await connection.execute(`
            ${getMessagesQuery}
            WHERE m.comicId IS NULL AND m.chapterId IS NULL
            GROUP BY m.id
            ORDER BY m.createdAt DESC
            LIMIT 30
        `);
        
        const messages = rows.map(formatMessage).reverse();
        res.json(messages);
    } catch (error) {
        console.error("Get global messages error:", error);
        res.status(500).json({ error: 'Failed to fetch global messages' });
    }
};

const getChapterMessages = async (req, res) => {
    try {
        const { comicId, chapterId } = req.params;
        const connection = getConnection();
        const [rows] = await connection.execute(`
            ${getMessagesQuery}
            WHERE m.comicId = ? AND m.chapterId = ?
            GROUP BY m.id
            ORDER BY m.createdAt ASC
        `, [comicId, chapterId]);
        
        const messages = rows.map(formatMessage);
        res.json(messages);
    } catch (error) {
        console.error("Get chapter messages error:", error);
        res.status(500).json({ error: 'Failed to fetch chapter messages' });
    }
};

const postMessage = async (req, res) => {
    try {
        const { userId } = req;
        const { comicId, chapterId, message, imageUrl, stickerUrl, replyToMessageId } = req.body;

        if (!message && !imageUrl && !stickerUrl) {
            return res.status(400).json({ error: 'Message content is empty' });
        }

        const connection = getConnection();
        const [result] = await connection.execute(
            'INSERT INTO chat_messages (userId, comicId, chapterId, message, imageUrl, stickerUrl, replyToMessageId) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, comicId || null, chapterId || null, message || null, imageUrl || null, stickerUrl || null, replyToMessageId || null]
        );
        
        const newMessageId = result.insertId;

        const [newMsgRows] = await connection.execute(`
            ${getMessagesQuery}
            WHERE m.id = ?
            GROUP BY m.id
        `, [newMessageId]);

        if (newMsgRows.length === 0) {
            throw new Error("Failed to retrieve new message after posting");
        }

        res.status(201).json(formatMessage(newMsgRows[0]));
    } catch (error) {
        console.error("Post message error:", error);
        res.status(500).json({ error: 'Failed to post message' });
    }
};

const toggleLikeMessage = async (req, res) => {
    try {
        const { userId } = req;
        const { messageId } = req.params;

        const connection = getConnection();
        
        const [existingLike] = await connection.execute(
            'SELECT * FROM chat_message_likes WHERE messageId = ? AND userId = ?',
            [messageId, userId]
        );

        if (existingLike.length > 0) {
            await connection.execute(
                'DELETE FROM chat_message_likes WHERE messageId = ? AND userId = ?',
                [messageId, userId]
            );
        } else {
            await connection.execute(
                'INSERT INTO chat_message_likes (messageId, userId) VALUES (?, ?)',
                [messageId, userId]
            );
        }
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Toggle like error:", error);
        res.status(500).json({ error: 'Failed to toggle like' });
    }
};

module.exports = {
    getGlobalMessages,
    getChapterMessages,
    postMessage,
    toggleLikeMessage
};