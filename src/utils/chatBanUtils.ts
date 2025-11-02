const BAN_INFO_KEY = 'chat_ban_info';

export interface BanInfo {
    date: string; 
    violations: number;
    banExpiry: number | null; 
}

const getCurrentDateString = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const getBanInfo = (userId: string): BanInfo => {
    const defaultInfo: BanInfo = { date: getCurrentDateString(), violations: 0, banExpiry: null };
    try {
        const allBanInfoStr = localStorage.getItem(BAN_INFO_KEY);
        const allBanInfo = allBanInfoStr ? JSON.parse(allBanInfoStr) : {};
        const userInfo: BanInfo | undefined = allBanInfo[userId];
        const todayStr = getCurrentDateString();

        if (!userInfo) {
            return defaultInfo;
        }

        if (userInfo.date !== todayStr) {
            return {
                date: todayStr,
                violations: 0,
                banExpiry: (userInfo.banExpiry && userInfo.banExpiry > Date.now()) ? userInfo.banExpiry : null,
            };
        }

        if (userInfo.banExpiry && userInfo.banExpiry <= Date.now()) {
             return { ...userInfo, banExpiry: null };
        }

        return userInfo; 
    } catch (error) {
        console.error("Error reading ban info:", error);
        return defaultInfo;
    }
};

export const setBanInfo = (userId: string, info: BanInfo): void => {
    try {
        const allBanInfoStr = localStorage.getItem(BAN_INFO_KEY);
        const allBanInfo = allBanInfoStr ? JSON.parse(allBanInfoStr) : {};
        allBanInfo[userId] = info;
        localStorage.setItem(BAN_INFO_KEY, JSON.stringify(allBanInfo));
    } catch (error) {
        console.error("Error saving ban info:", error);
    }
};

const BAN_DURATIONS_MINUTES = [
    0, 0, 0,          
    5, 0, 0,          
    15, 0, 0,         
    30, 0, 0,         
    60, 0, 0,         
    180, 0, 0,        
    300, 0, 0,       
    420, 0, 0,        
    600, 0, 0                 
];

export const calculateBanDurationMinutes = (violations: number): number => {
    if (violations <= 0) return 0;
    const index = Math.min(violations - 1, BAN_DURATIONS_MINUTES.length - 1);
    return BAN_DURATIONS_MINUTES[index];
};

export const formatRemainingTime = (expiryTimestamp: number | null): string | null => {
    if (!expiryTimestamp || expiryTimestamp <= Date.now()) {
        return null;
    }
    const remainingMs = expiryTimestamp - Date.now();
    const totalSeconds = Math.floor(remainingMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};