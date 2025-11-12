const { getConnection } = require('../db/connection');

const getUserForRewardRaw = async (userId, lock = false) => {
    const connection = getConnection();
    const lockClause = lock ? 'FOR UPDATE' : '';
    const [rows] = await connection.execute(
        `SELECT lastDailyLogin, consecutiveLoginDays, coinBalance, level, exp FROM users WHERE id = ? ${lockClause}`,
        [userId]
    );
    return rows.length > 0 ? rows[0] : null;
};

const updateDailyLoginRaw = async (userId, newBalance, nextLoginDays) => {
    const connection = getConnection();
    await connection.execute(
        'UPDATE users SET coinBalance = ?, lastDailyLogin = NOW(), consecutiveLoginDays = ? WHERE id = ?',
        [newBalance, nextLoginDays, userId]
    );
};

module.exports = { 
    getUserForRewardRaw, 
    updateDailyLoginRaw 
};