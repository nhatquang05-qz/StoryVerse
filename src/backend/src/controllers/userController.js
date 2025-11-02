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

const getWishlist = async (req, res) => {
    try {
        const { userId } = req;
        const connection = getConnection();

        const [rows] = await connection.execute(
            `SELECT 
                c.id, c.title, c.author, c.coverImageUrl, c.isDigital, c.price, c.status, c.viewCount, c.updatedAt,
                (SELECT AVG(rating) FROM reviews WHERE comicId = c.id) AS averageRating,
                (SELECT COUNT(id) FROM reviews WHERE comicId = c.id) AS totalReviews
            FROM user_wishlist uw
            JOIN comics c ON uw.comicId = c.id
            WHERE uw.userId = ?`,
            [userId]
        );

        const comicsWithRating = rows.map(comic => ({
            ...comic,
            isDigital: comic.isDigital === 1,
            averageRating: parseFloat(comic.averageRating) || 0,
            totalReviews: parseInt(comic.totalReviews) || 0,
            price: parseFloat(comic.price) || 0,
            viewCount: parseInt(comic.viewCount) || 0,
        }));

        res.json(comicsWithRating);
    } catch (error) {
        console.error("Get wishlist error:", error);
        res.status(500).json({ error: 'Failed to fetch wishlist' });
    }
};

const toggleWishlist = async (req, res) => {
    try {
        const { userId } = req;
        const { comicId } = req.body;

        if (!comicId) {
            return res.status(400).json({ error: 'Comic ID is required' });
        }

        const connection = getConnection();
        
        const [existing] = await connection.execute(
            'SELECT 1 FROM user_wishlist WHERE userId = ? AND comicId = ?',
            [userId, comicId]
        );

        let isAdded = false;
        if (existing.length > 0) {
            await connection.execute(
                'DELETE FROM user_wishlist WHERE userId = ? AND comicId = ?',
                [userId, comicId]
            );
        } else {
            const [comicCheck] = await connection.execute('SELECT 1 FROM comics WHERE id = ?', [comicId]);
            if (comicCheck.length === 0) {
                 return res.status(404).json({ error: 'Comic not found' });
            }

            await connection.execute(
                'INSERT INTO user_wishlist (userId, comicId) VALUES (?, ?)',
                [userId, comicId]
            );
            isAdded = true;
        }

        res.json({ message: 'Wishlist updated successfully', isAdded });
    } catch (error) {
        console.error("Toggle wishlist error:", error);
        res.status(500).json({ error: 'Failed to update wishlist' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const connection = getConnection();
        const [rows] = await connection.execute(
            'SELECT id, fullName, email, coinBalance, level, exp, isBanned  FROM users'
        );
        
        const users = rows.map(user => ({
            ...user,
            id: String(user.id),
            coinBalance: parseInt(user.coinBalance) || 0,
            level: parseInt(user.level) || 1,
            exp: parseFloat(user.exp) || 0,
            isBanned: user.isBanned === 1,
        }));

        res.json(users);
    } catch (error) {
        console.error("Admin Get All Users error:", error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

const updateUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const { coinBalance, level, exp } = req.body;

        if (coinBalance === undefined || level === undefined || exp === undefined) {
            return res.status(400).json({ error: 'Vui lòng cung cấp đủ thông tin coinBalance, level, và exp' });
        }

        const connection = getConnection();
        await connection.execute(
            'UPDATE users SET coinBalance = ?, level = ?, exp = ? WHERE id = ?',
            [Number(coinBalance), Number(level), Number(exp), id]
        );

        res.json({ message: 'Cập nhật người dùng thành công' });
    } catch (error) {
        console.error("Admin Update User error:", error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

const toggleUserBan = async (req, res) => {
    try {
        const { id } = req.params;
        const { isBanned } = req.body;

        if (isBanned === undefined) {
            return res.status(400).json({ error: 'Trạng thái isBanned là bắt buộc' });
        }
        
        const connection = getConnection();
        await connection.execute(
            'UPDATE users SET isBanned = ? WHERE id = ?',
            [isBanned ? 1 : 0, id]
        );

        const actionText = isBanned ? 'Cấm' : 'Bỏ cấm';
        res.json({ message: `${actionText} người dùng thành công` });
    } catch (error) {
        console.error("Admin Toggle Ban error:", error);
        res.status(500).json({ error: 'Failed to update user ban status' });
    }
};

const deleteUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const connection = getConnection();
        
        await connection.execute('DELETE FROM user_wishlist WHERE userId = ?', [id]);
        await connection.execute('DELETE FROM user_unlocked_chapters WHERE userId = ?', [id]);
        await connection.execute('DELETE FROM user_addresses WHERE userId = ?', [id]);

        const [result] = await connection.execute('DELETE FROM users WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Người dùng không tồn tại' });
        }

        res.json({ message: 'Xóa vĩnh viễn người dùng thành công' });
    } catch (error) {
        console.error("Admin Delete User error:", error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

module.exports = { 
    getMe, 
    updateProfile, 
    updateAvatar, 
    getTopUsers, 
    getUnlockedChapters, 
    getWishlist, 
    toggleWishlist,
    getAllUsers,
    updateUserById,
    toggleUserBan,
    deleteUserById
};