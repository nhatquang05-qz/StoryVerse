const { getConnection } = require('../db/connection'); 
const comicModel = require('../models/comicModel'); 
const userModel = require('../models/userModel'); 
const { BASE_EXP_PER_COIN, EXP_RATE_REDUCTION_FACTOR, MIN_EXP_PER_COIN } = require('../utils/constants');

const addComicService = async ({ title, author, description, coverImageUrl, status, isDigital, price, genres }) => {
    if (!title || !coverImageUrl) {
        throw { status: 400, error: 'Title and Cover Image URL are required' };
    }

    try {
        const comicId = await comicModel.createComicRaw({
            title, author, description, coverImageUrl, status, isDigital, price, genres
        });

        return { message: 'Comic added successfully', comicId: comicId, status: 201 };
    } catch (error) {
        console.error('Error adding comic in service:', error);
        throw { status: 500, error: 'Failed to add comic' };
    }
};

const updateComicService = async (id, { title, author, description, coverImageUrl, status, isDigital, price, genres }) => {
    if (!title || !coverImageUrl) {
        throw { status: 400, error: 'Title and Cover Image URL are required' };
    }

    try {
        await comicModel.updateComicRaw(id, {
            title, author, description, coverImageUrl, status, isDigital, price, genres
        });

        return { message: 'Comic updated successfully', status: 200 };
    } catch (error) {
        console.error('Error updating comic in service:', error);
        throw { status: 500, error: 'Failed to update comic' };
    }
};

const deleteComicService = async (id) => {
    try {
        const affectedRows = await comicModel.deleteComicRaw(id);

        if (affectedRows === 0) {
            throw { status: 404, error: 'Comic not found' };
        }
        return { message: 'Comic deleted successfully', status: 200 };
    } catch (error) {
        console.error('Error deleting comic in service:', error);
        throw { status: error.status || 500, error: error.error || 'Failed to delete comic' };
    }
};

const getAllGenresService = async () => {
    try {
        return await comicModel.getAllGenresRaw();
    } catch (error) {
        console.error('Error fetching genres in service:', error);
        throw { status: 500, error: 'Internal server error' };
    }
};

const getAllComicsService = async (page = 1, limit = 24) => {
    try {
        const offset = (page - 1) * limit;
        
        const totalItems = await comicModel.getComicCountRaw();
        const totalPages = Math.ceil(totalItems / limit);

        const rows = await comicModel.getComicListRaw(limit, offset);

        const comicsWithParsedGenres = rows.map(comic => ({
            ...comic,
            genres: typeof comic.genres === 'string' ? JSON.parse(comic.genres) : comic.genres,
            averageRating: parseFloat(comic.averageRating) || 0,
            totalReviews: parseInt(comic.totalReviews) || 0
        }));

        return {
            data: comicsWithParsedGenres,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages
            }
        };
    } catch (error) {
        console.error('Error fetching comics in service:', error);
        throw { status: 500, error: 'Internal server error' };
    }
};

const getComicByIdService = async (id) => {
    try {
        const comic = await comicModel.getComicDetailRaw(id);

        if (!comic) {
            throw { status: 404, error: 'Comic not found' };
        }

        const chapters = await comicModel.getComicChaptersRaw(id);

        comic.genres = typeof comic.genres === 'string' ? JSON.parse(comic.genres) : comic.genres;
        comic.chapters = chapters;
        comic.averageRating = parseFloat(comic.averageRating) || 0;
        comic.totalReviews = parseInt(comic.totalReviews) || 0;

        comicModel.incrementComicViewCount(id).catch(err => console.error("View increment fail", err));

        return comic;
    } catch (error) {
        console.error('Error fetching comic details in service:', error);
        throw { status: error.status || 500, error: error.error || 'Internal server error' };
    }
};

