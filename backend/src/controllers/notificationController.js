const Notification = require('../models/notificationModel');

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.userId; 
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const notifications = await Notification.getByUserId(userId, limit, offset);
        const unreadCount = await Notification.countUnread(userId);

        res.json({ notifications, unreadCount });
    } catch (error) {
        console.error("Error getting notifications:", error);
        res.status(500).json({ message: "Lỗi server khi lấy thông báo" });
    }
};

exports.markRead = async (req, res) => {
    try {
        const userId = req.userId; 
        const { id } = req.params;
        await Notification.markAsRead(id, userId);
        res.json({ success: true });
    } catch (error) {
        console.error("Error marking read:", error);
        res.status(500).json({ message: "Lỗi khi đánh dấu đã đọc" });
    }
};

exports.markAllRead = async (req, res) => {
    try {
        const userId = req.userId;
        await Notification.markAllAsRead(userId);
        res.json({ success: true });
    } catch (error) {
        console.error("Error marking all read:", error);
        res.status(500).json({ message: "Lỗi khi đánh dấu tất cả đã đọc" });
    }
};