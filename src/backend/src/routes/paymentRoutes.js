const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// SỬA DÒNG NÀY: Import { authenticateToken }
const { authenticateToken } = require('../middleware/authMiddleware'); 

// Các route CẦN xác thực người dùng (khi họ bấm nút thanh toán)
// SỬA DÒNG NÀY: Dùng authenticateToken
router.post('/create-coin-recharge', authenticateToken, paymentController.createCoinRecharge); 
// SỬA DÒNG NÀY: Dùng authenticateToken
router.post('/create-order-payment', authenticateToken, paymentController.createOrderPayment); 

// Route IPN (Webhook) do Server Sepay gọi (KHÔNG cần authMiddleware)
// Endpoint này phải khớp với `ipn_url` trong controller
router.post('/sepay-ipn', paymentController.handleSepayIPN);

module.exports = router;