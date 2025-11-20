const express = require('express');
const router = express.Router();
const apicache = require('apicache');
const {
    addComic, updateComic, deleteComic, getAllComics, getComicById,
    addChapter, deleteChapter, getChapterContent, getTopComics,
    searchComics, getComicsByGenre, getAllGenres, getReviews,
    postReview, unlockChapter
} = require('../controllers/comicController');
const { authenticateToken, authenticateAdmin } = require('../middleware/authMiddleware');

const cache = apicache.middleware;

// --- GET ROUTES ---
router.get('/', getAllComics); 
router.get('/top', cache('10 minutes'), getTopComics);
router.get('/search', cache('2 minutes'), searchComics);
router.get('/by-genre', cache('5 minutes'), getComicsByGenre);
router.get('/system/genres', cache('1 hour'), getAllGenres);
router.get('/:id', getComicById);
router.get('/:comicId/reviews', cache('2 minutes'), getReviews);

// --- AUTHENTICATED ROUTES ---
router.post('/:comicId/reviews', authenticateToken, postReview);
router.post('/unlock-chapter', authenticateToken, unlockChapter);
router.get('/:comicId/chapters/:chapterId', authenticateToken, getChapterContent);

// --- ADMIN ROUTES ---
router.post('/', authenticateAdmin, addComic);
router.put('/:id', authenticateAdmin, updateComic);
router.delete('/:id', authenticateAdmin, deleteComic);
router.post('/:comicId/chapters', authenticateAdmin, addChapter);
router.delete('/:comicId/chapters/:chapterId', authenticateAdmin, deleteChapter);

module.exports = router;