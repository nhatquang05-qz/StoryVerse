// src/backend/src/controllers/userController.js
const { getConnection } = require('../db/connection');
const ensureUserDataTypes = require('../utils/ensureUserDataTypes');

const getMe = async (req, res) => {
  try {
    const connection = getConnection();
    const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [req.userId]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const { password, ...userData } = rows[0];
    const finalUserData = ensureUserDataTypes(userData);

    res.json(finalUserData);
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    if (typeof fullName !== 'string' || fullName.trim() === '' || typeof phone !== 'string' || phone.trim() === '') {
        return res.status(400).json({ error: 'Họ tên và Số điện thoại không hợp lệ.' });
    }

    const connection = getConnection();
    await connection.execute(
      'UPDATE users SET fullName = ?, phone = ? WHERE id = ?',
      [fullName.trim(), phone.trim(), req.userId]
    );

    const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [req.userId]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found after update' });

    const { password, ...updatedUser } = rows[0];
    const finalUserData = ensureUserDataTypes(updatedUser);

    res.json(finalUserData);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

const updateAvatar = async (req, res) => {
    try {
        const { avatarUrl } = req.body;
        if (!avatarUrl || typeof avatarUrl !== 'string') {
            return res.status(400).json({ error: 'Avatar URL không hợp lệ.' });
        }

        const connection = getConnection();
        await connection.execute(
            'UPDATE users SET avatarUrl = ? WHERE id = ?',
            [avatarUrl, req.userId]
        );

        const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [req.userId]);
        if (rows.length === 0) return res.status(404).json({ message: 'User not found after update' });

        const { password, ...updatedUser } = rows[0];
        const finalUserData = ensureUserDataTypes(updatedUser);

        res.json({ message: 'Avatar updated successfully', user: finalUserData });

    } catch (error) {
        console.error('Update avatar error:', error);
        res.status(500).json({ error: 'Failed to update avatar' });
    }
};

const getTopUsers = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const safeLimit = Math.max(1, Math.floor(limit));
        
        const connection = getConnection();
        const query = `
            SELECT id, fullName, level, exp, avatarUrl, CAST(level AS UNSIGNED) * 100 + CAST(exp AS DECIMAL(5,2)) AS score
            FROM users
            ORDER BY CAST(level AS UNSIGNED) DESC, CAST(exp AS DECIMAL(5,2)) DESC
            LIMIT ${safeLimit}
        `;

        const [rows] = await connection.query(query);

        const topUsers = rows.map(user => ({
             id: String(user.id),
             fullName: user.fullName || 'Người dùng ẩn danh',
             level: parseInt(user.level) || 1,
             avatarUrl: user.avatarUrl || 'https://via.placeholder.com/45',
             score: parseFloat(user.score) || 0
        }));

        res.json(topUsers);

    } catch (error) {
        console.error("Get top users error:", error);
        res.status(500).json({ error: error.message || 'Failed to fetch top users' });
    }
};

const getUnlockedChapters = async (req, res) => {
    try {
        const { userId } = req;
        const connection = getConnection();
        const [rows] = await connection.execute(
            'SELECT chapterId FROM user_unlocked_chapters WHERE userId = ?',
            [userId]
        );
        res.json(rows);
    } catch (error) {
        console.error("Get unlocked chapters error:", error);
        res.status(500).json({ error: 'Failed to fetch unlocked chapters' });
    }
};

module.exports = { getMe, updateProfile, updateAvatar, getTopUsers, getUnlockedChapters };