// backend/src/routes/comicRoutes.js
const express = require('express');
const router = express.Router();
const { getComics, getComicById, addComic, getChapterContent, addChapter, searchComics } = require('../controllers/comicController');
const { authenticateToken } = require('../middleware/authMiddleware');
// const { checkAdminRole } = require('../middleware/adminMiddleware'); 

// Public Routes
router.get('/comics', getComics); 

router.get('/comics/search', searchComics); 

router.get('/comics/:id', getComicById); 

router.get('/comics/:comicId/chapters/:chapterNumber', authenticateToken, getChapterContent);

// Admin Routes
router.post('/comics', authenticateToken, /* checkAdminRole, */ addComic); 
router.post('/comics/:comicId/chapters', authenticateToken, /* checkAdminRole, */ addChapter); 

module.exports = router;