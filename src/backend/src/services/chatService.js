const chatModel = require('../models/chatModel');

const formatMessage = (row) => ({
    id: row.id,
    userId: String(row.userId),
    userName: row.userName,
    avatarUrl: row.avatarUrl,
    timestamp: new Date(row.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    message: row.message,
    userLevel: row.level,
    imageUrl: row.imageUrl,
    stickerUrl: row.stickerUrl,
    likes: row.likes ? row.likes.split(',') : [],
    replyTo: row.replyToMessageId,
    replyToAuthor: row.replyToAuthor,
});

const getGlobalMessagesService = async () => {
    try {
        const rows = await chatModel.getGlobalMessagesRaw();
        const messages = rows.map(formatMessage).reverse();
        return messages;
    } catch (error) {
        console.error("Get global messages error in service:", error);
        throw { status: 500, error: 'Failed to fetch global messages' };
    }
};

const getChapterMessagesService = async (comicId, chapterId) => {
    try {
        const rows = await chatModel.getChapterMessagesRaw(comicId, chapterId);
        const messages = rows.map(formatMessage);
        return messages;
    } catch (error) {
        console.error("Get chapter messages error in service:", error);
        throw { status: 500, error: 'Failed to fetch chapter messages' };
    }
};

const postMessageService = async (userId, comicId, chapterId, message, imageUrl, stickerUrl, replyToMessageId) => {
    // Business Logic: Validation
    if (!message && !imageUrl && !stickerUrl) {
        throw { status: 400, error: 'Message content is empty' };
    }

    try {
        const newMessageId = await chatModel.postMessageRaw(userId, comicId, chapterId, message, imageUrl, stickerUrl, replyToMessageId);
        
        const newMsgRow = await chatModel.getMessageByIdRaw(newMessageId);

        if (!newMsgRow) {
            throw new Error("Failed to retrieve new message after posting");
        }

        return formatMessage(newMsgRow);
    } catch (error) {
        console.error("Post message error in service:", error);
        throw { status: error.status || 500, error: 'Failed to post message' };
    }
};

const toggleLikeMessageService = async (userId, messageId) => {
    try {
        const existingLike = await chatModel.findLike(messageId, userId);

        let isLiked = false;
        if (existingLike) {
            await chatModel.removeLike(messageId, userId);
            isLiked = false;
        } else {
            await chatModel.addLike(messageId, userId);
            isLiked = true;
        }
        
        return { success: true, isLiked: isLiked };
    } catch (error) {
        console.error("Toggle like error in service:", error);
        throw { status: 500, error: 'Failed to toggle like' };
    }
};

module.exports = {
    getGlobalMessagesService,
    getChapterMessagesService,
    postMessageService,
    toggleLikeMessageService
};