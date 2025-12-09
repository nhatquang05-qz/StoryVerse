import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
	FiPlus,
	FiMinus,
	FiTrash2,
	FiShoppingCart,
	FiTag,
	FiX,
	FiAlertCircle,
} from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import '../assets/styles/CartPage.css';

const CartPage: React.FC = () => {
	const {
		cartItems,
		updateQuantity,
		removeFromCart,
		discount,
		applyVoucher,
		appliedVoucher,
		removeVoucher,
	} = useCart();

	const { currentUser } = useAuth();
	const { showToast } = useToast();
	const navigate = useNavigate();

	const [couponCode, setCouponCode] = useState('');
	const [isApplying, setIsApplying] = useState(false);
	const [voucherError, setVoucherError] = useState('');

	const realSubtotal = useMemo(() => {
		return cartItems.reduce((sum: number, item: any) => {
			const itemTotal =
				typeof item.finalTotal === 'number' ? item.finalTotal : item.price * item.quantity;
			return sum + itemTotal;
		}, 0);
	}, [cartItems]);

	const realTotal = Math.max(0, realSubtotal - discount);

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
			showToast(result.message, 'success');
			setCouponCode('');
		} else {
			setVoucherError(result.message);
		}
	};

	const handleRemoveVoucher = () => {
		removeVoucher();
		setVoucherError('');
		showToast('Đã gỡ bỏ mã giảm giá', 'info');
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setCouponCode(e.target.value.toUpperCase());
		if (voucherError) setVoucherError('');
	};

	const handleCheckout = () => {
		if (!currentUser) {
			showToast('Vui lòng đăng nhập để tiến hành thanh toán.', 'warning');
			navigate('/login');
			return;
		}

		if (cartItems.length === 0) {
			showToast('Giỏ hàng trống. Vui lòng thêm sản phẩm.', 'warning');
			return;
		}

		navigate('/checkout');
	};

	if (cartItems.length === 0) {
		return (
			<div className="cart-empty">
				<FiShoppingCart className="cart-empty-icon" />
				<h2>Giỏ hàng của bạn đang trống</h2>
				<Link to="/" className="continue-shopping-btn">
					Tiếp tục mua sắm
				</Link>
			</div>
		);
	}

	return (
		<div className="cart-page">
			<h1>Giỏ Hàng Của Bạn</h1>
			<div className="cart-container">
				<div className="cart-items-list">
					{cartItems.map((item: any) => {
						let priceDisplay;
						let noteDisplay = null;
						const rowTotal =
							typeof item.finalTotal === 'number'
								? item.finalTotal
								: item.price * item.quantity;

						if (item.isMixedSale && item.priceBreakdown) {
							const { saleQty, salePrice, normalQty, normalPrice } =
								item.priceBreakdown;

							priceDisplay = (
								<div className="mixed-price-col">
									<div className="price-row sale">
										<span className="p-price">{formatPrice(salePrice)}</span>
										<span className="p-qty">x{saleQty}</span>
									</div>
									<div className="price-row normal">
										<span className="p-price">{formatPrice(normalPrice)}</span>
										<span className="p-qty">x{normalQty}</span>
									</div>
								</div>
							);

							noteDisplay = (
								<div className="mixed-sale-note">
									<span className="badge-warning">Hết suất Flash Sale</span>
									<p>
										Bạn mua {item.quantity} cuốn: <b>{saleQty}</b> giá sale &{' '}
										<b>{normalQty}</b> giá gốc.
									</p>
								</div>
							);
						} else if (item.isFlashSale) {
							priceDisplay = (
								<div className="flash-sale-price">
									<span className="current-price">{formatPrice(item.price)}</span>
									{item.originalPrice && (
										<span className="original-price">
											{formatPrice(item.originalPrice)}
										</span>
									)}
								</div>
							);
						} else {
							priceDisplay = (
								<span className="cart-item-price">{formatPrice(item.price)}</span>
							);
						}

						return (
							<div key={item.id} className="cart-item">
								<img
									src={item.imageUrl || item.coverImageUrl}
									alt={item.title}
									className="cart-item-image"
								/>

								<div className="cart-item-details">
									<Link to={`/comic/${item.id}`} className="cart-item-title">
										{item.title}
									</Link>
									<p className="cart-item-author">
										{item.author || 'Đang cập nhật'}
									</p>

									<div className="cart-item-price-wrapper">{priceDisplay}</div>

									{noteDisplay}
									{item.saleNote && !item.isMixedSale && (
										<span className="sale-note-text">{item.saleNote}</span>
									)}
								</div>

								<div className="cart-item-actions">
									<div className="quantity-selector">
										<button
											onClick={() =>
												updateQuantity(item.id, item.quantity - 1)
											}
											disabled={item.quantity <= 1}
										>
											<FiMinus />
										</button>
										<input type="text" value={item.quantity} readOnly />
										<button
											onClick={() =>
												updateQuantity(item.id, item.quantity + 1)
											}
										>
											<FiPlus />
										</button>
									</div>
									<div
										className="cart-item-total-display"
										style={{
											fontWeight: 'bold',
											marginTop: '10px',
											color: 'var(--clr-primary)',
										}}
									>
										{formatPrice(rowTotal)}
									</div>
									<button
										onClick={() => removeFromCart(item.id)}
										className="remove-btn"
									>
										<FiTrash2 />
									</button>
								</div>
							</div>
						);
					})}
				</div>

				<div className="cart-summary">
					<h2>Tổng Quan Đơn Hàng</h2>

					<div className="summary-row">
						<span>Tạm tính</span>
						{/* Sử dụng realSubtotal thay vì subtotal */}
						<span>{formatPrice(realSubtotal)}</span>
					</div>

					<div className="summary-row">
						<span>Phí vận chuyển</span>
						<span>Miễn phí</span>
					</div>

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
									<p
										className="voucher-error-msg"
										style={{
											color: '#e74c3c',
											marginTop: '8px',
											fontSize: '0.9rem',
											display: 'flex',
											alignItems: 'center',
											gap: '5px',
										}}
									>
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
						<span className="total-price">{formatPrice(realTotal)}</span>
					</div>

					<button className="checkout-btn" onClick={handleCheckout}>
						Tiến hành thanh toán
					</button>
				</div>
			</div>
		</div>
	);
};

export default CartPage;
