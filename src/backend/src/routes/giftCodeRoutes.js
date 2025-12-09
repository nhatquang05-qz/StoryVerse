const express = require('express');
const router = express.Router();
const giftCodeController = require('../controllers/giftCodeController');
const authMiddleware = require('../middleware/authMiddleware'); 

// User Route
router.post('/redeem', authMiddleware.authenticateToken, giftCodeController.redeemGiftCode);

// Admin Routes
router.get('/', authMiddleware.authenticateAdmin, giftCodeController.getAllGiftCodes);
router.post('/', authMiddleware.authenticateAdmin, giftCodeController.createGiftCode);
router.put('/:id', authMiddleware.authenticateAdmin, giftCodeController.updateGiftCode);
router.delete('/:id', authMiddleware.authenticateAdmin, giftCodeController.deleteGiftCode);

module.exports = router;