const express = require('express');
const router = express.Router();
const { getMe, updateProfile, updateAvatar, getTopUsers, getUnlockedChapters, getWishlist, toggleWishlist } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

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

module.exports = router;