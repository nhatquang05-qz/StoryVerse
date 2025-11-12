const rewardService = require('../services/rewardService');

const addExp = async (req, res) => {
    try {
        const { amount, source, coinIncrease = 0 } = req.body;
        const result = await rewardService.addExpService(req.userId, { amount, source, coinIncrease });

        res.json({
            level: result.level,
            exp: result.exp,
            coinBalance: result.coinBalance,
            levelUpOccurred: result.levelUpOccurred
        });

    } catch (error) {
        const status = error.status || 500;
        console.error('Add EXP error:', error);
        res.status(status).json({ error: error.error || 'Failed to add EXP' });
    }
};

const claimReward = async (req, res) => {
    try {
        const result = await rewardService.claimRewardService(req.userId);

        res.json({
            newBalance: result.newBalance,
            nextLoginDays: result.nextLoginDays,
            rewardAmount: result.rewardAmount,
            notificationMessage: result.notificationMessage
        });

    } catch (error) {
        const status = error.status || 500;
        console.error('Claim reward error:', error);
        res.status(status).json({ error: error.error || 'Lỗi khi nhận thưởng' });
    }
};

module.exports = { addExp, claimReward };