// src/contexts/AuthContext.tsx

import React, { createContext, useState, useContext, type ReactNode } from 'react';
import { useNotification } from './NotificationContext';
import { saveNewOrder, loadOrders } from '../data/mockData';
import { type OrderItem } from '../data/mockData';

export interface Address {
    id: string;
    street: string;
    ward: string;
    district: string;
    city: string;
    isDefault: boolean;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  addresses: Address[];
  coinBalance: number;
  lastDailyLogin: string;
  consecutiveLoginDays: number; // THÊM MỚI
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  updateAddresses: (addresses: Address[]) => Promise<void>;
  claimDailyReward: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USER_STORAGE_KEY = 'storyverse_user';
const PROFILE_DATA_KEY = 'storyverse_user_profile';
const ADDRESSES_DATA_KEY = 'storyverse_user_addresses';

const mockDefaultAddress: Address = {
    id: 'default-1',
    street: '123 Đường Nguyễn Huệ',
    ward: 'Phường 1',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    isDefault: true,
};

const loadAddresses = (userId: string): Address[] => {
    try {
        const storedAddresses = localStorage.getItem(ADDRESSES_DATA_KEY + userId);
        const addresses: Address[] = storedAddresses ? JSON.parse(storedAddresses) : [];
        if (addresses.length === 0) {
            return [mockDefaultAddress];
        }
        return addresses;
    } catch (e) {
        return [mockDefaultAddress];
    }
};

const saveAddresses = (userId: string, addresses: Address[]): void => {
    try {
        localStorage.setItem(ADDRESSES_DATA_KEY + userId, JSON.stringify(addresses));
    } catch (e) {
        console.error("Failed to save addresses", e);
    }
};

const loadProfileData = (baseUser: { id: string, email: string }): User => {
    try {
        const storedProfile = localStorage.getItem(PROFILE_DATA_KEY + baseUser.id);
        const profile: Partial<User> = storedProfile ? JSON.parse(storedProfile) : {};

        const defaultProfile = {
            fullName: baseUser.email.split('@')[0] || 'Khách Hàng',
            phone: '0000000000',
            coinBalance: 1000,
            lastDailyLogin: '2000-01-01T00:00:00.000Z',
            consecutiveLoginDays: 0, // GIÁ TRỊ MẶC ĐỊNH
        };

        return {
            ...baseUser,
            ...defaultProfile,
            ...profile,
            addresses: loadAddresses(baseUser.id),
        } as User;
    } catch (e) {
        console.error("Failed to load profile data", e);
        return {
            ...baseUser,
            fullName: baseUser.email.split('@')[0] || 'Khách Hàng',
            phone: '0000000000',
            addresses: loadAddresses(baseUser.id),
            coinBalance: 1000,
            lastDailyLogin: '2000-01-01T00:00:00.000Z',
            consecutiveLoginDays: 0,
        } as User;
    }
};

const saveProfileData = (userId: string, profileData: Partial<User>): void => {
    try {
        const storedProfile = localStorage.getItem(PROFILE_DATA_KEY + userId);
        const currentProfile: Partial<User> = storedProfile ? JSON.parse(storedProfile) : {};
        const newProfile = { ...currentProfile, ...profileData };

        delete newProfile.addresses;

        localStorage.setItem(PROFILE_DATA_KEY + userId, JSON.stringify(newProfile));
    } catch (e) {
        console.error("Failed to save profile data", e);
    }
};

const createMockDigitalOrder = () => {
    return;
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
      return null;
    }
  });

  const { showNotification } = useNotification();

  const login = async (email: string, pass: string) => {
    const baseUser = { id: 'user-' + Date.now(), email: email };
    const mockUser: User = loadProfileData(baseUser);

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(baseUser));

    saveProfileData(baseUser.id, mockUser);
    saveAddresses(baseUser.id, mockUser.addresses);

    setCurrentUser(mockUser);
    showNotification('Đăng nhập thành công!', 'success');
    createMockDigitalOrder();
  };

  const register = async (email: string, pass: string) => {
    if (!email || !pass) throw new Error("Email/Pass required (mock)");
    showNotification('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
  };

  const logout = async () => {
    setCurrentUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    showNotification('Đã đăng xuất.', 'info');
  };

  const updateProfile = async (profileData: Partial<User>) => {
    if (!currentUser) {
        throw new Error('User not logged in.');
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    saveProfileData(currentUser.id, profileData);

    setCurrentUser(prevUser => {
        if (!prevUser) return null;
        return {
            ...prevUser,
            ...profileData,
        } as User;
    });
    showNotification('Cập nhật hồ sơ thành công!', 'success');
  };

  const updateAddresses = async (addresses: Address[]) => {
    if (!currentUser) {
        throw new Error('User not logged in.');
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    saveAddresses(currentUser.id, addresses);

    setCurrentUser(prevUser => {
        if (!prevUser) return null;
        return {
            ...prevUser,
            addresses: addresses,
        };
    });
    showNotification('Cập nhật địa chỉ thành công!', 'success');
  };
  
  const claimDailyReward = async () => {
      if (!currentUser) {
          showNotification('Vui lòng đăng nhập để nhận thưởng.', 'warning');
          return;
      }

      const today = new Date();
      const lastLoginDate = new Date(currentUser.lastDailyLogin);
      const oneDay = 24 * 60 * 60 * 1000;
      const diffDays = Math.round(Math.abs((today.getTime() - lastLoginDate.getTime()) / oneDay));

      // Kiểm tra xem đã nhận thưởng hôm nay chưa
      const isSameDay = 
          today.getFullYear() === lastLoginDate.getFullYear() &&
          today.getMonth() === lastLoginDate.getMonth() &&
          today.getDate() === lastLoginDate.getDate();

      if (isSameDay) {
          showNotification('Bạn đã nhận thưởng hàng ngày hôm nay rồi!', 'info');
          return;
      }
      
      let nextLoginDays = currentUser.consecutiveLoginDays + 1;
      let isStreakBroken = false;
      
      // Kiểm tra mất chuỗi (nếu cách nhau hơn 1 ngày)
      if (diffDays > 1) {
          nextLoginDays = 1;
          isStreakBroken = true;
      }
      
      if (isStreakBroken) {
          showNotification('Chuỗi đăng nhập đã bị đứt! Bắt đầu lại từ Ngày 1.', 'warning');
      }

      // Vòng lặp 7 ngày
      const currentRewardIndex = (nextLoginDays - 1) % dailyRewardsData.length;
      const reward = dailyRewardsData[currentRewardIndex];
      
      if (reward.type !== 'Xu') return; 

      const rewardCoins = reward.amount;
      const newBalance = currentUser.coinBalance + rewardCoins;
      const todayISOString = today.toISOString();

      try {
          await updateProfile({ 
              coinBalance: newBalance, 
              lastDailyLogin: todayISOString,
              consecutiveLoginDays: nextLoginDays,
          });

          showNotification(`Đã nhận ${rewardCoins} Xu thưởng đăng nhập Ngày ${nextLoginDays}!`, 'success');

      } catch (error) {
          showNotification('Lỗi khi nhận thưởng. Vui lòng thử lại.', 'error');
      }
  };


  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, updateProfile, updateAddresses, claimDailyReward }}>
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

// Dữ liệu phần thưởng giả lập 7 ngày
export const dailyRewardsData = [
    { day: 1, type: 'Xu', amount: 30, color: '#f7b731', icon: '../src/assets/images/coin.png' },
    { day: 2, type: 'Xu', amount: 50, color: '#28a745', icon: '../src/assets/images/coin.png' },
    { day: 3, type: 'Phiếu giảm giá', amount: 10, color: '#e63946', icon: 'FiTag' },
    { day: 4, type: 'Xu', amount: 70, color: '#f7b731', icon: '../src/assets/images/coin.png' },
    { day: 5, type: 'Xu', amount: 100, color: '#28a745', icon: '../src/assets/images/coin.png' },
    { day: 6, type: 'Xu', amount: 120, color: '#f7b731', icon: '../src/assets/images/coin.png' },
    { day: 7, type: 'Xu Đặc Biệt', amount: 200, color: '#747bff', icon: '../src/assets/images/coin.png' },
];