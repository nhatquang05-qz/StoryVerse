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
        SELECT c.*, u.fullName, u.email, o.id as orderDisplayId 
        FROM complaints c
        JOIN users u ON c.userId = u.id
        JOIN orders o ON c.orderId = o.id
        ORDER BY c.createdAt DESC
    `);
    return rows;
};

module.exports = {
    createComplaintRaw,
    getComplaintByOrderRaw,
    updateComplaintStatusRaw,
    getAllComplaintsRaw
};