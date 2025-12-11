const cloudinary = require('../config/CloudinaryConfig');

const uploadFromBufferRaw = (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
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
        uploadStream.end(buffer);
    });
};

module.exports = { uploadFromBufferRaw };