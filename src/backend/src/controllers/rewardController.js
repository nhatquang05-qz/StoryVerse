const { getConnection } = require('../db/connection');
const { dailyRewardsData, BASE_EXP_PER_PAGE, BASE_EXP_PER_COIN, EXP_RATE_REDUCTION_FACTOR, MIN_EXP_PER_COIN } = require('../utils/constants');

const addExp = async (req, res) => {
    try {
        const { amount, source, coinIncrease = 0 } = req.body;

        if (typeof amount !== 'number' || amount < 0 || typeof coinIncrease !== 'number') {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ.' });
        }

        const connection = getConnection();
        const [rows] = await connection.execute(
            'SELECT level, exp, coinBalance FROM users WHERE id = ? FOR UPDATE',
            [req.userId]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

        let currentLevel = parseInt(rows[0].level);
        let currentExp = parseFloat(rows[0].exp);
        let currentCoinBalance = parseInt(rows[0].coinBalance) + coinIncrease;
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

        await connection.execute(
            'UPDATE users SET level = ?, exp = ?, coinBalance = ? WHERE id = ?',
            [currentLevel, currentExp.toFixed(2), currentCoinBalance, req.userId]
        );

        res.json({
            level: currentLevel,
            exp: currentExp,
            coinBalance: currentCoinBalance,
            levelUpOccurred: currentLevel > initialLevel
        });

    } catch (error) {
        console.error('Add EXP error:', error);
        res.status(500).json({ error: 'Failed to add EXP' });
    }
};

const claimReward = async (req, res) => {
    try {
        const connection = getConnection();
        const [rows] = await connection.execute(
            'SELECT lastDailyLogin, consecutiveLoginDays, coinBalance FROM users WHERE id = ? FOR UPDATE',
            [req.userId]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

        const { lastDailyLogin, consecutiveLoginDays, coinBalance } = rows[0];

        const today = new Date();
        const lastLoginDate = new Date(lastDailyLogin);
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const lastLoginStart = new Date(lastLoginDate.getFullYear(), lastLoginDate.getMonth(), lastLoginDate.getDate());

        const diffTime = todayStart.getTime() - lastLoginStart.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
            return res.status(400).json({ error: 'Bạn đã nhận thưởng hôm nay rồi!' });
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
            return res.status(500).json({ error: 'Lỗi dữ liệu phần thưởng.' });
        }

        const rewardCoins = reward.amount;
        const newBalance = parseInt(coinBalance) + rewardCoins;

        await connection.execute(
            'UPDATE users SET coinBalance = ?, lastDailyLogin = NOW(), consecutiveLoginDays = ? WHERE id = ?',
            [newBalance, nextLoginDays, req.userId]
        );

        res.json({
            newBalance,
            nextLoginDays,
            rewardAmount: rewardCoins,
            notificationMessage: notificationMessage || `Đã nhận ${rewardCoins} Xu thưởng đăng nhập Ngày ${nextLoginDays}!`
        });

    } catch (error) {
        console.error('Claim reward error:', error);
        res.status(500).json({ error: 'Lỗi khi nhận thưởng' });
    }
};

module.exports = { addExp, claimReward };