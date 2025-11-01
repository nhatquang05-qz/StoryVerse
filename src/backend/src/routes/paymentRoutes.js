const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

// Các route CẦN xác thực người dùng (khi họ bấm nút thanh toán)
router.post('/create-coin-recharge', authMiddleware, paymentController.createCoinRecharge);
router.post('/create-order-payment', authMiddleware, paymentController.createOrderPayment);

// Route IPN (Webhook) do Server Sepay gọi (KHÔNG cần authMiddleware)
// Endpoint này phải khớp với `ipn_url` trong controller
router.post('/sepay-ipn', paymentController.handleSepayIPN);

module.exports = router;