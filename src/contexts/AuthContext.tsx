import React, { createContext, useState, useContext, type ReactNode, useCallback} from 'react';
import { useNotification } from './NotificationContext';

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
  consecutiveLoginDays: number;
  level: number;
  exp: number;
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<User | null>;
  updateAddresses: (addresses: Address[]) => Promise<void>;
  claimDailyReward: () => Promise<void>;
  addExp: (amount: number, source: 'reading' | 'recharge', coinIncrease?: number) => Promise<void>;
  getLevelColor: (level: number) => string;
  selectedSystemKey: string;
  updateSelectedSystemKey: (newKey: string) => void;
  getEquivalentLevelTitle: (userLevel: number) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USER_STORAGE_KEY = 'storyverse_user';
const PROFILE_DATA_KEY = 'storyverse_user_profile';
const ADDRESSES_DATA_KEY = 'storyverse_user_addresses';
const LEVEL_SYSTEM_STORAGE_KEY = 'user_level_system';

const BASE_EXP_PER_PAGE = 0.05;
const BASE_EXP_PER_COIN = 0.2;
const EXP_RATE_REDUCTION_FACTOR = 0.5;

const LEVEL_COLORS: { [key: number]: string } = {
    1: '#6c757d', 2: '#007bff', 3: '#28a745', 4: '#ffc107', 5: '#dc3545',
    6: '#6f42c1', 7: '#d704d5', 8: '#ecdcef', 9: '#eb4107', 10: '#441498',
    11: '#306983', 12: '#e919a7', 13: '#fef750', 14: '#1d93f3', 15: '#f87b77',
    16: '#df7ee2', 17: '#90037e', 18: '#eeb5ea', 19: '#16c4b0', 20: '#25d2b0'
};
const DEFAULT_LEVEL_COLOR = '#6c757d';

interface LevelSystem {
    key: string;
    name: string;
    description: string;
    levels: string[];
    minLevels: number[];
}

