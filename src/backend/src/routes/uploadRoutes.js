// backend/src/routes/uploadRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadImage } = require('../controllers/uploadController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Cấu hình Multer lưu vào memory (dễ xử lý hơn với Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp/; // Thêm webp nếu muốn
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Chỉ hỗ trợ upload file ảnh (jpeg, jpg, png, gif, webp)"));
    }
});

// Chỉ user đăng nhập mới được upload
router.post('/upload', authenticateToken, upload.single('image'), uploadImage);
// 'image' là tên field trong FormData gửi từ frontend

module.exports = router;