const { getConnection } = require('../db/connection');

const createReviewRaw = async (userId, comicId, orderId, rating, comment, images, video) => {
    const connection = getConnection();
    const [result] = await connection.execute(
        `INSERT INTO reviews (userId, comicId, orderId, rating, comment, images, video, createdAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [userId, comicId, orderId, rating, comment, JSON.stringify(images), video]
    );
    return result.insertId;
};

const checkReviewByOrderRaw = async (orderId) => {
    const connection = getConnection();
    const [rows] = await connection.execute('SELECT id FROM reviews WHERE orderId = ? LIMIT 1', [orderId]);
    return rows.length > 0;
};

module.exports = { createReviewRaw, checkReviewByOrderRaw };