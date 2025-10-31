import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiSearch, FiUser, FiHeart, FiMenu, FiX, FiDollarSign, FiGift, FiSettings, FiFilter } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { type ComicSummary, type Genre } from '../../types/comicTypes'; 
import ThemeToggleButton from '../common/ThemeToggleButton/ThemeToggleButton';
import DailyRewardModal from '../common/DailyRewardModal/DailyRewardModal';
import coinIcon from '../../assets/images/coin.png';
import './Header.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const MAX_SUGGESTIONS_TOTAL = 10; 

const formatPrice = (price: number) => {
  if (price === 0) return "Miễn phí";
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [suggestions, setSuggestions] = useState<ComicSummary[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false); 
  
  const [allGenres, setAllGenres] = useState<Genre[]>([]);
  
  const { cartCount, setCartIconRect } = useCart();
  const { currentUser, logout } = useAuth();
  const cartIconRef = useRef<HTMLAnchorElement>(null);
  const navigate = useNavigate();
  const searchBarRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<number | null>(null); 

  const location = useLocation();
  const isReaderPage = location.pathname.startsWith('/read/');

  const toggleMenu = () => { setIsMenuOpen(!isMenuOpen); };

  useEffect(() => {
    if (cartIconRef.current) {
      setCartIconRect(cartIconRef.current.getBoundingClientRect());
    }
  }, [setCartIconRect]);

  useEffect(() => {
    fetch(`${API_URL}/comics/system/genres`)
      .then(res => res.json())
      .then((data: Genre[]) => setAllGenres(data))
      .catch(err => console.error("Failed to fetch genres:", err));
  }, []);

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
    setIsSearchFocused(true);

    if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim().length > 1) {
        setIsLoadingSearch(true);
        searchTimeoutRef.current = window.setTimeout(async () => {
            try {
                const response = await fetch(`${API_URL}/comics/search?q=${encodeURIComponent(value.trim())}&limit=${MAX_SUGGESTIONS_TOTAL}`);
                if (!response.ok) throw new Error('Network response was not ok');
                const data: ComicSummary[] = await response.json();
                setSuggestions(data);
            } catch (error) {
                console.error("Lỗi fetch search suggestions:", error);
                setSuggestions([]);
            } finally {
                setIsLoadingSearch(false);
            }
        }, 300); 
    } else {
        setSuggestions([]);
        setIsLoadingSearch(false);
    }
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    if (searchTerm.trim().length > 1 && suggestions.length === 0 && !isLoadingSearch) {
       handleSearchTermChange(searchTerm); 
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setSuggestions([]);
      setIsSearchFocused(false);
      setIsMenuOpen(false);
    }
  };

  const handleSuggestionClick = (comicId: number) => {
    setSearchTerm('');
    setSuggestions([]);
    setIsSearchFocused(false);
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
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchBarRef]);

  const showSuggestionsDropdown = (suggestions.length > 0 || isLoadingSearch) && isSearchFocused;

  const digitalSuggestions = suggestions.filter(comic => (comic as any).isDigital === 1);
  const physicalSuggestions = suggestions.filter(comic => (comic as any).isDigital === 0);

  return (
    <header className={`header ${isReaderPage ? 'header-no-sticky' : ''}`}>
      <div className="header-container">
        <Link to="/" className="logo">StoryVerse</Link>

        <nav className="nav-desktop">
          <Link to="/physical-comics">Truyện In</Link>
          <Link to="/digital-comics">Đọc Online</Link>
          
          <div className="dropdown mega-dropdown">
            <button className="dropdown-btn">Thể Loại</button>
            <div className="dropdown-content genre-list">
                {allGenres.length > 0 ? (
                  allGenres.map(genre => (
                    <Link 
                        key={genre.id} 
                        to={`/genres/${genre.name}`} 
                        onClick={() => setIsMenuOpen(false)} 
                    >
                      {genre.name}
                    </Link>
                  ))
                ) : (
                  <span style={{ padding: '12px 16px', display: 'block', color: 'var(--clr-text-secondary)' }}>Đang tải...</span>
                )}
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
                onFocus={handleSearchFocus}
              />
              <button type="submit" className="search-btn"><FiSearch /></button>
            </form>
            
            <Link to="/search?advanced=true" className="action-icon advanced-search-btn" title="Lọc Nâng Cao" style={{ marginLeft: '0.5rem', height: '40px', width: '40px', border: '1px solid var(--clr-border-light)', borderRadius: 'var(--border-radius)' }}>
                <FiFilter style={{ fontSize: '1.2rem', color: 'var(--clr-text-secondary)' }} />
            </Link>


            {showSuggestionsDropdown && (
              <div className="search-suggestions-dropdown">
                {isLoadingSearch && <div className="suggestion-item">Đang tìm...</div>}
                
                {!isLoadingSearch && searchTerm.trim().length > 1 && suggestions.length === 0 && (
                     <div className="suggestion-item">Không tìm thấy kết quả nào.</div>
                )}

                {digitalSuggestions.length > 0 && (
                  <div className="suggestion-section">
                    <h5 className="suggestion-section-title">Truyện Online</h5>
                    {digitalSuggestions.map((comic) => (
                      <div
                        key={`digital-${comic.id}`}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(comic.id)}
                      >
                        <img src={comic.coverImageUrl} alt={comic.title} />
                        <div>
                          <p className="suggestion-title">{comic.title}</p>
                          <p className="suggestion-author" style={{ fontSize: '0.75rem' }}>{comic.author}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {digitalSuggestions.length > 0 && physicalSuggestions.length > 0 && (
                  <hr className="suggestion-divider" />
                )}

                {physicalSuggestions.length > 0 && (
                  <div className="suggestion-section">
                     <h5 className="suggestion-section-title">Truyện Vật Lý</h5>
                    {physicalSuggestions.map((comic) => (
                      <div
                        key={`physical-${comic.id}`}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(comic.id)}
                      >
                        <img src={comic.coverImageUrl} alt={comic.title} />
                        <div>
                          <p className="suggestion-title">{comic.title}</p>
                          {comic.price > 0 && (
                            <p className="suggestion-price">
                              {formatPrice(comic.price)}
                            </p>
                          )}
                          <p className="suggestion-author">{comic.author}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchTerm.trim().length > 1 && !isLoadingSearch && (
                  <Link
                    to={`/search?q=${encodeURIComponent(searchTerm)}`}
                    onClick={() => { setSuggestions([]); setIsSearchFocused(false); }}
                    className="suggestion-view-all"
                  >
                    Xem tất cả kết quả cho "{searchTerm}"
                  </Link>
                )}
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
                  <img src={currentUser.avatarUrl} alt="Avatar" className="user-avatar-icon" />
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
                  <img src={coinIcon} alt="Xu" className="coin-icon" style={{ width: '30px', height: '20px' }}/>
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
              onFocus={handleSearchFocus}
            />
            <button type="submit" className="search-btn"><FiSearch /></button>
          </form>
          <Link to="/physical-comics" onClick={toggleMenu}>Truyện In</Link>
          <Link to="/digital-comics" onClick={toggleMenu}>Đọc Online</Link>
          <Link to="/new-releases" onClick={toggleMenu}>Mới Phát Hành</Link>
          
          <div className="nav-mobile-separator"></div>
           <h4 className="nav-mobile-genres-title">Thể Loại</h4>
           <div className="nav-mobile-genres-grid">
                {allGenres.slice(0, 8).map(genre => ( 
                    <Link 
                        key={genre.id} 
                        to={`/genres/${genre.name}`} 
                        onClick={toggleMenu}
                        className="nav-mobile-genre-link"
                    >
                      {genre.name}
                    </Link>
                ))}
           </div>
           

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
                      <img src={coinIcon} alt="Xu" className="coin-icon" style={{ width: '30px', height: '20px' }}/>
                      <span className="coin-amount">{currentUser.coinBalance} Xu</span>
                  </div>
              </>
           )}
          <div className="nav-mobile-separator"></div>
          {currentUser ? (
            <div className="nav-mobile-user-section">
              <Link to="/profile" onClick={toggleMenu} className="nav-mobile-action">
                <img src={currentUser.avatarUrl} alt="Avatar" className="user-avatar-icon small" /> <span>Tài Khoản Của Tôi</span>
              </Link>
              <Link to="/recharge" onClick={toggleMenu} className="nav-mobile-action">
                <FiDollarSign /> <span>Nạp Xu</span>
              </Link>
              <Link to="/my-library">Thư Viện Số</Link>
              <Link to="/orders">Lịch Sử Mua Hàng</Link>
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