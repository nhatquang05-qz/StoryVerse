const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { authenticateToken, authenticateAdmin } = require('../middleware/authMiddleware');

router.post('/create', authenticateToken, complaintController.createComplaint);
router.get('/order/:orderId', authenticateToken, complaintController.getComplaintByOrder);
router.put('/reply/:id', authenticateAdmin, complaintController.adminReplyComplaint);

module.exports = router;