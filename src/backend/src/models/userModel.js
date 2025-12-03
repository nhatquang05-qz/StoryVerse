const { getConnection } = require('../db/connection');

const findUserByEmail = async (email) => {
    const connection = getConnection();
    const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows.length > 0 ? rows[0] : null;
};

const findUserById = async (id, lock = false) => {
    const connection = getConnection();
    const lockClause = lock ? 'FOR UPDATE' : '';
    const [rows] = await connection.execute(`SELECT * FROM users WHERE id = ? ${lockClause}`, [id]);
    return rows.length > 0 ? rows[0] : null;
};

const findUserByResetToken = async (token) => {
    const connection = getConnection();
    const [rows] = await connection.execute(
        'SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > ?',
        [token, new Date()]
    );
    return rows.length > 0 ? rows[0] : null;
};

const getTopUsersRaw = async (safeLimit) => {
    const connection = getConnection();
    const query = `
        SELECT id, fullName, level, exp, avatarUrl, levelSystem, CAST(level AS UNSIGNED) * 100 + CAST(exp AS DECIMAL(5,2)) AS score
        FROM users
        ORDER BY CAST(level AS UNSIGNED) DESC, CAST(exp AS DECIMAL(5,2)) DESC
        LIMIT ${safeLimit}
    `;

    const [rows] = await connection.query(query);
    return rows;
};

const getUnlockedChaptersRaw = async (userId) => {
    const connection = getConnection();
    const query = `
        SELECT 
            uuc.chapterId,
            ch.comicId,
            c.title AS comicTitle,
            ch.chapterNumber,
            ch.title AS title,
            ch.price,
            uuc.unlockedAt
        FROM user_unlocked_chapters uuc
        JOIN chapters ch ON uuc.chapterId = ch.id
        JOIN comics c ON ch.comicId = c.id
        WHERE uuc.userId = ?
        ORDER BY uuc.unlockedAt DESC
    `;
    
    try {
        const [rows] = await connection.execute(query, [userId]);
        return rows;
    } catch (error) {
        console.error("Error fetching unlocked chapters:", error);
        return [];
    }
};

const getWishlistRaw = async (userId) => {
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
    return rows;
};

const findWishlistEntry = async (userId, comicId) => {
    const connection = getConnection();
    const [rows] = await connection.execute(
        'SELECT 1 FROM user_wishlist WHERE userId = ? AND comicId = ?',
        [userId, comicId]
    );
    return rows.length > 0;
};

const checkComicExists = async (comicId) => {
    const connection = getConnection();
    const [rows] = await connection.execute('SELECT 1 FROM comics WHERE id = ?', [comicId]);
    return rows.length > 0;
};

const getAllUsersRaw = async () => {
    const connection = getConnection();
    const [rows] = await connection.execute(
        'SELECT id, fullName, email, coinBalance, level, exp, isBanned FROM users'
    );
    return rows;
};

const createNewUser = async (email, hashedPassword, fullName, addresses, avatarUrl = null) => {
    const connection = getConnection();
    const emptyAddresses = JSON.stringify([]);
    const [result] = await connection.execute(
      'INSERT INTO users (email, password, fullName, phone, coinBalance, lastDailyLogin, consecutiveLoginDays, level, exp, addresses, avatarUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, fullName, '', 1000, '2000-01-01 00:00:00', 0, 1, '0.00', emptyAddresses, avatarUrl]
    );
    return result.insertId;
};

const updateResetToken = async (id, token, expires) => {
    const connection = getConnection();
    await connection.execute(
        'UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE id = ?',
        [token, expires, id]
    );
};

const resetPasswordRaw = async (id, hashedPassword) => {
    const connection = getConnection();
    await connection.execute(
      'UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE id = ?',
      [hashedPassword, id]
    );
};

const updateProfileRaw = async (userId, fullName, phone) => {
    const connection = getConnection();
    await connection.execute(
      'UPDATE users SET fullName = ?, phone = ? WHERE id = ?',
      [fullName, phone, userId]
    );
};

const updateAvatarRaw = async (userId, avatarUrl) => {
    const connection = getConnection();
    await connection.execute(
        'UPDATE users SET avatarUrl = ? WHERE id = ?',
        [avatarUrl, userId]
    );
};

const toggleWishlistAdd = async (userId, comicId) => {
    const connection = getConnection();
    await connection.execute(
        'INSERT INTO user_wishlist (userId, comicId) VALUES (?, ?)',
        [userId, comicId]
    );
};

