const uploadModel = require('../models/uploadModel'); 

const uploadImageService = async (fileBuffer, originalname, size, folderPath) => {
    if (!fileBuffer) {
        throw { status: 400, error: 'No file uploaded or file buffer is missing.' };
    }
              
    let finalFolder = 'storyverse_uploads';
    
    if (folderPath && typeof folderPath === 'string' && folderPath.trim() !== '') {
        finalFolder = folderPath.trim().replace(/^\/+|\/+$/g, ''); 
    }

    try {
        const options = {
            folder: finalFolder, 
            resource_type: 'auto',
            
            
        };

        console.log(`[Service] Uploading '${originalname}' (${size} bytes) to Cloudinary folder: '${finalFolder}'`);

        const result = await uploadModel.uploadFromBufferRaw(fileBuffer, options);

        console.log("[Service] Upload Success. Public ID:", result.public_id); 

        return {
            message: 'Upload successful',
            imageUrl: result.secure_url,
            publicId: result.public_id,
            status: 200
        };

    } catch (error) {
        console.error('[Service] Error:', error);
        let errorMessage = 'Failed to upload image.';
        if (error instanceof Error) {
            errorMessage += ` Details: ${error.message}`;
        }
        throw { status: error.status || 500, error: errorMessage };
    }
};

module.exports = { uploadImageService };