import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; 
import { useNotification } from '../../contexts/NotificationContext'; 
import '../AuthPage.css'; 

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); 
  const { showNotification } = useNotification();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password); 
      navigate('/'); 
    } catch (err) {
      // Lỗi sẽ được throw từ AuthContext
      const errorMessage = (err instanceof Error) ? err.message : 'Email hoặc mật khẩu không đúng.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Lỗi đăng nhập:', err);
    }
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
            />
          </div>
          <button type="submit" className="auth-button">Đăng Nhập</button>
        </form>
        <p className="auth-switch">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;