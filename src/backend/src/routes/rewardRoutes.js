const express = require('express');
const router = express.Router();
const { addExp, claimReward } = require('../controllers/rewardController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/add-exp', authenticateToken, addExp);
router.post('/claim-reward', authenticateToken, claimReward);

module.exports = router;