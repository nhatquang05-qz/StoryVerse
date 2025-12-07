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
			<div className="wl-container">
				<div className="wl-empty-card">
					<div className="wl-icon-box">
						<FiHeart />
					</div>
					<h2 className="wl-empty-title">Đăng nhập để xem Wishlist</h2>
					<p className="wl-empty-desc">
						Vui lòng đăng nhập để đồng bộ và quản lý danh sách truyện yêu thích của bạn.
					</p>
					<Link to="/login" className="wl-btn wl-btn-primary">
						Đăng nhập ngay <FiArrowRight />
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="wl-container">
			{}
			<div className="wl-header">
				<div className="wl-title-group">
					<h1 className="wl-page-title">Danh Sách Yêu Thích</h1>
					<span className="wl-count-badge">{wishlistCount} truyện</span>
				</div>

				{wishlistCount > 0 && (
					<div className="wl-actions">
						<div className="wl-search-box">
							<FiSearch className="wl-search-icon" />
							<input
								type="text"
								placeholder="Tìm kiếm..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
					</div>
				)}
			</div>

			{}
			<div className="wl-body">
				{wishlistCount > 0 ? (
					<>
						{filteredItems.length > 0 ? (
							<div className="wl-grid">
								<ProductList comics={filteredItems as any[]} />
							</div>
						) : (
							<div className="wl-no-result">
								<FiSearch size={40} />
								<p>Không tìm thấy truyện nào khớp với từ khóa "{searchTerm}"</p>
							</div>
						)}
					</>
				) : (
					<div className="wl-empty-card">
						<div className="wl-icon-box empty">
							<FiHeart />
						</div>
						<h2 className="wl-empty-title">Danh sách đang trống</h2>
						<p className="wl-empty-desc">
							Bạn chưa lưu bộ truyện nào vào danh sách yêu thích.
						</p>
						<Link to="/" className="wl-btn wl-btn-outline">
							Khám phá ngay
						</Link>
					</div>
				)}
			</div>
		</div>
	);
};

export default WishlistPage;
