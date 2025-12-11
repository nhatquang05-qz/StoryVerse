const express = require('express');
const router = express.Router();
const apicache = require('apicache');
const multer = require('multer');
const path = require('path');

const {
    addComic, updateComic, deleteComic, getAllComics, getComicById,
    addChapter, deleteChapter, getChapterContent, getTopComics,
    searchComics, getComicsByGenre, getAllGenres, getReviews,
    postReview, unlockChapter, updateChapter
} = require('../controllers/comicController');
const { authenticateToken, authenticateAdmin } = require('../middleware/authMiddleware');

const cache = apicache.middleware;

const storage = multer.memoryStorage();

const reviewUpload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        // Chấp nhận ảnh và video
        const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|webm/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Chỉ hỗ trợ file ảnh và video!"));
    }
}).fields([
    { name: 'images', maxCount: 3 }, 
    { name: 'video', maxCount: 1 }   
]);

// --- GET ROUTES ---
router.get('/', getAllComics); 
router.get('/top', cache('10 minutes'), getTopComics);
router.get('/search', cache('2 minutes'), searchComics);
router.get('/by-genre', cache('5 minutes'), getComicsByGenre);
router.get('/system/genres', cache('1 hour'), getAllGenres);
router.get('/:id', getComicById);
router.get('/:comicId/reviews', getReviews); 

// --- AUTHENTICATED ROUTES ---
router.post('/:comicId/reviews', authenticateToken, reviewUpload, postReview);
router.post('/unlock-chapter', authenticateToken, unlockChapter);
router.get('/:comicId/chapters/:chapterId', authenticateToken, getChapterContent);

// --- ADMIN ROUTES ---
router.post('/', authenticateAdmin, addComic);
router.put('/:id', authenticateAdmin, updateComic);
router.delete('/:id', authenticateAdmin, deleteComic);
router.post('/:comicId/chapters', authenticateAdmin, addChapter);
router.delete('/:comicId/chapters/:chapterId', authenticateAdmin, deleteChapter);
router.put('/:comicId/chapters/:chapterId', authenticateAdmin, updateChapter);

module.exports = router;