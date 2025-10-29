// backend/src/controllers/uploadController.js
const cloudinary = require('../config/CloudinaryConfig');
const path = require('path'); // *** THÊM DÒNG NÀY ***
// Bỏ fs nếu không dùng diskStorage nữa
// const fs = require('fs');

// Hàm helper để upload từ buffer (khi dùng memoryStorage)
const uploadFromBuffer = (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        // Sử dụng upload_stream để gửi buffer lên Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) {
                console.error("Cloudinary stream upload error:", error);
                return reject(error);
            }
            if (!result) {
                 console.error("Cloudinary stream upload failed, no result received.");
                 return reject(new Error("Cloudinary upload failed: No result"));
            }
            resolve(result);
        });
        // Ghi buffer vào stream và kết thúc
        uploadStream.end(buffer);
    });
};

const uploadImage = async (req, res) => {
    // Kiểm tra xem req.file có tồn tại và có buffer không
    if (!req.file || !req.file.buffer) {
        console.error("Upload Error: No file or buffer found in req.file");
        return res.status(400).json({ error: 'No file uploaded or file buffer is missing.' });
    }

    try {
        const options = {
            folder: 'storyverse_uploads', // Optional: Thư mục trên Cloudinary
            resource_type: 'auto' // Tự động nhận diện loại file (image, video, etc.)
            // Có thể thêm public_id nếu muốn tên file cụ thể
            // public_id: `comic_${req.body.comicId || 'unknown'}_${Date.now()}`
        };

        console.log(`Uploading file: ${req.file.originalname}, size: ${req.file.size} bytes`);

        // **Chỉ sử dụng uploadFromBuffer vì đã cấu hình memoryStorage**
        const result = await uploadFromBuffer(req.file.buffer, options);

        console.log("Cloudinary Upload Result:", result); // Log kết quả để debug

        res.status(200).json({
            message: 'Upload successful',
            imageUrl: result.secure_url,
            publicId: result.public_id
        });

    } catch (error) {
        // Log lỗi chi tiết hơn
        console.error('Cloudinary upload processing error:', error);
        let errorMessage = 'Failed to upload image.';
        if (error instanceof Error) {
            errorMessage += ` Details: ${error.message}`;
        }
        // Trả về lỗi 500 nếu upload thất bại
        res.status(500).json({ error: errorMessage });
    }
};

module.exports = { uploadImage };