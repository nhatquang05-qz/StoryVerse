// backend/src/routes/comicRoutes.js
const express = require('express');
const router = express.Router();
const { getComics, getComicById, addComic, getChapterContent, addChapter } = require('../controllers/comicController');
const { authenticateToken } = require('../middleware/authMiddleware');
// const { checkAdminRole } = require('../middleware/adminMiddleware'); // *** Cần tạo middleware này ***

// Public Routes
router.get('/comics', getComics); // Lấy danh sách truyện
router.get('/comics/:id', getComicById); // Lấy chi tiết truyện + list chương
// Lấy nội dung chương (cần token để check quyền, nhưng có thể cho đọc free)
router.get('/comics/:comicId/chapters/:chapterNumber', authenticateToken, getChapterContent);

// Admin Routes (Ví dụ: Tạm thời chỉ cần authenticate)
// *** Nên thay authenticateToken bằng checkAdminRole cho các route này ***
router.post('/comics', authenticateToken, /* checkAdminRole, */ addComic); // Thêm truyện mới
router.post('/comics/:comicId/chapters', authenticateToken, /* checkAdminRole, */ addChapter); // Thêm chương mới

module.exports = router;