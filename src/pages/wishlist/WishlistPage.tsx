import React from 'react';
import { useWishlist } from '../../contexts/WishListContext';
import ProductList from '../../components/common/ProductList/ProductList';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import LoadingPage from '../../components/common/Loading/LoadingScreen';
import './WishlistPage.css';

const WishlistPage: React.FC = () => {
  const { wishlistItems, wishlistCount } = useWishlist();
  const { currentUser, loading: authLoading } = useAuth();

  if (authLoading) {
      return <LoadingPage />;
  }
  
  if (!currentUser) {
      return (
        <div className="wishlist-page">
            <h1>Danh Sách Yêu Thích (0)</h1>
            <div className="wishlist-empty-state">
              <FiHeart className="wishlist-empty-icon" />
              <h2>Bạn cần đăng nhập để xem danh sách yêu thích.</h2>
              <p>Danh sách yêu thích sẽ được lưu trữ trên máy chủ.</p>
              <Link to="/login" className="continue-shopping-btn">Đăng nhập ngay</Link>
            </div>
        </div>
      );
  }

  return (
    <div className="wishlist-page">
      <h1>Danh Sách Yêu Thích ({wishlistCount})</h1>
      
      {wishlistCount > 0 ? (
        <ProductList comics={wishlistItems as any[]} />
      ) : (
        <div className="wishlist-empty-state">
          <FiHeart className="wishlist-empty-icon" />
          <h2>Bạn chưa có sản phẩm nào trong danh sách yêu thích.</h2>
          <p>Nhấp vào biểu tượng trái tim trên sản phẩm để thêm vào danh sách.</p>
          <Link to="/" className="continue-shopping-btn">Khám phá ngay</Link>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;