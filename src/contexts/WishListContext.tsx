import React, { createContext, useState, useContext, type ReactNode, useMemo } from 'react';
import { type Comic } from '../data/mockData';

interface WishlistContextType {
  wishlistItems: Comic[];
  isWishlisted: (comicId: number) => boolean;
  toggleWishlist: (comic: Comic) => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<Comic[]>([]);

  const isWishlisted = (comicId: number) => {
    return wishlistItems.some(item => item.id === comicId);
  };

  const toggleWishlist = (comic: Comic) => {
    setWishlistItems(prevItems => {
      if (isWishlisted(comic.id)) {
        return prevItems.filter(item => item.id !== comic.id);
      } else {
        return [...prevItems, comic];
      }
    });
  };

  const wishlistCount = useMemo(() => wishlistItems.length, [wishlistItems]);

  return (
    <WishlistContext.Provider value={{ wishlistItems, isWishlisted, toggleWishlist, wishlistCount }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
