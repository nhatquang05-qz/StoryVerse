// src/backend/src/routes/comicRoutes.js

const express = require('express');
const router = express.Router();
const {
    addComic,
    updateComic,
    deleteComic,
    getAllComics,
    getComicById,
    addChapter,
    deleteChapter,
    getChapterContent,
    getTopComics,
    searchComics,
    getComicsByGenre,
    getAllGenres,
    getReviews,
    postReview,
    unlockChapter
} = require('../controllers/comicController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', getAllComics);
router.get('/top', getTopComics);
router.get('/search', searchComics);
router.get('/by-genre', getComicsByGenre);
router.get('/system/genres', getAllGenres);
router.get('/:id', getComicById);

router.get('/:comicId/reviews', getReviews);
router.post('/:comicId/reviews', authenticateToken, postReview);

router.get('/:comicId/chapters/:chapterId', authenticateToken, getChapterContent);

router.post('/', authenticateToken, addComic);
router.post('/:comicId/chapters', authenticateToken, addChapter);
router.post('/unlock-chapter', authenticateToken, unlockChapter);

router.put('/:id', authenticateToken, updateComic);

router.delete('/:id', authenticateToken, deleteComic);
router.delete('/:comicId/chapters/:chapterId', authenticateToken, deleteChapter);

module.exports = router;