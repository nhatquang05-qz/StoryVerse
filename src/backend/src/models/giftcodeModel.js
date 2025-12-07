const { getConnection } = require('../db/connection');

const GiftCode = {
  // ... (Giữ nguyên các hàm findByCode, checkUsage, recordUsage, incrementUsedCount, updateUserRewards cũ) ...
  findByCode: async (code) => {
    const connection = await getConnection();
    const [rows] = await connection.query('SELECT * FROM giftcodes WHERE code = ?', [code]); // Bỏ check isActive ở đây để Admin còn tìm được
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

  updateUserRewards: async (userId, coin, exp, connection) => {
    let query = 'UPDATE users SET ';
    const params = [];
    const updates = [];
    
    if (coin > 0) {
      updates.push('coinBalance = coinBalance + ?'); // Lưu ý: Check lại tên cột trong DB là coin hay coinBalance, code cũ bạn dùng coinBalance ở FE nhưng update coin ở BE. Tôi dùng coinBalance cho khớp userModel.
      params.push(coin);
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

  // --- SỬA LOGIC VOUCHER: Kiểm tra xem user đã có voucher này chưa ---
  addVoucherToUser: async (userId, voucherId, connection) => {
    if (!voucherId) return;
    
    // Kiểm tra xem user đã sở hữu voucher này chưa (bất kể đã dùng hay chưa)
    const [existing] = await connection.query(
        'SELECT id FROM user_vouchers WHERE userId = ? AND voucherId = ?', 
        [userId, voucherId]
    );

    if (existing.length > 0) {
        // User đã có voucher này rồi -> Không cộng thêm nữa (đúng yêu cầu mỗi tk chỉ xài 1 lần/sở hữu 1 cái)
        return; 
    }

    await connection.query('INSERT INTO user_vouchers (userId, voucherId, isUsed) VALUES (?, ?, 0)', [userId, voucherId]);
  },

  // --- CÁC HÀM CHO ADMIN ---
  getAll: async () => {
    const connection = await getConnection();
    const [rows] = await connection.query('SELECT * FROM giftcodes ORDER BY id DESC');
    return rows;
  },

  create: async (data) => {
    const connection = await getConnection();
    const { code, coinReward, expReward, voucherId, usageLimit, expiryDate } = data;
    const [result] = await connection.query(
      'INSERT INTO giftcodes (code, coinReward, expReward, voucherId, usageLimit, expiryDate, isActive) VALUES (?, ?, ?, ?, ?, ?, 1)',
      [code, coinReward || 0, expReward || 0, voucherId || null, usageLimit || 1, expiryDate]
    );
    return result.insertId;
  },

  update: async (id, data) => {
    const connection = await getConnection();
    const { code, coinReward, expReward, voucherId, usageLimit, expiryDate, isActive } = data;
    await connection.query(
      'UPDATE giftcodes SET code = ?, coinReward = ?, expReward = ?, voucherId = ?, usageLimit = ?, expiryDate = ?, isActive = ? WHERE id = ?',
      [code, coinReward, expReward, voucherId, usageLimit, expiryDate, isActive, id]
    );
  },

  delete: async (id) => {
    const connection = await getConnection();
    await connection.query('DELETE FROM giftcodes WHERE id = ?', [id]);
  }
};

module.exports = GiftCode;