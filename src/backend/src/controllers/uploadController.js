const uploadService = require('../services/uploadService');

const uploadImage = async (req, res) => {
    // ------------------- BẮT ĐẦU DEBUG -------------------
    console.log("--- DEBUG UPLOAD CONTROLLER START ---");
    console.log("1. Request Body (chứa folderPath):", req.body);
    console.log("2. Request File (chứa thông tin file):", req.file);
    console.log("--- DEBUG UPLOAD CONTROLLER END ---");
    // ------------------- KẾT THÚC DEBUG ------------------

    const folderPath = req.body.folderPath;

    if (!req.file || !req.file.buffer) {
        console.error("Upload Error: No file or buffer found in req.file");
        return res.status(400).json({ error: 'No file uploaded or file buffer is missing.' });
    }

    try {
        const result = await uploadService.uploadImageService(req.file.buffer, req.file.originalname, req.file.size, folderPath);

        res.status(result.status).json({
            message: result.message,
            imageUrl: result.imageUrl,
            publicId: result.publicId
        });

    } catch (error) {
        const status = error.status || 500;
        console.error('Cloudinary upload processing error:', error);
        res.status(status).json({ error: error.error || 'Failed to upload image.' });
    }
};

module.exports = { uploadImage };