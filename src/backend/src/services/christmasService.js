const { getConnection } = require('../db/connection');

const PRIZES = [
    { type: 'coin', value: 10, weight: 50, label: '10 Xu' },
    { type: 'coin', value: 50, weight: 30, label: '50 Xu' },
    { type: 'luck', value: 0, weight: 30, label: 'Chúc may mắn' },
    { type: 'coin', value: 100, weight: 10, label: '100 Xu' },
    { type: 'voucher', value: 'XMAS20', weight: 5, label: 'Voucher 20%' },
    { type: 'physical_comic', value: 'Special_Edition', weight: 1, label: 'Truyện In' }
];

const SPIN_COST = 20;

const spinWheel = async (userId) => {
    const db = getConnection();
    
    const [users] = await db.query('SELECT coinBalance FROM users WHERE id = ?', [userId]);
    if (users.length === 0) throw new Error('User not found');
    if ((users[0].coinBalance || 0) < SPIN_COST) throw new Error('Không đủ xu');

    const totalWeight = PRIZES.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    let prize = PRIZES[0];
    for (let p of PRIZES) {
        if (random < p.weight) {
            prize = p;
            break;
        }
        random -= p.weight;
    }

    let coinChange = -SPIN_COST;
    if (prize.type === 'coin') coinChange += parseInt(prize.value);

    await db.query('UPDATE users SET coinBalance = coinBalance + ? WHERE id = ?', [coinChange, userId]);

    await db.query(
        'INSERT INTO event_christmas_history (userId, rewardType, rewardValue) VALUES (?, ?, ?)',
        [userId, prize.type, prize.value.toString()]
    );

    return { result: prize, newBalance: users[0].coinBalance + coinChange };
};

const addWish = async (userId, content) => {
    const db = getConnection();    
    await db.query('INSERT INTO event_christmas_wishes (userId, content) VALUES (?, ?)', [userId, content]);    
    await db.query('UPDATE users SET coinBalance = coinBalance + 5 WHERE id = ?', [userId]);    
    return { message: "Gửi lời chúc thành công! +5 Xu" };
};

const getWishes = async () => {
    const db = getConnection();
    const [rows] = await db.query(`
        SELECT w.id, w.content, w.createdAt, u.fullName as username, u.avatarUrl as avatar 
        FROM event_christmas_wishes w
        JOIN users u ON w.userId = u.id
        ORDER BY w.createdAt DESC LIMIT 20
    `);
    return rows;
};

module.exports = { spinWheel, addWish, getWishes };