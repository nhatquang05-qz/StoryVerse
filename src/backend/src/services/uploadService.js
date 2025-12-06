const uploadModel = require('../models/uploadModel'); 

const uploadImageService = async (fileBuffer, originalname, size, folderPath) => {
    if (!fileBuffer) {
        throw { status: 400, error: 'No file uploaded or file buffer is missing.' };
    }

    const finalFolder = folderPath && typeof folderPath === 'string' && folderPath.trim() !== ''
        ? folderPath
        : 'storyverse_uploads';
        
    try {
        const options = {
            folder: finalFolder, 
            resource_type: 'auto' 
        };

        console.log(`Uploading file: ${originalname}, size: ${size} bytes to folder: ${finalFolder}`);

        const result = await uploadModel.uploadFromBufferRaw(fileBuffer, options);

        console.log("Cloudinary Upload Result:", result); 

        return {
            message: 'Upload successful',
            imageUrl: result.secure_url,
            publicId: result.public_id,
            status: 200
        };

    } catch (error) {
        console.error('Cloudinary upload processing error in service:', error);
        let errorMessage = 'Failed to upload image.';
        if (error instanceof Error) {
            errorMessage += ` Details: ${error.message}`;
        }
        throw { status: error.status || 500, error: errorMessage };
    }
};

module.exports = { uploadImageService };