import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';
import '../pages/AuthPage.css';

// THÊM: Import ErrorPopup
import ErrorPopup from '../components/popups/ErrorPopup';

const CheckoutPage: React.FC = () => {
    // SỬA DÒNG NÀY: Thêm 'token'
    const { currentUser, token } = useAuth();
    const { cartItems, totalPrice, discount, checkout } = useCart();
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(true); 
    
    // THÊM: State cho popup lỗi
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    const defaultAddress = currentUser?.addresses.find(a => a.isDefault);

    const [formData, setFormData] = useState({
        fullName: currentUser?.fullName || '',
        phone: currentUser?.phone || '',
        paymentMethod: 'COD', // Giữ nguyên COD làm mặc định
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

    if (cartItems.length === 0 && !isLoading) {
        return (
            <div className="auth-page" style={{ minHeight: '50vh', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '1rem' }}>Giỏ hàng của bạn đang trống!</h2>
                <p>Bạn không có sản phẩm nào để thanh toán.</p>
                <Link to="/physical-comics" className="auth-button" style={{ marginTop: '1rem', display: 'inline-block' }}>
                    Quay lại cửa hàng
                </Link>
            </div>
        );
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const finalTotal = totalPrice - discount;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleConfirmOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!defaultAddress) {
            showNotification('Vui lòng thêm địa chỉ mặc định trước khi đặt hàng.', 'error');
            return;
        }

        setIsProcessing(true);

        // THÊM: Phân nhánh logic dựa trên phương thức thanh toán
        
        if (formData.paymentMethod === 'COD') {
            // --- LOGIC GỐC CỦA BẠN (THANH TOÁN COD) ---
            try {
                const orderId = await checkout(formData.paymentMethod, defaultAddress);
                showNotification('Đặt hàng thành công!', 'success');
                navigate(`/order-success/${orderId}`);
            } catch (error) {
                console.error('Lỗi khi đặt hàng:', error);
                showNotification('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.', 'error');
            } finally {
                setIsProcessing(false);
            }
            // --- KẾT THÚC LOGIC GỐC ---

        } else if (formData.paymentMethod === 'SEPAY') {
            // --- LOGIC MỚI (THANH TOÁN SEPAY) ---
            
            // Kiểm tra token (giờ đã có)
            if (!token) {
                setErrorMessage('Phiên đăng nhập hết hạn, vui lòng tải lại trang.');
                setShowErrorPopup(true);
                setIsProcessing(false);
                return;
            }
            
            try {
                // BƯỚC 1: TẠO ĐƠN HÀNG (API NÀY BẠN CẦN TỰ TẠO)
                console.log('Bắt đầu tạo đơn hàng (cho Sepay)...');
                const createOrderResponse = await fetch(`${import.meta.env.VITE_API_URL}/orders/create`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify({ 
                        cartItems: cartItems.map(item => ({ id: item.id, quantity: item.quantity, price: item.price })),
                        totalAmount: finalTotal, 
                        shippingFee: 0, // Bạn đang miễn phí ship
                        addressId: defaultAddress.id, // ID địa chỉ mặc định (kiểu string)
                        paymentMethod: 'SEPAY' // Ghi rõ phương thức
                    })
                });
                
                const orderData = await createOrderResponse.json();

                if (!createOrderResponse.ok || !orderData.success) {
                    throw new Error(orderData.message || 'Tạo đơn hàng thất bại. (API /orders/create chưa tồn tại?)');
                }
                
                const orderIdFromAPI = orderData.orderId; // Lấy orderId từ API của bạn
                console.log(`Đã tạo đơn hàng thành công, ID: ${orderIdFromAPI}`);

                // BƯỚC 2: TẠO THANH TOÁN SEPAY
                console.log(`Bắt đầu tạo thanh toán Sepay cho orderId: ${orderIdFromAPI}`);
                
                const paymentResponse = await fetch(`${import.meta.env.VITE_API_URL}/payment/create-order-payment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ orderId: orderIdFromAPI, amount: finalTotal }) // Gửi orderId và tổng tiền
                });

                const paymentData = await paymentResponse.json();

                if (paymentResponse.ok && paymentData.paymentUrl) {
                    // Chuyển hướng đến cổng thanh toán Sepay
                    window.location.href = paymentData.paymentUrl;
                } else {
                    throw new Error(paymentData.message || 'Không thể tạo yêu cầu thanh toán Sepay.');
                }

            } catch (error: any) {
                setErrorMessage(error.message);
                setShowErrorPopup(true);
                setIsProcessing(false);
            }
            // --- KẾT THÚC LOGIC MỚI ---
        }
    };

    return (
        <div className="auth-page checkout-page" style={{ minHeight: '80vh' }}>
            <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Thanh Toán</h1>
            
            <div className="checkout-layout">
                
                {/* SỬA: Thêm id "checkout-form" vào thẻ form */}
                <form id="checkout-form" className="checkout-form" onSubmit={handleConfirmOrder}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>Thông Tin Giao Hàng</h2>
                    
                    <div className="auth-form-group">
                        <label htmlFor="fullName">Họ và Tên</label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    
                    <div className="auth-form-group">
                        <label htmlFor="phone">Số Điện Thoại</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    
                    <div className="auth-form-group">
                        <label>Địa Chỉ Giao Hàng</label>
                        {defaultAddress ? (
                            <div className="address-display">
                                <p><strong>{defaultAddress.recipient_name}</strong> ({defaultAddress.phone_number})</p>
                                <p>{defaultAddress.street}</p>
                                <p>{`${defaultAddress.ward}, ${defaultAddress.district}, ${defaultAddress.city}`}</p>
                                <Link to="/addresses" style={{ fontSize: '0.9rem' }}>Thay đổi</Link>
                            </div>
                        ) : (
                            <div className="address-display" style={{ color: '#e63946' }}>
                                <p>Vui lòng thêm địa chỉ giao hàng mặc định.</p>
                                <Link to="/addresses" className="auth-button" style={{ display: 'inline-block', marginTop: '0.5rem' }}>
                                    Thêm địa chỉ
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* --- THÊM PHẦN CHỌN THANH TOÁN --- */}
                    <div className="auth-form-group">
                        <label>Phương Thức Thanh Toán</label>
                        <div className="payment-options">
                            {/* LỰA CHỌN 1: COD (GỐC) */}
                            <label className="payment-option-label">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="COD"
                                    checked={formData.paymentMethod === 'COD'}
                                    onChange={handleInputChange}
                                />
                                <span>Thanh toán khi nhận hàng (COD)</span>
                            </label>

                            {/* LỰA CHỌN 2: SEPAY (MỚI) */}
                            <label className="payment-option-label">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="SEPAY"
                                    checked={formData.paymentMethod === 'SEPAY'}
                                    onChange={handleInputChange}
                                />
                                <span>Thanh toán qua Sepay (Thẻ/Bank/QR)</span>
                            </label>
                        </div>
                    </div>
                    {/* --- KẾT THÚC PHẦN THÊM --- */}

                </form>

                <div className="order-summary">
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>Đơn Hàng Của Bạn</h2>
                    
                    <div className="summary-items">
                        {cartItems.map(item => (
                            <div key={item.id} className="summary-item">
                                <img src={item.image} alt={item.name} className="summary-item-image" />
                                <div className="summary-item-details">
                                    <p className="summary-item-name">{item.name}</p>
                                    <p className="summary-item-qty">Số lượng: {item.quantity}</p>
                                </div>
                                <span className="summary-item-price">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="summary-row" style={{ marginTop: '1rem' }}>
                        <span>Tạm tính</span>
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
                    
                    {/* SỬA: Thêm 'form="checkout-form"' để liên kết với form */}
                    <button 
                        type="submit" 
                        form="checkout-form" // Liên kết với ID của form
                        className="checkout-btn" 
                        // Bỏ onClick ở đây vì 'type="submit"' đã xử lý
                        disabled={isProcessing || !defaultAddress} 
                        style={{ marginTop: '1rem' }}
                    >
                        {isProcessing ? 'Đang xử lý...' : 'Xác Nhận Đặt Hàng'}
                    </button>
                </div>

            </div>
            
            {/* THÊM: Popup hiển thị lỗi */}
            {showErrorPopup && (
                <ErrorPopup
                    message={errorMessage}
                    onClose={() => setShowErrorPopup(false)}
                />
            )}
        </div>
    );
};

export default CheckoutPage;