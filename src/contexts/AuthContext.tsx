import React, { createContext, useState, useContext, type ReactNode, useCallback, useEffect } from 'react';
import { useNotification } from './NotificationContext';
import { useNavigate } from 'react-router-dom';
import type { CredentialResponse } from '@react-oauth/google'; 
import LevelUpPopup from '../components/popups/LevelUpPopup';
import LoginSuccessPopup from '../components/popups/LoginSuccessPopup';
import ErrorPopup from '../components/popups/ErrorPopup'; 
import RegisterSuccessPopup from '../components/popups/RegisterSuccessPopup'; 
import type { User, Address } from '../types/userTypes';
import {
    getLevelColor,
    getEquivalentLevelTitle as getEquivalentLevelTitleUtil, 
    ensureUserDataTypes} from '../utils/authUtils'; 
import LoadingPage from '../components/common/Loading/LoadingScreen';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const TOKEN_STORAGE_KEY = 'storyverse_token';
const LEVEL_SYSTEM_STORAGE_KEY = 'user_level_system';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: (credentialResponse: CredentialResponse) => Promise<void>; 
  updateProfile: (profileData: Partial<User>) => Promise<User | null>;
  updateAvatar: (avatarUrl: string) => Promise<User | null>; 
  updateAddresses: (addresses: Address[]) => Promise<void>;
  claimDailyReward: () => Promise<void>;
  addExp: (amount: number, source: 'reading' | 'recharge', coinIncrease?: number) => Promise<{
    level: number;
    exp: number;
    coinBalance: number;
    levelUpOccurred: boolean;
  } | null>;
  unlockChapter: (chapterId: number) => Promise<{
    level: number;
    exp: number;
    coinBalance: number;
    levelUpOccurred: boolean;
  } | null>;
  getLevelColor: (level: number) => string;
  selectedSystemKey: string;
  updateSelectedSystemKey: (newKey: string) => void;
  getEquivalentLevelTitle: (userLevel: number) => string;
  isLevelUpPopupOpen: boolean;
  levelUpInfo: { newLevel: number; levelTitle: string } | null;
  closeLevelUpPopup: () => void;
  isLoginSuccessPopupOpen: boolean;
  closeLoginSuccessPopup: () => void;
  showLoginError: (title: string, message: string) => void;
  isRegisterSuccessPopupOpen: boolean; 
  closeRegisterSuccessPopup: () => void; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    const [selectedSystemKey, setSelectedSystemKey] = useState<string>(() => {
        return localStorage.getItem(LEVEL_SYSTEM_STORAGE_KEY) || 'Bình Thường';
    });

    const [isLevelUpPopupOpen, setIsLevelUpPopupOpen] = useState(false);
    const [levelUpInfo, setLevelUpInfo] = useState<{ newLevel: number; levelTitle: string } | null>(null);
    
    const [isLoginSuccessPopupOpen, setIsLoginSuccessPopupOpen] = useState(false);
    const [usernameToDisplay, setUsernameToDisplay] = useState('');

    const [isLoginErrorPopupOpen, setIsLoginErrorPopupOpen] = useState(false);
    const [loginErrorTitle, setLoginErrorTitle] = useState('');
    const [loginErrorMessage, setLoginErrorMessage] = useState('');

    const [isRegisterSuccessPopupOpen, setIsRegisterSuccessPopupOpen] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const token = getToken();
            if (token) {
                try {
                    const resUser = await fetch(`${API_URL}/users/me`, { 
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (resUser.ok) {
                        const rawUserData = await resUser.json();
                        const userData = ensureUserDataTypes(rawUserData); 
                        setCurrentUser(userData);
                    } else {
                        localStorage.removeItem(TOKEN_STORAGE_KEY);
                        setCurrentUser(null);
                    }
                } catch (error) {
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
        return getEquivalentLevelTitleUtil(userLevel, selectedSystemKey);
    }, [selectedSystemKey]);

    const showLoginError = useCallback((title: string, message: string) => {
        setLoginErrorTitle(title);
        setLoginErrorMessage(message);
        setIsLoginErrorPopupOpen(true);
    }, []);

    const closeLoginErrorPopup = useCallback(() => {
        setIsLoginErrorPopupOpen(false);
        setLoginErrorTitle('');
        setLoginErrorMessage('');
    }, []);

    const closeRegisterSuccessPopup = useCallback(() => {
        setIsRegisterSuccessPopupOpen(false);
    }, []);

    const login = async (email: string, pass: string) => {
        setLoading(true); 
        try {
            const response = await fetch(`${API_URL}/auth/login`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify({ email, password: pass }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Email hoặc mật khẩu không đúng.');

            localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
            const userData = ensureUserDataTypes(data.user); 
            setCurrentUser(userData);

            setUsernameToDisplay(email.split('@')[0] || 'Người dùng');
            setIsLoginSuccessPopupOpen(true);
            
        } catch (error: any) {
             showLoginError('Đăng nhập không thành công','Tài khoản hoặc mật khẩu không đúng. Vui lòng thử lại.');
             throw error; 
        } finally {
            setLoading(false); 
        }
    };

    const loginWithGoogle = async (credentialResponse: CredentialResponse) => {
        if (!credentialResponse.credential) {
            throw new Error("Không nhận được thông tin xác thực từ Google.");
        }
        
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/google-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: credentialResponse.credential }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error('Đăng nhập Google thất bại');

            localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
            const userData = ensureUserDataTypes(data.user);
            setCurrentUser(userData);
            setUsernameToDisplay(userData.fullName || userData.email.split('@')[0] || 'Người dùng');
            setIsLoginSuccessPopupOpen(true);

        } catch (error: any) {
            showLoginError('Lỗi đăng nhập Google', 'Đăng nhập Google thất bại.');
            throw error; 
        } finally {
            setLoading(false);
        }
    };

    const register = async (email: string, pass: string) => {
         setLoading(true); 
         try {
            const response = await fetch(`${API_URL}/auth/register`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify({ email, password: pass }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error('Đăng ký thất bại');
            
            setIsRegisterSuccessPopupOpen(true);

         } catch (error: any) {
              showLoginError('Đăng ký thất bại',  'Tài khoản đã tồn tại.');
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

        try {
            const response = await fetch(`${API_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error('Cập nhật hồ sơ thất bại');
            }

            const rawUpdatedUser = await response.json();
            const updatedUser = ensureUserDataTypes(rawUpdatedUser); 

            setCurrentUser(prevUser => prevUser ? { ...prevUser, ...updatedUser } : updatedUser);
            showNotification('Cập nhật hồ sơ thành công!', 'success');
            return updatedUser;

        } catch (error: any) {
            showNotification('Đã xảy ra lỗi khi cập nhật hồ sơ.', 'error');
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
            const response = await fetch(`${API_URL}/users/profile/avatar`, { 
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ avatarUrl })
            });

             if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error('Cập nhật ảnh đại diện thất bại');
             }

            const data = await response.json(); 
            const updatedUser = ensureUserDataTypes(data.user); 
            setCurrentUser(updatedUser); 
            showNotification('Cập nhật ảnh đại diện thành công!', 'success');
            return updatedUser;

        } catch (error: any) {
            showNotification('Đã xảy ra lỗi khi cập nhật ảnh đại diện.', 'error');
            return null;
        } finally {
        }
    }, [currentUser, showNotification]); 


    const updateAddresses = async (addresses: Address[]) => {
        const token = getToken();
        if (!token) { return; }

        try {
             const response = await fetch(`${API_URL}/address/addresses`, { 
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ addresses })
            });

             if (!response.ok) { throw new Error('Cập nhật địa chỉ thất bại'); }

            const updatedAddresses = await response.json(); 
            setCurrentUser(prevUser => prevUser ? { ...prevUser, addresses: updatedAddresses } : null);
            showNotification('Cập nhật địa chỉ thành công!', 'success');

        } catch (error: any) { 
            showNotification('Lỗi cập nhật địa chỉ.', 'error');
        }
    };

    const claimDailyReward = async () => {
        const token = getToken();
        if (!currentUser) { return; }

        try {
            const response = await fetch(`${API_URL}/rewards/claim-reward`, { 
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error('Nhận thưởng thất bại');

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

        } catch (error: any) { 
            showNotification('Lỗi khi nhận thưởng.', 'error');
        }
    };

    const addExp = useCallback(async (
        amount: number, 
        source: 'reading' | 'recharge', 
        coinIncrease: number = 0
    ): Promise<{ level: number, exp: number, coinBalance: number, levelUpOccurred: boolean } | null> => {
        const token = getToken();
        if (!currentUser) return null; 

        try {
            const response = await fetch(`${API_URL}/rewards/add-exp`, { 
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ amount, source, coinIncrease })
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error('Lỗi khi cộng EXP');

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
            
            return data; 

        } catch (error: any) { 
            showNotification('Đã xảy ra lỗi khi cập nhật EXP/Xu.', 'error');
            return null; 
        }

    }, [currentUser, getEquivalentLevelTitle, showNotification]);
    
    const unlockChapter = useCallback(async (
        chapterId: number
    ): Promise<{ level: number, exp: number, coinBalance: number, levelUpOccurred: boolean } | null> => {
        const token = getToken();
        if (!currentUser) {
             showNotification('Vui lòng đăng nhập để mở khóa.', 'warning');
             throw new Error('User not logged in');
        }

        try {
            const response = await fetch(`${API_URL}/comics/unlock-chapter`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ chapterId })
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error('Lỗi khi mở khóa chương');

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
            
            return data; 

        } catch (error: any) { 
            showNotification('Đã xảy ra lỗi khi mở khóa chương.', 'error');
            throw error;
        }
    }, [currentUser, getEquivalentLevelTitle, showNotification]);


    const closeLevelUpPopup = useCallback(() => {
        setIsLevelUpPopupOpen(false);
        setLevelUpInfo(null);
    }, []);
    
    const closeLoginSuccessPopup = useCallback(() => {
        setIsLoginSuccessPopupOpen(false);
        navigate('/', { replace: true }); 
    }, [navigate]);

    if (loading) {
        return <LoadingPage />;
    }

    const contextValue = {
            currentUser,
            loading, 
            login,
            register,
            logout,
            loginWithGoogle, 
            updateProfile,
            updateAvatar,
            updateAddresses,
            claimDailyReward,
            addExp,
            unlockChapter,
            getLevelColor,
            selectedSystemKey,
            updateSelectedSystemKey,
            getEquivalentLevelTitle,
            isLevelUpPopupOpen,
            levelUpInfo,
            closeLevelUpPopup,
            isLoginSuccessPopupOpen,
            closeLoginSuccessPopup,
            showLoginError,
            isRegisterSuccessPopupOpen,
            closeRegisterSuccessPopup 
        };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
            {levelUpInfo && (
                <LevelUpPopup
                    isOpen={isLevelUpPopupOpen}
                    onClose={closeLevelUpPopup}
                    newLevel={levelUpInfo.newLevel}
                    levelTitle={levelUpInfo.levelTitle}
                />
             )}
            {isLoginSuccessPopupOpen && (
                <LoginSuccessPopup 
                    isOpen={isLoginSuccessPopupOpen} 
                    onClose={closeLoginSuccessPopup}
                    username={usernameToDisplay}
                />
            )}
            {isLoginErrorPopupOpen && (
                <ErrorPopup
                    isOpen={isLoginErrorPopupOpen}
                    onClose={closeLoginErrorPopup}
                    title={loginErrorTitle}
                    message={loginErrorMessage}
                />
            )}
            {isRegisterSuccessPopupOpen && (
                <RegisterSuccessPopup
                    isOpen={isRegisterSuccessPopupOpen}
                    onClose={closeRegisterSuccessPopup}
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

export { dailyRewardsData } from '../utils/authUtils'; 

function setIsSaving(arg0: boolean) {
    throw new Error('Function not implemented.');
}