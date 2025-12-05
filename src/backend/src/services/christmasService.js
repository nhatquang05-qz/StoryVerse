const { getConnection } = require('../db/connection');

// --- CẤU HÌNH 15 Ô VÒNG QUAY (Xếp xen kẽ) ---
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

// --- TỶ LỆ QUAY THƯỞNG ---
const SPIN_RATES = [
    { type: 'luck', label: 'May mắn', rate: 90 },
    { type: 'coin', value: 10, label: '10 Xu', rate: 6 },
    { type: 'coin', value: 50, label: '50 Xu', rate: 3 },
    { type: 'coin', value: 500, label: '500 Xu', rate: 0.9 },
    { type: 'gift', value: 1, label: 'Truyện In', rate: 0.1 }
];

// --- TỶ LỆ QUÀ LỜI CHÚC ---
const WISH_RATES = [
    { min: 10, max: 100, rate: 90 },
    { min: 101, max: 200, rate: 8 },
    { min: 201, max: 500, rate: 1 },
    { min: 501, max: 800, rate: 0.75 },
    { min: 801, max: 1000, rate: 0.25 }
];

// Hàm Helper: Random theo trọng số
const getRandomItem = (items) => {
    const random = Math.random() * 100;
    let currentRate = 0;
    for (let item of items) {
        currentRate += item.rate;
        if (random <= currentRate) return item;
    }
    return items[0];
};

const spinWheel = async (userId) => {
    const db = getConnection();
    
    // 1. Kiểm tra số dư và lượt quay
    const [users] = await db.query('SELECT coinBalance, spins FROM users WHERE id = ?', [userId]);
    if (users.length === 0) throw new Error('User not found');
    
    const user = users[0];
    let useFreeSpin = false;

    if (user.spins > 0) {
        useFreeSpin = true;
    } else if (user.coinBalance < 20) {
        throw new Error('Bạn không đủ xu và lượt quay!');
    }

    // 2. Random giải thưởng
    const selectedPrize = getRandomItem(SPIN_RATES);

    // 3. Chọn ô trên vòng quay khớp với giải thưởng (để Frontend biết quay tới đâu)
    // Lọc ra các ô có cùng label với giải trúng
    const matchingSegments = WHEEL_LAYOUT.filter(s => s.label === selectedPrize.label);
    // Chọn ngẫu nhiên 1 trong các ô đó
    const targetSegment = matchingSegments[Math.floor(Math.random() * matchingSegments.length)];

    // 4. Cập nhật DB
    let sql = 'UPDATE users SET ';
    let params = [];

    // Trừ chi phí
    if (useFreeSpin) {
        sql += 'spins = spins - 1, ';
    } else {
        sql += 'coinBalance = coinBalance - 20, ';
    }

    // Cộng thưởng
    if (targetSegment.type === 'coin') {
        sql += 'coinBalance = coinBalance + ? ';
        params.push(targetSegment.value);
    } else {
        // Nếu trúng quà hiện vật/may mắn thì coin giữ nguyên (hoặc xử lý riêng)
        sql += 'coinBalance = coinBalance '; 
    }

    sql += 'WHERE id = ?';
    params.push(userId);
    
    await db.query(sql, params);

    // Lưu lịch sử
    await db.query(
        'INSERT INTO event_christmas_history (userId, rewardType, rewardValue) VALUES (?, ?, ?)',
        [userId, targetSegment.type, targetSegment.label]
    );

    // Lấy lại thông tin mới nhất để trả về FE
    const [updatedUser] = await db.query('SELECT coinBalance, spins FROM users WHERE id = ?', [userId]);

    return { 
        result: targetSegment, 
        newBalance: updatedUser[0].coinBalance,
        remainingSpins: updatedUser[0].spins 
    };
};

