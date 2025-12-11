const { getConnection } = require('../db/connection');

const getAllPacks = async (isAdmin = false) => {
    const connection = getConnection();
    const query = isAdmin 
        ? 'SELECT * FROM recharge_packs ORDER BY price ASC'
        : 'SELECT * FROM recharge_packs WHERE isActive = 1 ORDER BY price ASC';
    const [rows] = await connection.execute(query);
    return rows;
};

const createPack = async (data) => {
    const connection = getConnection();
    const { coins, price, bonus, isActive } = data;
    const [result] = await connection.execute(
        'INSERT INTO recharge_packs (coins, price, bonus, isActive) VALUES (?, ?, ?, ?)',
        [coins, price, bonus, isActive ? 1 : 0]
    );
    return result.insertId;
};

const updatePack = async (id, data) => {
    const connection = getConnection();
    const { coins, price, bonus, isActive } = data;
    await connection.execute(
        'UPDATE recharge_packs SET coins = ?, price = ?, bonus = ?, isActive = ? WHERE id = ?',
        [coins, price, bonus, isActive ? 1 : 0, id]
    );
};

const deletePack = async (id) => {
    const connection = getConnection();
    await connection.execute('DELETE FROM recharge_packs WHERE id = ?', [id]);
};

module.exports = { getAllPacks, createPack, updatePack, deletePack };