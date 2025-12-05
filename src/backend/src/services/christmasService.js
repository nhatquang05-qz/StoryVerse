const { getConnection } = require('../db/connection');

const WHEEL_LAYOUT = [
    { id: 1, label: '10 Xu', type: 'coin', value: 10 },
    { id: 2, label: '50 Xu', type: 'coin', value: 50 },
    { id: 3, label: '10 Xu', type: 'coin', value: 10 },
    { id: 4, label: 'May mắn', type: 'luck', value: 0 },
    { id: 5, label: '10 Xu', type: 'coin', value: 10 },
    { id: 6, label: '50 Xu', type: 'coin', value: 50 },
    { id: 7, label: '10 Xu', type: 'coin', value: 10 },
    { id: 8, label: 'May mắn', type: 'luck', value: 0 },
    { id: 9, label: '50 Xu', type: 'coin', value: 50 },
    { id: 10, label: '10 Xu', type: 'coin', value: 10 },
    { id: 11, label: '500 Xu', type: 'coin', value: 500 },
    { id: 12, label: 'May mắn', type: 'luck', value: 0 },
    { id: 13, label: '50 Xu', type: 'coin', value: 50 },
    { id: 14, label: '10 Xu', type: 'coin', value: 10 },
    { id: 15, label: 'Truyện In', type: 'gift', value: 1 }
];

const SPIN_RATES = [
    { type: 'luck', label: 'May mắn', rate: 90 },
    { type: 'coin', value: 10, label: '10 Xu', rate: 6 },
    { type: 'coin', value: 50, label: '50 Xu', rate: 3 },
    { type: 'coin', value: 500, label: '500 Xu', rate: 0.9 },
    { type: 'gift', value: 1, label: 'Truyện In', rate: 0.1 }
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

    const selectedPrize = getRandomItem(SPIN_RATES);
    const matchingSegments = WHEEL_LAYOUT.filter(s => s.label === selectedPrize.label);
    const targetSegment = matchingSegments[Math.floor(Math.random() * matchingSegments.length)];

    if (useFreeSpin) {
        await db.query('UPDATE user_event_status SET spins = spins - 1 WHERE userId = ?', [userId]);
    } else {
        await db.query('UPDATE users SET coinBalance = coinBalance - 20 WHERE id = ?', [userId]);
    }

    if (targetSegment.type === 'coin') {
        await db.query('UPDATE users SET coinBalance = coinBalance + ? WHERE id = ?', [targetSegment.value, userId]);
    }

    await db.query(
        'INSERT INTO event_christmas_history (userId, rewardType, rewardValue) VALUES (?, ?, ?)',
        [userId, targetSegment.type, targetSegment.label]
    );

    const [updatedUser] = await db.query('SELECT coinBalance FROM users WHERE id = ?', [userId]);
    const [updatedStatus] = await db.query('SELECT spins FROM user_event_status WHERE userId = ?', [userId]);

    return { 
        result: targetSegment, 
        newBalance: updatedUser[0].coinBalance,
        remainingSpins: updatedStatus[0].spins 
    };
};

const addWish = async (userId, content) => {
    const db = getConnection();
    const today = new Date().toISOString().slice(0, 10);

    await ensureEventStatus(db, userId);
    const [status] = await db.query('SELECT lastWishDate FROM user_event_status WHERE userId = ?', [userId]);
    
    if (status[0].lastWishDate) {
        const lastDate = new Date(status[0].lastWishDate).toISOString().slice(0, 10);
        if (lastDate === today) {
            throw new Error("Bạn đã gửi lời chúc hôm nay rồi.");
        }
    }

    const config = getRandomItem(WISH_RATES);
    const rewardCoins = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;

    await db.query('INSERT INTO event_christmas_wishes (userId, content) VALUES (?, ?)', [userId, content]);
    
    await db.query('UPDATE user_event_status SET lastWishDate = NOW() WHERE userId = ?', [userId]);
    await db.query('UPDATE users SET coinBalance = coinBalance + ? WHERE id = ?', [rewardCoins, userId]);
    
    return { 
        message: `Nhận được ${rewardCoins} Xu!`,
        reward: rewardCoins 
    };
};

const getUserGameInfo = async (userId) => {
    const db = getConnection();
    const today = new Date().toISOString().slice(0, 10);
    
    await ensureEventStatus(db, userId);

    // Lấy spins và lastWishDate từ bảng riêng
    const [statusRows] = await db.query('SELECT spins, lastWishDate FROM user_event_status WHERE userId = ?', [userId]);
    const [missions] = await db.query(
        'SELECT missionType, progress, target, isClaimed FROM user_missions WHERE userId = ? AND updatedAt = ?',
        [userId, today]
    );
    
    const missionStatus = {
        LOGIN: missions.find(m => m.missionType === 'LOGIN') || { progress: 0, target: 1, isClaimed: 0 },
        BUY_COMIC: missions.find(m => m.missionType === 'BUY_COMIC') || { progress: 0, target: 1, isClaimed: 0 },
        READ_CHAPTER: missions.find(m => m.missionType === 'READ_CHAPTER') || { progress: 0, target: 3, isClaimed: 0 }
    };

    const lastWish = statusRows[0].lastWishDate ? new Date(statusRows[0].lastWishDate).toISOString().slice(0, 10) : '';

    return {
        spins: statusRows[0].spins || 0,
        hasWishedToday: lastWish === today,
        missions: missionStatus
    };
};

const updateMissionProgress = async (userId, type) => {
    const db = getConnection();
    const today = new Date().toISOString().slice(0, 10);
    
    let rewardSpins = 0;
    let target = 1;
    
    if (type === 'LOGIN') { rewardSpins = 1; target = 1; }
    else if (type === 'BUY_COMIC') { rewardSpins = 5; target = 1; }
    else if (type === 'READ_CHAPTER') { rewardSpins = 1; target = 3; }

    await ensureEventStatus(db, userId);

    await db.query(`
        INSERT INTO user_missions (userId, missionType, progress, target, isClaimed, updatedAt)
        VALUES (?, ?, 1, ?, 0, ?)
        ON DUPLICATE KEY UPDATE progress = progress + 1
    `, [userId, type, target, today]);

    const [mission] = await db.query(
        'SELECT * FROM user_missions WHERE userId = ? AND missionType = ? AND updatedAt = ?',
        [userId, type, today]
    );

    if (mission[0].progress >= target && mission[0].isClaimed === 0) {
        // Cộng lượt quay vào bảng user_event_status
        await db.query('UPDATE user_event_status SET spins = spins + ? WHERE userId = ?', [rewardSpins, userId]);
        await db.query('UPDATE user_missions SET isClaimed = 1 WHERE userId = ? AND missionType = ? AND updatedAt = ?', [userId, type, today]);
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

module.exports = { spinWheel, addWish, getWishes, getUserGameInfo, updateMissionProgress, WHEEL_LAYOUT };