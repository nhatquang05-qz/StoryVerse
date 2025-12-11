const { getConnection } = require('../db/connection');
const userModel = require('../models/userModel'); 
const rewardModel = require('../models/rewardModel');
const { dailyRewardsData, BASE_EXP_PER_PAGE, BASE_EXP_PER_COIN, EXP_RATE_REDUCTION_FACTOR, MIN_EXP_PER_COIN } = require('../utils/constants');

const addExpService = async (userId, { amount, source, coinIncrease = 0 }) => {
    if (typeof amount !== 'number' || amount < 0 || typeof coinIncrease !== 'number') {
        throw { status: 400, error: 'Dữ liệu không hợp lệ.' };
    }

    try {
        const user = await userModel.findUserById(userId, true);
        if (!user) throw { status: 404, error: 'User not found' };

        let currentLevel = parseInt(user.level);
        let currentExp = parseFloat(user.exp);
        let currentCoinBalance = parseInt(user.coinBalance) + coinIncrease;
        let initialLevel = currentLevel;

        if (source === 'recharge' && amount > 0) {
            let coinsToProcess = amount;
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
        } else if (source === 'reading' && amount > 0) {
             const modifier = Math.pow(EXP_RATE_REDUCTION_FACTOR, currentLevel - 1);
             const actualExpGain = (BASE_EXP_PER_PAGE * amount) * modifier;
             currentExp += actualExpGain;
             while (currentExp >= 100) {
                 currentLevel += 1;
                 currentExp -= 100;
             }
        }

        currentExp = Math.min(100, Math.max(0, currentExp));

        await userModel.updateUserBalanceAndExpRaw(userId, currentCoinBalance, currentLevel, currentExp);

        return {
            level: currentLevel,
            exp: currentExp,
            coinBalance: currentCoinBalance,
            levelUpOccurred: currentLevel > initialLevel
        };

    } catch (error) {
        console.error('Add EXP error in service:', error);
        throw { status: error.status || 500, error: error.error || 'Failed to add EXP' };
    }
};

const claimRewardService = async (userId) => {
    const connection = getConnection();
    await connection.beginTransaction();

    try {
        const rewardData = await rewardModel.getUserForRewardRaw(userId, true);
        if (!rewardData) {
            await connection.rollback();
            throw { status: 404, error: 'User not found' };
        }

        const { lastDailyLogin, consecutiveLoginDays, coinBalance } = rewardData;

        const today = new Date();
        const lastLoginDate = new Date(lastDailyLogin);
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const lastLoginStart = new Date(lastLoginDate.getFullYear(), lastLoginDate.getMonth(), lastLoginDate.getDate());

        const diffTime = todayStart.getTime() - lastLoginStart.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
            await connection.rollback();
            throw { status: 400, error: 'Bạn đã nhận thưởng hôm nay rồi!' };
        }

        let nextLoginDays = parseInt(consecutiveLoginDays) + 1;
        let notificationMessage = '';

        if (diffDays > 1) {
            nextLoginDays = 1;
            notificationMessage = 'Chuỗi đăng nhập đã bị đứt! Bắt đầu lại từ Ngày 1.';
        }

        const currentRewardIndex = (nextLoginDays - 1) % dailyRewardsData.length;
        const reward = dailyRewardsData[currentRewardIndex];

        if (!reward || reward.type !== 'Xu') {
            console.error("Invalid reward data for day:", nextLoginDays, reward);
            await connection.rollback();
            throw { status: 500, error: 'Lỗi dữ liệu phần thưởng.' };
        }

        const rewardCoins = reward.amount;
        const newBalance = parseInt(coinBalance) + rewardCoins;

        await rewardModel.updateDailyLoginRaw(userId, newBalance, nextLoginDays);
        await connection.commit();

        return {
            newBalance,
            nextLoginDays,
            rewardAmount: rewardCoins,
            notificationMessage: notificationMessage || `Đã nhận ${rewardCoins} Xu thưởng đăng nhập Ngày ${nextLoginDays}!`
        };

    } catch (error) {
        await connection.rollback();
        console.error('Claim reward error in service:', error);
        throw { status: error.status || 500, error: error.error || 'Lỗi khi nhận thưởng' };
    }
};

module.exports = { addExpService, claimRewardService };