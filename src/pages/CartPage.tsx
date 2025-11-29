import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiMinus, FiTrash2, FiShoppingCart, FiTag, FiX, FiAlertCircle } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import '../assets/styles/CartPage.css';

const CartPage: React.FC = () => {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    subtotal, 
    total, 
    discount, 
    applyVoucher, 
    appliedVoucher, 
    removeVoucher 
  } = useCart();
  
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  
  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [voucherError, setVoucherError] = useState(''); 

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!couponCode.trim()) return;

      setIsApplying(true);
      setVoucherError(''); 

      const result = await applyVoucher(couponCode);
      setIsApplying(false);

      if (result.success) {
          showNotification(result.message, 'success');
          setCouponCode('');
      } else {

          setVoucherError(result.message);
      }
  };

  const handleRemoveVoucher = () => {
      removeVoucher();
      setVoucherError('');
      showNotification('Đã gỡ bỏ mã giảm giá', 'info');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCouponCode(e.target.value.toUpperCase());
      if (voucherError) setVoucherError('');
  };

  const handleCheckout = () => {
    if (!currentUser) {
        showNotification('Vui lòng đăng nhập để tiến hành thanh toán.', 'warning');
        navigate('/login');
        return;
    }

    if (cartItems.length === 0) {
        showNotification('Giỏ hàng trống. Vui lòng thêm sản phẩm.', 'warning');
        return;
    }
    
    navigate('/checkout'); 
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <FiShoppingCart className="cart-empty-icon" />
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
              <img src={item.imageUrl || item.coverImageUrl} alt={item.title} className="cart-item-image" />
              <div className="cart-item-details">
                <Link to={`/comic/${item.id}`} className="cart-item-title">{item.title}</Link>
                <p className="cart-item-author">{item.author || 'Đang cập nhật'}</p>
                <p className="cart-item-price">{formatPrice(item.price)}</p>
              </div>
              <div className="cart-item-actions">
                <div className="quantity-selector">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}><FiMinus /></button>
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
            <span>Tạm tính</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <div className="summary-row">
            <span>Phí vận chuyển</span>
            <span>Miễn phí</span>
          </div>

          {/* Voucher Section */}
          <div className="voucher-section">
            {appliedVoucher ? (
                <div className="applied-voucher-info">
                    <div className="voucher-code-display">
                        <FiTag />
                        <span>{appliedVoucher.code}</span>
                    </div>
                    <button 
                        onClick={handleRemoveVoucher}
                        className="remove-voucher-btn"
                        title="Gỡ mã"
                    >
                        <FiX size={18} />
                    </button>
                </div>
            ) : (
                <>
                    <form onSubmit={handleApplyCoupon} className="voucher-form">
                        <input 
                            type="text" 
                            className="voucher-input"
                            placeholder="Mã giảm giá"
                            value={couponCode}
                            onChange={handleInputChange}
                        />
                        <button 
                            type="submit"
                            className="apply-voucher-btn" 
                            disabled={isApplying || !couponCode}
                        >
                            {isApplying ? '...' : 'Áp dụng'}
                        </button>
                    </form>
                    {voucherError && (
                        <p className="voucher-error-msg" style={{ color: '#e74c3c', marginTop: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FiAlertCircle /> {voucherError}
                        </p>
                    )}
                </>
            )}
          </div>
          
          {discount > 0 && (
              <div className="summary-row discount-text">
                  <span>Giảm giá ({appliedVoucher?.code})</span>
                  <span>- {formatPrice(discount)}</span>
              </div>
          )}
          
          <div className="summary-total">
            <span>Tổng Cộng</span>
            <span className="total-price">{formatPrice(total)}</span>
          </div>
          
          <button className="checkout-btn" onClick={handleCheckout}>Tiến hành thanh toán</button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;