const addWish = async (userId, content) => {
    const db = getConnection();
    const today = new Date().toISOString().slice(0, 10);

    // 1. Check đã chúc hôm nay chưa
    const [users] = await db.query('SELECT lastWishDate FROM users WHERE id = ?', [userId]);
    if (users[0].lastWishDate) {
        const lastDate = new Date(users[0].lastWishDate).toISOString().slice(0, 10);
        if (lastDate === today) {
            throw new Error("Bạn đã gửi lời chúc hôm nay rồi.");
        }
    }

    // 2. Random xu thưởng
    const config = getRandomItem(WISH_RATES);
    const rewardCoins = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;

    // 3. Lưu
    await db.query('INSERT INTO event_christmas_wishes (userId, content) VALUES (?, ?)', [userId, content]);
    await db.query('UPDATE users SET coinBalance = coinBalance + ?, lastWishDate = NOW() WHERE id = ?', [rewardCoins, userId]);
    
    return { message: `Nhận được ${rewardCoins} Xu!`, reward: rewardCoins };
};

const getUserGameInfo = async (userId) => {
    const db = getConnection();
    const today = new Date().toISOString().slice(0, 10);
    
    // Lấy thông tin user
    const [users] = await db.query('SELECT spins, lastWishDate FROM users WHERE id = ?', [userId]);
    
    // Lấy thông tin nhiệm vụ hôm nay
    const [missions] = await db.query(
        'SELECT missionType, progress, target, isClaimed FROM user_missions WHERE userId = ? AND updatedAt = ?',
        [userId, today]
    );
    
    // Map nhiệm vụ để frontend dễ dùng
    const missionStatus = {
        LOGIN: missions.find(m => m.missionType === 'LOGIN') || { progress: 0, target: 1, isClaimed: 0 },
        BUY_COMIC: missions.find(m => m.missionType === 'BUY_COMIC') || { progress: 0, target: 1, isClaimed: 0 },
        READ_CHAPTER: missions.find(m => m.missionType === 'READ_CHAPTER') || { progress: 0, target: 3, isClaimed: 0 }
    };

    const lastWish = users[0].lastWishDate ? new Date(users[0].lastWishDate).toISOString().slice(0, 10) : '';

    return {
        spins: users[0].spins,
        hasWishedToday: lastWish === today,
        missions: missionStatus
    };
};

// Hàm gọi nội bộ khi user làm hành động (Login, Mua, Đọc)
// Cần import hàm này vào AuthController (Login), OrderController (Mua), ComicController (Mở khóa)
const updateMissionProgress = async (userId, type) => {
    const db = getConnection();
    const today = new Date().toISOString().slice(0, 10);
    
    let rewardSpins = 0;
    let target = 1;
    
    if (type === 'LOGIN') { rewardSpins = 1; target = 1; }
    else if (type === 'BUY_COMIC') { rewardSpins = 5; target = 1; }
    else if (type === 'READ_CHAPTER') { rewardSpins = 1; target = 3; }

    // 1. Insert nếu chưa có, hoặc update progress
    await db.query(`
        INSERT INTO user_missions (userId, missionType, progress, target, isClaimed, updatedAt)
        VALUES (?, ?, 1, ?, 0, ?)
        ON DUPLICATE KEY UPDATE progress = progress + 1
    `, [userId, type, target, today]);

    // 2. Check xem đã đủ target chưa và chưa nhận thưởng
    const [mission] = await db.query(
        'SELECT * FROM user_missions WHERE userId = ? AND missionType = ? AND updatedAt = ?',
        [userId, type, today]
    );

    if (mission[0].progress >= target && mission[0].isClaimed === 0) {
        // Cộng lượt quay và đánh dấu đã nhận
        await db.query('UPDATE users SET spins = spins + ? WHERE id = ?', [rewardSpins, userId]);
        await db.query('UPDATE user_missions SET isClaimed = 1 WHERE userId = ? AND missionType = ? AND updatedAt = ?', [userId, type, today]);
        return true; // Có thưởng
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