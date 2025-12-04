import React, { useState, useMemo } from 'react';
import { useCart } from '../contexts/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import '../assets/styles/CheckoutPage.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const CheckoutPage: React.FC = () => {
	const { cartItems, clearCart, appliedVoucher, discount } = useCart();

	const { currentUser, token } = useAuth();
	const { showNotification } = useNotification();
	const navigate = useNavigate();

	const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY'>('COD');
	const [isProcessing, setIsProcessing] = useState(false);

	const realSubtotal = useMemo(() => {
		return cartItems.reduce((sum: number, item: any) => {
			const itemTotal =
				typeof item.finalTotal === 'number' ? item.finalTotal : item.price * item.quantity;
			return sum + itemTotal;
		}, 0);
	}, [cartItems]);

	const finalAmount = Math.max(0, realSubtotal - discount);

	const [shippingInfo, setShippingInfo] = useState({
		fullName: currentUser?.fullName || '',
		phone: currentUser?.phone || '',
		address:
			currentUser?.addresses && currentUser.addresses.length > 0
				? `${currentUser.addresses[0].specificAddress}, ${currentUser.addresses[0].ward}, ${currentUser.addresses[0].district}, ${currentUser.addresses[0].city}`
				: '',
	});

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
	};

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

			const createOrderResponse = await fetch(`${API_URL}/orders`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					fullName: shippingInfo.fullName,
					phone: shippingInfo.phone,
					address: shippingInfo.address,
					totalAmount: finalAmount,
					paymentMethod: paymentMethod,
					items: cartItems,
					voucherCode: appliedVoucher ? appliedVoucher.code : null,
				}),
			});

			const orderResult = await createOrderResponse.json();

			if (!createOrderResponse.ok) {
				throw new Error(orderResult.message || 'Lỗi tạo đơn hàng');
			}

			const realOrderId = orderResult.orderId;

			if (paymentMethod === 'COD') {
				clearCart();
				showNotification('Đặt hàng thành công!', 'success');
				navigate(`/order-success/${realOrderId}`);
			} else if (paymentMethod === 'VNPAY') {
				const response = await fetch(`${API_URL}/payment/create_payment_url`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						paymentType: 'PURCHASE',
						amount: finalAmount,
						orderReference: realOrderId,
					}),
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
			<div className="checkout-container empty-cart-container">
				<h2 className="empty-cart-text">Giỏ hàng của bạn đang trống</h2>
				<Link to="/" className="continue-shopping-btn">
					Mua sắm ngay
				</Link>
			</div>
		);
	}

	return (
		<div className="checkout-container">
			<h2 className="checkout-title">Thanh Toán</h2>

			<div className="checkout-grid">
				<div className="checkout-left">
					<div className="checkout-card">
						<h3>Thông tin giao hàng</h3>

						<div className="form-group">
							<label className="form-label">Họ tên người nhận</label>
							<input
								type="text"
								className="form-input"
								placeholder="Nhập họ và tên"
								value={shippingInfo.fullName}
								onChange={(e) =>
									setShippingInfo({ ...shippingInfo, fullName: e.target.value })
								}
							/>
						</div>

						<div className="form-group">
							<label className="form-label">Số điện thoại</label>
							<input
								type="text"
								className="form-input"
								placeholder="Nhập số điện thoại liên hệ"
								value={shippingInfo.phone}
								onChange={(e) =>
									setShippingInfo({ ...shippingInfo, phone: e.target.value })
								}
							/>
						</div>

						<div className="form-group">
							<label className="form-label">Địa chỉ nhận hàng</label>
							<textarea
								className="form-textarea"
								placeholder="Nhập địa chỉ chi tiết (Số nhà, đường, phường/xã...)"
								value={shippingInfo.address}
								onChange={(e) =>
									setShippingInfo({ ...shippingInfo, address: e.target.value })
								}
							/>
						</div>
					</div>

					<div className="checkout-card">
						<h3>Phương thức thanh toán</h3>
						<div className="payment-methods">
							<div
								className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`}
								onClick={() => setPaymentMethod('COD')}
							>
								<input
									type="radio"
									className="payment-radio"
									checked={paymentMethod === 'COD'}
									readOnly
								/>
								<div className="payment-info">
									<strong>Thanh toán khi nhận hàng (COD)</strong>
									<p>Thanh toán bằng tiền mặt khi shipper giao hàng</p>
								</div>
							</div>

							<div
								className={`payment-option ${paymentMethod === 'VNPAY' ? 'selected' : ''}`}
								onClick={() => setPaymentMethod('VNPAY')}
							>
								<input
									type="radio"
									className="payment-radio"
									checked={paymentMethod === 'VNPAY'}
									readOnly
								/>
								<div className="payment-info">
									<strong>
										Thanh toán qua VNPAY
										<span className="recommend-badge">Khuyên dùng</span>
									</strong>
									<p>Quét mã QR, ví điện tử VNPAY hoặc thẻ ngân hàng</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="checkout-right">
					<div className="checkout-card order-summary-container">
						<h3>Đơn hàng ({cartItems.length} sản phẩm)</h3>

						<div className="summary-list">
							{cartItems.map((item: any) => {
								let priceDetail;
								const rowTotal = item.finalTotal ?? item.price * item.quantity;

								if (item.isMixedSale && item.priceBreakdown) {
									const { saleQty, salePrice, normalQty, normalPrice } =
										item.priceBreakdown;
									priceDetail = (
										<div className="checkout-mixed-price">
											<div className="mixed-row text-red">
												{formatPrice(salePrice)} x{saleQty}
											</div>
											<div className="mixed-row">
												{formatPrice(normalPrice)} x{normalQty}
											</div>
										</div>
									);
								} else if (item.isFlashSale) {
									priceDetail = (
										<div className="checkout-price-single">
											<span className="text-red font-bold">
												{formatPrice(item.price)}
											</span>
											{item.originalPrice && (
												<span className="text-strike">
													{formatPrice(item.originalPrice)}
												</span>
											)}
											<span className="qty-badge">x{item.quantity}</span>
										</div>
									);
								} else {
									priceDetail = (
										<div className="checkout-price-single">
											<span>{formatPrice(item.price)}</span>
											<span className="qty-badge">x{item.quantity}</span>
										</div>
									);
								}

								return (
									<div key={item.id} className="summary-item">
										<div className="item-info-col">
											<div className="item-name">{item.title}</div>
											{priceDetail}
										</div>
										<div className="item-total-col">
											{formatPrice(rowTotal)}
										</div>
									</div>
								);
							})}
						</div>

						<div className="summary-pricing">
							<div className="pricing-row">
								<span>Tạm tính</span>
								<span>{formatPrice(realSubtotal)}</span>
							</div>

							{appliedVoucher && (
								<div className="pricing-row discount-row">
									<span>Voucher ({appliedVoucher.code})</span>
									<span>- {formatPrice(discount)}</span>
								</div>
							)}

							<div className="pricing-row">
								<span>Phí vận chuyển</span>
								<span>Miễn phí</span>
							</div>

							<div className="total-row">
								<span>Tổng cộng</span>
								<span className="pricing-value">{formatPrice(finalAmount)}</span>
							</div>
						</div>

						<button
							className="checkout-btn"
							onClick={handlePlaceOrder}
							disabled={isProcessing}
						>
							{isProcessing
								? 'Đang xử lý...'
								: paymentMethod === 'VNPAY'
									? 'Thanh Toán VNPAY'
									: 'Đặt Hàng'}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CheckoutPage;
