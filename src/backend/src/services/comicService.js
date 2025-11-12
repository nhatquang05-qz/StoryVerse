const { getConnection } = require('../db/connection'); 
const comicModel = require('../models/comicModel'); 
const userModel = require('../models/userModel'); 
const { BASE_EXP_PER_COIN, EXP_RATE_REDUCTION_FACTOR, MIN_EXP_PER_COIN } = require('../utils/constants');

const addComicService = async ({ title, author, description, coverImageUrl, status, isDigital, price, genres }) => {
    if (!title || !coverImageUrl) {
        throw { status: 400, error: 'Title and Cover Image URL are required' };
    }

    const connection = getConnection();
    try {
        await connection.beginTransaction();

        const comicId = await comicModel.createComicRaw(title, author, description, coverImageUrl, status, isDigital, price);

        if (genres && Array.isArray(genres) && genres.length > 0) {
            const genreValues = genres.map(genreId => [comicId, Number(genreId)]);
            await comicModel.insertComicGenresRaw(genreValues);
        }

        await connection.commit();
        return { message: 'Comic added successfully', comicId: comicId, status: 201 };

    } catch (error) {
        await connection.rollback();
        console.error('Error adding comic in service:', error);
        throw { status: 500, error: 'Failed to add comic' };
    }
};

const updateComicService = async (id, { title, author, description, coverImageUrl, status, isDigital, price, genres }) => {
    if (!title || !coverImageUrl) {
        throw { status: 400, error: 'Title and Cover Image URL are required' };
    }

    const connection = getConnection();
    try {
        await connection.beginTransaction();

        await comicModel.updateComicRaw(id, title, author, description, coverImageUrl, status, isDigital, price);

        await comicModel.deleteComicGenresRaw(id);

        if (genres && Array.isArray(genres) && genres.length > 0) {
            const genreValues = genres.map(genreId => [id, Number(genreId)]);
            await comicModel.insertComicGenresRaw(genreValues);
        }

        await connection.commit();
        return { message: 'Comic updated successfully', status: 200 };

    } catch (error) {
        await connection.rollback();
        console.error('Error updating comic in service:', error);
        throw { status: 500, error: 'Failed to update comic' };
    }
};