const addChapterService = async (comicId, { chapterNumber, title, contentUrls, price }) => {
    if (!chapterNumber || !contentUrls || !Array.isArray(contentUrls) || contentUrls.length === 0) {
        throw { status: 400, error: 'Chapter number and content URLs are required' };
    }

    try {
        const contentUrlsJson = JSON.stringify(contentUrls);
        
        const chapterId = await comicModel.createChapterRaw(comicId, {
            chapterNumber, 
            title, 
            contentUrls: contentUrlsJson,
            price
        });

        return { message: 'Chapter added successfully', chapterId: chapterId, status: 201 };
    } catch (error) {
        console.error('Error adding chapter in service:', error);
        throw { status: 500, error: 'Failed to add chapter' };
    }
};

const deleteChapterService = async (comicId, chapterId) => {
    try {
        const affectedRows = await comicModel.deleteChapterRaw(comicId, chapterId);

        if (affectedRows === 0) {
            throw { status: 404, error: 'Chapter not found or not associated with this comic' };
        }

        return { message: 'Chapter deleted successfully', status: 200 };
    } catch (error) {
        console.error('Error deleting chapter in service:', error);
        throw { status: error.status || 500, error: error.error || 'Failed to delete chapter' };
    }
};

const getChapterContentService = async (comicId, chapterId, userId) => {
    try {
        const chapter = await comicModel.getChapterRaw(comicId, chapterId);

        if (!chapter) {
            throw { status: 404, error: 'Chapter not found' };
        }

        if (userId) {
            const user = await userModel.findUserById(userId, false);
            if (user && user.email === 'admin@123') {
                try {
                    if (typeof chapter.contentUrls === 'string') {
                        chapter.contentUrls = JSON.parse(chapter.contentUrls);
                    }
                } catch (e) {
                    chapter.contentUrls = [];
                }
                chapter.contentUrls = chapter.contentUrls || [];
                
                return chapter; 
            }
        }

        let isPurchased = false;

        if (chapter.price === 0) {
            isPurchased = true;
        } 
        else if (chapter.price > 0 && userId) {
            const fullPurchase = await comicModel.findFullPurchase(userId, comicId);
            
            if (fullPurchase) {
                isPurchased = true;
            } else {
                const unlockedChapter = await comicModel.findUnlockedChapter(userId, chapter.id);
                if (unlockedChapter) {
                    isPurchased = true;
                }
            }
        } else if (chapter.price > 0 && !userId) {
            throw { status: 401, error: 'You must be logged in to read this chapter' };
        }

        if (isPurchased) {
            await comicModel.incrementChapterViewCount(comicId, chapterId);             
            try {
                if (typeof chapter.contentUrls === 'string') {
                    chapter.contentUrls = JSON.parse(chapter.contentUrls);
                }
            } catch (e) {
                chapter.contentUrls = [];
            }
            chapter.contentUrls = chapter.contentUrls || [];

            return chapter;
        } else {
            throw { status: 403, error: 'You do not have access to this chapter.' };
        }

    } catch (error) {
        console.error('Error fetching chapter content in service:', error);
        throw { status: error.status || 500, error: error.error || 'Internal server error' };
    }
};