const toggleWishlistRemove = async (userId, comicId) => {
    const connection = getConnection();
    await connection.execute(
        'DELETE FROM user_wishlist WHERE userId = ? AND comicId = ?',
        [userId, comicId]
    );
};

const updateUserBalanceAndExpRaw = async (id, newCoinBalance, currentLevel, currentExp) => {
    const connection = getConnection();
    await connection.execute(
        'UPDATE users SET coinBalance = ?, level = ?, exp = ? WHERE id = ?',
        [newCoinBalance, currentLevel, currentExp.toFixed(2), id]
    );
}

const updateAdminUserRaw = async (id, coinBalance, level, exp) => {
    const connection = getConnection();
    await connection.execute(
        'UPDATE users SET coinBalance = ?, level = ?, exp = ? WHERE id = ?',
        [Number(coinBalance), Number(level), Number(exp), id]
    );
};

const toggleUserBanRaw = async (id, isBanned) => {
    const connection = getConnection();
    await connection.execute(
        'UPDATE users SET isBanned = ? WHERE id = ?',
        [isBanned ? 1 : 0, id]
    );
};

const deleteUserDependenciesRaw = async (id) => {
    const connection = getConnection();
    
    try { await connection.execute('DELETE FROM chat_messages WHERE userId = ?', [id]); } catch (e) {}
    try { await connection.execute('DELETE FROM user_wishlist WHERE userId = ?', [id]); } catch (e) {}
    try { await connection.execute('DELETE FROM user_unlocked_chapters WHERE userId = ?', [id]); } catch (e) {}
    try { await connection.execute('DELETE FROM reviews WHERE userId = ?', [id]); } catch (e) {}
    try { await connection.execute('DELETE FROM user_library WHERE userId = ?', [id]); } catch (e) {}
    try { await connection.execute('DELETE FROM cart_items WHERE userId = ?', [id]); } catch (e) {}
    try { await connection.execute('DELETE FROM orders WHERE userId = ?', [id]); } catch (e) {}
    try { await connection.execute('DELETE FROM payment_transactions WHERE userId = ?', [id]); } catch (e) {}
};

const deleteUserRaw = async (id) => {
    const connection = getConnection();
    const [result] = await connection.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows;
};

const updateLevelSystemRaw = async (userId, systemKey) => {
    const connection = getConnection();
    await connection.execute(
        'UPDATE users SET levelSystem = ? WHERE id = ?',
        [systemKey, userId]
    );
};

const getPublicUserByIdRaw = async (id) => {
    const connection = getConnection();
    const query = `
        SELECT id, fullName, avatarUrl, level, levelSystem, acc_created_at AS createdAt, exp
        FROM users 
        WHERE id = ?
    `;
    const [rows] = await connection.execute(query, [id]);
    return rows.length > 0 ? rows[0] : null;
};
const getUserRecentReviewsRaw = async (userId) => {
    const connection = getConnection();
    const query = `
        SELECT r.id, r.rating, r.comment, r.createdAt,
               c.title AS comicTitle, c.coverImageUrl, c.id AS comicId
        FROM reviews r
        JOIN comics c ON r.comicId = c.id
        WHERE r.userId = ?
        ORDER BY r.createdAt DESC
        LIMIT 10
    `;
    const [rows] = await connection.execute(query, [userId]);
    return rows;
};

const getUserRecentCommentsRaw = async (userId) => {
    const connection = getConnection();
    const query = `
        SELECT m.id, m.message, m.createdAt,
               c.title AS comicTitle, c.coverImageUrl, c.id AS comicId,
               ch.chapterNumber, ch.title AS chapterTitle
        FROM chat_messages m
        JOIN comics c ON m.comicId = c.id
        LEFT JOIN chapters ch ON m.chapterId = ch.id
        WHERE m.userId = ? AND m.comicId IS NOT NULL
        ORDER BY m.createdAt DESC
        LIMIT 10
    `;
    const [rows] = await connection.execute(query, [userId]);
    return rows;
};

module.exports = { 
    findUserByEmail, findUserById, findUserByResetToken,
    createNewUser, updateResetToken, resetPasswordRaw,
    updateProfileRaw, updateAvatarRaw,
    getTopUsersRaw, getUnlockedChaptersRaw, getWishlistRaw,
    findWishlistEntry, checkComicExists, toggleWishlistAdd, toggleWishlistRemove,
    updateUserBalanceAndExpRaw,
    getAllUsersRaw, updateAdminUserRaw, toggleUserBanRaw, deleteUserDependenciesRaw, deleteUserRaw,
    updateLevelSystemRaw, getPublicUserByIdRaw, getUserRecentReviewsRaw, getUserRecentCommentsRaw
};