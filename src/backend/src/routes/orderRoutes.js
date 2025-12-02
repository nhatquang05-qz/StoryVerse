const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, authenticateAdmin } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, orderController.createOrder);
router.get('/my-orders', authenticateToken, orderController.getMyOrders);
router.post('/create', orderController.createOrder);

router.get('/admin/all', authenticateAdmin, orderController.getAllOrders);
router.put('/admin/:id/status', authenticateAdmin, orderController.adminUpdateStatus);
router.get('/admin/:id/items', authenticateAdmin, orderController.getOrderDetails); 

router.get('/:id', authenticateToken, orderController.getOrderById);

module.exports = router;