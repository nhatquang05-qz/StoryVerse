const reviewModel = require('../models/reviewModel');

exports.createReview = async (req, res) => {
    try {
        const userId = req.userId;
        const { comicId, orderId, rating, comment, images, video } = req.body;

        await reviewModel.createReviewRaw(userId, comicId, orderId, rating, comment, images, video);
        res.status(201).json({ message: 'Đánh giá thành công' });
    } catch (error) {
        console.error('Create Review Error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này rồi.' });
        }
        res.status(500).json({ message: 'Lỗi server khi tạo đánh giá' });
    }
};

exports.checkReviewOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const hasReviewed = await reviewModel.checkReviewByOrderRaw(orderId);
        res.json({ reviewed: hasReviewed });
    } catch (error) {
        console.error('Check Review Error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};