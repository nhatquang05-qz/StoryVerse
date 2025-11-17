import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import '../assets/styles/AuthPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp. Vui lòng nhập lại.');
      return;
    }
    
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Đã xảy ra lỗi. Vui lòng thử lại.');
      }

      setMessage(data.message);
      showNotification(data.message, 'success');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'Token không hợp lệ hoặc đã hết hạn.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Đặt Lại Mật Khẩu</h2>
        <p className="auth-subtext">Nhập mật khẩu mới cho tài khoản của bạn.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-success">{message}</p>}
          
          <div className="form-group">
            <label htmlFor="password">Mật Khẩu Mới</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Nhập mật khẩu mới"
              disabled={isLoading || !!message}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Xác Nhận Mật Khẩu</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Xác nhận mật khẩu mới"
              disabled={isLoading || !!message}
            />
          </div>
          
          <button type="submit" className="auth-button" disabled={isLoading || !!message}>
            {isLoading ? 'Đang cập nhật...' : 'Đặt Lại Mật Khẩu'}
          </button>
        </form>
        {message && (
           <p className="auth-switch">
             Bạn sẽ được chuyển hướng đến trang <Link to="/login">Đăng nhập</Link>...
           </p>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;