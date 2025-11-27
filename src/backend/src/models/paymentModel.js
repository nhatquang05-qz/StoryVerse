const { getConnection } = require('../db/connection');

const createTransactionRaw = async (userId, orderId, amount, status, type, description) => {
    const connection = getConnection();
    const [result] = await connection.execute(
        'INSERT INTO payment_transactions (userId, orderId, amount, status, type, description) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, orderId, amount, status, type, description]
    );
    return result.insertId;
};

const getTransactionHistoryRaw = async (userId) => {
    const connection = getConnection();
    const [rows] = await connection.execute(
        'SELECT * FROM payment_transactions WHERE userId = ? ORDER BY createdAt DESC',
        [userId]
    );
    return rows;
};

module.exports = { createTransactionRaw, getTransactionHistoryRaw };