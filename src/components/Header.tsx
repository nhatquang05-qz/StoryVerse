import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
	FiShoppingCart,
	FiSearch,
	FiHeart,
	FiMenu,
	FiX,
	FiDollarSign,
	FiGift,
	FiSettings,
	FiBell,
	FiMessageSquare,
	FiInfo,
	FiAlertTriangle,
} from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { type ComicSummary, type Genre } from '../types/comicTypes';
import ThemeToggleButton from './common/ThemeToggleButton';
import DailyRewardModal from './common/DailyRewardModal';
import coinIcon from '../assets/images/coin.avif';
import '../assets/styles/Header.css';
import defaultAvatarImg from '../assets/images/defaultAvatar.webp';

interface Notification {
	id: number;
	type: 'SYSTEM' | 'ORDER' | 'COMIC' | 'COMMUNITY' | 'RECHARGE';
	title: string;
	message: string;
	isRead: number;
	createdAt: string;
	imageUrl?: string;
	referenceId?: number;
	referenceType?: string;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const MAX_SUGGESTIONS_TOTAL = 10;

const formatPrice = (price: number) => {
	if (price === 0) return 'Miễn phí';
	return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const formatTimeAgo = (dateString: string) => {
	const date = new Date(dateString);
	const now = new Date();
	const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (seconds < 60) return 'Vừa xong';
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes} phút trước`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours} giờ trước`;
	const days = Math.floor(hours / 24);
	return `${days} ngày trước`;
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
	const { currentUser, logout, token } = useAuth();
	const cartIconRef = useRef<HTMLAnchorElement>(null);
	const navigate = useNavigate();
	const searchBarRef = useRef<HTMLDivElement>(null);
	const searchTimeoutRef = useRef<number | null>(null);
	const location = useLocation();
	const isReaderPage = location.pathname.startsWith('/read/');
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [isNotifOpen, setIsNotifOpen] = useState(false);
	const notifRef = useRef<HTMLDivElement>(null);

	const getAvatarSrc = (url: string | null | undefined) => {
		if (!url || url === 'defaultAvatar.webp') return defaultAvatarImg;
		return url;
	};

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	const fetchNotifications = async () => {
		if (!currentUser || !token) return;
		try {
			const res = await fetch(`${API_URL}/notifications?limit=20`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (res.ok) {
				const data = await res.json();
				setNotifications(data.notifications);
				setUnreadCount(data.unreadCount);
			}
		} catch (err) {
			console.error('Lỗi lấy thông báo', err);
		}
	};

	useEffect(() => {
		if (currentUser) {
			fetchNotifications();
			const interval = setInterval(fetchNotifications, 60000);
			return () => clearInterval(interval);
		}
	}, [currentUser, token]);

	const handleMarkAllRead = async () => {
		if (!currentUser || !token) return;
		try {
			await fetch(`${API_URL}/notifications/read-all`, {
				method: 'PUT',
				headers: { Authorization: `Bearer ${token}` },
			});
			setNotifications((prev) => prev.map((n) => ({ ...n, isRead: 1 })));
			setUnreadCount(0);
		} catch (err) {
			console.error(err);
		}
	};

	const handleNotificationClick = async (notif: Notification) => {
		if (notif.isRead === 0 && token) {
			fetch(`${API_URL}/notifications/${notif.id}/read`, {
				method: 'PUT',
				headers: { Authorization: `Bearer ${token}` },
			}).catch((err) => console.error(err));

			setNotifications((prev) =>
				prev.map((n) => (n.id === notif.id ? { ...n, isRead: 1 } : n)),
			);
			setUnreadCount((prev) => Math.max(0, prev - 1));
		}

		setIsNotifOpen(false);

		if (notif.type === 'COMIC' && notif.referenceId) navigate(`/comic/${notif.referenceId}`);
		else if (notif.type === 'ORDER') navigate(`/orders`);
		else if (notif.type === 'RECHARGE') navigate(`/recharge`);
		else if (notif.type === 'COMMUNITY' && notif.referenceId) navigate(`/community`);
	};

	useEffect(() => {
		const handleClickOutsideNotif = (event: MouseEvent) => {
			if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
				setIsNotifOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutsideNotif);
		return () => document.removeEventListener('mousedown', handleClickOutsideNotif);
	}, []);

	useEffect(() => {
		const updateCartPosition = () => {
			if (cartIconRef.current) {
				const rect = cartIconRef.current.getBoundingClientRect();
				if (rect.width > 0 && rect.height > 0) {
					setCartIconRect(rect);
				}
			}
		};

		updateCartPosition();

		const timer = setTimeout(updateCartPosition, 500);

		window.addEventListener('resize', updateCartPosition);

		return () => {
			clearTimeout(timer);
			window.removeEventListener('resize', updateCartPosition);
		};
	}, [setCartIconRect]);

	useEffect(() => {
		fetch(`${API_URL}/comics/system/genres`)
			.then((res) => res.json())
			.then((data: Genre[]) => setAllGenres(data))
			.catch((err) => console.error('Failed to fetch genres:', err));
	}, []);

	const handleLogout = async () => {
		try {
			await logout();
			setIsMenuOpen(false);
		} catch (error) {
			console.error('Lỗi đăng xuất:', error);
		}
	};

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
					const response = await fetch(
						`${API_URL}/comics/search?q=${encodeURIComponent(value.trim())}&limit=${MAX_SUGGESTIONS_TOTAL}`,
					);
					if (!response.ok) throw new Error('Network response was not ok');
					const data = await response.json();

					if (Array.isArray(data)) {
						setSuggestions(data);
					} else {
						console.warn('API search response is not an array:', data);
						setSuggestions([]);
					}
				} catch (error) {
					console.error('Lỗi fetch search suggestions:', error);
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

	const handleOpenRewardModal = (
		e: React.MouseEvent<HTMLDivElement> | React.MouseEvent<HTMLButtonElement>,
	) => {
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

	const canClaimReward = currentUser
		? (() => {
				const today = new Date();
				const lastLoginDate = new Date(currentUser.lastDailyLogin);
				return !(
					today.getFullYear() === lastLoginDate.getFullYear() &&
					today.getMonth() === lastLoginDate.getMonth() &&
					today.getDate() === lastLoginDate.getDate()
				);
			})()
		: false;

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

	const isActive = (path: string) => {
		return location.pathname.startsWith(path);
	};

	const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];
	const showSuggestionsDropdown =
		(safeSuggestions.length > 0 || isLoadingSearch) && isSearchFocused;

	const digitalSuggestions = safeSuggestions.filter((comic) => (comic as any).isDigital === 1);
	const physicalSuggestions = safeSuggestions.filter((comic) => (comic as any).isDigital === 0);

	return (
		<header className={`header ${isReaderPage ? 'header-no-sticky' : ''}`}>
			<div className="header-container">
				<Link to="/" className="logo">
					StoryVerse
				</Link>

				<nav className="nav-desktop">
					<Link
						to="/physical-comics"
						className={isActive('/physical-comics') ? 'active' : ''}
					>
						Truyện giấy
					</Link>
					<Link
						to="/digital-comics"
						className={isActive('/digital-comics') ? 'active' : ''}
					>
						Đọc online
					</Link>

					<div className="dropdown mega-dropdown">
						<button className={`dropdown-btn ${isActive('/genres') ? 'active' : ''}`}>
							Thể loại
						</button>
						<div className="dropdown-content genre-list">
							{allGenres.length > 0 ? (
								allGenres.map((genre) => (
									<Link
										key={genre.id}
										to={`/genres/${genre.name}`}
										onClick={() => setIsMenuOpen(false)}
									>
										{genre.name}
									</Link>
								))
							) : (
								<span
									style={{
										padding: '12px 16px',
										display: 'block',
										color: 'var(--clr-text-secondary)',
									}}
								>
									Đang tải...
								</span>
							)}
						</div>
					</div>

					<Link to="/community" className={isActive('/community') ? 'active' : ''}>
						Cộng đồng
					</Link>
					<Link to="/about-us" className={isActive('/about-us') ? 'active' : ''}>
						Giới thiệu
					</Link>
					<Link to="/ranking" className={isActive('/ranking') ? 'active' : ''}>
						Bảng xếp hạng
					</Link>
				</nav>

				<div className="header-actions">
					<div className="search-filter-group">
						<div className="search-wrapper" ref={searchBarRef}>
							<form onSubmit={handleSearchSubmit} className="search-bar">
								<input
									type="text"
									placeholder="Tìm kiếm truyện..."
									value={searchTerm}
									onChange={(e) => handleSearchTermChange(e.target.value)}
									onFocus={handleSearchFocus}
								/>
								<button type="submit" className="search-btn">
									<FiSearch />
								</button>
							</form>

							{showSuggestionsDropdown && (
								<div className="search-suggestions-dropdown">
									{isLoadingSearch && (
										<div className="suggestion-item">Đang tìm...</div>
									)}

									{!isLoadingSearch &&
										searchTerm.trim().length > 1 &&
										safeSuggestions.length === 0 && (
											<div className="suggestion-item">
												Không tìm thấy kết quả nào.
											</div>
										)}

									{digitalSuggestions.length > 0 && (
										<div className="suggestion-section">
											<h5 className="suggestion-section-title">
												Truyện Online
											</h5>
											{digitalSuggestions.map((comic) => (
												<div
													key={`digital-${comic.id}`}
													className="suggestion-item"
													onClick={() => handleSuggestionClick(comic.id)}
												>
													<img
														src={comic.coverImageUrl}
														alt={comic.title}
													/>
													<div>
														<p className="suggestion-title">
															{comic.title}
														</p>
														<p
															className="suggestion-author"
															style={{ fontSize: '0.75rem' }}
														>
															{comic.author}
														</p>
													</div>
												</div>
											))}
										</div>
									)}

									{digitalSuggestions.length > 0 &&
										physicalSuggestions.length > 0 && (
											<hr className="suggestion-divider" />
										)}

									{physicalSuggestions.length > 0 && (
										<div className="suggestion-section">
											<h5 className="suggestion-section-title">
												Truyện giấy
											</h5>
											{physicalSuggestions.map((comic) => (
												<div
													key={`physical-${comic.id}`}
													className="suggestion-item"
													onClick={() => handleSuggestionClick(comic.id)}
												>
													<img
														src={comic.coverImageUrl}
														alt={comic.title}
													/>
													<div>
														<p className="suggestion-title">
															{comic.title}
														</p>
														{comic.price > 0 && (
															<p className="suggestion-price">
																{formatPrice(comic.price)}
															</p>
														)}
														<p className="suggestion-author">
															{comic.author}
														</p>
													</div>
												</div>
											))}
										</div>
									)}

									{searchTerm.trim().length > 1 && !isLoadingSearch && (
										<Link
											to={`/search?q=${encodeURIComponent(searchTerm)}`}
											onClick={() => {
												setSuggestions([]);
												setIsSearchFocused(false);
											}}
											className="suggestion-view-all"
										>
											Xem tất cả kết quả cho "{searchTerm}"
										</Link>
									)}
								</div>
							)}
						</div>
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
								<span className="daily-reward-tooltip">
									Bạn có quà hàng ngày chưa nhận
								</span>
							)}
						</div>
					)}

					<Link to="/wishlist" className="action-icon" aria-label="Danh sách yêu thích">
						<FiHeart />
					</Link>

					<Link
						ref={cartIconRef}
						to="/cart"
						className="action-icon cart-icon-link"
						aria-label="Giỏ hàng"
					>
						<FiShoppingCart />
						{cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
					</Link>

					{currentUser ? (
						<>
							<div className="notification-wrapper" ref={notifRef}>
								<button
									className="action-icon notification-btn"
									onClick={() => setIsNotifOpen(!isNotifOpen)}
									aria-label="Thông báo"
								>
									<FiBell />
									{unreadCount > 0 && (
										<span className="notification-badge">
											{unreadCount > 99 ? '99+' : unreadCount}
										</span>
									)}
								</button>

								{isNotifOpen && (
									<div className="notification-dropdown">
										<div className="notification-header">
											<h3>Thông báo</h3>
											{unreadCount > 0 && (
												<button
													className="mark-all-read"
													onClick={handleMarkAllRead}
												>
													Đánh dấu tất cả đã đọc
												</button>
											)}
										</div>
										<div className="notification-list">
											{notifications.length > 0 ? (
												notifications.map((notif) => (
													<div
														key={notif.id}
														className={`notification-item ${notif.isRead === 0 ? 'unread' : ''}`}
														onClick={() =>
															handleNotificationClick(notif)
														}
													>
														<div className="notif-icon-wrapper">
															{notif.imageUrl ? (
																<img
																	src={notif.imageUrl}
																	alt=""
																	className="notif-img"
																/>
															) : notif.type === 'ORDER' ? (
																<FiShoppingCart
																	size={20}
																	color="#52c41a"
																/>
															) : notif.type === 'RECHARGE' ? (
																<FiDollarSign
																	size={20}
																	color="#faad14"
																/>
															) : notif.type === 'COMMUNITY' ? (
																<FiMessageSquare
																	size={20}
																	color="#1890ff"
																/>
															) : notif.type === 'SYSTEM' ? (
																<FiAlertTriangle
																	size={20}
																	color="#f5222d"
																/>
															) : (
																<FiInfo size={20} />
															)}
														</div>
														<div className="notif-content">
															<p className="notif-message">
																<span
																	dangerouslySetInnerHTML={{
																		__html: notif.message,
																	}}
																/>
															</p>
															<span className="notif-time">
																{formatTimeAgo(notif.createdAt)}
															</span>
														</div>
														{notif.isRead === 0 && (
															<div
																style={{
																	width: 8,
																	height: 8,
																	borderRadius: '50%',
																	background:
																		'var(--clr-primary)',
																	alignSelf: 'center',
																}}
															></div>
														)}
													</div>
												))
											) : (
												<div className="notification-empty">
													<p>Bạn chưa có thông báo nào</p>
												</div>
											)}
										</div>
									</div>
								)}
							</div>

							<div className="dropdown">
								<button className="action-icon user-icon" aria-label="Tài khoản">
									<img
										src={getAvatarSrc(currentUser.avatarUrl)}
										alt="Avatar"
										className="user-avatar-icon"
									/>
								</button>
								<div className="dropdown-content user-dropdown">
									<Link to="/profile">Tài Khoản Của Tôi</Link>
									<Link to="/recharge">Nạp Xu</Link>
									<Link to="/giftcode">Nhập Giftcode</Link>
									<Link to="/my-library">Thư Viện Số</Link>
									<Link to="/orders">Lịch Sử Mua Hàng</Link>
									<Link to="/settings">Cài Đặt</Link>
									<Link to="/giftcode">Nhập Giftcode</Link>
									<button onClick={handleLogout} className="logout-btn">
										Đăng Xuất
									</button>
								</div>
							</div>

							<div className="coin-balance-display">
								<img
									src={coinIcon}
									alt="Xu"
									className="coin-icon"
									style={{ width: '30px', height: '30px' }}
								/>
								<span className="coin-amount">{currentUser.coinBalance}</span>
							</div>
						</>
					) : (
						<Link to="/login" className="login-btn">
							Đăng Nhập
						</Link>
					)}

					<button className="menu-toggle" onClick={toggleMenu} aria-label="Mở menu">
						{isMenuOpen ? <FiX /> : <FiMenu />}
					</button>
				</div>
			</div>

			{isMenuOpen && (
				<nav className="nav-mobile">
					<div className="search-filter-group mobile-search-group">
						<form
							onSubmit={handleSearchSubmit}
							className="search-bar mobile-search-bar"
						>
							<input
								type="text"
								placeholder="Tìm kiếm truyện..."
								value={searchTerm}
								onChange={(e) => handleSearchTermChange(e.target.value)}
								onFocus={handleSearchFocus}
							/>
							<button type="submit" className="search-btn">
								<FiSearch />
							</button>
						</form>
					</div>

					<Link to="/physical-comics" onClick={toggleMenu}>
						Truyện giấy
					</Link>
					<Link to="/digital-comics" onClick={toggleMenu}>
						Đọc Online
					</Link>

					<Link to="/community" onClick={toggleMenu}>
						Cộng đồng
					</Link>
					<Link to="/about-us" onClick={toggleMenu}>
						Giới thiệu
					</Link>

					<div className="nav-mobile-separator"></div>
					<h4 className="nav-mobile-genres-title">Thể Loại</h4>
					<div className="nav-mobile-genres-grid">
						{allGenres.slice(0, 8).map((genre) => (
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
							<button
								className="nav-mobile-action"
								onClick={() => {
									setIsNotifOpen(true);
									toggleMenu();
								}}
							>
								<FiBell /> <span>Thông báo ({unreadCount})</span>
							</button>

							<button
								className={`nav-mobile-action daily-reward-btn ${canClaimReward ? 'can-claim' : ''}`}
								onClick={handleOpenRewardModal}
							>
								<FiGift />{' '}
								<span>
									{canClaimReward ? 'Nhận Thưởng Hàng Ngày' : 'Đã Nhận Thưởng'}
								</span>
							</button>

							<div className="coin-balance-display mobile-coin-balance">
								<img
									src={coinIcon}
									alt="Xu"
									className="coin-icon"
									style={{ width: '30px', height: '30px' }}
								/>
								<span className="coin-amount">{currentUser.coinBalance} Xu</span>
							</div>
						</>
					)}
					<div className="nav-mobile-separator"></div>
					{currentUser ? (
						<div className="nav-mobile-user-section">
							<Link to="/profile" onClick={toggleMenu} className="nav-mobile-action">
								<img
									src={getAvatarSrc(currentUser.avatarUrl)}
									alt="Avatar"
									className="user-avatar-icon small"
								/>{' '}
								<span>Tài Khoản Của Tôi</span>
							</Link>
							<Link to="/recharge" onClick={toggleMenu} className="nav-mobile-action">
								<FiDollarSign /> <span>Nạp Xu</span>
							</Link>

							<Link
								to="/my-library"
								onClick={toggleMenu}
								className="nav-mobile-action"
							>
								<span>Thư Viện Số</span>
							</Link>
							<Link to="/orders" onClick={toggleMenu} className="nav-mobile-action">
								<span>Lịch Sử Mua Hàng</span>
							</Link>
							<Link to="/settings" onClick={toggleMenu} className="nav-mobile-action">
								<FiSettings /> <span>Cài Đặt</span>
							</Link>
							<button
								onClick={() => {
									handleLogout();
									toggleMenu();
								}}
								className="logout-btn-mobile"
							>
								Đăng Xuất
							</button>
						</div>
					) : (
						<Link to="/login" onClick={toggleMenu} className="nav-mobile-login-btn">
							Đăng Nhập
						</Link>
					)}
				</nav>
			)}

			<DailyRewardModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
		</header>
	);
};

export default Header;
