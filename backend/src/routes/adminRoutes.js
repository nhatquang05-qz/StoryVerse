const express = require('express');
const router = express.Router();

const { 
    getAllUsers, 
    updateUserById, 
    toggleUserBan, 
    deleteUserById,
    getUserDetailsAdmin 
} = require('../controllers/userController');

const { getDashboardStats } = require('../controllers/dashboardController');

const {
    getPendingReports,
    deleteContent,
    banUserAndDeleteContent,
    dismissReport
} = require('../controllers/reportController');

const { authenticateAdmin } = require('../middleware/authMiddleware');

router.get('/dashboard-stats', authenticateAdmin, getDashboardStats);
router.get('/users', authenticateAdmin, getAllUsers);
router.get('/users/:id/details', authenticateAdmin, getUserDetailsAdmin); 
router.put('/users/:id', authenticateAdmin, updateUserById);
router.post('/users/:id/ban', authenticateAdmin, toggleUserBan);
router.delete('/users/:id', authenticateAdmin, deleteUserById);
router.get('/reports/pending', authenticateAdmin, getPendingReports);
router.delete('/reports/:reportId/content', authenticateAdmin, deleteContent);
router.post('/reports/:reportId/ban', authenticateAdmin, banUserAndDeleteContent);
router.post('/reports/:reportId/dismiss', authenticateAdmin, dismissReport);

module.exports = router;