import React, { createContext, useState, useContext, type ReactNode, useMemo, useEffect, useCallback } from 'react';
import { type Comic, type Order } from '../data/mockData';
import { useAuth } from './AuthContext';
import { saveNewOrder } from '../data/mockData';
import { useNotification } from './NotificationContext';

export interface CartItem extends Comic {
  quantity: number;
  coverImageUrl?: string;
}

interface AnimationData {
  src: string | null;
  startRect: DOMRect | null;
  endRect: DOMRect | null;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (comic: Comic | any, quantity: number, startElementRect: DOMRect | null) => void; 
  updateQuantity: (comicId: number, newQuantity: number) => void;
  removeFromCart: (comicId: number) => void;
  clearCart: () => void;
  cartCount: number;
  totalPrice: number;
  discount: number;
  applyDiscountCode: (code: string) => void;
  animationData: AnimationData;
  setCartIconRect: (rect: DOMRect | null) => void;
  clearAnimation: () => void;
  checkout: () => Promise<Order>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const VALID_COUPON = 'STORY20';
const DISCOUNT_PERCENTAGE = 0.20;
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser, token } = useAuth();
  const { showNotification } = useNotification();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
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
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
              const data = await response.json();
              const mappedData = data.map((item: any) => ({
                  ...item,
                  imageUrl: item.imageUrl || item.coverImageUrl 
              }));
              setCartItems(mappedData);
          }
      } catch (error) {
          console.error("Failed to fetch cart:", error);
      }
  }, [currentUser, token]);

  useEffect(() => {
      fetchCart();
  }, [fetchCart]);

  const addToCart = async (comic: Comic | any, quantity: number, startElementRect: DOMRect | null) => {
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
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ comicId: comic.id, quantity })
            });
            
            if (response.ok) {
                const updatedCart = await response.json();
                // Map lại dữ liệu trả về từ API
                const mappedCart = updatedCart.map((item: any) => ({
                    ...item,
                    imageUrl: item.imageUrl || item.coverImageUrl
                }));
                setCartItems(mappedCart);
                showNotification(`Đã thêm ${comic.title} vào giỏ hàng.`, 'success');
            } else {
                showNotification('Lỗi khi thêm vào giỏ hàng.', 'error');
            }
        } catch (error) {
            console.error("Add to cart error:", error);
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
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ comicId, quantity: newQuantity })
        });

        if (response.ok) {
            const updatedCart = await response.json();
            const mappedCart = updatedCart.map((item: any) => ({
                ...item,
                imageUrl: item.imageUrl || item.coverImageUrl
            }));
            setCartItems(mappedCart);
        }
    } catch (error) {
        console.error("Update cart error:", error);
    }
  };

  const removeFromCart = async (comicId: number) => {
    if (!currentUser || !token) return;

    try {
        const response = await fetch(`${API_URL}/cart/remove/${comicId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const updatedCart = await response.json();
            const mappedCart = updatedCart.map((item: any) => ({
                ...item,
                imageUrl: item.imageUrl || item.coverImageUrl
            }));
            setCartItems(mappedCart);
            showNotification('Đã xóa sản phẩm khỏi giỏ hàng.', 'success');
        }
    } catch (error) {
        console.error("Remove from cart error:", error);
    }
  };

  const clearCart = async () => {
      if (currentUser && token) {
          try {
              await fetch(`${API_URL}/cart/clear`, {
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${token}` }
              });
          } catch (e) { console.error(e); }
      }
      setCartItems([]);
      setDiscount(0);
  };

  const applyDiscountCode = (code: string) => {
    if (code.toUpperCase() === VALID_COUPON) {
        const calculatedDiscount = totalPrice * DISCOUNT_PERCENTAGE;
        setDiscount(calculatedDiscount);
        showNotification(`Áp dụng mã thành công!`, 'success');
    } else {
        setDiscount(0);
        showNotification('Mã giảm giá không hợp lệ.', 'error');
    }
  };

  const clearAnimation = () => {
    setAnimationData({ src: null, startRect: null, endRect: null });
  };

  const totalPrice = useMemo(() => {
    return cartItems
        .filter(item => !item.isDigital)
        .reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  const cartCount = useMemo(() => {
    return cartItems.filter(item => !item.isDigital).reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const checkout = async (): Promise<Order> => {
    if (!currentUser) throw new Error('User must be logged in.');
    
    const physicalItems = cartItems.filter(item => !item.isDigital);
    const finalTotal = totalPrice - discount;
    const newOrder: Order = {
        id: `ORDER-${Date.now()}`,
        userId: currentUser.id,
        date: new Date().toLocaleDateString('vi-VN'),
        total: finalTotal,
        status: 'Đang chờ' as const,
        items: physicalItems.map(item => ({
            ...item, 
            imageUrl: item.imageUrl || item.coverImageUrl || ''
        })),
    };
    
    saveNewOrder(newOrder);
    await clearCart();
    return newOrder;
  };

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, addToCart, updateQuantity, removeFromCart, clearCart,
        cartCount, totalPrice, discount, applyDiscountCode,
        animationData, setCartIconRect, clearAnimation, checkout
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