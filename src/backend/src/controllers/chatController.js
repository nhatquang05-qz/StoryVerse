const chatService = require('../services/chatService');
const socket = require('../utils/socket'); 

const getGlobalMessages = async (req, res) => {
    try {
        const messages = await chatService.getGlobalMessagesService();
        res.json(messages);
    } catch (error) {
        const status = error.status || 500;
        console.error("Get global messages error:", error);
        res.status(status).json({ error: error.error || 'Failed to fetch global messages' });
    }
};

const getChapterMessages = async (req, res) => {
    try {
        const { comicId, chapterId } = req.params;
        const messages = await chatService.getChapterMessagesService(comicId, chapterId);
        res.json(messages);
    } catch (error) {
        const status = error.status || 500;
        console.error("Get chapter messages error:", error);
        res.status(status).json({ error: error.error || 'Failed to fetch chapter messages' });
    }
};

const postMessage = async (req, res) => {
    try {
        const { userId } = req;
        const { comicId, chapterId, message, imageUrl, stickerUrl, replyToMessageId } = req.body;

        const newMessage = await chatService.postMessageService(userId, comicId, chapterId, message, imageUrl, stickerUrl, replyToMessageId);

        let room = 'global';
        if (comicId && chapterId) {
            room = `chapter_${comicId}_${chapterId}`;
        }

        try {
            const io = socket.getIO();
            io.to(room).emit('receive_message', newMessage);
        } catch (socketError) {
            console.error("Socket emit message error:", socketError);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        const status = error.status || 500;
        console.error("Post message error:", error);
        res.status(status).json({ error: error.error || 'Failed to post message' });
    }
};

const toggleLikeMessage = async (req, res) => {
    try {
        const { userId } = req;
        const { messageId } = req.params;

        const result = await chatService.toggleLikeMessageService(userId, messageId);
        
        try {
            const io = socket.getIO();
            io.emit('update_like', { 
                messageId: parseInt(messageId), 
                userId: userId, 
                isLiked: result.isLiked 
            });
        } catch (socketError) {
            console.error("Socket emit like error:", socketError);
        }

        res.status(200).json({ success: true, isLiked: result.isLiked });
    } catch (error) {
        const status = error.status || 500;
        console.error("Toggle like error:", error);
        res.status(status).json({ error: error.error || 'Failed to toggle like' });
    }
};

module.exports = {
    getGlobalMessages,
    getChapterMessages,
    postMessage,
    toggleLikeMessage
};