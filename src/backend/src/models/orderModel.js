const { getConnection } = require('../db/connection');

const createOrderRaw = async (userId, fullName, phone, address, totalAmount, paymentMethod, items) => {
    const connection = getConnection();
    await connection.beginTransaction();
    try {
        const [result] = await connection.execute(
            'INSERT INTO orders (userId, fullName, phone, address, totalAmount, paymentMethod, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
            [userId, fullName, phone, address, totalAmount, paymentMethod, 'PENDING']
        );
        const orderId = result.insertId;

        if (items && items.length > 0) {
            const values = items.map(item => [orderId, item.id, item.quantity, item.price, item.title, item.coverImageUrl]);
            await connection.query(
                'INSERT INTO order_items (orderId, comicId, quantity, price, title, coverImageUrl) VALUES ?',
                [values]
            );
        }

        await connection.commit();
        return orderId;
    } catch (error) {
        await connection.rollback();
        throw error;
    }
};

const getOrdersByUserIdRaw = async (userId) => {
    const connection = getConnection();
    const [rows] = await connection.execute(
        'SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC',
        [userId]
    );
    for (let order of rows) {
        const [items] = await connection.execute(
            'SELECT * FROM order_items WHERE orderId = ?',
            [order.id]
        );
        order.items = items;
    }
    return rows;
};

const getOrderItemsRaw = async (orderId) => {
    const connection = getConnection();
    const [rows] = await connection.execute(
        `SELECT oi.*, c.title, c.coverImageUrl 
         FROM order_items oi
         JOIN comics c ON oi.comicId = c.id
         WHERE oi.orderId = ?`,
        [orderId]
    );
    return rows;
};

const getAllOrdersRaw = async (limit, offset) => {
    const connection = getConnection();
    const limitInt = Number(limit) || 20;
    const offsetInt = Number(offset) || 0;

    const [rows] = await connection.query(
        `SELECT o.id, o.userId, o.totalAmount, o.status, o.paymentMethod, o.createdAt, 
                u.fullName, u.email, u.phone,
                t.transactionCode 
         FROM orders o
         JOIN users u ON o.userId = u.id
         LEFT JOIN payment_transactions t 
            ON t.orderId COLLATE utf8mb4_unicode_ci = CAST(o.id AS CHAR) COLLATE utf8mb4_unicode_ci 
            AND t.type = 'PURCHASE'
         ORDER BY o.createdAt DESC
         LIMIT ? OFFSET ?`,
        [limitInt, offsetInt]
    );
    return rows;
};

const getOrderCountRaw = async () => {
    const connection = getConnection();
    const [rows] = await connection.execute('SELECT COUNT(*) as total FROM orders');
    return rows[0].total;
};

const updateOrderStatusRaw = async (orderId, status) => {
    const connection = getConnection();
    await connection.execute('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
};

module.exports = {
    createOrderRaw,
    getOrdersByUserIdRaw,
    getOrderItemsRaw,
    getAllOrdersRaw,
    getOrderCountRaw,
    updateOrderStatusRaw
};