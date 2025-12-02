import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';
import '../assets/styles/Footer.css';
import logoImage from '../assets/images/logo.avif';
import footerAdGif from '../assets/images/cute.gif'; 

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        <div className="footer-section">
          <Link to="/" aria-label="Trang chủ StoryVerse">
            <img src={logoImage} alt="StoryVerse Logo" className="footer-logo" />
          </Link>                
        </div>

        <div className="footer-section">
          <h4 className="footer-title">Liên Kết Hữu Ích</h4>
          <ul className="footer-links">
            <li><Link to="/about-us">Về Chúng Tôi</Link></li>
            <li><Link to="/contact">Liên Hệ</Link></li>
            <li><Link to="/faq">Câu Hỏi Thường Gặp</Link></li>
            <li><Link to="/privacy-policy">Chính Sách Bảo Mật</Link></li>
            <li><Link to="/terms-of-service">Điều Khoản Dịch Vụ</Link></li>
          </ul>
        </div>

        <div className="footer-section"> 
          <h4 className="footer-title">Theo Dõi Chúng Tôi</h4>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebook /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><FaYoutube /></a>
          </div>
        </div>
        
        <div className="footer-section footer-gif-section">
            <div className="footer-ad-wrapper">
                <a>
                    <img src={footerAdGif} alt="Promotion GIF" className="footer-ad-gif" />
                </a>
            </div>
        </div>
        
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} StoryVerse. Đã đăng ký Bản quyền.</p>
      </div>
    </footer>
  );
};

export default Footer;