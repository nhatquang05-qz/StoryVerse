const express = require('express');
const router = express.Router();
const {
    addComic, updateComic, deleteComic, getAllComics, getComicById,
    addChapter, deleteChapter, getChapterContent, getTopComics,
    searchComics, getComicsByGenre, getAllGenres, getReviews,
    postReview, unlockChapter
} = require('../controllers/comicController');
const { authenticateToken, authenticateAdmin } = require('../middleware/authMiddleware');

// --- 1. PUBLIC ROUTES
router.get('/', getAllComics);
router.get('/top', getTopComics);
router.get('/search', searchComics);
router.get('/by-genre', getComicsByGenre);
router.get('/system/genres', getAllGenres); 
router.get('/:id', getComicById); 
router.get('/:comicId/reviews', getReviews); 

// --- 2. AUTHENTICATED ROUTES 
router.post('/:comicId/reviews', authenticateToken, postReview);
router.post('/unlock-chapter', authenticateToken, unlockChapter); 
router.get('/:comicId/chapters/:chapterId', authenticateToken, getChapterContent);

// --- 3. ADMIN ROUTES
router.post('/', authenticateAdmin, addComic);
router.put('/:id', authenticateAdmin, updateComic);
router.delete('/:id', authenticateAdmin, deleteComic);
router.post('/:comicId/chapters', authenticateAdmin, addChapter);
router.delete('/:comicId/chapters/:chapterId', authenticateAdmin, deleteChapter);

module.exports = router;