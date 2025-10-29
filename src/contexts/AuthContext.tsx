import React, { createContext, useState, useContext, type ReactNode, useCallback, useEffect } from 'react';
import { useNotification } from './NotificationContext';
import LevelUpPopup from '../components/popups/LevelUpPopup';
import type { User, Address } from '../types/userTypes';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const TOKEN_STORAGE_KEY = 'storyverse_token';
const LEVEL_SYSTEM_STORAGE_KEY = 'user_level_system';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<User | null>;
  updateAvatar: (avatarUrl: string) => Promise<User | null>; 
  updateAddresses: (addresses: Address[]) => Promise<void>;
  claimDailyReward: () => Promise<void>;
  addExp: (amount: number, source: 'reading' | 'recharge', coinIncrease?: number) => Promise<void>;
  getLevelColor: (level: number) => string;
  selectedSystemKey: string;
  updateSelectedSystemKey: (newKey: string) => void;
  getEquivalentLevelTitle: (userLevel: number) => string;
  isLevelUpPopupOpen: boolean;
  levelUpInfo: { newLevel: number; levelTitle: string } | null;
  closeLevelUpPopup: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

const getToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);

const ensureUserDataTypes = (userData: any): User => {
    if (!userData) {

       console.warn("ensureUserDataTypes received null or undefined userData");
       return {} as User;
    }
    const safeData = { ...userData };

    try {
        safeData.exp = typeof safeData.exp === 'string' ? parseFloat(safeData.exp) : (safeData.exp || 0);
        if (isNaN(safeData.exp)) safeData.exp = 0;
    } catch (e) {
        safeData.exp = 0;
    }

    try {
        if (typeof safeData.addresses === 'string') {
           safeData.addresses = JSON.parse(safeData.addresses || '[]');
        }
        if (!Array.isArray(safeData.addresses)) safeData.addresses = [];
    } catch(e) {
        console.error("Error parsing addresses:", e, "Original value:", safeData.addresses);
        safeData.addresses = []; 
    }

    safeData.avatarUrl = String(safeData.avatarUrl || 'https://via.placeholder.com/150');

    safeData.level = parseInt(String(safeData.level || 1));
    if (isNaN(safeData.level) || safeData.level < 1) safeData.level = 1;

    safeData.coinBalance = parseInt(String(safeData.coinBalance || 0));
     if (isNaN(safeData.coinBalance)) safeData.coinBalance = 0;

    safeData.consecutiveLoginDays = parseInt(String(safeData.consecutiveLoginDays || 0));
     if (isNaN(safeData.consecutiveLoginDays)) safeData.consecutiveLoginDays = 0;

    if (typeof safeData.id !== 'undefined' && typeof safeData.id !== 'string') {
        safeData.id = String(safeData.id);
    }

    safeData.email = String(safeData.email || '');
    safeData.fullName = String(safeData.fullName || '');
    safeData.phone = String(safeData.phone || '');
    safeData.lastDailyLogin = String(safeData.lastDailyLogin || '2000-01-01T00:00:00.000Z'); 
    return safeData as User; 
};


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { showNotification } = useNotification();

    const [selectedSystemKey, setSelectedSystemKey] = useState<string>(() => {
        return localStorage.getItem(LEVEL_SYSTEM_STORAGE_KEY) || 'Bình Thường';
    });

    const [isLevelUpPopupOpen, setIsLevelUpPopupOpen] = useState(false);
    const [levelUpInfo, setLevelUpInfo] = useState<{ newLevel: number; levelTitle: string } | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            const token = getToken();
            if (token) {
                try {
                    const resUser = await fetch(`${API_URL}/me`, { 
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (resUser.ok) {
                        const rawUserData = await resUser.json();
                        const userData = ensureUserDataTypes(rawUserData); 
                        setCurrentUser(userData);
                    } else {
                        localStorage.removeItem(TOKEN_STORAGE_KEY);
                        setCurrentUser(null);
                        console.error("Failed to fetch user, status:", resUser.status);
                    }
                } catch (error) {
                    console.error("Failed to fetch user with token:", error);
                    localStorage.removeItem(TOKEN_STORAGE_KEY);
                    setCurrentUser(null);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false); 
            }
        };

        checkUser();
    }, []); 

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
        setLoading(true); 
        try {
            const response = await fetch(`${API_URL}/login`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify({ email, password: pass }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Đăng nhập thất bại');

            localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
            const userData = ensureUserDataTypes(data.user); 
            setCurrentUser(userData);
            showNotification('Đăng nhập thành công!', 'success');
        } catch (error: any) {
             showNotification(error.message || 'Đã xảy ra lỗi khi đăng nhập.', 'error');
             throw error;
        } finally {
            setLoading(false); 
        }
    };

    const register = async (email: string, pass: string) => {
         setLoading(true); 
         try {
            const response = await fetch(`${API_URL}/register`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify({ email, password: pass }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Đăng ký thất bại');
            showNotification('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
         } catch (error: any) {
              showNotification(error.message || 'Đã xảy ra lỗi khi đăng ký.', 'error');
              throw error;
         } finally {
             setLoading(false);
         }
    };

    const logout = async () => {
        setCurrentUser(null);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        showNotification('Đã đăng xuất.', 'info');
    };

    const updateProfile = useCallback(async (profileData: Partial<User>): Promise<User | null> => {
        const token = getToken();
        if (!token) {
            showNotification('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
            return null;
        }

        setIsSaving(true);
        try {
            const response = await fetch(`${API_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.error || 'Cập nhật hồ sơ thất bại');
            }

            const rawUpdatedUser = await response.json();
            const updatedUser = ensureUserDataTypes(rawUpdatedUser); // Chuẩn hóa dữ liệu trả về

            // Cập nhật state currentUser
            setCurrentUser(prevUser => prevUser ? { ...prevUser, ...updatedUser } : updatedUser);
            showNotification('Cập nhật hồ sơ thành công!', 'success');
            return updatedUser;

        } catch (error: any) {
            console.error('Lỗi khi cập nhật hồ sơ:', error);
            showNotification(error.message || 'Đã xảy ra lỗi khi cập nhật hồ sơ.', 'error');
            return null; 
        } finally {
        }
    }, [showNotification]); 

     const updateAvatar = useCallback(async (avatarUrl: string): Promise<User | null> => {
        const token = getToken();
        if (!token || !currentUser) {
            showNotification('Vui lòng đăng nhập để cập nhật ảnh đại diện.', 'error');
            return null;
        }

        try {
            const response = await fetch(`${API_URL}/profile/avatar`, { 
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ avatarUrl })
            });

             if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.error || 'Cập nhật ảnh đại diện thất bại');
             }

            const data = await response.json(); 
            const updatedUser = ensureUserDataTypes(data.user); 
            setCurrentUser(updatedUser); 
            showNotification('Cập nhật ảnh đại diện thành công!', 'success');
            return updatedUser;

        } catch (error: any) {
            console.error('Lỗi khi cập nhật avatar:', error);
            showNotification(error.message || 'Đã xảy ra lỗi khi cập nhật ảnh đại diện.', 'error');
            return null;
        } finally {
        }
    }, [currentUser, showNotification]); 


    const updateAddresses = async (addresses: Address[]) => {
        const token = getToken();
        if (!token) { /* ... (xử lý lỗi) ... */ return; }

        try {
             const response = await fetch(`${API_URL}/addresses`, { 
                method: 'PUT',
                headers: { /* ... */ 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ addresses })
            });

             if (!response.ok) { /* ... (xử lý lỗi) ... */ }

            const updatedAddresses = await response.json(); 
            setCurrentUser(prevUser => prevUser ? { ...prevUser, addresses: updatedAddresses } : null);
            showNotification('Cập nhật địa chỉ thành công!', 'success');

        } catch (error: any) { /* ... (xử lý lỗi) ... */ }
    };

    const claimDailyReward = async () => {
        const token = getToken();
        if (!currentUser) { /* ... */ return; }

        try {
            const response = await fetch(`${API_URL}/claim-reward`, { 
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Nhận thưởng thất bại');

            setCurrentUser(prevUser => prevUser ? {
                ...prevUser,
                coinBalance: data.newBalance,
                consecutiveLoginDays: data.nextLoginDays,
                lastDailyLogin: new Date().toISOString()
            } : null);

            if (data.notificationMessage.includes('Bắt đầu lại')) {
                 showNotification(data.notificationMessage, 'warning');
            } else {
                 showNotification(data.notificationMessage, 'success');
            }

        } catch (error: any) { /* ... (xử lý lỗi) ... */ }
    };

    const addExp = useCallback(async (amount: number, source: 'reading' | 'recharge', coinIncrease: number = 0) => {
        const token = getToken();
        if (!currentUser) return; 

        try {
            const response = await fetch(`${API_URL}/add-exp`, { 
                method: 'POST',
                headers: { /* ... */ 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ amount, source, coinIncrease })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Lỗi khi cộng EXP');

            setCurrentUser(prevUser => prevUser ? {
                ...prevUser,
                level: data.level,
                exp: data.exp,
                coinBalance: data.coinBalance
            } : null);

            if (data.levelUpOccurred) {
                const newLevelTitle = getEquivalentLevelTitle(data.level);
                setLevelUpInfo({ newLevel: data.level, levelTitle: newLevelTitle });
                setIsLevelUpPopupOpen(true);
            }
        } catch (error: any) { /* ... (xử lý lỗi) ... */ }

    }, [currentUser, getEquivalentLevelTitle, showNotification]);

    const closeLevelUpPopup = useCallback(() => {
        setIsLevelUpPopupOpen(false);
        setLevelUpInfo(null);
    }, []);

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5rem', color: 'var(--clr-text)' }}>Đang tải dữ liệu người dùng...</div>;
    }

    const contextValue = {
            currentUser,
            loading, 
            login,
            register,
            logout,
            updateProfile,
            updateAvatar,
            updateAddresses,
            claimDailyReward,
            addExp,
            getLevelColor,
            selectedSystemKey,
            updateSelectedSystemKey,
            getEquivalentLevelTitle,
            isLevelUpPopupOpen,
            levelUpInfo,
            closeLevelUpPopup
        };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
            {/* Render popup level up nếu cần */}
            {levelUpInfo && (
                <LevelUpPopup
                    isOpen={isLevelUpPopupOpen}
                    onClose={closeLevelUpPopup}
                    newLevel={levelUpInfo.newLevel}
                    levelTitle={levelUpInfo.levelTitle}
                />
             )}
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
    { day: 1, type: 'Xu', amount: 30, color: '#f7b731', icon: '/src/assets/images/coin.png' }, 
    { day: 2, type: 'Xu', amount: 50, color: '#28a745', icon: '/src/assets/images/coin.png' },
    { day: 3, type: 'Xu', amount: 60, color: '#e63946', icon: '/src/assets/images/coin.png' },
    { day: 4, type: 'Xu', amount: 70, color: '#f7b731', icon: '/src/assets/images/coin.png' },
    { day: 5, type: 'Xu', amount: 100, color: '#28a745', icon: '/src/assets/images/coin.png' },
    { day: 6, type: 'Xu', amount: 120, color: '#f7b731', icon: '/src/assets/images/coin.png' },
    { day: 7, type: 'Xu', amount: 200, color: '#747bff', icon: '/src/assets/images/coin.png' },
];

function setIsSaving(arg0: boolean) {
    throw new Error('Function not implemented.');
}
