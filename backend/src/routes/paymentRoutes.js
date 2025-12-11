const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/create_payment_url', authenticateToken, paymentController.createPaymentUrl);
router.post('/vnpay_return', paymentController.vnpayReturn);

module.exports = router;