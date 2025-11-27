import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import '../assets/styles/CartPage.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const CheckoutPage: React.FC = () => {
    const { cartItems, totalPrice, clearCart } = useCart();
    const { currentUser, token } = useAuth();
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY'>('COD');
    const [isProcessing, setIsProcessing] = useState(false);

    const [shippingInfo, setShippingInfo] = useState({
        fullName: currentUser?.fullName || '',
        phone: currentUser?.phone || '',
        address: currentUser?.addresses && currentUser.addresses.length > 0 
                 ? `${currentUser.addresses[0].specificAddress}, ${currentUser.addresses[0].ward}, ${currentUser.addresses[0].district}, ${currentUser.addresses[0].city}` 
                 : ''
    });

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) {
            showNotification('Giỏ hàng trống', 'warning');
            return;
        }
        if (!shippingInfo.address || !shippingInfo.phone) {
            showNotification('Vui lòng nhập đầy đủ thông tin giao hàng', 'warning');
            return;
        }

        setIsProcessing(true);

        try {
            if (!token) {
                showNotification('Vui lòng đăng nhập để đặt hàng', 'error');
                setIsProcessing(false);
                return;
            }

            const createOrderResponse = await fetch(`${API_URL}/orders/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    fullName: shippingInfo.fullName,
                    phone: shippingInfo.phone,
                    address: shippingInfo.address,
                    totalAmount: totalPrice,
                    paymentMethod: paymentMethod,
                    items: cartItems
                })
            });

            const orderResult = await createOrderResponse.json();
            
            if (!createOrderResponse.ok) {
                throw new Error(orderResult.message || 'Lỗi tạo đơn hàng');
            }

            const realOrderId = orderResult.orderId; 

            if (paymentMethod === 'COD') { 
                clearCart(); 
                showNotification('Đặt hàng thành công! (COD)', 'success');
                navigate(`/order-success/${realOrderId}`);

            } else if (paymentMethod === 'VNPAY') {  
                const response = await fetch(`${API_URL}/payment/create_payment_url`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        paymentType: 'PURCHASE', 
                        amount: totalPrice,      
                        orderReference: realOrderId 
                    })
                });

                const data = await response.json();

                if (response.ok && data.paymentUrl) {
                    window.location.href = data.paymentUrl;
                } else {
                    throw new Error(data.message || 'Lỗi tạo cổng thanh toán');
                }
            }

        } catch (error: any) {
            console.error('Checkout Error:', error);
            showNotification(error.message || 'Đặt hàng thất bại', 'error');
            
            setIsProcessing(false); 
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="cart-page-container empty-cart">
                <h2>Giỏ hàng của bạn đang trống</h2>
                <Link to="/" className="continue-shopping-btn">Mua sắm ngay</Link>
            </div>
        );
    }

    return (
        <div className="cart-page-container" style={{maxWidth: '1000px', margin: '0 auto', padding: '20px'}}>
            <h2>Thanh Toán</h2>
            
            <div className="checkout-grid" style={{display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px'}}>
                
                <div className="checkout-left">
                    <div className="checkout-section card" style={{padding: '20px', background: 'var(--card-bg)', borderRadius: '12px', marginBottom: '20px'}}>
                        <h3>Thông tin giao hàng</h3>
                        <div className="form-group" style={{marginBottom: '15px'}}>
                            <label>Họ tên</label>
                            <input 
                                type="text" 
                                className="form-control"
                                value={shippingInfo.fullName}
                                onChange={e => setShippingInfo({...shippingInfo, fullName: e.target.value})}
                                style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '5px'}}
                            />
                        </div>
                        <div className="form-group" style={{marginBottom: '15px'}}>
                            <label>Số điện thoại</label>
                            <input 
                                type="text" 
                                className="form-control"
                                value={shippingInfo.phone}
                                onChange={e => setShippingInfo({...shippingInfo, phone: e.target.value})}
                                style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '5px'}}
                            />
                        </div>
                        <div className="form-group">
                            <label>Địa chỉ nhận hàng</label>
                            <textarea 
                                className="form-control"
                                value={shippingInfo.address}
                                onChange={e => setShippingInfo({...shippingInfo, address: e.target.value})}
                                style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '5px'}}
                            />
                        </div>
                    </div>

                    <div className="checkout-section card" style={{padding: '20px', background: 'var(--card-bg)', borderRadius: '12px'}}>
                        <h3>Phương thức thanh toán</h3>
                        
                        <div 
                            className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`}
                            onClick={() => setPaymentMethod('COD')}
                            style={{
                                padding: '15px', 
                                border: paymentMethod === 'COD' ? '2px solid var(--primary-color)' : '1px solid #ddd',
                                borderRadius: '8px',
                                marginBottom: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <input type="radio" checked={paymentMethod === 'COD'} readOnly style={{marginRight: '10px'}} />
                            <div>
                                <strong>Thanh toán khi nhận hàng (COD)</strong>
                                <p style={{fontSize: '0.9rem', color: '#666', margin: 0}}>Thanh toán bằng tiền mặt khi giao hàng</p>
                            </div>
                        </div>

                        <div 
                            className={`payment-option ${paymentMethod === 'VNPAY' ? 'selected' : ''}`}
                            onClick={() => setPaymentMethod('VNPAY')}
                            style={{
                                padding: '15px', 
                                border: paymentMethod === 'VNPAY' ? '2px solid var(--primary-color)' : '1px solid #ddd',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <input type="radio" checked={paymentMethod === 'VNPAY'} readOnly style={{marginRight: '10px'}} />
                            <div>
                                <strong>Thanh toán qua VNPAY</strong> <span style={{fontSize: '0.8rem', color: 'white', background: '#005ba3', padding: '2px 6px', borderRadius: '4px'}}>Khuyên dùng</span>
                                <p style={{fontSize: '0.9rem', color: '#666', margin: 0}}>Quét mã QR hoặc dùng thẻ ATM/Visa</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="checkout-right">
                    <div className="order-summary card" style={{padding: '20px', background: 'var(--card-bg)', borderRadius: '12px', position: 'sticky', top: '100px'}}>
                        <h3>Đơn hàng ({cartItems.length} sản phẩm)</h3>
                        <div className="summary-items" style={{maxHeight: '300px', overflowY: 'auto', marginBottom: '20px'}}>
                            {cartItems.map(item => (
                                <div key={item.id} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                                    <span>{item.quantity}x {item.title}</span>
                                    <span>{(item.price * item.quantity).toLocaleString()}đ</span>
                                </div>
                            ))}
                        </div>
                        <hr style={{margin: '15px 0', border: 'none', borderTop: '1px solid #eee'}} />
                        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold'}}>
                            <span>Tổng cộng:</span>
                            <span style={{color: 'var(--primary-color)'}}>{totalPrice.toLocaleString()}đ</span>
                        </div>

                        <button 
                            className="auth-button"
                            onClick={handlePlaceOrder}
                            disabled={isProcessing}
                            style={{marginTop: '20px', width: '100%', background: 'var(--primary-color)', color: 'white', cursor: isProcessing ? 'not-allowed' : 'pointer'}}
                        >
                            {isProcessing ? 'Đang xử lý...' : (paymentMethod === 'COD' ? 'Đặt Hàng Ngay' : 'Thanh Toán VNPAY')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;