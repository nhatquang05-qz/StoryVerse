import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import '../assets/styles/AuthPage.css';
import bgRegister from '../assets/images/bg-reg.jpg';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register } = useAuth();
  const { showNotification } = useNotification();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.'); 
      showNotification('Mật khẩu nhập lại không khớp.', 'warning'); 
      return; 
    }

    setIsSubmitting(true);
    try {
      await register(email, password);
    } catch (err) {
      let errorMessage = 'Không thể tạo tài khoản. Vui lòng thử lại.';
      if (err instanceof Error) {
          if (err.message.includes('Email already in use')) {
              errorMessage = 'Email này đã được sử dụng. Vui lòng chọn email khác.';
          } else if (err.message.includes('at least 6 characters')) {
              errorMessage = 'Mật khẩu phải có ít nhất 6 ký tự.';
          }
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page" style={{ backgroundImage: `url(${bgRegister})` }}>
      <div className="auth-container">
        <h2>Tạo Tài Khoản Mới</h2>
        
        {error && <div className="auth-error">⚠️ {error}</div>}
        
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
              disabled={isSubmitting}
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
              placeholder="Tạo mật khẩu (ít nhất 6 ký tự)"
              minLength={6}
              disabled={isSubmitting}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Nhập Lại Mật Khẩu</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Xác nhận lại mật khẩu"
              disabled={isSubmitting}
            />
          </div>
          
          <button type="submit" className="auth-button" disabled={isSubmitting}>
            {isSubmitting ? 'Đang Đăng Ký...' : 'Đăng Ký Ngay'}
          </button>
        </form>
        
        <p className="auth-switch">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;