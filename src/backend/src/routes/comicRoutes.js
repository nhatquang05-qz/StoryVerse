// src/backend/src/routes/comicRoutes.js
// backend/src/routes/comicRoutes.js
const express = require('express');
const router = express.Router();
const { 
    getComics, 
    getComicById, 
    addComic, 
    getChapterContent, 
    addChapter, 
    searchComics,
    getReviews,
    addReview,
    getTopRatedComics
} = require('../controllers/comicController');
const { authenticateToken } = require('../middleware/authMiddleware');
// const { checkAdminRole } = require('../middleware/adminMiddleware'); 

// Public Routes
router.get('/comics', getComics); 

router.get('/comics/search', searchComics); 

router.get('/comics/top-rated', getTopRatedComics);

router.get('/comics/:id', getComicById); 

router.get('/comics/:comicId/chapters/:chapterNumber', authenticateToken, getChapterContent);

// Review Routes
router.get('/comics/:comicId/reviews', getReviews);
router.post('/comics/:comicId/reviews', authenticateToken, addReview);

// Admin Routes
router.post('/comics', authenticateToken, /* checkAdminRole, */ addComic); 
router.post('/comics/:comicId/chapters', authenticateToken, /* checkAdminRole, */ addChapter); 

module.exports = router;