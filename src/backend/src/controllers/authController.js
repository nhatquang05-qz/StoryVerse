const authService = require('../services/authService');
const userModel = require('../models/userModel');
const christmasService = require('../services/christmasService'); 
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,       
    pass: process.env.MAIL_APP_PASSWORD
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
      from: '"StoryVerse Support" <no-reply@storyverse.com>',
      to: email,
      subject: 'Mã xác thực đăng ký tài khoản - StoryVerse',
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; padding: 40px 0; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <div style="background-color: #0f172a; padding: 30px 20px; text-align: center; border-bottom: 3px solid #3b82f6;">
              <img src="https://res.cloudinary.com/dyefom7du/image/upload/v1764951838/ld6yhb7jry6tcptfxmw5.png" alt="StoryVerse Logo" style="max-width: 220px; height: auto; display: block; margin: 0 auto;">
            </div>

            <div style="padding: 40px 30px; text-align: center; color: #333333;">
              <h2 style="margin-top: 0; color: #1e293b; font-size: 24px; font-weight: 700;">Xác thực tài khoản</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #64748b; margin-bottom: 25px;">
                Xin chào! Cảm ơn bạn đã tham gia vào vũ trụ <strong>StoryVerse</strong>. <br>
                Vui lòng nhập mã OTP bên dưới để hoàn tất quá trình đăng ký:
              </p>
              
              <div style="margin: 30px 0;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #3b82f6; background-color: #eff6ff; padding: 15px 40px; border-radius: 8px; border: 2px dashed #93c5fd; display: inline-block;">${otpCode}</span>
              </div>

              <div style="background-color: #fff1f2; border-left: 4px solid #f43f5e; padding: 15px; text-align: left; margin-top: 30px; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #be123c;">
                  <strong>Lưu ý:</strong> Mã xác thực này sẽ hết hạn sau <strong>5 phút</strong>. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.
                </p>
              </div>
            </div>

            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 13px; color: #94a3b8; margin: 0;">
                Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
              </p>
              <p style="font-size: 12px; color: #cbd5e1; margin-top: 10px;">
                &copy; ${new Date().getFullYear()} StoryVerse. All rights reserved.
              </p>
            </div>
          </div>
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

    if (result.status === 200 && result.user) {
        try {
            await christmasService.updateMissionProgress(result.user.id, 'LOGIN');
        } catch (e) {
            console.error("Lỗi cập nhật nhiệm vụ Minigame (Login):", e.message);
        }
    }

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

    if (result.status === 200 && result.user) {
        try {
            await christmasService.updateMissionProgress(result.user.id, 'LOGIN');
        } catch (e) {
            console.error("Lỗi cập nhật nhiệm vụ Minigame (Google):", e.message);
        }
    }

    res.status(result.status).json({ message: result.message, token: result.token, user: result.user });
  } catch (error) {
    const status = error.status || 500;
    console.error('Google Login error:', error);
    res.status(status).json({ error: error.error || 'Failed to log in with Google' });
  }
};

const facebookLogin = async (req, res) => {
  try {
    const { accessToken } = req.body;
    const result = await authService.facebookLoginService({ accessToken });

    if (result.status === 200 && result.user) {
        try {
            await christmasService.updateMissionProgress(result.user.id, 'LOGIN');
        } catch (e) {
            console.error("Lỗi cập nhật nhiệm vụ Minigame (Facebook):", e.message);
        }
    }

    res.status(result.status).json({ message: result.message, token: result.token, user: result.user });
  } catch (error) {
    const status = error.status || 500;
    console.error('Facebook Login error:', error);
    res.status(status).json({ error: error.error || 'Failed to log in with Facebook' });
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

const changePassword = async (req, res) => {
    const { userId } = req;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin.' });
    }

    try {
        
        const isMatch = await authService.verifyOldPassword(userId, oldPassword);
        if (!isMatch) {
            return res.status(400).json({ error: 'Mật khẩu cũ không chính xác.' });
        }

        
        if (oldPassword === newPassword) {
            return res.status(400).json({ error: 'Mật khẩu mới không được trùng với mật khẩu cũ.' });
        }

        
        await authService.updatePasswordService(userId, newPassword);
        res.json({ message: 'Đổi mật khẩu thành công.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi server.' });
    }
};

const sendOtpLoggedIn = async (req, res) => {
    const { userId } = req;
    try {
        
        const user = await userModel.findUserById(userId, false);
        if (!user) return res.status(404).json({ error: 'User not found' });        
        const otp = Math.floor(100000 + Math.random() * 900000).toString();               
        await authService.saveOtpService(userId, otp);        
        const mailOptions = {
            from: 'StoryVerse Support',
            to: user.email,
            subject: 'Mã xác thực đổi mật khẩu - StoryVerse',
            text: `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau 5 phút.`
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Mã OTP đã được gửi đến email của bạn.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Gửi OTP thất bại.' });    }
};

const resetPasswordWithOtp = async (req, res) => {
    const { userId } = req;
    const { otp, newPassword } = req.body;

    try {
        const isValid = await authService.verifyOtpService(userId, otp);
        if (!isValid) {
            return res.status(400).json({ error: 'Mã OTP không đúng hoặc đã hết hạn.' });
        }

        await authService.updatePasswordService(userId, newPassword);
        res.json({ message: 'Đổi mật khẩu thành công.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi server.' });
    }
};

module.exports = { 
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
};