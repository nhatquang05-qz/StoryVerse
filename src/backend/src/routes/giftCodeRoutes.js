const express = require('express');
const router = express.Router();
const giftCodeController = require('../controllers/giftcodeController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/redeem',  authenticateToken, giftCodeController.redeemGiftCode);

module.exports = router;