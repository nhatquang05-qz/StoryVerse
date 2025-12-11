const uploadService = require('../services/uploadService');

const sanitizeString = (str) => {
    if (!str) return '';
    return str
        .normalize('NFD') 
        .replace(/[\u0300-\u036f]/g, '') 
        .replace(/đ/g, 'd').replace(/Đ/g, 'D') 
        .replace(/[^a-zA-Z0-9\-_]/g, '_') 
        .replace(/_+/g, '_') 
        .toLowerCase();
};

const uploadImage = async (req, res) => {
    
    console.log("--- UPLOAD REQUEST START ---");
    console.log("Body:", req.body);
    

    if (!req.file || !req.file.buffer) {
        return res.status(400).json({ error: 'No file uploaded or file buffer is missing.' });
    }

    
    const { uploadType, comicName, chapterNumber, userId } = req.body;
    
    
    let targetFolder = 'storyverse_uploads/others'; 

    const rootDir = 'storyverse'; 

    switch (uploadType) {
        case 'comic_cover': 
            if (comicName) {
                targetFolder = `${rootDir}/comics/${sanitizeString(comicName)}/covers`;
            }
            break;

        case 'chapter_content': 
            if (comicName && chapterNumber) {
                targetFolder = `${rootDir}/comics/${sanitizeString(comicName)}/chapters/${sanitizeString(chapterNumber)}`;
            }
            break;

        case 'user_avatar': 
            if (userId) {
                targetFolder = `${rootDir}/users/${sanitizeString(userId)}/avatar`;
            }
            break;
            
        case 'banner':
            targetFolder = `${rootDir}/banners`;
            break;
            
        default:
            
            if (req.body.folderPath) {
                targetFolder = sanitizeString(req.body.folderPath);
            }
    }

    console.log(`Generated Folder Path: ${targetFolder}`);

    try {
        const result = await uploadService.uploadImageService(
            req.file.buffer, 
            req.file.originalname, 
            req.file.size, 
            targetFolder
        );

        res.status(result.status).json({
            message: result.message,
            imageUrl: result.imageUrl,
            publicId: result.publicId,
            folder: targetFolder 
        });

    } catch (error) {
        const status = error.status || 500;
        console.error('Upload Failed:', error);
        res.status(status).json({ error: error.error || 'Failed to upload image.' });
    }
};

module.exports = { uploadImage };