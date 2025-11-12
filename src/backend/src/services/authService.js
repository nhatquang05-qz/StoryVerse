const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); 
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library'); 
const userModel = require('../models/userModel'); 

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
  secure: false, 
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const registerService = async ({ email, password }) => {
  if (!email || !password) throw { status: 400, error: 'Email and password are required' };
  if (password.length < 6) throw { status: 400, error: 'Password must be at least 6 characters long' };

  const existingUser = await userModel.findUserByEmail(email);
  if (existingUser) throw { status: 409, error: 'Email already in use' };

  const hashedPassword = await bcrypt.hash(password, 10);
  const defaultFullName = email.split('@')[0] || 'New User';
  const mockDefaultAddress = JSON.stringify([{ id: `default-${Date.now()}`, street: '123 Đường Mặc định', ward: 'Phường Mặc định', district: 'Quận Mặc định', city: 'TP Mặc định', isDefault: true }]);

  const userId = await userModel.createNewUser(email, hashedPassword, defaultFullName, mockDefaultAddress);
  
  return { message: 'User registered successfully', userId: userId, status: 201 };
};

const loginService = async ({ email, password }) => {
  if (!email || !password) throw { status: 400, error: 'Email and password are required' };

  const user = await userModel.findUserByEmail(email);
  if (!user) throw { status: 401, error: 'Invalid email or password' };

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw { status: 401, error: 'Invalid email or password' };

  const { password: userPassword, ...userWithoutPassword } = user;
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

  const userData = ensureUserDataTypes(userWithoutPassword);
  return { message: 'Login successful', token, user: userData, status: 200 };
};

const googleLoginService = async ({ token }) => {
  if (!token) throw { status: 400, error: 'Google token is required' };

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { email, name, picture } = payload;

  if (!email) throw { status: 400, error: 'Failed to get email from Google' };

  let user;
  let message = 'Login successful';
  let statusCode = 200;

  const existingUser = await userModel.findUserByEmail(email);

  if (existingUser) {
    user = existingUser;
  } else {
    const generatedPassword = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);      
    const defaultFullName = name || email.split('@')[0] || 'New User';
    const mockDefaultAddress = JSON.stringify([{ id: `default-${Date.now()}`, street: '123 Đường Mặc định', ward: 'Phường Mặc định', district: 'Quận Mặc định', city: 'TP Mặc định', isDefault: true }]);
    const avatarUrl = picture || null; 
    
    const userId = await userModel.createNewUser(email, hashedPassword, defaultFullName, mockDefaultAddress, avatarUrl);
    
    user = await userModel.findUserById(userId);
    if (!user) throw { status: 500, error: 'Failed to retrieve new user data' };

    message = 'User registered and logged in successfully';
    statusCode = 201;
  }

  const { password: userPassword, ...userWithoutPassword } = user;
  const jwtToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

  const userData = ensureUserDataTypes(userWithoutPassword);
  return { message: message, token: jwtToken, user: userData, status: statusCode };
};

const forgotPasswordService = async ({ email }) => {
  if (!email) throw { status: 400, error: 'Email is required' };

  const user = await userModel.findUserByEmail(email);

  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await userModel.updateResetToken(user.id, token, expires);

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
  
  return { message: 'Nếu email của bạn đã đăng ký, bạn sẽ nhận được một liên kết đặt lại mật khẩu.', status: 200 };
};

const resetPasswordService = async ({ token, password }) => {
  if (!password || password.length < 6) {
    throw { status: 400, error: 'Password must be at least 6 characters long' };
  }

  const user = await userModel.findUserByResetToken(token);

  if (!user) {
    throw { status: 400, error: 'Password reset token is invalid or has expired' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userModel.resetPasswordRaw(user.id, hashedPassword);

  const mailOptions = {
    from: `"StoryVerse" <${EMAIL_USER}>`,
    to: user.email,
    subject: 'Mật khẩu của bạn đã được thay đổi',
    text: `Xin chào,\n\n` +
          `Đây là email xác nhận mật khẩu cho tài khoản ${user.email} của bạn vừa được thay đổi.\n`
  };

  await emailTransporter.sendMail(mailOptions);

  return { message: 'Password has been reset successfully', status: 200 };
};

module.exports = { 
    registerService, 
    loginService, 
    googleLoginService, 
    forgotPasswordService, 
    resetPasswordService 
};