const LEVEL_SYSTEMS: LevelSystem[] = [
    { key: 'Bình Thường', name: 'Bình Thường', description: 'Hệ thống cấp bậc cơ bản từ Cấp 0 đến Cấp 15+.', levels: ['Cấp 0', 'Cấp 1', 'Cấp 2', 'Cấp 3', 'Cấp 4', 'Cấp 5', 'Cấp 6', 'Cấp 7', 'Cấp 8', 'Cấp 9', 'Cấp 10', 'Cấp 11', 'Cấp 12', 'Cấp 13', 'Cấp 14', 'Cấp 15+'], minLevels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
    { key: 'Tu Tiên', name: 'Tu Tiên', description: 'Thế giới tu luyện linh khí, truy cầu trường sinh bất tử.', levels: ['Phàm nhân', 'Luyện Khí', 'Trúc Cơ', 'Kim Đan', 'Nguyên Anh', 'Hóa Thần', 'Hợp Thể', 'Đại Thừa', 'Phi Thăng', 'Tiên Nhân'], minLevels: [0, 1, 2, 4, 6, 7, 8, 10, 12, 15], },
    { key: 'Game', name: 'Game', description: 'Thế giới trò chơi, nhân vật thăng cấp, săn boss, vượt nhiệm vụ.', levels: ['Vô hạng', 'Đồng', 'Bạc', 'Vàng', 'Bạch Kim', 'Kim Cương', 'Huyền Thoại', 'Cao thủ', 'Thách đấu'], minLevels: [0, 1, 3, 5, 7, 9, 11, 13, 15], },
    { key: 'Ma Vương', name: 'Ma Vương', description: 'Thế giới hắc ám, ma giới, chiến đấu với anh hùng và thần linh.', levels: ['Ma thường', 'Ma Nhân', 'Ma Sĩ', 'Ma Tướng', 'Ma Tôn', 'Ma Đế', 'Ma Thần', 'Ma Vương', 'Hắc Ma Vạn Tôn'], minLevels: [0, 1, 3, 5, 7, 9, 11, 13, 15], },
    { key: 'Pháp Sư', name: 'Pháp Sư', description: 'Thế giới phép thuật, học viện, chiến đấu bằng ma pháp và trí tuệ.', levels: ['Học đồ', 'Pháp sư sơ cấp', 'Pháp sư trung cấp', 'Pháp sư cao cấp', 'Đại Pháp Sư', 'Pháp Thánh', 'Pháp Thần', 'Ma đạo sư'], minLevels: [0, 1, 3, 6, 9, 11, 13, 15], },
    { key: 'Tinh Không', name: 'Tinh Không', description: 'Thế giới vũ trụ, du hành giữa các hành tinh và hệ sao.', levels: ['Binh lính', 'Chiến Sĩ', 'Vệ Tinh', 'Tinh Vương', 'Tinh Hoàng', 'Tinh Đế', 'Tinh Tôn', 'Vũ Trụ Chi Chủ'], minLevels: [0, 1, 3, 6, 9, 11, 13, 15], }
];

const getLevelColor = (level: number): string => {
    const applicableLevels = Object.keys(LEVEL_COLORS).map(Number).filter(l => l <= level).sort((a, b) => b - a);
    const highestApplicableLevel = applicableLevels[0];
    return LEVEL_COLORS[highestApplicableLevel] || DEFAULT_LEVEL_COLOR;
};

const mockDefaultAddress: Address = { id: 'default-1', street: '123 Đường Nguyễn Huệ', ward: 'Phường 1', district: 'Quận 1', city: 'TP. Hồ Chí Minh', isDefault: true, };
const loadAddresses = (userId: string): Address[] => { try { const storedAddresses = localStorage.getItem(ADDRESSES_DATA_KEY + userId); const addresses: Address[] = storedAddresses ? JSON.parse(storedAddresses) : []; if (addresses.length === 0 && userId) { return [mockDefaultAddress]; } return addresses.sort((a, b) => (a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1)); } catch (e) { return userId ? [mockDefaultAddress] : []; } };
const saveAddresses = (userId: string, addresses: Address[]): void => { try { localStorage.setItem(ADDRESSES_DATA_KEY + userId, JSON.stringify(addresses)); } catch (e) { console.error("Failed to save addresses", e); } };
const loadProfileData = (baseUser: { id: string, email: string }): User => { try { const storedProfile = localStorage.getItem(PROFILE_DATA_KEY + baseUser.id); const profile: Partial<User> = storedProfile ? JSON.parse(storedProfile) : {}; const defaultProfile = { fullName: baseUser.email.split('@')[0] || 'Khách Hàng', phone: '0000000000', coinBalance: 1000, lastDailyLogin: '2000-01-01T00:00:00.000Z', consecutiveLoginDays: 0, level: 1, exp: 0, }; const loadedLevel = typeof profile.level === 'number' && profile.level >= 1 ? profile.level : defaultProfile.level; const loadedExp = typeof profile.exp === 'number' && profile.exp >= 0 && profile.exp <= 100 ? profile.exp : defaultProfile.exp; return { ...baseUser, ...defaultProfile, ...profile, level: loadedLevel, exp: loadedExp, addresses: loadAddresses(baseUser.id), } as User; } catch (e) { console.error("Failed to load profile data", e); return { ...baseUser, fullName: baseUser.email.split('@')[0] || 'Khách Hàng', phone: '0000000000', addresses: loadAddresses(baseUser.id), coinBalance: 1000, lastDailyLogin: '2000-01-01T00:00:00.000Z', consecutiveLoginDays: 0, level: 1, exp: 0, } as User; } };
const saveProfileData = (userId: string, profileData: Partial<User>): void => { try { const storedProfile = localStorage.getItem(PROFILE_DATA_KEY + userId); const currentProfile: Partial<User> = storedProfile ? JSON.parse(storedProfile) : {}; const { addresses, ...dataToSave } = { ...currentProfile, ...profileData }; localStorage.setItem(PROFILE_DATA_KEY + userId, JSON.stringify(dataToSave)); } catch (e) { console.error("Failed to save profile data", e); } };

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
            console.error("Error loading user from storage:", error);
            return null;
        }
    });
    const { showNotification } = useNotification();

    const [selectedSystemKey, setSelectedSystemKey] = useState<string>(() => {
        return localStorage.getItem(LEVEL_SYSTEM_STORAGE_KEY) || 'Bình Thường';
    });

    const updateSelectedSystemKey = useCallback((newKey: string) => {
        setSelectedSystemKey(newKey);
        localStorage.setItem(LEVEL_SYSTEM_STORAGE_KEY, newKey);
    }, []);

    const getEquivalentLevelTitle = useCallback((userLevel: number): string => {
        const system = LEVEL_SYSTEMS.find(s => s.key === selectedSystemKey) || LEVEL_SYSTEMS[0];
        let matchingLevel = system.levels[0];
        for (let i = system.minLevels.length - 1; i >= 0; i--) {
            if (userLevel >= system.minLevels[i]) {
                matchingLevel = system.levels[i];
                break;
            }
        }
        return matchingLevel;
    }, [selectedSystemKey]);

    const login = async (email: string, pass: string) => {
        const baseUser = { id: 'user-' + email, email: email };
        const fullUser = loadProfileData(baseUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ id: fullUser.id, email: fullUser.email }));
        saveProfileData(fullUser.id, fullUser);
        saveAddresses(fullUser.id, fullUser.addresses);
        setCurrentUser(fullUser);
        const storedSystemKey = localStorage.getItem(LEVEL_SYSTEM_STORAGE_KEY) || 'Bình Thường';
        setSelectedSystemKey(storedSystemKey);
        showNotification('Đăng nhập thành công!', 'success');
    };

    const register = async (email: string, pass: string) => {
        if (!email || !pass) throw new Error("Email/Pass required (mock)");
        const baseUser = { id: 'user-' + email, email: email };
        const defaultUser = loadProfileData(baseUser);
        saveProfileData(baseUser.id, defaultUser);
        saveAddresses(baseUser.id, defaultUser.addresses);
        localStorage.setItem(LEVEL_SYSTEM_STORAGE_KEY, 'Bình Thường');
        showNotification('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
    };

    const logout = async () => {
        setCurrentUser(null);
        localStorage.removeItem(USER_STORAGE_KEY);
        setSelectedSystemKey('Bình Thường');
        showNotification('Đã đăng xuất.', 'info');
    };

    const updateProfile = useCallback(async (profileData: Partial<User>): Promise<User | null> => { return new Promise((resolve) => { setCurrentUser(prevUser => { if (!prevUser) { resolve(null); return null; } const updatedUser = { ...prevUser, ...profileData }; saveProfileData(prevUser.id, updatedUser); if (Object.keys(profileData).some(key => !['level', 'exp', 'coinBalance'].includes(key))) { showNotification('Cập nhật hồ sơ thành công!', 'success'); } resolve(updatedUser); return updatedUser; }); }); }, [showNotification]);
    const updateAddresses = async (addresses: Address[]) => { if (!currentUser) { throw new Error('User not logged in.'); } await new Promise(resolve => setTimeout(resolve, 100)); const sortedAddresses = addresses.sort((a, b) => (a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1)); saveAddresses(currentUser.id, sortedAddresses); setCurrentUser(prevUser => { if (!prevUser) return null; return { ...prevUser, addresses: sortedAddresses, }; }); showNotification('Cập nhật địa chỉ thành công!', 'success'); };
    const claimDailyReward = async () => { if (!currentUser) { showNotification('Vui lòng đăng nhập để nhận thưởng.', 'warning'); return; } const today = new Date(); const lastLoginDate = new Date(currentUser.lastDailyLogin); const oneDay = 24 * 60 * 60 * 1000; const diffDays = Math.round(Math.abs((today.getTime() - lastLoginDate.getTime()) / oneDay)); const isSameDay = today.getFullYear() === lastLoginDate.getFullYear() && today.getMonth() === lastLoginDate.getMonth() && today.getDate() === lastLoginDate.getDate(); if (isSameDay) { showNotification('Bạn đã nhận thưởng hàng ngày hôm nay rồi!', 'info'); return; } let nextLoginDays = currentUser.consecutiveLoginDays + 1; if (diffDays > 1) { nextLoginDays = 1; showNotification('Chuỗi đăng nhập đã bị đứt! Bắt đầu lại từ Ngày 1.', 'warning'); } const currentRewardIndex = (nextLoginDays - 1) % dailyRewardsData.length; const reward = dailyRewardsData[currentRewardIndex]; if (reward.type !== 'Xu') return; const rewardCoins = reward.amount; const newBalance = currentUser.coinBalance + rewardCoins; const todayISOString = today.toISOString(); try { await updateProfile({ coinBalance: newBalance, lastDailyLogin: todayISOString, consecutiveLoginDays: nextLoginDays }); showNotification(`Đã nhận ${rewardCoins} Xu thưởng đăng nhập Ngày ${nextLoginDays}!`, 'success'); } catch (error) { showNotification('Lỗi khi nhận thưởng. Vui lòng thử lại.', 'error'); } };
    const addExp = useCallback(async (amount: number, source: 'reading' | 'recharge', coinIncrease: number = 0) => { setCurrentUser(prevUser => { if (!prevUser) return null; let baseExpGain = 0; if (source === 'reading') { baseExpGain = BASE_EXP_PER_PAGE * amount; } else if (source === 'recharge') { baseExpGain = BASE_EXP_PER_COIN * amount; } const modifier = Math.pow(EXP_RATE_REDUCTION_FACTOR, prevUser.level - 1); const actualExpGain = baseExpGain * modifier; let currentBalance = prevUser.coinBalance + coinIncrease; let newExp = prevUser.exp + actualExpGain; let newLevel = prevUser.level; let levelUpOccurred = false; while (newExp >= 100) { newLevel += 1; newExp -= 100; levelUpOccurred = true; } const updatedUserData: Partial<User> = { level: newLevel, exp: Math.min(100, Math.max(0, newExp)), coinBalance: currentBalance }; const updatedUser = { ...prevUser, ...updatedUserData }; saveProfileData(prevUser.id, updatedUser); if (levelUpOccurred) { showNotification(`Chúc mừng! Bạn đã lên Cấp ${newLevel}!`, 'success'); } return updatedUser; }); await new Promise(resolve => setTimeout(resolve, 10)); }, [showNotification]);

    return (
        <AuthContext.Provider value={{
            currentUser,
            login,
            register,
            logout,
            updateProfile,
            updateAddresses,
            claimDailyReward,
            addExp,
            getLevelColor,
            selectedSystemKey,
            updateSelectedSystemKey,
            getEquivalentLevelTitle
        }}>
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

export const dailyRewardsData = [
    { day: 1, type: 'Xu', amount: 30, color: '#f7b731', icon: '../src/assets/images/coin.png' },
    { day: 2, type: 'Xu', amount: 50, color: '#28a745', icon: '../src/assets/images/coin.png' },
    { day: 3, type: 'Xu', amount: 60, color: '#e63946', icon: '../src/assets/images/coin.png' },
    { day: 4, type: 'Xu', amount: 70, color: '#f7b731', icon: '../src/assets/images/coin.png' },
    { day: 5, type: 'Xu', amount: 100, color: '#28a745', icon: '../src/assets/images/coin.png' },
    { day: 6, type: 'Xu', amount: 120, color: '#f7b731', icon: '../src/assets/images/coin.png' },
    { day: 7, type: 'Xu', amount: 200, color: '#747bff', icon: '../src/assets/images/coin.png' },
];