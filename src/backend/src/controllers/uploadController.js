const cloudinary = require('../config/CloudinaryConfig');
const path = require('path');

const uploadFromBuffer = (buffer, options = {}) => {
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

const uploadImage = async (req, res) => {
    if (!req.file || !req.file.buffer) {
        console.error("Upload Error: No file or buffer found in req.file");
        return res.status(400).json({ error: 'No file uploaded or file buffer is missing.' });
    }

    try {
        const options = {
            folder: 'storyverse_uploads', 
            resource_type: 'auto' 

        };

        console.log(`Uploading file: ${req.file.originalname}, size: ${req.file.size} bytes`);

        const result = await uploadFromBuffer(req.file.buffer, options);

        console.log("Cloudinary Upload Result:", result); 

        res.status(200).json({
            message: 'Upload successful',
            imageUrl: result.secure_url,
            publicId: result.public_id
        });

    } catch (error) {
        console.error('Cloudinary upload processing error:', error);
        let errorMessage = 'Failed to upload image.';
        if (error instanceof Error) {
            errorMessage += ` Details: ${error.message}`;
        }
        res.status(500).json({ error: errorMessage });
    }
};

module.exports = { uploadImage };