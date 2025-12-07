const rankingService = require('../services/rankingService');

const getDigitalComicsRanking = async (req, res) => {
    const period = req.query.period || 'day'; 
    if (!['day', 'week', 'month'].includes(period)) {
        return res.status(400).json({ error: 'Invalid period parameter. Must be day, week, or month.' });
    }
    try {
        const rankings = await rankingService.getDigitalComicsRankingService(period);
        res.status(200).json(rankings);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.error || 'Internal Server Error' });
    }
};

const getPhysicalComicsRanking = async (req, res) => {
    const period = req.query.period || 'day'; 
    if (!['day', 'week', 'month'].includes(period)) {
        return res.status(400).json({ error: 'Invalid period parameter. Must be day, week, or month.' });
    }
    try {
        const rankings = await rankingService.getPhysicalComicsRankingService(period);
        res.status(200).json(rankings);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.error || 'Internal Server Error' });
    }
};

const getMemberRanking = async (req, res) => {
    try {
        
        const rankings = await rankingService.getMemberRankingService(); 
        res.status(200).json(rankings);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.error || 'Internal Server Error' });
    }
};

module.exports = {
    getDigitalComicsRanking,
    getPhysicalComicsRanking,
    getMemberRanking,
};