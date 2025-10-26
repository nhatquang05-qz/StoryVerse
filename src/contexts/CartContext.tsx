import React, { createContext, useState, useContext, type ReactNode, useMemo, useEffect } from 'react';
import { type Comic, type Order } from '../data/mockData';
import { useAuth } from './AuthContext';
import { saveNewOrder, type OrderItem } from '../data/mockData';
import { useNotification } from './NotificationContext';

export interface CartItem extends Comic {
  quantity: number;
}

interface AnimationData {
  src: string | null;
  startRect: DOMRect | null;
  endRect: DOMRect | null;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (comic: Comic, quantity: number, startElementRect: DOMRect | null) => void;
  updateQuantity: (comicId: number, newQuantity: number) => void;
  removeFromCart: (comicId: number) => void;
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
const CART_STORAGE_KEY = 'storyverse_cart';
const VALID_COUPON = 'STORY20';
const DISCOUNT_PERCENTAGE = 0.20;

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error("Could not load cart from local storage", error);
      return [];
    }
  });

  const [discount, setDiscount] = useState(0);

  const [cartIconRect, setCartIconRect] = useState<DOMRect | null>(null);
  const [animationData, setAnimationData] = useState<AnimationData>({
    src: null,
    startRect: null,
    endRect: null,
  });
  
  useEffect(() => {
    try {
      // Chỉ lưu trữ truyện vật lý, bỏ qua truyện digital trong giỏ hàng
      const physicalCartItems = cartItems.filter(item => !item.isDigital);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(physicalCartItems));
    } catch (error) {
      console.error("Could not save cart to local storage", error);
    }
  }, [cartItems]);

  const totalPrice = useMemo(() => {
    // Chỉ tính tổng giá trị của truyện vật lý
    return cartItems
        .filter(item => !item.isDigital)
        .reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);
  
  const applyDiscountCode = (code: string) => {
    if (code.toUpperCase() === VALID_COUPON) {
        const calculatedDiscount = totalPrice * DISCOUNT_PERCENTAGE;
        setDiscount(calculatedDiscount);
        showNotification(`Áp dụng mã ${VALID_COUPON} thành công! Giảm ${DISCOUNT_PERCENTAGE * 100}% tổng đơn hàng.`, 'success');
    } else {
        setDiscount(0);
        showNotification('Mã giảm giá không hợp lệ.', 'error');
    }
  };


  const addToCart = (comic: Comic, quantity: number, startElementRect: DOMRect | null) => {
    // BỎ QUA truyện Digital
    if (comic.isDigital) {
        showNotification(`Truyện Digital không được thêm vào giỏ hàng. Vui lòng mở khóa bằng Xu.`, 'info');
        return;
    }
    
    if (startElementRect && cartIconRect && comic.imageUrl) {
      setAnimationData({
        src: comic.imageUrl,
        startRect: startElementRect,
        endRect: cartIconRect,
      });
    }

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === comic.id);
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        showNotification(`Đã thêm ${quantity} cuốn ${comic.title} vào giỏ hàng. Tổng: ${newQuantity}`, 'info');
        return prevItems.map(item =>
          item.id === comic.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
      showNotification(`Đã thêm ${comic.title} vào giỏ hàng.`, 'success');
      return [...prevItems, { ...comic, quantity }];
    });
  };

  const clearAnimation = () => {
    setAnimationData({ src: null, startRect: null, endRect: null });
  };

  const updateQuantity = (comicId: number, newQuantity: number) => {
    const finalQuantity = Math.max(1, newQuantity);
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === comicId ? { ...item, quantity: finalQuantity } : item
      )
    );
  };

  const removeFromCart = (comicId: number) => {
    setCartItems(prevItems => {
        const removedItem = prevItems.find(item => item.id === comicId);
        if (removedItem) {
            showNotification(`Đã xóa ${removedItem.title} khỏi giỏ hàng.`, 'error');
        }
        return prevItems.filter(item => item.id !== comicId);
    });
  };
  
  const checkout = async (): Promise<Order> => {
    if (!currentUser) {
        throw new Error('User must be logged in to checkout.');
    }
    
    const physicalItems = cartItems.filter(item => !item.isDigital);

    if (physicalItems.length === 0) {
        throw new Error('Cart is empty or contains only digital comics.');
    }

    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    const orderItems: OrderItem[] = physicalItems.map(item => ({
        id: item.id,
        title: item.title,
        author: item.author,
        price: item.price,
        imageUrl: item.imageUrl,
        quantity: item.quantity,
    }));
    
    const finalTotal = totalPrice - discount;

    const newOrder: Order = {
        id: `ORDER-${Date.now()}`,
        userId: currentUser.id,
        date: new Date().toLocaleDateString('vi-VN'),
        total: finalTotal,
        status: 'Đang chờ' as const,
        items: orderItems,
    };
    
    saveNewOrder(newOrder);
    setCartItems([]);
    setDiscount(0);
    
    showNotification('Đặt hàng thành công! Đơn hàng đang được xử lý.', 'success');
    return newOrder;
  };


  const cartCount = useMemo(() => {
    return cartItems.filter(item => !item.isDigital).reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);


  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        addToCart, 
        updateQuantity, 
        removeFromCart, 
        cartCount, 
        totalPrice,
        discount,
        applyDiscountCode,
        animationData, 
        setCartIconRect,
        clearAnimation,
        checkout
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};