const unlockChapterService = async (userId, chapterId) => {
    if (!chapterId) {
        throw { status: 400, error: 'chapterId is required.' };
    }

    try {
        const chapterData = await comicModel.findChapterForUnlock(chapterId);
        if (!chapterData) {
            throw { status: 404, error: 'Chapter not found.' };
        }
        const chapterPrice = parseInt(chapterData.price);
        const comicId = chapterData.comicId; 

        const user = await userModel.findUserById(userId, false); 
        if (!user) {
            throw { status: 404, error: 'User not found.' };
        }
        
        let { coinBalance, level, exp } = user;
        coinBalance = parseInt(coinBalance);
        level = parseInt(level);
        exp = parseFloat(exp);
        const initialLevel = level;

        if (chapterPrice === 0) {
             const existingFreeUnlock = await comicModel.findUnlockedChapter(userId, chapterId);
             if (!existingFreeUnlock) {
                 await comicModel.insertUnlockedChapter(userId, chapterId);
             }
             return { message: 'Chapter is free and unlocked.', level, exp, coinBalance, levelUpOccurred: false };
        }

        if (coinBalance < chapterPrice) {
            throw { status: 400, error: 'Số dư Xu không đủ. Vui lòng nạp thêm Xu.' };
        }

        const existingUnlock = await comicModel.findUnlockedChapter(userId, chapterId);
        if (existingUnlock) {
            return { message: 'Chapter already unlocked.', level, exp, coinBalance, levelUpOccurred: false };
        }
        await comicModel.insertUnlockedChapter(userId, chapterId);

        const newCoinBalance = coinBalance - chapterPrice;
        let currentLevel = level;
        let currentExp = exp;
        let coinsToProcess = chapterPrice; 

        while (coinsToProcess > 0) {
            const modifier = Math.pow(EXP_RATE_REDUCTION_FACTOR, currentLevel - 1);
            const expPerCoinThisLevel = BASE_EXP_PER_COIN * modifier;
            if (expPerCoinThisLevel < MIN_EXP_PER_COIN) {
                coinsToProcess = 0; 
                break;
            }
            const expNeededForNextLevel = 100.0 - currentExp;
            if (expNeededForNextLevel < 1e-9) {
                 currentLevel += 1;
                 currentExp = 0;
                 continue;
            }
            const coinsNeededForNextLevel = expNeededForNextLevel / expPerCoinThisLevel;
            if (coinsToProcess >= coinsNeededForNextLevel) {
                coinsToProcess -= coinsNeededForNextLevel;
                currentLevel += 1;
                currentExp = 0;
            } else {
                currentExp += coinsToProcess * expPerCoinThisLevel;
                coinsToProcess = 0;
            }
        }
        currentExp = Math.min(100, Math.max(0, currentExp));

        await userModel.updateUserBalanceAndExpRaw(userId, newCoinBalance, currentLevel, currentExp);

        return {
            level: currentLevel,
            exp: currentExp,
            coinBalance: newCoinBalance,
            levelUpOccurred: currentLevel > initialLevel
        };

    } catch (error) {
        console.error('Unlock chapter error in service:', error);
        throw { status: error.status || 500, error: error.error || 'Failed to unlock chapter' };
    }
};


const getTopComicsService = async (period) => {
    try {
        let startDate = null;
        let endDate = null;
        const now = new Date();

        if (period === 'day') {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);

        } else if (period === 'week') {
            const firstDayOfWeek = now.getDate() - now.getDay();
            startDate = new Date(now.getFullYear(), now.getMonth(), firstDayOfWeek, 0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 7);

        } else if (period === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
        }

        const rows = await comicModel.getTopComicsRaw(startDate, endDate);
        
        const comicsWithRating = rows.map(comic => ({
            ...comic,
            averageRating: parseFloat(comic.averageRating) || 0,
            totalReviews: parseInt(comic.totalReviews) || 0
        }));
        return comicsWithRating;
    } catch (error) {
        console.error('Error fetching top comics in service:', error);
        throw { status: 500, error: 'Internal server error' };
    }
};

const searchComicsService = async (query, page = 1, limit = 24) => {
    if (!query) {
        throw { status: 400, error: 'Query parameter is required' };
    }
    try {
        const offset = (page - 1) * limit;
        const searchQuery = `%${query}%`;
        const totalItems = await comicModel.getSearchComicsCountRaw(searchQuery);
        const totalPages = Math.ceil(totalItems / limit);
        const rows = await comicModel.searchComicsRaw(searchQuery, limit, offset);

        const comicsWithRating = rows.map(comic => ({
            ...comic,
            averageRating: parseFloat(comic.averageRating) || 0,
            totalReviews: parseInt(comic.totalReviews) || 0
        }));

        return {
            data: comicsWithRating,
            pagination: { page, limit, totalItems, totalPages }
        };
    } catch (error) {
        console.error('Error searching comics in service:', error);
        throw { status: 500, error: 'Internal server error' };
    }
};

