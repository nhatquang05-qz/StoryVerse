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
    getAllGenres
} = require('../controllers/comicController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', getAllComics);
router.get('/top', getTopComics);
router.get('/search', searchComics);
router.get('/by-genre', getComicsByGenre);
router.get('/system/genres', getAllGenres);
router.get('/:id', getComicById);
router.get('/:comicId/chapters/:chapterId', authMiddleware, getChapterContent);

router.post('/', authMiddleware, addComic);
router.post('/:comicId/chapters', authMiddleware, addChapter);

router.put('/:id', authMiddleware, updateComic);

router.delete('/:id', authMiddleware, deleteComic);
router.delete('/:comicId/chapters/:chapterId', authMiddleware, deleteChapter);

module.exports = router;