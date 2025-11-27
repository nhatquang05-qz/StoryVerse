const express = require('express');
const router = express.Router();
const { 
    getMe, updateProfile, updateAvatar, getTopUsers, getUnlockedChapters, getWishlist, toggleWishlist,
    getAllUsers, updateUserById, toggleUserBan, deleteUserById, getTransactionHistory 
} = require('../controllers/userController');
const { authenticateToken, authenticateAdmin } = require('../middleware/authMiddleware');

// --- 1. PUBLIC ROUTES ---
router.get('/top', getTopUsers); 

// --- 2. AUTHENTICATED ROUTES 
router.use(authenticateToken); 
router.get('/me', getMe);
router.put('/profile', updateProfile);
router.put('/profile/avatar', updateAvatar);
router.get('/unlocked-chapters', getUnlockedChapters);
router.get('/wishlist', getWishlist);
router.post('/wishlist/toggle', toggleWishlist);
router.get('/history', getTransactionHistory);

// --- 3. ADMIN ROUTES ---
router.get('/', authenticateAdmin, getAllUsers); 
router.put('/:id', authenticateAdmin, updateUserById); 
router.post('/:id/ban', authenticateAdmin, toggleUserBan); 
router.delete('/:id', authenticateAdmin, deleteUserById); 


module.exports = router;