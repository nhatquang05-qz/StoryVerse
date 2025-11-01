import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'; // Thêm import
import { useAuth } from '../../contexts/AuthContext'; 
import { useNotification } from '../../contexts/NotificationContext'; 
import '../AuthPage.css'; 

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  // Thêm loginWithGoogle từ useAuth
  const { login, isLoginSuccessPopupOpen, loginWithGoogle } = useAuth(); 
  const { showNotification } = useNotification();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isLoginSuccessPopupOpen) return;

    try {
      await login(email, password); 
 
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'Email hoặc mật khẩu không đúng.';
      setError(errorMessage);
      console.error('Lỗi đăng nhập:', err);
    }
  };

  // --- BẮT ĐẦU CODE MỚI ---
  const handleGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    setError('');
    if (isLoginSuccessPopupOpen) return;

    try {
      await loginWithGoogle(credentialResponse);
      // Popup sẽ tự động mở bởi AuthContext
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'Đăng nhập Google thất bại.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Lỗi đăng nhập Google:', err);
    }
  };

  const handleGoogleLoginError = () => {
    const errorMessage = 'Đăng nhập Google thất bại. Vui lòng thử lại.';
    setError(errorMessage);
    showNotification(errorMessage, 'error');
  };
  // --- KẾT THÚC CODE MỚI ---

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Đăng Nhập</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <p className="auth-error">{error}</p>}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Nhập email của bạn"
              disabled={isLoginSuccessPopupOpen} 
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mật Khẩu</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Nhập mật khẩu"
              disabled={isLoginSuccessPopupOpen} 
            />
          </div>
          <button type="submit" className="auth-button" disabled={isLoginSuccessPopupOpen}>Đăng Nhập</button>
        </form>

        {/* --- BẮT ĐẦU CODE MỚI --- */}
        <div className="auth-divider">
          <span>HOẶC</span>
        </div>
        
        {/* Thêm data-disabled để xử lý CSS khi popup đang mở */}
        <div className="google-login-container" data-disabled={isLoginSuccessPopupOpen}>
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginError}
            theme="outline" // 'outline', 'filled_blue', 'filled_black'
            size="large"
            text="signin_with" // 'signin_with', 'signup_with', 'continue_with'
            shape="rectangular" // 'rectangular', 'pill', 'circle'
            locale="vi" // Hiển thị tiếng Việt
            width="100%" // Cần set width cho wrapper
          />
        </div>
        {/* --- KẾT THÚC CODE MỚI --- */}

        <p className="auth-switch">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;