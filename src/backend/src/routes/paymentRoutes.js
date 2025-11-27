// src/backend/src/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Route tạo URL thanh toán (yêu cầu đăng nhập)
router.post('/create_payment_url', authenticateToken, paymentController.createPaymentUrl);

// Route xử lý kết quả trả về từ Frontend (verify giao dịch)
router.post('/vnpay_return', paymentController.vnpayReturn);

module.exports = router;