import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiSearch, FiUser, FiHeart, FiMenu, FiX } from 'react-icons/fi';
import './Header.css';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Dữ liệu giả, sau này sẽ thay bằng state thật
  const cartItemCount = 3; 
  const isLoggedIn = false;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        
        {/* Logo */}
        <Link to="/" className="logo">
          StoryVerse
        </Link>

        {/* Menu cho Desktop */}
        <nav className="nav-desktop">
          <Link to="/physical-comics">Truyện In</Link>
          <Link to="/digital-comics">Đọc truyện Online</Link>
          <div className="dropdown">
            <button className="dropdown-btn">Thể Loại</button>
            <div className="dropdown-content">
              <Link to="/genres/action">Hành Động</Link>
              <Link to="/genres/romance">Tình Cảm</Link>
              <Link to="/genres/fantasy">Fantasy</Link>
              <Link to="/genres/sci-fi">Khoa Học Viễn Tưởng</Link>
            </div>
          </div>
          <Link to="/new-releases">Mới Phát Hành</Link>
        </nav>

        {/* Các chức năng bên phải */}
        <div className="header-actions">
          <div className="search-bar">
            <input type="text" placeholder="Tìm kiếm truyện..." />
            <button className="search-btn"><FiSearch /></button>
          </div>
          <Link to="/wishlist" className="action-icon" aria-label="Danh sách yêu thích">
            <FiHeart />
          </Link>
          <Link to="/cart" className="action-icon" aria-label="Giỏ hàng">
            <FiShoppingCart />
            {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
          </Link>
          {isLoggedIn ? (
            <div className="dropdown">
              <button className="action-icon user-icon" aria-label="Tài khoản">
                <FiUser />
              </button>
              <div className="dropdown-content user-dropdown">
                <Link to="/profile">Tài Khoản Của Tôi</Link>
                <Link to="/my-library">Thư Viện Số</Link>
                <Link to="/orders">Lịch Sử Mua Hàng</Link>
                <button className="logout-btn">Đăng Xuất</button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="login-btn">Đăng Nhập</Link>
          )}

          {/* Nút menu cho mobile */}
          <button className="menu-toggle" onClick={toggleMenu} aria-label="Mở menu">
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
      
      {/* Menu cho Mobile */}
      {isMenuOpen && (
        <nav className="nav-mobile">
          <Link to="/physical-comics" onClick={toggleMenu}>Truyện Vật Lý</Link>
          <Link to="/digital-comics" onClick={toggleMenu}>Đọc Online</Link>
          <Link to="/new-releases" onClick={toggleMenu}>Mới Phát Hành</Link>
          <Link to="/genres" onClick={toggleMenu}>Thể Loại</Link>
        </nav>
      )}
    </header>
  );
};

export default Header;