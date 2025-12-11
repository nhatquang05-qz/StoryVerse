const express = require('express');
const router = express.Router();
const flashSaleController = require('../controllers/flashSaleController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

router.get('/active', flashSaleController.getActiveFlashSale);
router.get('/', authenticateAdmin, flashSaleController.getAllFlashSales);
router.post('/', authenticateAdmin, flashSaleController.createFlashSale);
router.get('/:id', authenticateAdmin, flashSaleController.getFlashSaleById);
router.delete('/:id', authenticateAdmin, flashSaleController.deleteFlashSale);

module.exports = router;