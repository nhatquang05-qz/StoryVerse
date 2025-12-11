const { getConnection } = require('../db/connection');

const findUserAddressesRaw = async (userId) => {
    const connection = getConnection();
    const [rows] = await connection.execute(
        'SELECT addresses FROM users WHERE id = ?',
        [userId]
    );
    return rows.length > 0 ? rows[0] : null;
};

const updateAddressesRaw = async (userId, addressesJson) => {
    const connection = getConnection();
    const [result] = await connection.execute(
        'UPDATE users SET addresses = ? WHERE id = ?',
        [addressesJson, userId]
    );
    return result;
};

module.exports = { findUserAddressesRaw, updateAddressesRaw };