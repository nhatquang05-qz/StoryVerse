import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiSearch, FiUser, FiHeart, FiMenu, FiX, FiDollarSign, FiGift, FiSettings } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { comics } from '../../data/mockData';
import ThemeToggleButton from '../common/ThemeToggleButton/ThemeToggleButton';
import DailyRewardModal from '../common/DailyRewardModal/DailyRewardModal';
import './Header.css';

const MAX_SUGGESTIONS = 5;

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<typeof comics>([]);
  const { cartCount, setCartIconRect } = useCart();
  const { currentUser, logout } = useAuth();
  const cartIconRef = useRef<HTMLAnchorElement>(null);
  const navigate = useNavigate();
  const searchBarRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => { setIsMenuOpen(!isMenuOpen); };

  useEffect(() => {
    if (cartIconRef.current) {
      setCartIconRect(cartIconRef.current.getBoundingClientRect());
    }
  }, [setCartIconRect]);

  const handleLogout = async () => {
      try {
          await logout();
          setIsMenuOpen(false);
      } catch (error) {
          console.error("Lỗi đăng xuất:", error);
      }
  }

  const handleSearchTermChange = (value: string) => {
    setSearchTerm(value);

    if (value.trim().length > 1) {
      const normalizedValue = value.toLowerCase().trim();
      const filtered = comics
        .filter(
          (c) =>
            c.title.toLowerCase().includes(normalizedValue) ||
            c.author.toLowerCase().includes(normalizedValue)
        )
        .slice(0, MAX_SUGGESTIONS);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setSuggestions([]);
      setIsMenuOpen(false);
    }
  };

  const handleSuggestionClick = (comicId: number) => {
    setSearchTerm('');
    setSuggestions([]);
    navigate(`/comic/${comicId}`);
  };

  const handleOpenRewardModal = (e: React.MouseEvent<HTMLDivElement> | React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (!currentUser) {
          navigate('/login');
          return;
      }
      setIsModalOpen(true);
      if (isMenuOpen) {
          setIsMenuOpen(false);
      }
  };
  
  const canClaimReward = currentUser ? (() => {
    const today = new Date();
    const lastLoginDate = new Date(currentUser.lastDailyLogin);
    return !(
        today.getFullYear() === lastLoginDate.getFullYear() &&
        today.getMonth() === lastLoginDate.getMonth() &&
        today.getDate() === lastLoginDate.getDate()
    );
  })() : false;


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchBarRef]);

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">StoryVerse</Link>

        <nav className="nav-desktop">
          <Link to="/physical-comics">Truyện In</Link>
          <Link to="/digital-comics">Đọc Online</Link>

          <div className="dropdown mega-dropdown">
            <button className="dropdown-btn">Thể Loại</button>
            <div className="dropdown-content mega-content">

              <div className="dropdown-column">
                <h4>Truyện In (Vật Lý)</h4>
                <Link to="/genres/action">Hành Động</Link>
                <Link to="/genres/fantasy">Fantasy</Link>
                <Link to="/genres/sci-fi">Khoa Học Viễn Tưởng</Link>
                <Link to="/genres/trinh-tham">Trinh Thám</Link>
              </div>

              <div className="dropdown-column">
                <h4>Đọc Online (Digital)</h4>
                <Link to="/genres/romance">Tình Cảm</Link>
                <Link to="/genres/huyen-bi">Huyền Bí</Link>
                <Link to="/genres/the-thao">Thể Thao</Link>
                <Link to="/genres/sieu-anh-hung">Siêu Anh Hùng</Link>
              </div>

            </div>
          </div>
          <Link to="/new-releases">Mới Phát Hành</Link>
        </nav>

        <div className="header-actions">
          <div className="search-wrapper" ref={searchBarRef}>
            <form onSubmit={handleSearchSubmit} className="search-bar">
              <input
                type="text"
                placeholder="Tìm kiếm truyện..."
                value={searchTerm}
                onChange={(e) => handleSearchTermChange(e.target.value)}
              />
              <button type="submit" className="search-btn"><FiSearch /></button>
            </form>

            {suggestions.length > 0 && (
                <div className="search-suggestions-dropdown">
                    {suggestions.map((comic) => (
                        <div
                            key={comic.id}
                            className="suggestion-item"
                            onClick={() => handleSuggestionClick(comic.id)}
                        >
                            <img src={comic.imageUrl} alt={comic.title} />
                            <div>
                                <p className="suggestion-title">{comic.title}</p>
                                <p className="suggestion-author">{comic.author}</p>
                            </div>
                        </div>
                    ))}
                    <Link to={`/search?q=${encodeURIComponent(searchTerm)}`} onClick={() => setSuggestions([])} className="suggestion-view-all">
                        Xem tất cả kết quả cho "{searchTerm}"
                    </Link>
                </div>
            )}
          </div>

          <ThemeToggleButton />

          {currentUser && (
              <div 
                  className={`action-icon daily-reward-icon-wrapper ${canClaimReward ? 'can-claim-wrapper' : ''}`}
                  onClick={handleOpenRewardModal}
                  aria-label="Nhận thưởng hàng ngày"
              >
                  <FiGift className="daily-reward-icon" />
                  {canClaimReward && (
                      <span className="daily-reward-tooltip">Bạn có quà hàng ngày chưa nhận</span>
                  )}
              </div>
          )}

          <Link to="/wishlist" className="action-icon" aria-label="Danh sách yêu thích">
            <FiHeart />
          </Link>
          <Link ref={cartIconRef} to="/cart" className="action-icon cart-icon-link" aria-label="Giỏ hàng">
            <FiShoppingCart />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {currentUser ? (
            <>
              <div className="dropdown">
                <button className="action-icon user-icon" aria-label="Tài khoản">
                  <FiUser />
                </button>
                <div className="dropdown-content user-dropdown">
                  <Link to="/profile">Tài Khoản Của Tôi</Link>
                  <Link to="/recharge">Nạp Xu</Link>
                  <Link to="/my-library">Thư Viện Số</Link>
                  <Link to="/orders">Lịch Sử Mua Hàng</Link>
                  <Link to="/settings">Cài Đặt</Link>
                  <button onClick={handleLogout} className="logout-btn">Đăng Xuất</button>
                </div>
              </div>
              <div className="coin-balance-display">
                  <img src="../src/assets/images/coin.png" alt="Xu" className="coin-icon" style={{ width: '30px', height: '20px' }}/>
                  <span className="coin-amount">{currentUser.coinBalance}</span>
              </div>
            </>
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
          <form onSubmit={handleSearchSubmit} className="search-bar mobile-search-bar">
            <input
              type="text"
              placeholder="Tìm kiếm truyện..."
              value={searchTerm}
              onChange={(e) => handleSearchTermChange(e.target.value)}
            />
            <button type="submit" className="search-btn"><FiSearch /></button>
          </form>

          <Link to="/physical-comics" onClick={toggleMenu}>Truyện In</Link>
          <Link to="/digital-comics" onClick={toggleMenu}>Đọc Online</Link>
          <Link to="/new-releases" onClick={toggleMenu}>Mới Phát Hành</Link>
          <Link to="/genres" onClick={toggleMenu}>Thể Loại</Link>
          <div className="nav-mobile-separator"></div>
           <div style={{ padding: '0 2rem', marginBottom: '1rem' }}>
              <ThemeToggleButton />
           </div>
          <Link to="/wishlist" onClick={toggleMenu} className="nav-mobile-action">
            <FiHeart /> <span>Yêu Thích</span>
          </Link>
          <Link to="/cart" onClick={toggleMenu} className="nav-mobile-action">
            <FiShoppingCart /> <span>Giỏ Hàng ({cartCount})</span>
          </Link>

          {currentUser && (
              <>
                  <button className={`nav-mobile-action daily-reward-btn ${canClaimReward ? 'can-claim' : ''}`} onClick={handleOpenRewardModal}>
                      <FiGift /> <span>{canClaimReward ? 'Nhận Thưởng Hàng Ngày' : 'Đã Nhận Thưởng'}</span>
                  </button>
                  <div className="coin-balance-display mobile-coin-balance">
                      <img src="/coin-icon.png" alt="Xu" className="coin-icon" />
                      <span className="coin-amount">{currentUser.coinBalance} Xu</span>
                  </div>
              </>
           )}
          <div className="nav-mobile-separator"></div>
          {currentUser ? (
            <div className="nav-mobile-user-section">
              <Link to="/profile" onClick={toggleMenu} className="nav-mobile-action">
                <FiUser /> <span>Tài Khoản Của Tôi</span>
              </Link>
              <Link to="/recharge" onClick={toggleMenu} className="nav-mobile-action">
                <FiDollarSign /> <span>Nạp Xu</span>
              </Link>
              <Link to="/settings" onClick={toggleMenu} className="nav-mobile-action">
                <FiSettings /> <span>Cài Đặt</span>
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
      
      <DailyRewardModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
      />
    </header>
  );
};

export default Header;