const deleteComicService = async (id) => {
    const connection = getConnection();
    try {
        await connection.beginTransaction();
        
        const affectedRows = await comicModel.deleteComicRaw(id);

        await connection.commit();
        if (affectedRows === 0) {
            throw { status: 404, error: 'Comic not found' };
        }
        return { message: 'Comic deleted successfully', status: 200 };

    } catch (error) {
        await connection.rollback();
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


const getAllComicsService = async () => {
    try {
        const rows = await comicModel.getComicListRaw();
        const comicsWithParsedGenres = rows.map(comic => ({
            ...comic,
            genres: typeof comic.genres === 'string' ? JSON.parse(comic.genres) : comic.genres,
            averageRating: parseFloat(comic.averageRating) || 0,
            totalReviews: parseInt(comic.totalReviews) || 0
        }));
        return comicsWithParsedGenres;
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

        await comicModel.incrementComicViewCount(id); 

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
        const chapterId = await comicModel.createChapterRaw(comicId, chapterNumber, title, contentUrlsJson, price);
        return { message: 'Chapter added successfully', chapterId: chapterId, status: 201 };
    } catch (error) {
        console.error('Error adding chapter in service:', error);
        throw { status: 500, error: 'Failed to add chapter' };
    }
};

const deleteChapterService = async (comicId, chapterId) => {
    const connection = getConnection();
    try {
        await connection.beginTransaction();
        
        const affectedRows = await comicModel.deleteChapterRaw(comicId, chapterId);
        
        await connection.commit();

        if (affectedRows === 0) {
            throw { status: 404, error: 'Chapter not found or not associated with this comic' };
        }

        return { message: 'Chapter deleted successfully', status: 200 };
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting chapter in service:', error);
        throw { status: error.status || 500, error: error.error || 'Failed to delete chapter' };
    }
};

// --- CHAPTER CONTENT & UNLOCK LOGIC ---

const getChapterContentService = async (comicId, chapterId, userId) => {
    try {
        const chapter = await comicModel.getChapterRaw(comicId, chapterId);

        if (!chapter) {
            throw { status: 404, error: 'Chapter not found' };
        }

        let isPurchased = false;

        if (chapter.price === 0) {
            isPurchased = true;
        } 
        else if (chapter.price > 0 && userId) {
            // Check full comic purchase
            const fullPurchase = await comicModel.findFullPurchase(userId, comicId);
            
            if (fullPurchase) {
                isPurchased = true;
            } else {
                // Check single chapter unlock
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

    const connection = getConnection();
    try {
        await connection.beginTransaction();

        const chapterData = await comicModel.findChapterForUnlock(chapterId);
        if (!chapterData) {
            await connection.rollback();
            throw { status: 404, error: 'Chapter not found.' };
        }
        const chapterPrice = parseInt(chapterData.price);
        const comicId = chapterData.comicId;

        const user = await userModel.findUserById(userId, true); 
        if (!user) {
            await connection.rollback();
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
             await connection.commit();
             return { message: 'Chapter is free and unlocked.', level, exp, coinBalance, levelUpOccurred: false };
        }

        if (coinBalance < chapterPrice) {
            await connection.rollback();
            throw { status: 400, error: 'Số dư Xu không đủ. Vui lòng nạp thêm Xu.' };
        }

        const existingUnlock = await comicModel.findUnlockedChapter(userId, chapterId);
        if (existingUnlock) {
            await connection.commit();
            return { message: 'Chapter already unlocked.', level, exp, coinBalance, levelUpOccurred: false };
        }

        await comicModel.insertUnlockedChapter(userId, chapterId);

        const newCoinBalance = coinBalance - chapterPrice;
        
        // EXP CALCULATION LOGIC (Business Logic)
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

        await connection.commit();

        return {
            level: currentLevel,
            exp: currentExp,
            coinBalance: newCoinBalance,
            levelUpOccurred: currentLevel > initialLevel
        };

    } catch (error) {
        await connection.rollback();
        console.error('Unlock chapter error in service:', error);
        throw { status: error.status || 500, error: error.error || 'Failed to unlock chapter' };
    }
};

// --- SEARCH/STATS ---

const getTopComicsService = async () => {
    try {
        const rows = await comicModel.getTopComicsRaw();
        // Data Formatting Logic
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

const searchComicsService = async (query) => {
    if (!query) {
        throw { status: 400, error: 'Query parameter is required' };
    }
    try {
        const searchQuery = `%${query}%`;
        const rows = await comicModel.searchComicsRaw(searchQuery);
        const comicsWithRating = rows.map(comic => ({
            ...comic,
            averageRating: parseFloat(comic.averageRating) || 0,
            totalReviews: parseInt(comic.totalReviews) || 0
        }));
        return comicsWithRating;
    } catch (error) {
        console.error('Error searching comics in service:', error);
        throw { status: 500, error: 'Internal server error' };
    }
};

const getComicsByGenreService = async (genre) => {
    if (!genre) {
        throw { status: 400, error: 'Genre parameter is required' };
    }
    try {
        const rows = await comicModel.getComicsByGenreRaw(genre);
        const comicsWithRating = rows.map(comic => ({
            ...comic,
            averageRating: parseFloat(comic.averageRating) || 0,
            totalReviews: parseInt(comic.totalReviews) || 0
        }));
        return comicsWithRating;
    } catch (error) {
        console.error('Error fetching comics by genre in service:', error);
        throw { status: 500, error: 'Internal server error' };
    }
};

// --- REVIEW LOGIC ---

const getReviewsService = async (comicId) => {
    try {
        return await comicModel.getReviewsRaw(comicId);
    } catch (error) {
        console.error('Error fetching reviews in service:', error);
        throw { status: 500, error: 'Internal server error' };
    }
};

const postReviewService = async (comicId, userId, rating, comment) => {
    if (!rating || !comment) {
        throw { status: 400, error: 'Rating and comment are required' };
    }
    
    try {
        const existing = await comicModel.findExistingReview(comicId, userId);

        let reviewId;
        if (existing) {
            reviewId = existing.id;
            await comicModel.updateReviewRaw(reviewId, rating, comment);
        } else {
            reviewId = await comicModel.insertReviewRaw(comicId, userId, rating, comment);
        }

        const newReview = await comicModel.getReviewByIdRaw(reviewId);

        return { review: newReview, status: 201 };

    } catch (error) {
        console.error('Error posting review in service:', error);
        throw { status: error.status || 500, error: error.error || 'Internal server error' };
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
    unlockChapterService
};