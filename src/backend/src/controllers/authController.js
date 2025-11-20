const authService = require('../services/authService');
const userModel = require('../models/userModel'); 
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'duongnguyennhatquang@gmail.com', 
    pass: 'cxwuplnsorqyxyfq'      
  }
});
const otpStore = new Map();

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: 'Định dạng email không hợp lệ.' });
    }

    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email này đã được đăng ký.' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore.set(email, {
      code: otpCode,
      expires: Date.now() + 5 * 60 * 1000 
    });

    const mailOptions = {
      from: '"StoryVerse" <no-reply@storyverse.com>',
      to: email,
      subject: 'Mã xác thực đăng ký tài khoản - StoryVerse',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Xin chào!</h2>
          <p>Mã xác thực OTP của bạn là:</p>
          <h1 style="color: #4CAF50; letter-spacing: 5px;">${otpCode}</h1>
          <p>Mã này sẽ hết hạn trong vòng 5 phút.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Mã OTP đã được gửi về email của bạn.' });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Không thể gửi email. Vui lòng thử lại sau.' });
  }
};

const register = async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    if (!email || !password || !otp) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin và mã OTP.' });
    }

    const storedOtpData = otpStore.get(email);

    if (!storedOtpData) {
      return res.status(400).json({ error: 'Mã OTP không tồn tại hoặc đã hết hạn. Vui lòng gửi lại.' });
    }

    if (storedOtpData.expires < Date.now()) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'Mã OTP đã hết hạn. Vui lòng lấy mã mới.' });
    }

    if (storedOtpData.code !== otp) {
      return res.status(400).json({ error: 'Mã OTP không chính xác.' });
    }

    otpStore.delete(email);

    const result = await authService.registerService({ email, password });
    res.status(result.status).json({ message: result.message, userId: result.userId });
  } catch (error) {
    const status = error.status || 500;
    console.error('Register error:', error);
    res.status(status).json({ error: error.error || 'Failed to register user' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginService({ email, password });
    res.status(result.status).json({ message: result.message, token: result.token, user: result.user });
  } catch (error) {
    const status = error.status || 500;
    console.error('Login error:', error);
    res.status(status).json({ error: error.error || 'Failed to log in' });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    const result = await authService.googleLoginService({ token });
    res.status(result.status).json({ message: result.message, token: result.token, user: result.user });
  } catch (error) {
    const status = error.status || 500;
    console.error('Google Login error:', error);
    res.status(status).json({ error: error.error || 'Failed to log in with Google' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPasswordService({ email });
    res.status(result.status).json({ message: result.message });
  } catch (error) {
    const status = error.status || 500;
    console.error('Forgot Password error:', error);
    res.status(status).json({ error: error.error || 'Failed to process forgot password request' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const result = await authService.resetPasswordService({ token, password });
    res.status(result.status).json({ message: result.message });
  } catch (error) {
    const status = error.status || 500;
    console.error('Reset Password error:', error);
    res.status(status).json({ error: error.error || 'Failed to reset password' });
  }
};

module.exports = { register, login, googleLogin, forgotPassword, resetPassword, sendOtp };