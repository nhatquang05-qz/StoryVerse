import React from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import './CartPage.css';

const CartPage: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, totalPrice } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Giỏ hàng của bạn đang trống</h2>
        <Link to="/" className="continue-shopping-btn">Tiếp tục mua sắm</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Giỏ Hàng Của Bạn</h1>
      <div className="cart-container">
        <div className="cart-items-list">
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <img src={item.imageUrl} alt={item.title} className="cart-item-image" />
              <div className="cart-item-details">
                <Link to={`/comic/${item.id}`} className="cart-item-title">{item.title}</Link>
                <p className="cart-item-author">{item.author}</p>
                <p className="cart-item-price">{formatPrice(item.price)}</p>
              </div>
              <div className="cart-item-actions">
                <div className="quantity-selector">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><FiMinus /></button>
                  <input type="text" value={item.quantity} readOnly />
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><FiPlus /></button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="remove-btn"><FiTrash2 /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Tổng Quan Đơn Hàng</h2>
          <div className="summary-row">
            <span>Tổng tiền hàng</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className="summary-row">
            <span>Phí vận chuyển</span>
            <span>Miễn phí</span>
          </div>
          <div className="summary-total">
            <span>Tổng Cộng</span>
            <span className="total-price">{formatPrice(totalPrice)}</span>
          </div>
          <button className="checkout-btn">Tiến hành thanh toán</button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;