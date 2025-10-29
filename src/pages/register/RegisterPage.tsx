import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import RegisterSuccessPopup from '../../components/popups/RegisterSuccessPopup'; 
import '../AuthPage.css';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showNotification } = useNotification();
  const [error, setError] = useState('');
  const [isRegisterSuccessPopupOpen, setIsRegisterSuccessPopupOpen] = useState(false); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.'); 
      showNotification('Mật khẩu nhập lại không khớp.', 'warning'); 
      return; 
    }

    try {
      await register(email, password);
      setIsRegisterSuccessPopupOpen(true); 
    } catch (err) {
      // Chỉnh sửa logic bắt lỗi để hiển thị đúng thông báo từ backend
      let errorMessage = 'Không thể tạo tài khoản. Vui lòng thử lại.';
      if (err instanceof Error) {
          if (err.message.includes('Email already in use')) {
              errorMessage = 'Email này đã được sử dụng. Vui lòng chọn email khác.';
          } else if (err.message.includes('at least 6 characters')) {
              errorMessage = 'Mật khẩu phải có ít nhất 6 ký tự.';
          } else {
              errorMessage = err.message; // Hiển thị lỗi chung từ API
          }
      }
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Lỗi đăng ký:', err);
    }
  };

  const handleCloseRegisterPopup = () => {
    setIsRegisterSuccessPopupOpen(false);
    // navigate('/login') // Bỏ comment dòng này nếu bạn muốn tự động chuyển sang trang login
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

      <RegisterSuccessPopup
        isOpen={isRegisterSuccessPopupOpen}
        onClose={handleCloseRegisterPopup} 
      />
    </div>
  );
};

export default RegisterPage;