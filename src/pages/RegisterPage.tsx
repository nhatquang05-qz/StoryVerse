import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import '../assets/styles/AuthPage.css';
import bgRegister from '../assets/images/bg-reg.avif';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth'; 

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');  
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const { showNotification } = useNotification();
  const navigate = useNavigate();   
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSendOtp = async () => {
    setError('');
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!email) {
        setError('Vui lòng nhập email.');
        return;
    }
    if (!emailRegex.test(email)) {
        setError('Định dạng email không hợp lệ (ví dụ: ten@domain.com).');
        return;
    }

    setIsSubmitting(true);
    try {
        await axios.post(`${API_URL}/send-otp`, { email });
        
        setIsOtpSent(true);
        setShowOtpInput(true);
        showNotification('Mã OTP đã được gửi về email!', 'success');
    } catch (err: any) {
        const msg = err.response?.data?.error || 'Không thể gửi OTP. Vui lòng thử lại.';
        setError(msg);
        showNotification(msg, 'error');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.'); 
      showNotification('Mật khẩu nhập lại không khớp.', 'warning'); 
      return; 
    }

    if (!otp || otp.length !== 6) {
        setError('Vui lòng nhập mã OTP 6 số.');
        return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/register`, { 
        email, 
        password, 
        otp 
      });
      
      showNotification('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
      navigate('/login'); 

    } catch (err: any) {
      let errorMessage = 'Không thể tạo tài khoản. Vui lòng thử lại.';
      if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
      } else if (err instanceof Error) {
          errorMessage = err.message;
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
            <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Nhập email của bạn"
                  disabled={isSubmitting || isOtpSent} 
                  style={{ flex: 1 }}
                />
                {!isOtpSent && (
                    <button 
                        type="button" 
                        className="auth-button" 
                        onClick={handleSendOtp}
                        disabled={isSubmitting || !email}
                        style={{ width: '100px', fontSize: '0.9rem', padding: '0 10px', margin: 0, whiteSpace: 'nowrap' }}
                    >
                        {isSubmitting ? '...' : 'Gửi mã'}
                    </button>
                )}
            </div>
          </div>

          {showOtpInput && (
            <>
              <div className="form-group">
                <label htmlFor="otp">Mã xác thực (OTP)</label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  placeholder="Nhập 6 số OTP từ email"
                  maxLength={6}
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
                {isSubmitting ? 'Đang Xử Lý...' : 'Xác Nhận Đăng Ký'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                  <small 
                      style={{ color: '#fff', cursor: 'pointer', textDecoration: 'underline', opacity: 0.8 }}
                      onClick={() => { 
                          setIsOtpSent(false); 
                          setShowOtpInput(false); 
                          setOtp(''); 
                          setError('');
                      }}
                  >
                      Nhập sai email? Gửi lại.
                  </small>
              </div>
            </>
          )}
        </form>
        
        <p className="auth-switch">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;