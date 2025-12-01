const { getConnection } = require('../db/connection');

const getCartByUserId = async (userId) => {
    const connection = getConnection();
    const query = `
        SELECT c.id, c.id AS comicId, c.title, c.author, c.price, c.coverImageUrl as imageUrl, c.isDigital, ci.quantity
        FROM cart_items ci
        JOIN comics c ON ci.comicId = c.id
        WHERE ci.userId = ?
    `;
    const [rows] = await connection.execute(query, [userId]);
    return rows;
};

const addToCartRaw = async (userId, comicId, quantity) => {
    const connection = getConnection();
    const query = `
        INSERT INTO cart_items (userId, comicId, quantity) 
        VALUES (?, ?, ?) 
        ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
    `;
    await connection.execute(query, [userId, comicId, quantity]);
};

const updateQuantityRaw = async (userId, comicId, quantity) => {
    const connection = getConnection();
    await connection.execute(
        'UPDATE cart_items SET quantity = ? WHERE userId = ? AND comicId = ?',
        [quantity, userId, comicId]
    );
};

const removeFromCartRaw = async (userId, comicId) => {
    const connection = getConnection();
    await connection.execute(
        'DELETE FROM cart_items WHERE userId = ? AND comicId = ?',
        [userId, comicId]
    );
};

const clearCartRaw = async (userId) => {
    const connection = getConnection();
    await connection.execute('DELETE FROM cart_items WHERE userId = ?', [userId]);
};

module.exports = { 
    getCartByUserId, 
    addToCartRaw, 
    updateQuantityRaw, 
    removeFromCartRaw, 
    clearCartRaw 
};