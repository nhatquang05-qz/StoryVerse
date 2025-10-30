const express = require('express');
const router = express.Router();
const { getMe, updateProfile, updateAvatar, getTopUsers, getUnlockedChapters } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);
router.put('/profile/avatar', authenticateToken, updateAvatar);
router.get('/top', getTopUsers);
router.get('/unlocked-chapters', authenticateToken, getUnlockedChapters);

module.exports = router;