const express = require('express');
const router = express.Router();
const { 
    getAllUsers, 
    updateUserById, 
    toggleUserBan, 
    deleteUserById,
    getUserDetailsAdmin 
} = require('../controllers/userController');

const { getDashboardData } = require('../controllers/dashboardController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

router.get('/dashboard-stats', authenticateAdmin, getDashboardData);
router.get('/users', authenticateAdmin, getAllUsers);
router.get('/users/:id/details', authenticateAdmin, getUserDetailsAdmin); 
router.put('/users/:id', authenticateAdmin, updateUserById);
router.post('/users/:id/ban', authenticateAdmin, toggleUserBan);
router.delete('/users/:id', authenticateAdmin, deleteUserById);

module.exports = router;