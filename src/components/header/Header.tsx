import React, { useState, useRef, useEffect } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiSearch, FiUser, FiHeart, FiMenu, FiX } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext'; 
import { useAuth } from '../../contexts/AuthContext'; 
import './Header.css';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { cartCount, setCartIconRect } = useCart(); 
  const { currentUser, logout } = useAuth(); 
  const cartIconRef = useRef<HTMLAnchorElement>(null); 
  const navigate = useNavigate();

  const toggleMenu = () => { setIsMenuOpen(!isMenuOpen); };

  useEffect(() => {
    if (cartIconRef.current) {
      setCartIconRect(cartIconRef.current.getBoundingClientRect());
    }
  }, [setCartIconRect]); 

  const handleLogout = async () => {
      try {
          await logout();
      } catch (error) {
          console.error("Lỗi đăng xuất:", error);
      }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm(''); 
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">StoryVerse</Link>

        <nav className="nav-desktop">
          <Link to="/physical-comics">Truyện In</Link>
          <Link to="/digital-comics">Đọc Online</Link>
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

        <div className="header-actions">
          <form onSubmit={handleSearch} className="search-bar">
            <input 
              type="text" 
              placeholder="Tìm kiếm truyện..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-btn"><FiSearch /></button>
          </form>
          
          <Link to="/wishlist" className="action-icon" aria-label="Danh sách yêu thích">
            <FiHeart />
          </Link>
          <Link ref={cartIconRef} to="/cart" className="action-icon cart-icon-link" aria-label="Giỏ hàng">
            <FiShoppingCart />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
          
          {currentUser ? (
            <div className="dropdown">
              <button className="action-icon user-icon" aria-label="Tài khoản">
                <FiUser />
              </button>
              <div className="dropdown-content user-dropdown">
                <Link to="/profile">Tài Khoản Của Tôi</Link>
                <Link to="/my-library">Thư Viện Số</Link>
                <Link to="/orders">Lịch Sử Mua Hàng</Link>
                <button onClick={handleLogout} className="logout-btn">Đăng Xuất</button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="login-btn">Đăng Nhập</Link>
          )}

          <button className="menu-toggle" onClick={toggleMenu} aria-label="Mở menu">
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
      
      {isMenuOpen && (
        <nav className="nav-mobile">
          <form onSubmit={handleSearch} className="search-bar mobile-search-bar">
            <input 
              type="text" 
              placeholder="Tìm kiếm truyện..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-btn"><FiSearch /></button>
          </form>

          <Link to="/physical-comics" onClick={toggleMenu}>Truyện In</Link>
          <Link to="/digital-comics" onClick={toggleMenu}>Đọc Online</Link>
          <Link to="/new-releases" onClick={toggleMenu}>Mới Phát Hành</Link>
          <Link to="/genres" onClick={toggleMenu}>Thể Loại</Link>
          <div className="nav-mobile-separator"></div>
          <Link to="/wishlist" onClick={toggleMenu} className="nav-mobile-action">
            <FiHeart /> <span>Yêu Thích</span>
          </Link>
          <Link to="/cart" onClick={toggleMenu} className="nav-mobile-action">
            <FiShoppingCart /> <span>Giỏ Hàng ({cartCount})</span>
          </Link>
          <div className="nav-mobile-separator"></div>
          {currentUser ? (
            <div className="nav-mobile-user-section">
              <Link to="/profile" onClick={toggleMenu} className="nav-mobile-action">
                <FiUser /> <span>Tài Khoản Của Tôi</span>
              </Link>
              <button onClick={() => { handleLogout(); toggleMenu(); }} className="logout-btn-mobile">Đăng Xuất</button>
            </div>
          ) : (
            <Link to="/login" onClick={toggleMenu} className="nav-mobile-login-btn">
              Đăng Nhập
            </Link>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;