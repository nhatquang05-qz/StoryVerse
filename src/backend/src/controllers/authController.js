const authService = require('../services/authService');

const register = async (req, res) => {
  try {
    const { email, password } = req.body;
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

module.exports = { register, login, googleLogin, forgotPassword, resetPassword };