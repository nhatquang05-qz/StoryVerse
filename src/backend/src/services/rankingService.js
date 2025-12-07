const userModel = require('../models/userModel'); 
const comicModel = require('../models/comicModel'); 


const getStartAndEndDate = (period) => {
    let startDate = null;
    let endDate = null;
    const now = new Date();

    
    now.setHours(0, 0, 0, 0);

    if (period === 'day') {
        startDate = now;
        endDate = new Date(now);
        endDate.setDate(startDate.getDate() + 1);
    } else if (period === 'week') {
        
        const dayOfWeek = now.getDay(); 
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); 
        startDate = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7);
    } else if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
    } else {
        throw { status: 400, error: 'Invalid period parameter.' };
    }

    return { startDate, endDate };
};


const getDigitalComicsRankingService = async (period) => {
    try {
        const { startDate, endDate } = getStartAndEndDate(period);      
        const rows = await comicModel.getDigitalComicsRankingRaw(startDate, endDate); 
        
        return rows.map((comic, index) => ({
            ...comic,
            rank: index + 1,
            totalViews: parseInt(comic.totalViews) || 0,
            isDigital: true
        }));
    } catch (error) {
        console.error(`Error fetching digital comics ranking for period ${period}:`, error);
        throw { status: error.status || 500, error: error.error || 'Failed to fetch digital comic rankings' };
    }
};


const getPhysicalComicsRankingService = async (period) => {
    try {
        const { startDate, endDate } = getStartAndEndDate(period);

        
        
        const rows = await comicModel.getPhysicalComicsRankingRaw(startDate, endDate);

        return rows.map((comic, index) => ({
            ...comic,
            rank: index + 1,
            totalPurchases: parseInt(comic.totalPurchases) || 0,
            isDigital: false
        }));
    } catch (error) {
        console.error(`Error fetching physical comics ranking for period ${period}:`, error);
        throw { status: error.status || 500, error: error.error || 'Failed to fetch physical comic rankings' };
    }
};


const getMemberRankingService = async () => {
    try {
        
        const rows = await userModel.getTopUsersByPointsRaw(20); 

        return rows.map((user, index) => ({
            id: user.id,
            username: user.username,
            avatar: user.avatarUrl, 
            totalPoints: parseInt(user.totalPoints) || 0, 
            rank: index + 1
        }));
    } catch (error) {
        console.error('Error fetching member ranking:', error);
        throw { status: 500, error: 'Failed to fetch member rankings' };
    }
};

module.exports = {
    getDigitalComicsRankingService,
    getPhysicalComicsRankingService,
    getMemberRankingService,
};