// src/backend/src/routes/postRoutes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Post Routes
router.get('/', authenticateToken, postController.getPosts);
router.post('/', authenticateToken, postController.createPost);
router.delete('/:id', authenticateToken, postController.deletePost);
router.post('/:id/like', authenticateToken, postController.toggleLike);
router.post('/:id/report', authenticateToken, postController.reportPost); 

// Comment Routes
router.get('/:id/comments', postController.getComments);
router.post('/:id/comments', authenticateToken, postController.addComment);
router.post('/comments/:commentId/like', authenticateToken, postController.toggleCommentLike);
router.post('/comments/:commentId/report', authenticateToken, postController.reportComment); 
router.delete('/comments/:commentId', authenticateToken, postController.deleteComment); 

module.exports = router;