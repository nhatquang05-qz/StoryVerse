const express = require('express');
const router = express.Router();
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

router.post('/register', register);
router.post('/send-otp', sendOtp);
router.post('/login', login);
router.post('/google-login', googleLogin); 
router.post('/facebook-login', facebookLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.put('/change-password', authenticateToken, changePassword);
router.post('/send-otp-logged-in', authenticateToken, sendOtpLoggedIn);
router.post('/reset-password-otp', authenticateToken, resetPasswordWithOtp);

module.exports = router;