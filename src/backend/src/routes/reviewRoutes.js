const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/create', authenticateToken, reviewController.createReview);
router.get('/check-order/:orderId', authenticateToken, reviewController.checkReviewOrder);

module.exports = router;