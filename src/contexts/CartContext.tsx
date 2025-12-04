import React, {
	createContext,
	useState,
	useContext,
	type ReactNode,
	useMemo,
	useEffect,
	useCallback,
} from 'react';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import type { ComicSummary } from '../types/comicTypes';

export interface CartItem extends ComicSummary {
	quantity: number;
	imageUrl?: string;
}

interface AnimationData {
	src: string | null;
	startRect: DOMRect | null;
	endRect: DOMRect | null;
}

interface Voucher {
	code: string;
	discountType: 'PERCENT' | 'FIXED';
	discountValue: number;
	minOrderValue: number;
	maxDiscountAmount: number;
	calculatedDiscount: number;
}

interface CartContextType {
	cartItems: CartItem[];
	addToCart: (
		comic: ComicSummary | any,
		quantity: number,
		startElementRect: DOMRect | null,
	) => void;
	updateQuantity: (comicId: number, newQuantity: number) => void;
	removeFromCart: (comicId: number) => void;
	clearCart: () => void;
	cartCount: number;
	subtotal: number;
	totalPrice: number;
	total: number;
	discount: number;
	appliedVoucher: Voucher | null;
	applyVoucher: (code: string) => Promise<{ success: boolean; message: string }>;
	removeVoucher: () => void;
	animationData: AnimationData;
	setCartIconRect: (rect: DOMRect | null) => void;
	clearAnimation: () => void;
	checkout: () => Promise<any>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const { currentUser, token } = useAuth();
	const { showNotification } = useNotification();

	const [cartItems, setCartItems] = useState<CartItem[]>([]);
	const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
	const [cartIconRect, setCartIconRect] = useState<DOMRect | null>(null);
	const [animationData, setAnimationData] = useState<AnimationData>({
		src: null,
		startRect: null,
		endRect: null,
	});