const getComicsByGenreService = async (genre, page = 1, limit = 24) => {
    if (!genre) {
        throw { status: 400, error: 'Genre parameter is required' };
    }
    try {
        const offset = (page - 1) * limit;

        const totalItems = await comicModel.getComicsByGenreCountRaw(genre);
        const totalPages = Math.ceil(totalItems / limit);

        const rows = await comicModel.getComicsByGenreRaw(genre, limit, offset);

        const comicsWithRating = rows.map(comic => ({
            ...comic,
            averageRating: parseFloat(comic.averageRating) || 0,
            totalReviews: parseInt(comic.totalReviews) || 0
        }));
        
        return {
            data: comicsWithRating,
            pagination: { page, limit, totalItems, totalPages }
        };
    } catch (error) {
        console.error('Error fetching comics by genre in service:', error);
        throw { status: 500, error: 'Internal server error' };
    }
};

const getReviewsService = async (comicId) => {
    try {
        return await comicModel.getReviewsRaw(comicId);
    } catch (error) {
        console.error('Error fetching reviews in service:', error);
        throw { status: 500, error: 'Internal server error' };
    }
};

const postReviewService = async (comicId, userId, rating, comment, images = [], video = null) => {
    if (!rating || !comment) {
        throw { status: 400, error: 'Rating and comment are required' };
    }
    
    try {
        const existing = await comicModel.findExistingReview(comicId, userId);

        let reviewId;
        if (existing) {
            reviewId = existing.id;
            await comicModel.updateReviewRaw(reviewId, rating, comment, images, video);
        } else {
            reviewId = await comicModel.insertReviewRaw(comicId, userId, rating, comment, images, video);
        }

        const newReview = await comicModel.getReviewByIdRaw(reviewId);

        if (newReview && typeof newReview.images === 'string') {
            try {
                newReview.images = JSON.parse(newReview.images);
            } catch (e) {
                newReview.images = [];
            }
        }

        return { review: newReview, status: 201 };

    } catch (error) {
        console.error('Error posting review in service:', error);
        throw { status: error.status || 500, error: error.error || 'Internal server error' };
    }
};

const updateChapterService = async (comicId, chapterId, data) => {
    const connection = getConnection(); 

    try {
        const [existing] = await connection.execute(
            'SELECT id FROM chapters WHERE id = ? AND comicId = ?', 
            [chapterId, comicId]
        );

        if (existing.length === 0) {
            throw { status: 404, error: 'Chapter not found' };
        }

        let query = 'UPDATE chapters SET ';
        const params = [];
        const updates = [];

        if (data.chapterNumber !== undefined) {
            updates.push('chapterNumber = ?');
            params.push(data.chapterNumber);
        }
        if (data.title !== undefined) {
            updates.push('title = ?');
            params.push(data.title);
        }
        if (data.contentUrls !== undefined) {
            updates.push('contentUrls = ?');
            params.push(JSON.stringify(data.contentUrls)); 
        }
        if (data.price !== undefined) {
            updates.push('price = ?');
            params.push(data.price);
        }

        if (updates.length === 0) {
            return { status: 200, message: 'No changes made' };
        }

        query += updates.join(', ') + ' WHERE id = ?';
        params.push(chapterId);

        await connection.execute(query, params);

        return { status: 200, message: 'Chapter updated successfully' };

    } catch (error) {
        throw error;
    } 
};
module.exports = {
    addComicService,
    updateComicService,
    deleteComicService,
    getAllComicsService, 
    getComicByIdService,
    addChapterService,
    deleteChapterService,
    getChapterContentService,
    getTopComicsService,
    searchComicsService, 
    getComicsByGenreService, 
    getAllGenresService,
    getReviewsService,
    postReviewService,
    unlockChapterService,
    updateChapterService
};