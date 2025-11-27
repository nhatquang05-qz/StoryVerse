const { getConnection } = require('../db/connection');

const createOrderRaw = async (userId, fullName, phone, address, totalAmount, paymentMethod, items) => {
    const connection = getConnection();
    
    const [orderResult] = await connection.execute(
        'INSERT INTO orders (userId, fullName, phone, address, totalAmount, paymentMethod, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, fullName, phone, address, totalAmount, paymentMethod, paymentMethod === 'COD' ? 'PROCESSING' : 'PENDING']
    );
    const orderId = orderResult.insertId;

    if (items && items.length > 0) {
        const itemValues = items.map(item => [
            orderId, 
            item.id, 
            item.quantity, 
            item.price, 
            item.title, 
            item.coverImageUrl || item.imageUrl
        ]);
        
        const query = 'INSERT INTO order_items (orderId, comicId, quantity, price, title, coverImageUrl) VALUES ?';
        await connection.query(query, [itemValues]);
    }

    return orderId;
};

const getOrdersByUserIdRaw = async (userId) => {
    const connection = getConnection();
    const [orders] = await connection.execute(
        'SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC',
        [userId]
    );
    
    for (let order of orders) {
        const [items] = await connection.execute(
            'SELECT * FROM order_items WHERE orderId = ?',
            [order.id]
        );
        order.items = items;
    }
    
    return orders;
};

const updateOrderStatusRaw = async (orderId, status) => {
    const connection = getConnection();
    await connection.execute(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, orderId]
    );
};

module.exports = { createOrderRaw, getOrdersByUserIdRaw, updateOrderStatusRaw };