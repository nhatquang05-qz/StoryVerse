// backend/src/config/cloudinaryConfig.js
const cloudinary = require('cloudinary').v2;

// Đã load .env trong server.js rồi nên có thể truy cập process.env trực tiếp
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.warn('!!! Cloudinary config is missing from .env file. Uploads will likely fail.');
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

module.exports = cloudinary;