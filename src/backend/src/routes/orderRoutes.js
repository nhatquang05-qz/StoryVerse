const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.post('/create', orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);

module.exports = router;