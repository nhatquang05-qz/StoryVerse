import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'; 
import { useAuth } from '../contexts/AuthContext'; 
import '../assets/styles/AuthPage.css'; 
import bgLogin from '../assets/images/bg-login.webp';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoginSuccessPopupOpen, loginWithGoogle, showLoginError } = useAuth(); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoginSuccessPopupOpen) return;

    try {
      await login(email, password); 
    } catch (err) {
      console.error('Lỗi đăng nhập:', err);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    if (isLoginSuccessPopupOpen) return;

    try {
      await loginWithGoogle(credentialResponse);
    } catch (err) {
      console.error('Lỗi đăng nhập Google:', err);
    }
  };

  const handleGoogleLoginError = () => {
    const errorMessage = 'Đăng nhập Google thất bại. Vui lòng thử lại.';
    showLoginError('Lỗi đăng nhập Google', errorMessage);
  };

  return (
    <div className="auth-page" style={{ backgroundImage: `url(${bgLogin})` }}>
      <div className="auth-container">
        <h2>Chào Mừng Trở Lại</h2>
        
        <form className="auth-form" onSubmit={handleSubmit}>
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
              autoComplete="email"
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
              autoComplete="current-password"
            />
          </div>
          
          <div className="auth-options">
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </div>

          <button type="submit" className="auth-button" disabled={isLoginSuccessPopupOpen}>
            {isLoginSuccessPopupOpen ? 'Đang xử lý...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="auth-divider">
          <span>HOẶC</span>
        </div>
        
        <div className="google-login-container" data-disabled={isLoginSuccessPopupOpen}>
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginError}
            theme="filled_black" 
            size="large"
            text="signin_with" 
            shape="pill" 
            locale="vi" 
            width="100%" 
          />
        </div>

        <p className="auth-switch">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;