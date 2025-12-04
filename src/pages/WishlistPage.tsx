import React, { useState } from 'react';
import { useWishlist } from '../contexts/WishListContext';
import ProductList from '../components/common/ProductList';
import { Link } from 'react-router-dom';
import { FiHeart, FiSearch, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import LoadingPage from '../components/common/Loading/LoadingScreen';
import '../assets/styles/WishlistPage.css';

const WishlistPage: React.FC = () => {
	const { wishlistItems, wishlistCount } = useWishlist();
	const { currentUser, loading: authLoading } = useAuth();
	const [searchTerm, setSearchTerm] = useState('');

	if (authLoading) {
		return <LoadingPage />;
	}

	const filteredItems = wishlistItems.filter((item: any) =>
		item.title?.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	if (!currentUser) {
		return (
			<div className="wishlist-page-container">
				<div className="wishlist-empty-state login-required">
					<div className="icon-wrapper">
						<FiHeart className="wishlist-empty-icon" />
					</div>
					<h2 className="wlh2">Bạn cần đăng nhập</h2>
					<p className="wlp">
						Vui lòng đăng nhập để đồng bộ và xem danh sách truyện yêu thích của bạn.
					</p>
					<Link to="/login" className="action-btn primary-btn">
						Đăng nhập ngay <FiArrowRight />
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="wishlist-page-container">
			<div className="wishlist-header">
				<div className="header-left">
					<h1 className="page-title">Danh Sách Yêu Thích</h1>
					<span className="item-count">{wishlistCount} truyện</span>
				</div>

				{wishlistCount > 0 && (
					<div className="header-right search-box">
						<FiSearch className="search-icon" />
						<input
							type="text"
							placeholder="Tìm trong danh sách..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
				)}
			</div>

			<div className="wishlist-content">
				{wishlistCount > 0 ? (
					<>
						{filteredItems.length > 0 ? (
							<ProductList comics={filteredItems as any[]} />
						) : (
							<div className="no-result-state">
								<p>Không tìm thấy truyện nào khớp với "{searchTerm}"</p>
							</div>
						)}
					</>
				) : (
					<div className="wishlist-empty-state">
						<div className="icon-wrapper empty">
							<FiHeart className="wishlist-empty-icon" />
						</div>
						<h2>Danh sách trống</h2>
						<p>
							Bạn chưa lưu bộ truyện nào. Hãy khám phá và thả tim cho những bộ truyện
							bạn thích nhé!
						</p>
						<Link to="/" className="action-btn outline-btn">
							Khám phá truyện mới
						</Link>
					</div>
				)}
			</div>
		</div>
	);
};

export default WishlistPage;
