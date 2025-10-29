const express = require('express');
const router = express.Router();
const { getMe, updateProfile, updateAvatar, getTopUsers } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);
router.put('/profile/avatar', authenticateToken, updateAvatar);
router.get('/users/top', getTopUsers);

module.exports = router;