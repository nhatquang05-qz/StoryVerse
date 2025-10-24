import React, { createContext, useState, useContext, type ReactNode, useMemo } from 'react';
import { type Comic } from '../data/mockData';

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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartIconRect, setCartIconRect] = useState<DOMRect | null>(null);
  const [animationData, setAnimationData] = useState<AnimationData>({
    src: null,
    startRect: null,
    endRect: null,
  });

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
        return prevItems.map(item =>
          item.id === comic.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
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
    setCartItems(prevItems => prevItems.filter(item => item.id !== comicId));
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
        clearAnimation
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

