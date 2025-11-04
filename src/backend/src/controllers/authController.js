const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); 
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library'); 
const { getConnection } = require('../db/connection');
const { 
  JWT_SECRET, 
  GOOGLE_CLIENT_ID,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  FRONTEND_URL
} = require('../config/appConfig'); 
const ensureUserDataTypes = require('../utils/ensureUserDataTypes');

const client = new OAuth2Client(GOOGLE_CLIENT_ID); 

const emailTransporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

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

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const connection = getConnection();
    const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length > 0) {
      const user = rows[0];
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 3600000); // 1 hour

      await connection.execute(
        'UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE id = ?',
        [token, expires, user.id]
      );

      const resetUrl = `${FRONTEND_URL}/reset-password/${token}`;
      const mailOptions = {
        from: `"StoryVerse" <${EMAIL_USER}>`,
        to: user.email,
        subject: 'Yêu cầu đặt lại mật khẩu StoryVerse',
        text: `Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn.\n\n` +
              `Vui lòng nhấp vào liên kết sau hoặc dán vào trình duyệt của bạn để hoàn tất quy trình:\n\n` +
              `${resetUrl}\n\n` +
              `Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này và mật khẩu của bạn sẽ không thay đổi.\n`
      };

      await emailTransporter.sendMail(mailOptions);
    }
    
    res.status(200).json({ message: 'Nếu email của bạn đã đăng ký, bạn sẽ nhận được một liên kết đặt lại mật khẩu.' });
  } catch (error) {
    console.error('Forgot Password error:', error);
    res.status(500).json({ error: 'Failed to process forgot password request' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const connection = getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > ?',
      [token, new Date()]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired' });
    }

    const user = rows[0];
    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.execute(
      'UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    const mailOptions = {
      from: `"StoryVerse" <${EMAIL_USER}>`,
      to: user.email,
      subject: 'Mật khẩu của bạn đã được thay đổi',
      text: `Xin chào,\n\n` +
            `Đây là email xác nhận mật khẩu cho tài khoản ${user.email} của bạn vừa được thay đổi.\n`
    };

    await emailTransporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset Password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

module.exports = { register, login, googleLogin, forgotPassword, resetPassword };