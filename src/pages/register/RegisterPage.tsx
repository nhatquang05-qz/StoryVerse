// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
import '../AuthPage.css'; // Dùng chung CSS

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  // const { register } = useAuth(); // Sẽ dùng sau
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Mật khẩu nhập lại không khớp.');
    }

    try {
      // Logic đăng ký giả
      console.log('Đăng ký với:', email, password);
      // await register(email, password); // Sẽ gọi hàm register thật
      alert('Đăng ký thành công! (Giả lập)'); // Thông báo tạm
      navigate('/login'); // Chuyển đến trang đăng nhập sau khi đăng ký
    } catch (err) {
      setError('Không thể tạo tài khoản. Vui lòng thử lại.');
      console.error('Lỗi đăng ký:', err);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Đăng Ký Tài Khoản</h2>
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
              placeholder="Tạo mật khẩu (ít nhất 6 ký tự)"
              minLength={6}
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
            />
          </div>
          <button type="submit" className="auth-button">Đăng Ký</button>
        </form>
        <p className="auth-switch">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;