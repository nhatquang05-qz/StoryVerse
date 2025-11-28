const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const { authenticateToken, authenticateAdmin } = require('../middleware/authMiddleware');

router.post('/validate', voucherController.validateVoucher);

router.get('/admin', authenticateAdmin, voucherController.getAdminVouchers);
router.post('/', authenticateAdmin, voucherController.createVoucher);
router.put('/:id', authenticateAdmin, voucherController.updateVoucher);
router.delete('/:id', authenticateAdmin, voucherController.deleteVoucher);

module.exports = router;