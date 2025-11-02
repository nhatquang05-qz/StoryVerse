const express = require('express');
const router = express.Router();
const { 
    getAllUsers, 
    updateUserById, 
    toggleUserBan, 
    deleteUserById 
} = require('../controllers/userController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

router.get('/users', authenticateAdmin, getAllUsers);

router.put('/users/:id', authenticateAdmin, updateUserById);

router.post('/users/:id/ban', authenticateAdmin, toggleUserBan);

router.delete('/users/:id', authenticateAdmin, deleteUserById);

module.exports = router;