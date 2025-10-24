import React, { createContext, useState, useContext, type ReactNode, useMemo, useEffect } from 'react';
import { type Comic } from '../data/mockData';
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
  animationData: AnimationData;
  setCartIconRect: (rect: DOMRect | null) => void;
  clearAnimation: () => void;
  checkout: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = 'storyverse_cart';

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

  const [cartIconRect, setCartIconRect] = useState<DOMRect | null>(null);
  const [animationData, setAnimationData] = useState<AnimationData>({
    src: null,
    startRect: null,
    endRect: null,
  });
  
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error("Could not save cart to local storage", error);
    }
  }, [cartItems]);

  const addToCart = (comic: Comic, quantity: number, startElementRect: DOMRect | null) => {
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
  
  const checkout = async () => {
    if (!currentUser) {
        throw new Error('User must be logged in to checkout.');
    }
    
    if (cartItems.length === 0) {
        throw new Error('Cart is empty.');
    }

    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    const orderItems: OrderItem[] = cartItems.map(item => ({
        id: item.id,
        title: item.title,
        author: item.author,
        price: item.price,
        imageUrl: item.imageUrl,
        quantity: item.quantity,
    }));
    
    const newOrder = {
        id: `ORDER-${Date.now()}`,
        userId: currentUser.id,
        date: new Date().toLocaleDateString('vi-VN'),
        total: totalPrice,
        status: 'Đang chờ' as const,
        items: orderItems,
    };
    
    saveNewOrder(newOrder);
    setCartItems([]);
    
    showNotification('Đặt hàng thành công! Đơn hàng đang được xử lý.', 'success');
  };

  const cartCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
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