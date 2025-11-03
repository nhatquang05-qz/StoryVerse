const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); 
const { OAuth2Client } = require('google-auth-library'); 
const { getConnection } = require('../db/connection');
const { JWT_SECRET, GOOGLE_CLIENT_ID } = require('../config/appConfig'); 
const ensureUserDataTypes = require('../utils/ensureUserDataTypes');

const client = new OAuth2Client(GOOGLE_CLIENT_ID); 

const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters long' });

    const connection = getConnection();
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
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const connection = getConnection();
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
};

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Google token is required' });

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    if (!email) return res.status(400).json({ error: 'Failed to get email from Google' });

    const connection = getConnection();
    const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);

    let user;
    let message = 'Login successful';
    let statusCode = 200;

    if (rows.length > 0) {
      user = rows[0];
    } else {

      const generatedPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);      
      const defaultFullName = name || email.split('@')[0] || 'New User';
      const mockDefaultAddress = JSON.stringify([{ id: `default-${Date.now()}`, street: '123 Đường Mặc định', ward: 'Phường Mặc định', district: 'Quận Mặc định', city: 'TP Mặc định', isDefault: true }]);
      const avatarUrl = picture || null; 
      const [result] = await connection.execute(
        'INSERT INTO users (email, password, fullName, phone, coinBalance, lastDailyLogin, consecutiveLoginDays, level, exp, addresses, avatarUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [email, hashedPassword, defaultFullName, '', 1000, '2000-01-01 00:00:00', 0, 1, '0.00', mockDefaultAddress, avatarUrl]
      );

      const [newRows] = await connection.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
      user = newRows[0];
      message = 'User registered and logged in successfully';
      statusCode = 201;
    }

    const { password: userPassword, ...userWithoutPassword } = user;
    const jwtToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    const userData = ensureUserDataTypes(userWithoutPassword);
    res.status(statusCode).json({ message: message, token: jwtToken, user: userData });

  } catch (error) {
    console.error('Google Login error:', error);
    res.status(500).json({ error: 'Failed to log in with Google' });
  }
};

module.exports = { register, login, googleLogin }; 