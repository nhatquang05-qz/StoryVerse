const { getConnection } = require('../db/connection');

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

const getGlobalMessagesRaw = async () => {
    const connection = getConnection();
    const [rows] = await connection.execute(`
        ${getMessagesQuery}
        WHERE m.comicId IS NULL AND m.chapterId IS NULL
        GROUP BY m.id
        ORDER BY m.createdAt DESC
        LIMIT 30
    `);
    return rows;
};

const getChapterMessagesRaw = async (comicId, chapterId) => {
    const connection = getConnection();
    const [rows] = await connection.execute(`
        ${getMessagesQuery}
        WHERE m.comicId = ? AND m.chapterId = ?
        GROUP BY m.id
        ORDER BY m.createdAt ASC
    `, [comicId, chapterId]);
    return rows;
};

const postMessageRaw = async (userId, comicId, chapterId, message, imageUrl, stickerUrl, replyToMessageId) => {
    const connection = getConnection();
    const [result] = await connection.execute(
        'INSERT INTO chat_messages (userId, comicId, chapterId, message, imageUrl, stickerUrl, replyToMessageId) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, comicId || null, chapterId || null, message || null, imageUrl || null, stickerUrl || null, replyToMessageId || null]
    );
    return result.insertId;
};

const getMessageByIdRaw = async (messageId) => {
    const connection = getConnection();
    const [rows] = await connection.execute(`
        ${getMessagesQuery}
        WHERE m.id = ?
        GROUP BY m.id
    `, [messageId]);
    return rows.length > 0 ? rows[0] : null;
};

const findLike = async (messageId, userId) => {
    const connection = getConnection();
    const [rows] = await connection.execute(
        'SELECT * FROM chat_message_likes WHERE messageId = ? AND userId = ?',
        [messageId, userId]
    );
    return rows.length > 0;
};

const addLike = async (messageId, userId) => {
    const connection = getConnection();
    await connection.execute(
        'INSERT INTO chat_message_likes (messageId, userId) VALUES (?, ?)',
        [messageId, userId]
    );
};

const removeLike = async (messageId, userId) => {
    const connection = getConnection();
    await connection.execute(
        'DELETE FROM chat_message_likes WHERE messageId = ? AND userId = ?',
        [messageId, userId]
    );
};

module.exports = {
    getGlobalMessagesRaw,
    getChapterMessagesRaw,
    postMessageRaw,
    getMessageByIdRaw,
    findLike,
    addLike,
    removeLike
};