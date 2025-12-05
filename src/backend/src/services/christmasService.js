const { getConnection } = require('../db/connection');

const PRIZE_TIERS = [
    { min: 1, max: 10, rate: 80 },
    { min: 11, max: 20, rate: 15 },
    { min: 21, max: 100, rate: 3 },
    { min: 101, max: 1000, rate: 1.5 },
    { min: 2412, max: 2412, rate: 0.49 },
    { min: 24120, max: 24120, rate: 0.01 }
];

const WISH_RATES = [
    { min: 10, max: 100, rate: 90 },
    { min: 101, max: 200, rate: 8 },
    { min: 201, max: 500, rate: 1 },
    { min: 501, max: 800, rate: 0.75 },
    { min: 801, max: 1000, rate: 0.25 }
];

const getRandomItem = (items) => {
    const random = Math.random() * 100;
    let currentRate = 0;
    for (let item of items) {
        currentRate += item.rate;
        if (random <= currentRate) return item;
    }
    return items[0];
};

const getMysteryGiftPrize = () => {
    const random = Math.random() * 100;
    let currentRate = 0;
    for (let tier of PRIZE_TIERS) {
        currentRate += tier.rate;
        if (random <= currentRate) {
            const value = Math.floor(Math.random() * (tier.max - tier.min + 1)) + tier.min;
            return { type: 'coin', value, label: `${value.toLocaleString()} Xu` };
        }
    }
    const tier = PRIZE_TIERS[0];
    const value = Math.floor(Math.random() * (tier.max - tier.min + 1)) + tier.min;
    return { type: 'coin', value, label: `${value.toLocaleString()} Xu` };
};

const ensureEventStatus = async (connection, userId) => {
    await connection.query('INSERT IGNORE INTO user_event_status (userId, spins) VALUES (?, 0)', [userId]);
};

const spinWheel = async (userId) => {
    const db = getConnection();
    
    const [users] = await db.query('SELECT coinBalance FROM users WHERE id = ?', [userId]);
    if (users.length === 0) throw new Error('User not found');
    
    await ensureEventStatus(db, userId);
    const [eventStatus] = await db.query('SELECT spins FROM user_event_status WHERE userId = ?', [userId]);
    
    const userCoin = users[0].coinBalance || 0;
    const userSpins = eventStatus[0].spins || 0;
    let useFreeSpin = false;

    if (userSpins > 0) {
        useFreeSpin = true;
    } else if (userCoin < 20) {
        throw new Error('Bạn không đủ xu và lượt quay!');
    }

    const prize = getMysteryGiftPrize();

    if (useFreeSpin) {
        await db.query('UPDATE user_event_status SET spins = spins - 1 WHERE userId = ?', [userId]);
    } else {
        await db.query('UPDATE users SET coinBalance = coinBalance - 20 WHERE id = ?', [userId]);
    }

    if (prize.type === 'coin') {
        await db.query('UPDATE users SET coinBalance = coinBalance + ? WHERE id = ?', [prize.value, userId]);
    }

    await db.query(
        'INSERT INTO event_christmas_history (userId, rewardType, rewardValue) VALUES (?, ?, ?)',
        [userId, prize.type, prize.label]
    );

    const [updatedUser] = await db.query('SELECT coinBalance FROM users WHERE id = ?', [userId]);
    const [updatedStatus] = await db.query('SELECT spins FROM user_event_status WHERE userId = ?', [userId]);

    return { 
        result: prize, 
        newBalance: updatedUser[0].coinBalance,
        remainingSpins: updatedStatus[0].spins 
    };
};

const addWish = async (userId, content) => {
    const db = getConnection();
    await ensureEventStatus(db, userId);

    const [check] = await db.query(`
        SELECT 1 FROM user_event_status 
        WHERE userId = ? AND lastWishDate = CURDATE()
    `, [userId]);
    
    if (check.length > 0) {
        throw new Error("Bạn đã gửi lời chúc hôm nay rồi.");
    }

    const config = getRandomItem(WISH_RATES);
    const rewardCoins = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;

    await db.query('INSERT INTO event_christmas_wishes (userId, content) VALUES (?, ?)', [userId, content]);    
    await db.query('INSERT INTO event_christmas_history (userId, rewardType, rewardValue) VALUES (?, ?, ?)', 
        [userId, 'coin', `Wish-${rewardCoins}`]
    );
    
    await db.query('UPDATE user_event_status SET lastWishDate = CURDATE() WHERE userId = ?', [userId]);
    await db.query('UPDATE users SET coinBalance = coinBalance + ? WHERE id = ?', [rewardCoins, userId]);
    
    return { 
        message: `Nhận được ${rewardCoins} Xu!`,
        reward: rewardCoins 
    };
};

