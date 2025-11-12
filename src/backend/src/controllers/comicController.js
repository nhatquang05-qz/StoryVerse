const comicService = require('../services/comicService');

const addComic = async (req, res) => {
    const { title, author, description, coverImageUrl, status, isDigital, price, genres } = req.body;
    try {
        const result = await comicService.addComicService({ title, author, description, coverImageUrl, status, isDigital, price, genres });
        res.status(result.status).json({ message: result.message, comicId: result.comicId });
    } catch (error) {
        const status = error.status || 500;
        console.error('Error adding comic:', error);
        res.status(status).json({ error: error.error || 'Failed to add comic' });
    }
};

const updateComic = async (req, res) => {
    const { id } = req.params;
    const { title, author, description, coverImageUrl, status, isDigital, price, genres } = req.body;
    try {
        const result = await comicService.updateComicService(id, { title, author, description, coverImageUrl, status, isDigital, price, genres });
        res.status(result.status).json({ message: result.message });
    } catch (error) {
        const status = error.status || 500;
        console.error('Error updating comic:', error);
        res.status(status).json({ error: error.error || 'Failed to update comic' });
    }
};

const deleteComic = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await comicService.deleteComicService(id);
        res.status(result.status).json({ message: result.message });
    } catch (error) {
        const status = error.status || 500;
        console.error('Error deleting comic:', error);
        res.status(status).json({ error: error.error || 'Failed to delete comic' });
    }
};

const getAllGenres = async (req, res) => {
    try {
        const genres = await comicService.getAllGenresService();
        res.json(genres);
    } catch (error) {
        const status = error.status || 500;
        console.error('Error fetching genres:', error);
        res.status(status).json({ error: error.error || 'Internal server error' });
    }
};

const getAllComics = async (req, res) => {
    try {
        const comics = await comicService.getAllComicsService();
        res.json(comics);
    } catch (error) {
        const status = error.status || 500;
        console.error('Error fetching comics:', error);
        res.status(status).json({ error: error.error || 'Internal server error' });
    }
};

const getComicById = async (req, res) => {
    try {
        const { id } = req.params;
        const comic = await comicService.getComicByIdService(id);
        res.json(comic);
    } catch (error) {
        const status = error.status || 500;
        console.error('Error fetching comic details:', error);
        res.status(status).json({ error: error.error || 'Internal server error' });
    }
};

const addChapter = async (req, res) => {
    const { comicId } = req.params;
    const { chapterNumber, title, contentUrls, price } = req.body;

    try {
        const result = await comicService.addChapterService(comicId, { chapterNumber, title, contentUrls, price });
        res.status(result.status).json({ message: result.message, chapterId: result.chapterId });
    } catch (error) {
        const status = error.status || 500;
        console.error('Error adding chapter:', error);
        res.status(status).json({ error: error.error || 'Failed to add chapter' });
    }
};

const deleteChapter = async (req, res) => {
    const { comicId, chapterId } = req.params;
    try {
        const result = await comicService.deleteChapterService(comicId, chapterId);
        res.status(result.status).json({ message: result.message });
    } catch (error) {
        const status = error.status || 500;
        console.error('Error deleting chapter:', error);
        res.status(status).json({ error: error.error || 'Failed to delete chapter' });
    }
};

const getChapterContent = async (req, res) => {
    const { comicId, chapterId } = req.params;
    const { userId } = req; 

    try {
        const chapter = await comicService.getChapterContentService(comicId, chapterId, userId);
        res.json(chapter);
    } catch (error) {
        const status = error.status || 500;
        console.error('Error fetching chapter content:', error);
        res.status(status).json({ error: error.error || 'Internal server error' });
    }
};

const unlockChapter = async (req, res) => {
    const { userId } = req;
    const { chapterId } = req.body;

    try {
        const result = await comicService.unlockChapterService(userId, chapterId);

        res.json({
            level: result.level,
            exp: result.exp,
            coinBalance: result.coinBalance,
            levelUpOccurred: result.levelUpOccurred,
            message: result.message
        });

    } catch (error) {
        const status = error.status || 500;
        console.error('Unlock chapter error:', error);
        res.status(status).json({ error: error.error || 'Failed to unlock chapter' });
    }
};

const getTopComics = async (req, res) => {
    try {
        const comics = await comicService.getTopComicsService();
        res.json(comics);
    } catch (error) {
        const status = error.status || 500;
        console.error('Error fetching top comics:', error);
        res.status(status).json({ error: error.error || 'Internal server error' });
    }
};

const searchComics = async (req, res) => {
    try {
        const { q } = req.query;
        const comics = await comicService.searchComicsService(q);
        res.json(comics);
    } catch (error) {
        const status = error.status || 500;
        console.error('Error searching comics:', error);
        res.status(status).json({ error: error.error || 'Internal server error' });
    }
};

const getComicsByGenre = async (req, res) => {
    try {
        const { genre } = req.query;
        const comics = await comicService.getComicsByGenreService(genre);
        res.json(comics);
    } catch (error) {
        const status = error.status || 500;
        console.error('Error fetching comics by genre:', error);
        res.status(status).json({ error: error.error || 'Internal server error' });
    }
};

const getReviews = async (req, res) => {
    try {
        const { comicId } = req.params;
        const reviews = await comicService.getReviewsService(comicId);
        res.json(reviews);
    } catch (error) {
        const status = error.status || 500;
        console.error('Error fetching reviews:', error);
        res.status(status).json({ error: error.error || 'Internal server error' });
    }
};

const postReview = async (req, res) => {
    try {
        const { comicId } = req.params;
        const { userId } = req;
        const { rating, comment } = req.body;

        const result = await comicService.postReviewService(comicId, userId, rating, comment);

        res.status(result.status).json(result.review);

    } catch (error) {
        const status = error.status || 500;
        console.error('Error posting review:', error);
        res.status(status).json({ error: error.error || 'Internal server error' });
    }
};

module.exports = {
    addComic,
    updateComic,
    deleteComic,
    getAllComics,
    getComicById,
    addChapter,
    deleteChapter,
    getChapterContent,
    getTopComics,
    searchComics,
    getComicsByGenre,
    getAllGenres,
    getReviews,
    postReview,
    unlockChapter
};