const express = require('express');
const router = express.Router();
const { 
    getMe, updateProfile, updateAvatar, getTopUsers, getUnlockedChapters, getWishlist, toggleWishlist,
    getAllUsers, updateUserById, toggleUserBan, deleteUserById, getTransactionHistory, 
    updateLevelSystem, getPublicUserProfile, getPendingAvatars, approveAvatar, rejectAvatar, getCommunityStats 
} = require('../controllers/userController');
const { authenticateToken, authenticateAdmin } = require('../middleware/authMiddleware');

// --- 1. PUBLIC ROUTES ---
router.get('/top', getTopUsers); 
router.get('/profile/:id', getPublicUserProfile); 

// --- 2. AUTHENTICATED ROUTES 
router.use(authenticateToken); 
router.get('/me', getMe);
router.put('/profile', updateProfile);
router.put('/profile/avatar', updateAvatar);
router.put('/level-system', updateLevelSystem);
router.get('/unlocked-chapters', getUnlockedChapters);
router.get('/wishlist', getWishlist);
router.post('/wishlist/toggle', toggleWishlist);
router.get('/history', getTransactionHistory);
router.get('/:id/community-stats', getCommunityStats);

// --- 3. ADMIN ROUTES ---
router.get('/', authenticateAdmin, getAllUsers); 
router.put('/:id', authenticateAdmin, updateUserById); 
router.post('/:id/ban', authenticateAdmin, toggleUserBan); 
router.delete('/:id', authenticateAdmin, deleteUserById); 
router.get('/admin/avatars/pending', authenticateAdmin, getPendingAvatars);
router.post('/admin/avatars/:id/approve', authenticateAdmin, approveAvatar);
router.post('/admin/avatars/:id/reject', authenticateAdmin, rejectAvatar)

module.exports = router;