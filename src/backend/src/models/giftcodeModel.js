const { getConnection } = require('../db/connection');

const GiftCode = {
  findByCode: async (code) => {
    const connection = await getConnection();
    const [rows] = await connection.query('SELECT * FROM giftcodes WHERE code = ? AND isActive = 1', [code]);
    return rows[0];
  },

  checkUsage: async (userId, giftcodeId) => {
    const connection = await getConnection();
    const [rows] = await connection.query('SELECT * FROM user_giftcode_usage WHERE userId = ? AND giftcodeId = ?', [userId, giftcodeId]);
    return rows[0];
  },

  recordUsage: async (userId, giftcodeId, connection) => {
    await connection.query('INSERT INTO user_giftcode_usage (userId, giftcodeId) VALUES (?, ?)', [userId, giftcodeId]);
  },

  incrementUsedCount: async (giftcodeId, connection) => {
    await connection.query('UPDATE giftcodes SET usedCount = usedCount + 1 WHERE id = ?', [giftcodeId]);
  },

  updateUserRewards: async (userId, coinBalance, exp, connection) => {
    let query = 'UPDATE users SET ';
    const params = [];
    const updates = [];
    
    if (coinBalance > 0) {
      updates.push('coinBalance = coinBalance + ?');
      params.push(coinBalance);
    }
    if (exp > 0) {
      updates.push('exp = exp + ?');
      params.push(exp);
    }

    if (updates.length === 0) return;

    query += updates.join(', ') + ' WHERE id = ?';
    params.push(userId);
    await connection.query(query, params);
  },

  addVoucherToUser: async (userId, voucherId, connection) => {
    if (!voucherId) return;
    await connection.query('INSERT INTO user_vouchers (userId, voucherId, isUsed) VALUES (?, ?, 0)', [userId, voucherId]);
  }
};

module.exports = GiftCode;