	const fetchCart = useCallback(async () => {
		if (!currentUser || !token) {
			setCartItems([]);
			return;
		}

		try {
			const response = await fetch(`${API_URL}/cart`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (response.ok) {
				const data = await response.json();
				const mappedData = data.map((item: any) => ({
					...item,
					imageUrl: item.imageUrl || item.coverImageUrl,
					status: item.status || 'Ongoing',
					views: item.views || 0,
					averageRating: item.averageRating || 0,
					totalReviews: item.totalReviews || 0,
					isDigital: item.isDigital || false,
				}));
				setCartItems(mappedData);
			}
		} catch (error) {
			console.error('Failed to fetch cart:', error);
		}
	}, [currentUser, token]);

	useEffect(() => {
		fetchCart();
	}, [fetchCart]);

	const subtotal = useMemo(() => {
		return cartItems
			.filter((item) => !item.isDigital)
			.reduce((total, item) => total + Number(item.price) * item.quantity, 0);
	}, [cartItems]);

	const cartCount = useMemo(() => {
		return cartItems
			.filter((item) => !item.isDigital)
			.reduce((count, item) => count + item.quantity, 0);
	}, [cartItems]);

	useEffect(() => {
		if (appliedVoucher && subtotal > 0) {
			validateCurrentVoucher(appliedVoucher.code);
		} else if (subtotal === 0) {
			setAppliedVoucher(null);
		}
	}, [subtotal]);

	const validateCurrentVoucher = async (code: string) => {
		try {
			const res = await fetch(`${API_URL}/vouchers/validate`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ code, totalAmount: subtotal }),
			});
			const data = await res.json();
			if (data.valid) {
				setAppliedVoucher(data.data);
			} else {
				setAppliedVoucher(null);
				showNotification(data.message || 'Voucher không còn hợp lệ', 'warning');
			}
		} catch (error) {
			setAppliedVoucher(null);
		}
	};

	const discount = appliedVoucher ? appliedVoucher.calculatedDiscount : 0;
	const total = Math.max(0, subtotal - discount);

	const addToCart = async (
		comic: ComicSummary | any,
		quantity: number,
		startElementRect: DOMRect | null,
	) => {
		if (comic.isDigital) {
			showNotification(`Truyện Digital không được thêm vào giỏ hàng.`, 'info');
			return;
		}

		const imageSrc = comic.coverImageUrl || comic.imageUrl;

		if (startElementRect && cartIconRect && imageSrc) {
			setAnimationData({
				src: imageSrc,
				startRect: startElementRect,
				endRect: cartIconRect,
			});
		}

		if (currentUser && token) {
			try {
				const response = await fetch(`${API_URL}/cart/add`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ comicId: comic.id, quantity }),
				});

				if (response.ok) {
					// Refresh cart sau khi add thành công để đồng bộ dữ liệu chuẩn nhất
					await fetchCart();
					showNotification(`Đã thêm ${comic.title} vào giỏ hàng.`, 'success');
				} else {
					showNotification('Lỗi khi thêm vào giỏ hàng.', 'error');
				}
			} catch (error) {
				console.error('Add to cart error:', error);
			}
		} else {
			showNotification('Vui lòng đăng nhập để thêm vào giỏ hàng.', 'warning');
		}
	};

	const updateQuantity = async (comicId: number, newQuantity: number) => {
		if (!currentUser || !token) return;

		try {
			const response = await fetch(`${API_URL}/cart/update`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ comicId, quantity: newQuantity }),
			});

			if (response.ok) {
				await fetchCart();
			}
		} catch (error) {
			console.error('Update cart error:', error);
		}
	};

	const removeFromCart = async (comicId: number) => {
		if (!currentUser || !token) return;

		try {
			const response = await fetch(`${API_URL}/cart/remove/${comicId}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` },
			});

			if (response.ok) {
				await fetchCart();
				showNotification('Đã xóa sản phẩm khỏi giỏ hàng.', 'success');
			}
		} catch (error) {
			console.error('Remove from cart error:', error);
		}
	};

	const clearCart = async () => {
		if (currentUser && token) {
			try {
				await fetch(`${API_URL}/cart/clear`, {
					method: 'DELETE',
					headers: { Authorization: `Bearer ${token}` },
				});
			} catch (e) {
				console.error(e);
			}
		}
		setCartItems([]);
		setAppliedVoucher(null);
	};

	const applyVoucher = async (code: string): Promise<{ success: boolean; message: string }> => {
		if (subtotal === 0) return { success: false, message: 'Giỏ hàng trống' };

		try {
			const res = await fetch(`${API_URL}/vouchers/validate`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ code, totalAmount: subtotal }),
			});
			const data = await res.json();

			if (data.valid) {
				setAppliedVoucher(data.data);
				return { success: true, message: 'Áp dụng mã thành công!' };
			} else {
				setAppliedVoucher(null);
				return { success: false, message: data.message || 'Mã không hợp lệ' };
			}
		} catch (error) {
			return { success: false, message: 'Lỗi kết nối server' };
		}
	};

	const removeVoucher = () => {
		setAppliedVoucher(null);
	};

	const clearAnimation = () => {
		setAnimationData({ src: null, startRect: null, endRect: null });
	};

	const checkout = async (): Promise<any> => {
		if (!currentUser) throw new Error('User must be logged in.');

		try {
			const response = await fetch(`${API_URL}/orders`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					items: cartItems
						.filter((item) => !item.isDigital)
						.map((item) => ({
							comicId: item.id,
							quantity: item.quantity,
							price: item.price,
						})),
					totalAmount: total,
					subTotal: subtotal,
					discountAmount: discount,
					voucherCode: appliedVoucher?.code || null,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Thanh toán thất bại');
			}

			const orderResult = await response.json();
			await clearCart();
			return orderResult;
		} catch (error: any) {
			console.error('Checkout error:', error);
			throw error;
		}
	};

	return (
		<CartContext.Provider
			value={{
				cartItems,
				addToCart,
				updateQuantity,
				removeFromCart,
				clearCart,
				cartCount,
				subtotal,
				totalPrice: total,
				total,
				discount,
				appliedVoucher,
				applyVoucher,
				removeVoucher,
				animationData,
				setCartIconRect,
				clearAnimation,
				checkout,
			}}
		>
			{children}
		</CartContext.Provider>
	);
};

export const useCart = () => {
	const context = useContext(CartContext);
	if (context === undefined) throw new Error('useCart must be used within a CartProvider');
	return context;
};
