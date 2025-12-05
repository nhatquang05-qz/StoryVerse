const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/authMiddleware'); 

router.post('/', authenticateToken, reportController.createReport);
router.get('/pending', authenticateToken, reportController.getPendingReports);
router.delete('/:reportId', authenticateToken, reportController.deleteContent);
router.post('/:reportId/ban', authenticateToken, reportController.banUserAndDeleteContent);
router.post('/:reportId/dismiss', authenticateToken, reportController.dismissReport);

module.exports = router;