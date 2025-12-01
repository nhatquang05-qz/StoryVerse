const express = require('express');
const router = express.Router();
const flashSaleController = require('../controllers/flashSaleController');
// Import middleware xác thực admin
const { authenticateAdmin } = require('../middleware/authMiddleware');

// Public route cho homepage (Ai cũng xem được để hiển thị banner)
router.get('/active', flashSaleController.getActiveFlashSale);

// Admin routes (Đã thêm middleware check admin)
// Lấy danh sách tất cả các đợt sale (cho trang quản lý)
router.get('/', authenticateAdmin, flashSaleController.getAllFlashSales);

// Tạo đợt flash sale mới
router.post('/', authenticateAdmin, flashSaleController.createFlashSale);

// Xóa đợt flash sale
router.delete('/:id', authenticateAdmin, flashSaleController.deleteFlashSale);

module.exports = router;