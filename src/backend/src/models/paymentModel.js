const { getConnection } = require('../db/connection');

const createTransactionRaw = async (userId, orderId, amount, status, type, description, transactionCode) => {
    const connection = getConnection();
    
    // Cập nhật câu lệnh SQL thêm cột transactionCode
    const [result] = await connection.execute(
        'INSERT INTO payment_transactions (userId, orderId, amount, status, type, description, transactionCode) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, orderId, amount, status, type, description, transactionCode]
    );
    return result.insertId;
};

const getTransactionHistoryRaw = async (userId) => {
    const connection = getConnection();

    const query = `
        SELECT 
            t.id, 
            t.userId, 
            t.orderId,
            t.transactionCode, 
            t.amount, 
            t.status, 
            t.type, 
            t.createdAt,
            item_info.titles as purchasedItem, 
            CASE 
                WHEN t.description IS NOT NULL AND t.description != '' THEN t.description
                WHEN (t.type = 'purchase' OR t.type = 'buy') AND item_info.titles IS NOT NULL THEN CONCAT('Mua: ', item_info.titles)
                WHEN (t.type = 'deposit' OR t.type = 'recharge') THEN CONCAT('Nạp ', FORMAT(t.amount, 0), ' VNĐ')
                WHEN (t.type = 'purchase' OR t.type = 'buy') THEN 'Mua truyện/vật phẩm'
                ELSE 'Giao dịch hệ thống'
            END as description
        FROM payment_transactions t
        LEFT JOIN (
            SELECT 
                o.id as order_ref_id, 
                GROUP_CONCAT(oi.title SEPARATOR ', ') as titles
            FROM orders o
            JOIN order_items oi ON o.id = oi.orderId
            GROUP BY o.id
        ) item_info ON t.orderId COLLATE utf8mb4_unicode_ci = CAST(item_info.order_ref_id AS CHAR) COLLATE utf8mb4_unicode_ci
        WHERE t.userId = ? 
        ORDER BY t.createdAt DESC
    `;
    
    try {
        const [rows] = await connection.execute(query, [userId]);
        return rows;
    } catch (error) {
        console.error("Error fetching transaction history:", error);
        const [simpleRows] = await connection.execute(
            'SELECT *, NULL as purchasedItem FROM payment_transactions WHERE userId = ? ORDER BY createdAt DESC', 
            [userId]
        );
        return simpleRows;
    }
};

const getTransactionByCode = async (transactionCode) => {
    const connection = getConnection();
    const [rows] = await connection.execute(
        'SELECT * FROM payment_transactions WHERE transactionCode = ?',
        [transactionCode]
    );
    return rows[0]; 
};

const createPayment = createTransactionRaw;

module.exports = { 
    createTransactionRaw, 
    getTransactionHistoryRaw,
    createPayment,
    getTransactionByCode
};