const getUserGameInfo = async (userId) => {
    const db = getConnection();
    await ensureEventStatus(db, userId);
    
    const [statusRows] = await db.query(`
        SELECT spins, 
        CASE WHEN lastWishDate = CURDATE() THEN 1 ELSE 0 END as hasWishedToday 
        FROM user_event_status 
        WHERE userId = ?
    `, [userId]);

    const hasWishedToday = statusRows[0].hasWishedToday === 1;    
    const todayStr = new Date().toISOString().slice(0, 10);
    const [missions] = await db.query(
        'SELECT missionType, progress, target, isClaimed FROM user_missions WHERE userId = ? AND updatedAt = CURDATE()',
        [userId]
    );
    
    const missionStatus = {
        LOGIN: missions.find(m => m.missionType === 'LOGIN') || { progress: 0, target: 1, isClaimed: 0 },
        BUY_COMIC: missions.find(m => m.missionType === 'BUY_COMIC') || { progress: 0, target: 1, isClaimed: 0 },
        READ_CHAPTER: missions.find(m => m.missionType === 'READ_CHAPTER') || { progress: 0, target: 3, isClaimed: 0 }
    };

    
    let todayWishReward = 0;
    if (hasWishedToday) {
        const [history] = await db.query(`
            SELECT rewardValue FROM event_christmas_history 
            WHERE userId = ? AND DATE(createdAt) = CURDATE() AND rewardValue LIKE 'Wish-%'
            ORDER BY createdAt DESC LIMIT 1
        `, [userId]);
        
        if (history.length > 0) {
            const val = history[0].rewardValue.split('-')[1];
            todayWishReward = parseInt(val) || 0;
        }
    }

    return {
        spins: statusRows[0].spins || 0,
        hasWishedToday,
        todayWishReward,
        missions: missionStatus
    };
};

const updateMissionProgress = async (userId, type) => {
    const db = getConnection();
    
    let rewardSpins = 0;
    let target = 1;
    
    if (type === 'LOGIN') { rewardSpins = 1; target = 1; }
    else if (type === 'BUY_COMIC') { rewardSpins = 5; target = 1; }
    else if (type === 'READ_CHAPTER') { rewardSpins = 1; target = 3; }

    await ensureEventStatus(db, userId);

    
    await db.query(`
        INSERT INTO user_missions (userId, missionType, progress, target, isClaimed, updatedAt)
        VALUES (?, ?, 1, ?, 0, CURDATE())
        ON DUPLICATE KEY UPDATE progress = progress + 1
    `, [userId, type, target]);

    const [mission] = await db.query(
        'SELECT * FROM user_missions WHERE userId = ? AND missionType = ? AND updatedAt = CURDATE()',
        [userId, type]
    );

    if (mission[0].progress >= target && mission[0].isClaimed === 0) {
        await db.query('UPDATE user_event_status SET spins = spins + ? WHERE userId = ?', [rewardSpins, userId]);
        await db.query('UPDATE user_missions SET isClaimed = 1 WHERE userId = ? AND missionType = ? AND updatedAt = CURDATE()', [userId, type]);
        return true;
    }
    return false;
};

const getWishes = async () => {
    const db = getConnection();
    const [rows] = await db.query(`
        SELECT w.id, w.content, w.createdAt, u.fullName, u.avatarUrl 
        FROM event_christmas_wishes w
        JOIN users u ON w.userId = u.id
        ORDER BY w.createdAt DESC LIMIT 20
    `);
    return rows;
};

const getEventHistory = async (userId) => {
    const db = getConnection();
    const [rows] = await db.query(`
        SELECT rewardType, rewardValue, createdAt 
        FROM event_christmas_history 
        WHERE userId = ? 
        ORDER BY createdAt DESC 
        LIMIT 50
    `, [userId]);

    return rows.map(row => {
        let source = 'Hộp quà bí ẩn';
        let value = row.rewardValue;

        if (typeof value === 'string' && value.startsWith('Wish-')) {
            source = 'Lời chúc Giáng sinh';
            value = value.replace('Wish-', '') + ' Xu';
        }

        return {
            id: row.id, 
            source,
            value,
            createdAt: row.createdAt
        };
    });
};

module.exports = { spinWheel, addWish, getWishes, getUserGameInfo, updateMissionProgress, getEventHistory };