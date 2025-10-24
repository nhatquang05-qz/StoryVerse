import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { comics } from '../../data/mockData';
import { useCart } from '../../contexts/CartContext';
import './ComicDetailPage.css';

const ComicDetailPage: React.FC = () => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { comicId } = useParams<{ comicId: string }>();
  const comic = comics.find(c => c.id === Number(comicId));
  const imgRef = useRef<HTMLImageElement>(null); // Di chuyển lên đây

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };
  
  const handleAddToCart = () => {
    if (comic) {
      const rect = imgRef.current ? imgRef.current.getBoundingClientRect() : null;
      addToCart(comic, quantity, rect);
    }
  };

  if (!comic) {
    return <div>Không tìm thấy truyện!</div>;
  }

  return (
    <div className="detail-page-container">
      <div className="detail-main-card">
        <div className="detail-image-wrapper">
          <img ref={imgRef} src={comic.imageUrl} alt={comic.title} className="detail-image" /> 
        </div>
        <div className="detail-info-wrapper">
          <p className="detail-author">Tác giả: {comic.author}</p>
          <h1 className="detail-title">{comic.title}</h1>
          <p className="detail-price">{formatPrice(comic.price)}</p>
          
          <div className="detail-actions">
            <div className="quantity-selector">
              <button onClick={() => handleQuantityChange(-1)} className="quantity-btn" aria-label="Giảm số lượng">
                <FiMinus />
              </button>
              <input type="text" value={quantity} readOnly className="quantity-input" />
              <button onClick={() => handleQuantityChange(1)} className="quantity-btn" aria-label="Tăng số lượng">
                <FiPlus />
              </button>
            </div>
            <button className="add-to-cart-btn" onClick={handleAddToCart}>Thêm vào giỏ hàng</button>
          </div>
          
          <div className="detail-description">
            <h3>Mô tả</h3>
            <p>
              Đây là mô tả cho cuốn truyện "{comic.title}". Nội dung chi tiết về các tình tiết hấp dẫn, 
              nhân vật đặc sắc và những cuộc phiêu lưu kỳ thú sẽ được cập nhật tại đây. 
              Hãy sẵn sàng để đắm chìm vào một thế giới đầy màu sắc và bất ngờ!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComicDetailPage;

