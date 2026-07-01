const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { authenticateToken } = require('../middleware/authMiddleware');

const { 
  register, 
  login, 
  googleLogin, 
  facebookLogin,
  forgotPassword, 
  resetPassword,
  sendOtp,
  changePassword,      
  sendOtpLoggedIn,    
  resetPasswordWithOtp  
} = require('../controllers/authController');

const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: { error: 'Bạn đã yêu cầu gửi email quá nhiều lần. Vui lòng thử lại sau 15 phút.' }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: { error: 'Quá nhiều lần đăng nhập sai. Vui lòng thử lại sau 15 phút.' }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 5, 
  message: { error: 'Bạn đã tạo quá nhiều tài khoản. Vui lòng thử lại sau.' }
});

router.post('/register', registerLimiter, register);
router.post('/send-otp', emailLimiter, sendOtp);

router.post('/login', loginLimiter, login);
router.post('/google-login', loginLimiter, googleLogin); 
router.post('/facebook-login', loginLimiter, facebookLogin);

router.post('/forgot-password', emailLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.put('/change-password', authenticateToken, changePassword);
router.post('/send-otp-logged-in', authenticateToken, emailLimiter, sendOtpLoggedIn);
router.post('/reset-password-otp', authenticateToken, resetPasswordWithOtp);

module.exports = router;