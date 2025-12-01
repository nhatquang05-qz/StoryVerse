const { getConnection } = require('../db/connection');

const Notification = {
    create: async (data) => {
        const db = getConnection();
        const sql = `INSERT INTO notifications (userId, type, title, message, referenceId, referenceType, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await db.execute(sql, [
            data.userId, data.type, data.title, data.message, 
            data.referenceId || null, data.referenceType || null, data.imageUrl || null
        ]);
        return result.insertId;
    },

    getByUserId: async (userId, limit = 20, offset = 0) => {
        const db = getConnection(); 
        const sql = `SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
        const [rows] = await db.execute(sql, [userId, String(limit), String(offset)]);
        return rows;
    },

    countUnread: async (userId) => {
        const db = getConnection(); 
        const sql = `SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = 0`;
        const [rows] = await db.execute(sql, [userId]);
        return rows[0].count;
    },

    markAsRead: async (id, userId) => {
        const db = getConnection();
        const sql = `UPDATE notifications SET isRead = 1 WHERE id = ? AND userId = ?`;
        await db.execute(sql, [id, userId]);
    },

    markAllAsRead: async (userId) => {
        const db = getConnection(); 
        const sql = `UPDATE notifications SET isRead = 1 WHERE userId = ?`;
        await db.execute(sql, [userId]);
    }
};

module.exports = Notification;