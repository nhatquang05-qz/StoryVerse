import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaDiscord, FaYoutube, FaTiktok } from 'react-icons/fa';
import '../assets/styles/Footer.css';
import logoLightMode from '../assets/images/logo_dark.avif'; 
import logoDarkMode from '../assets/images/logo.avif';     

const Footer: React.FC = () => {
    return (
        <footer className="footer">            
            <div className="footer-container">
                <div className="footer-column brand-col">
                    <Link to="/" className="brand-logo-link" aria-label="Trang chủ StoryVerse">
                        <img
                            src={logoLightMode}
                            alt="StoryVerse Logo"
                            className="footer-logo logo-for-light-theme"
                        />
                        <img
                            src={logoDarkMode}
                            alt="StoryVerse Logo"
                            className="footer-logo logo-for-dark-theme"
                        />
                    </Link>
                    <p className="footer-description hover-text">
                        Nền tảng truyện tranh đa vũ trụ. Kết nối đam mê, thỏa sức sáng tạo và đắm chìm trong những câu chuyện bất tận.
                    </p>
                </div>

                <div className="footer-column links-col">
                    <h4 className="footer-title hover-text">Khám Phá</h4>
                    <ul className="footer-links">
                        <li><Link to="/about-us">Về Chúng Tôi</Link></li>
                        <li><Link to="/contact">Liên Hệ Hỗ Trợ</Link></li>
                        <li><Link to="/faq">Câu Hỏi Thường Gặp</Link></li>
                        <li><Link to="/ranking">Bảng Xếp Hạng</Link></li>
                    </ul>
                </div>

                <div className="footer-column links-col">
                    <h4 className="footer-title hover-text">Pháp Lý</h4>
                    <ul className="footer-links">
                        <li><Link to="/privacy-policy">Chính Sách Bảo Mật</Link></li>
                        <li><Link to="/terms-of-service">Điều Khoản Dịch Vụ</Link></li>
                        <li><Link to="/copyright">Bản Quyền</Link></li>
                    </ul>
                </div>

                <div className="footer-column social-col">
                    <h4 className="footer-title hover-text">Kết Nối Cộng Đồng</h4>
                    <p className="social-desc hover-text">Tham gia ngay Discord và Fanpage để nhận Giftcode hàng tuần!</p>
                    
                    <div className="social-icons">
                        <a href="https://discord.gg" target="_blank" rel="noreferrer" className="social-item discord" aria-label="Discord">
                            <FaDiscord />
                        </a>
                        <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-item facebook" aria-label="Facebook">
                            <FaFacebookF />
                        </a>
                        <a href="https://youtube.com" target="_blank" rel="noreferrer" className="social-item youtube" aria-label="YouTube">
                            <FaYoutube />
                        </a>
                        <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="social-item tiktok" aria-label="TikTok">
                            <FaTiktok />
                        </a>
                    </div>

                    <div className="newsletter-box">
                        <input type="email" placeholder="Nhập email nhận tin..." />
                        <button aria-label="Đăng ký">➜</button>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="footer-bottom-content">
                    <p className="hover-text">&copy; {new Date().getFullYear()} StoryVerse. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;