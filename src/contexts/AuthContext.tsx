// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, type ReactNode } from 'react';
import { useNotification } from './NotificationContext';
import { saveNewOrder, loadOrders, comics } from '../data/mockData'; // Import loadOrders, comics

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  address: string;
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USER_STORAGE_KEY = 'storyverse_user';
const PROFILE_DATA_KEY = 'storyverse_user_profile';

const loadProfileData = (baseUser: { id: string, email: string }): User => {
    try {
        const storedProfile = localStorage.getItem(PROFILE_DATA_KEY);
        const profile: Partial<User> = storedProfile ? JSON.parse(storedProfile) : {};
        
        const defaultProfile = {
            fullName: baseUser.email.split('@')[0] || 'Khách Hàng',
            phone: '0000000000',
            address: 'Chưa cập nhật',
        };

        return {
            ...baseUser,
            ...defaultProfile,
            ...profile,
        };
    } catch (e) {
        console.error("Failed to load profile data", e);
        return {
            ...baseUser,
            fullName: baseUser.email.split('@')[0] || 'Khách Hàng',
            phone: '0000000000',
            address: 'Chưa cập nhật',
        };
    }
};

const saveProfileData = (profileData: Partial<User>): void => {
    try {
        localStorage.setItem(PROFILE_DATA_KEY, JSON.stringify(profileData));
    } catch (e) {
        console.error("Failed to save profile data", e);
    }
};

// Hàm mới: Tạo đơn hàng mẫu cho truyện số
const createMockDigitalOrder = (userId: string, comicId: number, _title: string) => {
    const digitalComic = comics.find(c => c.id === comicId);
    if (!digitalComic) return;

    const existingOrders = loadOrders(userId);
    // Chỉ tạo nếu chưa có đơn hàng mẫu này
    if (existingOrders.some(order => order.id === 'MOCK-DIGITAL-1')) return;

    const mockOrder = {
        id: 'MOCK-DIGITAL-1',
        userId: userId,
        date: new Date().toLocaleDateString('vi-VN'),
        total: digitalComic.price,
        status: 'Hoàn thành' as const, // Trạng thái hoàn thành để truyện có thể đọc
        items: [{ 
            ...digitalComic, 
            quantity: 1,
        }],
    };
    saveNewOrder(mockOrder);
};


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      const baseUser = storedUser ? JSON.parse(storedUser) : null;
      if (baseUser) {
        return loadProfileData(baseUser);
      }
      return null;
    } catch (error) {
      console.error("Could not load user from local storage", error);
      return null;
    }
  });

  const { showNotification } = useNotification();

  const login = async (email: string, pass: string) => {
    console.log('Attempting login (mock):', email, pass);
    if (email && pass) {
        const baseUser = { id: 'user-' + Date.now(), email: email };
        const mockUser: User = loadProfileData(baseUser);
        setCurrentUser(mockUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(baseUser));
        showNotification('Đăng nhập thành công!', 'success');
        
        // GỌI HÀM TẠO ĐƠN HÀNG MẪU Ở ĐÂY
        createMockDigitalOrder(mockUser.id, 1, 'Chú Thuật Hồi Chiến - Tập 10'); 

    } else {
        throw new Error('Invalid credentials (mock)');
    }
  };

  const register = async (email: string, pass: string) => {
    console.log('Attempting register (mock):', email, pass);
    if (!email || !pass) throw new Error("Email/Pass required (mock)");
    showNotification('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
  };

  const logout = async () => {
    console.log('Attempting logout (mock)');
    setCurrentUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(PROFILE_DATA_KEY);
    showNotification('Đã đăng xuất.', 'info');
  };

  const updateProfile = async (profileData: Partial<User>) => {
    if (!currentUser) {
        throw new Error('User not logged in.');
    }

    await new Promise(resolve => setTimeout(resolve, 500)); 

    saveProfileData(profileData);
    
    setCurrentUser(prevUser => {
        if (!prevUser) return null;
        return {
            ...prevUser,
            ...profileData,
        };
    });
    showNotification('Cập nhật hồ sơ thành công!', 'success');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};