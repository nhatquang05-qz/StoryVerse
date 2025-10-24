import React from 'react';
import { useWishlist } from '../../contexts/WishListContext';
import ProductList from '../../components/common/ProductList/ProductList';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import './WishlistPage.css';

const WishlistPage: React.FC = () => {
  const { wishlistItems, wishlistCount } = useWishlist();

  return (
    <div className="wishlist-page">
      <h1>Danh Sách Yêu Thích ({wishlistCount})</h1>
      
      {wishlistCount > 0 ? (
        <ProductList comics={wishlistItems} />
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