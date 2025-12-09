const complaintModel = require('../models/complaintModel');
const Notification = require('../models/notificationModel');

const createComplaint = async (req, res) => {
    try {
        const { orderId, description, images, video } = req.body;
        const userId = req.userId;

        const existing = await complaintModel.getComplaintByOrderRaw(orderId);
        if (existing) {
            return res.status(400).json({ message: 'Đơn hàng này đã có khiếu nại.' });
        }

        await complaintModel.createComplaintRaw(userId, orderId, description, images, video);
        res.status(201).json({ message: 'Gửi khiếu nại thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const getComplaintByOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const complaint = await complaintModel.getComplaintByOrderRaw(orderId);
        res.json({ complaint });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const adminReplyComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminReply, status } = req.body;

        await complaintModel.updateComplaintStatusRaw(id, adminReply, status);

        res.json({ message: 'Đã xử lý khiếu nại' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

module.exports = {
    createComplaint,
    getComplaintByOrder,
    adminReplyComplaint
};