// src/components/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        <div className="footer-section">
          <h3 className="footer-logo">StoryVerse</h3>
          <p className="footer-description">
            Khám phá thế giới truyện tranh vô tận, từ những tác phẩm kinh điển đến những bộ truyện mới nhất.
          </p>
        </div>

        <div className="footer-section">
          <h4 className="footer-title">Liên Kết Hữu Ích</h4>
          <ul className="footer-links">
            <li><Link to="/about-us">Về Chúng Tôi</Link></li>
            <li><Link to="/contact">Liên Hệ</Link></li>
            <li><Link to="/privacy-policy">Chính Sách Bảo Mật</Link></li>
            <li><Link to="/terms-of-service">Điều Khoản Dịch Vụ</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-title">Theo Dõi Chúng Tôi</h4>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebook /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><FaYoutube /></a>
          </div>
        </div>
        
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} StoryVerse. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;