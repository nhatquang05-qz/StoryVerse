const { getConnection } = require('../db/connection');

const createComplaintRaw = async (userId, orderId, description, images, video) => {
    const connection = getConnection();
    const [result] = await connection.execute(
        'INSERT INTO complaints (userId, orderId, description, images, video, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [userId, orderId, description, JSON.stringify(images), video, 'PENDING']
    );
    return result.insertId;
};

const getComplaintByOrderRaw = async (orderId) => {
    const connection = getConnection();
    const [rows] = await connection.execute(
        'SELECT * FROM complaints WHERE orderId = ?',
        [orderId]
    );
    return rows[0] || null;
};

const updateComplaintStatusRaw = async (id, adminReply, status) => {
    const connection = getConnection();
    await connection.execute(
        'UPDATE complaints SET adminReply = ?, status = ? WHERE id = ?',
        [adminReply, status, id]
    );
};

const getAllComplaintsRaw = async () => {
    const connection = getConnection();
    const [rows] = await connection.execute(`
        SELECT 
            c.*, 
            u.fullName, 
            u.email, 
            o.id as orderDisplayId, 
            t.transactionCode 
        FROM complaints c
        JOIN users u ON c.userId = u.id   -- Sửa user_id -> userId
        JOIN orders o ON c.orderId = o.id -- Sửa order_id -> orderId
        LEFT JOIN payment_transactions t 
            ON CAST(o.id AS CHAR) COLLATE utf8mb4_unicode_ci = t.orderId COLLATE utf8mb4_unicode_ci
        ORDER BY c.createdAt DESC         -- Sửa created_at -> createdAt
    `);
    return rows;
};

const getComplaintByIdRaw = async (id) => {
    const connection = getConnection();
    const [rows] = await connection.execute(`
        SELECT 
            c.userId, 
            c.orderId, 
            t.transactionCode 
        FROM complaints c
        JOIN orders o ON c.orderId = o.id
        LEFT JOIN payment_transactions t 
            ON CAST(o.id AS CHAR) COLLATE utf8mb4_unicode_ci = t.orderId COLLATE utf8mb4_unicode_ci
        WHERE c.id = ?
    `, [id]);
    return rows[0] || null;
};

module.exports = {
    createComplaintRaw,
    getComplaintByOrderRaw,
    updateComplaintStatusRaw,
    getAllComplaintsRaw,
    getComplaintByIdRaw
};