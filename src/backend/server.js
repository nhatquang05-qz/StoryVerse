const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();


app.use(cors({
  origin: 'http://localhost:5173', // Hoặc domain frontend của bạn
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const JWT_SECRET = 'your_super_secret_key_change_this_later_123456';


const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '24122005Quang#', // <<< NHỚ THAY PASSWORD DB CỦA BẠN
  database: 'storyverse_db'   // <<< NHỚ THAY TÊN DB CỦA BẠN
};

let connection;

async function connectDB() {
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database!');
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
}

connectDB();


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.sendStatus(403);
    }
    req.userId = user.id;
    next();
  });
};


const ensureUserDataTypes = (userData) => {
    if (!userData) return null;
    const safeData = { ...userData };

    try {
        safeData.exp = parseFloat(safeData.exp || 0);
        if (isNaN(safeData.exp)) safeData.exp = 0;
    } catch (e) {
        safeData.exp = 0;
    }

    try {
        if (typeof safeData.addresses === 'string') {
           safeData.addresses = JSON.parse(safeData.addresses || '[]');
        }
        if (!Array.isArray(safeData.addresses)) safeData.addresses = [];
    } catch(e) {
        console.error("Error parsing addresses:", e, "Original value:", safeData.addresses);
        safeData.addresses = [];
    }

    safeData.level = parseInt(safeData.level || 1);
    if (isNaN(safeData.level)) safeData.level = 1;

    safeData.coinBalance = parseInt(safeData.coinBalance || 0);
     if (isNaN(safeData.coinBalance)) safeData.coinBalance = 0;

    safeData.consecutiveLoginDays = parseInt(safeData.consecutiveLoginDays || 0);
     if (isNaN(safeData.consecutiveLoginDays)) safeData.consecutiveLoginDays = 0;

    if (typeof safeData.id !== 'undefined' && typeof safeData.id !== 'string') {
        safeData.id = String(safeData.id);
    }


    return safeData;
};


app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters long' });

    const [existingUser] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) return res.status(409).json({ error: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultFullName = email.split('@')[0] || 'New User';
    const mockDefaultAddress = JSON.stringify([{ id: `default-${Date.now()}`, street: '123 Đường Mặc định', ward: 'Phường Mặc định', district: 'Quận Mặc định', city: 'TP Mặc định', isDefault: true }]);

    const [result] = await connection.execute(
      'INSERT INTO users (email, password, fullName, phone, coinBalance, lastDailyLogin, consecutiveLoginDays, level, exp, addresses) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, defaultFullName, '', 1000, '2000-01-01 00:00:00', 0, 1, '0.00', mockDefaultAddress]
    );
    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Invalid email or password' });

    const { password: userPassword, ...userWithoutPassword } = user;
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    const userData = ensureUserDataTypes(userWithoutPassword);
    res.json({ message: 'Login successful', token, user: userData });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to log in' });
  }
});


app.get('/api/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [req.userId]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const { password, ...userData } = rows[0];
    const finalUserData = ensureUserDataTypes(userData);

    res.json(finalUserData);
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    if (typeof fullName !== 'string' || fullName.trim() === '' || typeof phone !== 'string' || phone.trim() === '') {
        return res.status(400).json({ error: 'Họ tên và Số điện thoại không hợp lệ.' });
    }

    await connection.execute(
      'UPDATE users SET fullName = ?, phone = ? WHERE id = ?',
      [fullName.trim(), phone.trim(), req.userId]
    );

    const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [req.userId]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found after update' });

    const { password, ...updatedUser } = rows[0];
    const finalUserData = ensureUserDataTypes(updatedUser);

    res.json(finalUserData);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});


app.get('/api/addresses', authenticateToken, async (req, res) => {
    try {
        const [rows] = await connection.execute(
            'SELECT addresses FROM users WHERE id = ?',
            [req.userId]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

        const addresses = ensureUserDataTypes({ addresses: rows[0].addresses }).addresses;
        res.json(addresses);

    } catch (error) {
        console.error("Fetch addresses error:", error);
        res.status(500).json({ error: 'Failed to fetch addresses' });
    }
});

app.put('/api/addresses', authenticateToken, async (req, res) => {
    try {
        const { addresses } = req.body;
        if (!Array.isArray(addresses)) {
            return res.status(400).json({ error: 'Invalid data format, expected an array of addresses.' });
        }
        for(const addr of addresses) {
            if (!addr || typeof addr.street !== 'string' || typeof addr.city !== 'string') {
                 return res.status(400).json({ error: 'Một hoặc nhiều địa chỉ không hợp lệ.' });
            }
        }


        await connection.execute(
            'UPDATE users SET addresses = ? WHERE id = ?',
            [JSON.stringify(addresses), req.userId]
        );

        res.json(addresses);
    } catch (error) {
        console.error('Update addresses error:', error);
        res.status(500).json({ error: 'Failed to update addresses' });
    }
});



const BASE_EXP_PER_PAGE = 0.05;
const BASE_EXP_PER_COIN = 0.2;
const EXP_RATE_REDUCTION_FACTOR = 0.5;
const MIN_EXP_PER_COIN = 1e-9;
const dailyRewardsData = [
    { day: 1, type: 'Xu', amount: 30 }, { day: 2, type: 'Xu', amount: 50 },
    { day: 3, type: 'Xu', amount: 60 }, { day: 4, type: 'Xu', amount: 70 },
    { day: 5, type: 'Xu', amount: 100 }, { day: 6, type: 'Xu', amount: 120 },
    { day: 7, type: 'Xu', amount: 200 },
];

app.post('/api/add-exp', authenticateToken, async (req, res) => {
    try {
        const { amount, source, coinIncrease = 0 } = req.body;

        if (typeof amount !== 'number' || amount < 0 || typeof coinIncrease !== 'number') {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ.' });
        }


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
                    console.warn(`EXP gain per coin (${expPerCoinThisLevel}) too low at level ${currentLevel}. Stopping EXP calculation.`);
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
});


app.post('/api/claim-reward', authenticateToken, async (req, res) => {
    try {
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
});

// --- SỬA ĐỔI Ở ĐÂY ---
app.get('/api/users/top', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        // Đảm bảo limit là số nguyên dương
        const safeLimit = Math.max(1, Math.floor(limit));

        // Dùng template literal để chèn giá trị limit đã được làm sạch
        const query = `
            SELECT id, fullName, level, exp
            FROM users
            ORDER BY CAST(level AS UNSIGNED) DESC, CAST(exp AS DECIMAL(5,2)) DESC
            LIMIT ${safeLimit}
        `;

        // Sử dụng connection.query vì không còn placeholder
        const [rows] = await connection.query(query);

        const topUsers = rows.map(user => ({
             id: String(user.id),
             fullName: user.fullName || 'Người dùng ẩn danh', // Thêm fallback
             level: parseInt(user.level) || 1, // Thêm fallback
        }));

        res.json(topUsers);

    } catch (error) {
        console.error("Get top users error:", error);
        // Gửi thông báo lỗi chi tiết hơn nếu có
        res.status(500).json({ error: error.message || 'Failed to fetch top users' });
    }
});
// --- KẾT THÚC SỬA ĐỔI ---

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on('SIGINT', async () => {
  if (connection) {
    try {
        await connection.end();
        console.log('Database connection closed.');
    } catch(err) {
        console.error("Error closing DB connection:", err);
    }
  }
  process.exit();
});