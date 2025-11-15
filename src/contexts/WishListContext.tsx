import React, { createContext, useState, useContext, type ReactNode, useMemo, useEffect, useCallback } from 'react';
import { type ComicSummary } from '../types/comicTypes'; 
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

interface WishlistContextType {
  wishlistItems: ComicSummary[];
  isWishlisted: (comicId: number) => boolean;
  toggleWishlist: (comic: ComicSummary) => void;
  wishlistCount: number;
  
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const TOKEN_STORAGE_KEY = 'storyverse_token';

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  const [wishlistItems, setWishlistItems] = useState<ComicSummary[]>([]);
  const [, setIsLoading] = useState(true);
  
  const fetchWishlist = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!currentUser || !token) {
      setWishlistItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/wishlist`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data: ComicSummary[] = await response.json();
        setWishlistItems(data);
      } else {
        throw new Error('Failed to fetch wishlist from API');
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setWishlistItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist, currentUser]);

  const isWishlisted = (comicId: number) => {
    return wishlistItems.some(item => item.id === comicId);
  };

  const toggleWishlist = async (comic: ComicSummary) => {
    if (!currentUser) {
        showNotification('Vui lòng đăng nhập để thêm vào danh sách yêu thích.', 'warning');
        return;
    }
    
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
        showNotification('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
        return;
    }

    const isCurrentlyWishlisted = isWishlisted(comic.id);
    const originalItems = wishlistItems;
    
    setWishlistItems(prevItems => {
        if (isCurrentlyWishlisted) {
            return prevItems.filter(item => item.id !== comic.id);
        } else {
            return [...prevItems, comic];
        }
    });

    try {
        const response = await fetch(`${API_URL}/users/wishlist/toggle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ comicId: comic.id })
        });

        const data = await response.json();
        if (!response.ok) {
            setWishlistItems(originalItems);
            throw new Error(data.error || 'Cập nhật danh sách yêu thích thất bại.');
        }

    } catch (error: any) {
        console.error("Toggle wishlist API error:", error);
        showNotification(error.message || 'Lỗi khi cập nhật danh sách yêu thích.', 'error');
        setWishlistItems(originalItems);
    }
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