import React, { createContext, useState, useContext, type ReactNode } from 'react';
import { useNotification } from './NotificationContext';
import { saveNewOrder, loadOrders, comics } from '../data/mockData';

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
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  updateAddresses: (addresses: Address[]) => Promise<void>;
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
        };

        return {
            ...baseUser,
            ...defaultProfile,
            ...profile,
            addresses: loadAddresses(baseUser.id),
        };
    } catch (e) {
        console.error("Failed to load profile data", e);
        return {
            ...baseUser,
            fullName: baseUser.email.split('@')[0] || 'Khách Hàng',
            phone: '0000000000',
            addresses: loadAddresses(baseUser.id),
        };
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

const createMockDigitalOrder = (userId: string, comicId: number) => {
    const digitalComic = comics.find(c => c.id === comicId);
    if (!digitalComic) return;

    const existingOrders = loadOrders(userId);
    if (existingOrders.some(order => order.id === 'MOCK-DIGITAL-1')) return;

    const mockOrder = {
        id: 'MOCK-DIGITAL-1',
        userId: userId,
        date: new Date().toLocaleDateString('vi-VN'),
        total: digitalComic.price,
        status: 'Hoàn thành' as const, 
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
    createMockDigitalOrder(mockUser.id, 1); 
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
        };
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


  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, updateProfile, updateAddresses }}>
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