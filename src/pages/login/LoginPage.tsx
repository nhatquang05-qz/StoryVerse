import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'; 
import { useAuth } from '../../contexts/AuthContext'; 
import { useNotification } from '../../contexts/NotificationContext'; 
import '../AuthPage.css'; 

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
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

  const handleGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    setError('');
    if (isLoginSuccessPopupOpen) return;

    try {
      await loginWithGoogle(credentialResponse);
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

        <div className="auth-divider">
          <span>HOẶC</span>
        </div>
        
        <div className="google-login-container" data-disabled={isLoginSuccessPopupOpen}>
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginError}
            theme="outline" 
            size="large"
            text="signin_with" 
            shape="rectangular" 
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