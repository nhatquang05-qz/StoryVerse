import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, type Address } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';
import '../pages/AuthPage.css';

const CheckoutPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { cartItems, totalPrice, discount, checkout } = useCart();
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(true); 
    
    const defaultAddress = currentUser?.addresses.find(a => a.isDefault);

    const [formData, setFormData] = useState({
        fullName: currentUser?.fullName || '',
        phone: currentUser?.phone || '',
        paymentMethod: 'COD',
    });

    useEffect(() => {
        if (currentUser !== undefined && cartItems !== undefined) {
             setIsLoading(false);
        }
        
        if (currentUser) {
            setFormData(prev => ({
                ...prev,
                fullName: currentUser.fullName || '',
                phone: currentUser.phone || '',
            }));
        }
    }, [currentUser, cartItems]);

    if (isLoading) {
        return <div className="auth-page"><h2>Đang tải thông tin...</h2></div>;
    }

    if (!currentUser || cartItems.length === 0) {
        return <div className="auth-page"><h2>Vui lòng kiểm tra Giỏ hàng và Đăng nhập.</h2></div>;
    }
    
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const handleConfirmOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.fullName || !formData.phone) {
            showNotification('Vui lòng điền đầy đủ Họ tên và Số điện thoại.', 'warning');
            return;
        }

        if (!defaultAddress) {
            showNotification('Vui lòng chọn địa chỉ giao hàng mặc định.', 'warning');
            return;
        }

        setIsProcessing(true);
        try {
            const newOrder = await checkout();
            
            navigate(`/order-success/${newOrder.id}`); 
        } catch (error) {
            console.error('Lỗi khi đặt hàng:', error);
            showNotification('Đặt hàng thất bại. Vui lòng thử lại.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };
    
    const finalTotal = totalPrice - discount;

    return (
        <div className="auth-page" style={{ minHeight: 'unset', padding: '2rem 1rem' }}>
            <div className="auth-container" style={{ maxWidth: '800px', display: 'flex', gap: '2rem', textAlign: 'left' }}>
                
                <div style={{ flex: 2 }}>
                    <h2>1. Thông Tin Cá Nhân & Giao Hàng</h2>
                    
                    <form onSubmit={handleConfirmOrder} className="auth-form" style={{ gap: '1rem' }}>
                        <div className="form-group">
                            <label htmlFor="fullName">Họ và Tên</label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Số Điện Thoại</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                required
                            />
                        </div>
                        
                        <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ margin: 0 }}>Địa Chỉ Giao Hàng (Mặc Định)</label>
                            <Link to="/addresses?checkout=true" className="detail-order-btn" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                                Thay đổi/Thêm địa chỉ
                            </Link>
                        </div>

                        <div className="address-display-group" style={{ padding: '1rem', border: defaultAddress ? '1px solid var(--primary-color)' : '1px solid #e63946', borderRadius: '6px', backgroundColor: '#f8f9fa' }}>
                            {defaultAddress ? (
                                <>
                                    <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>{defaultAddress.street}</p>
                                    <p style={{ margin: '0' }}>{defaultAddress.ward}, {defaultAddress.district}, {defaultAddress.city}</p>
                                </>
                            ) : (
                                <p style={{ margin: 0, color: '#e63946' }}>Vui lòng chọn địa chỉ mặc định.</p>
                            )}
                        </div>
                        
                    </form>

                    <h2>2. Phương Thức Thanh Toán</h2>
                    <div className="form-group">
                        <label>
                            <input type="radio" name="payment" value="COD" checked readOnly style={{ marginRight: '0.5rem' }} />
                            Thanh toán khi nhận hàng (COD)
                        </label>
                    </div>
                </div>

                <div className="cart-summary" style={{ flex: 1, padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px' }}>
                    <h2>3. Tổng Quan Đơn Hàng</h2>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
                        {cartItems.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem', borderBottom: '1px dotted #ccc' }}>
                                <span>{item.title} (x{item.quantity})</span>
                                <span>{formatPrice(item.price * item.quantity)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="summary-row" style={{ marginTop: '1rem' }}>
                        <span>Tổng tiền hàng</span>
                        <span>{formatPrice(totalPrice)}</span>
                    </div>
                    
                    {discount > 0 && (
                        <div className="summary-row" style={{ color: '#e63946', fontWeight: 'bold' }}>
                            <span>Giảm giá</span>
                            <span>- {formatPrice(discount)}</span>
                        </div>
                    )}
                    
                    <div className="summary-row">
                        <span>Phí vận chuyển</span>
                        <span>Miễn phí</span>
                    </div>
                    <div className="summary-total" style={{ borderTop: '1px solid #e0e0e0', paddingTop: '1rem', marginTop: '1rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>Tổng Cộng</span>
                        <span className="total-price" style={{ fontSize: '1.2rem', color: 'var(--primary-color)' }}>{formatPrice(finalTotal)}</span>
                    </div>
                    <button 
                        type="submit" 
                        className="checkout-btn" 
                        onClick={handleConfirmOrder} 
                        disabled={isProcessing || !defaultAddress} 
                        style={{ marginTop: '1rem' }}
                    >
                        {isProcessing ? 'Đang đặt hàng...' : 'Xác Nhận Đặt Hàng'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CheckoutPage;