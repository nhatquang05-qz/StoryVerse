const userModel = require('../models/userModel'); 
const ensureUserDataTypes = require('../utils/ensureUserDataTypes');

const getMeService = async (userId) => {
    const userRow = await userModel.findUserById(userId); 
    
    if (!userRow) {
        throw { status: 404, error: 'User not found' };
    }

    const { password, ...userData } = userRow;
    const finalUserData = ensureUserDataTypes(userData);

    return finalUserData;
};

const updateProfileService = async (userId, { fullName, phone }) => {
    if (typeof fullName !== 'string' || fullName.trim() === '' || typeof phone !== 'string' || phone.trim() === '') {
        throw { status: 400, error: 'Họ tên và Số điện thoại không hợp lệ.' };
    }
    
    await userModel.updateProfileRaw(userId, fullName.trim(), phone.trim());

    const userRow = await userModel.findUserById(userId); 
    if (!userRow) throw { status: 404, error: 'User not found after update' };

    const { password, ...updatedUser } = userRow;
    const finalUserData = ensureUserDataTypes(updatedUser);

    return finalUserData;
};

const updateAvatarService = async (userId, avatarUrl) => {
    if (!avatarUrl || typeof avatarUrl !== 'string') {
        throw { status: 400, error: 'Avatar URL không hợp lệ.' };
    }
    await userModel.updateAvatarRaw(userId, avatarUrl);
    await userModel.createNotificationRaw(
        userId,
        'Hồ sơ',
        'Ảnh đại diện của bạn đang chờ duyệt. Vui lòng đợi quản trị viên kiểm tra.',
        'SYSTEM'
    );

    return { message: 'Đã gửi yêu cầu đổi ảnh đại diện. Vui lòng chờ duyệt.' };
};

const getTopUsersService = async (limit = 10) => {
    try {
        const safeLimit = Math.max(1, Math.floor(parseInt(limit)));        
        const rows = await userModel.getTopUsersRaw(safeLimit);
        const topUsers = rows.map(user => ({
             id: String(user.id),
             fullName: user.fullName || 'Người dùng ẩn danh',
             level: parseInt(user.level) || 1,
             avatarUrl: user.avatarUrl || 'https://via.placeholder.com/45',
             score: parseFloat(user.score) || 0,             
             levelSystem: user.levelSystem || 'Bình Thường' 
        }));

        return topUsers;

    } catch (error) {
        console.error("Get top users error in service:", error);
        throw { status: 500, error: error.message || 'Failed to fetch top users' };
    }
};

const getUnlockedChaptersService = async (userId) => {
    try {
        return await userModel.getUnlockedChaptersRaw(userId);
    } catch (error) {
        console.error("Get unlocked chapters error in service:", error);
        throw { status: 500, error: 'Failed to fetch unlocked chapters' };
    }
};

const getWishlistService = async (userId) => {
    try {
        const rows = await userModel.getWishlistRaw(userId);
        const comicsWithRating = rows.map(comic => ({
            ...comic,
            isDigital: comic.isDigital === 1,
            averageRating: parseFloat(comic.averageRating) || 0,
            totalReviews: parseInt(comic.totalReviews) || 0,
            price: parseFloat(comic.price) || 0,
            viewCount: parseInt(comic.viewCount) || 0,
        }));

        return comicsWithRating;
    } catch (error) {
        console.error("Get wishlist error in service:", error);
        throw { status: 500, error: 'Failed to fetch wishlist' };
    }
};

const toggleWishlistService = async (userId, comicId) => {
    if (!comicId) {
        throw { status: 400, error: 'Comic ID is required' };
    }

    try {
        const existing = await userModel.findWishlistEntry(userId, comicId);

        let isAdded = false;
        if (existing) {
            await userModel.toggleWishlistRemove(userId, comicId);
        } else {
            const comicExists = await userModel.checkComicExists(comicId);
            if (!comicExists) {
                 throw { status: 404, error: 'Comic not found' };
            }

            await userModel.toggleWishlistAdd(userId, comicId);
            isAdded = true;
        }

        return { message: 'Wishlist updated successfully', isAdded };
    } catch (error) {
        console.error("Toggle wishlist error in service:", error);
        throw { status: error.status || 500, error: error.error || 'Failed to update wishlist' };
    }
};

const getAllUsersService = async () => {
    try {
        const rows = await userModel.getAllUsersRaw();
        
        const users = rows.map(user => ({
            ...user,
            id: String(user.id),
            coinBalance: parseInt(user.coinBalance) || 0,
            level: parseInt(user.level) || 1,
            exp: parseFloat(user.exp) || 0,
            isBanned: user.isBanned === 1,
        }));

        return users;
    } catch (error) {
        console.error("Admin Get All Users error in service:", error);
        throw { status: 500, error: 'Failed to fetch users' };
    }
};

const updateUserService = async (id, { coinBalance, level, exp }) => {
    if (coinBalance === undefined || level === undefined || exp === undefined) {
        throw { status: 400, error: 'Vui lòng cung cấp đủ thông tin coinBalance, level, và exp' };
    }

    try {
        await userModel.updateAdminUserRaw(id, coinBalance, level, exp);

        return { message: 'Cập nhật người dùng thành công' };
    } catch (error) {
        console.error("Admin Update User error in service:", error);
        throw { status: 500, error: 'Failed to update user' };
    }
};

const toggleUserBanService = async (id, isBanned) => {
    if (isBanned === undefined) {
        throw { status: 400, error: 'Trạng thái isBanned là bắt buộc' };
    }
    
    try {
        await userModel.toggleUserBanRaw(id, isBanned);

        const actionText = isBanned ? 'Cấm' : 'Bỏ cấm';
        return { message: `${actionText} người dùng thành công` };
    } catch (error) {
        console.error("Admin Toggle Ban error in service:", error);
        throw { status: 500, error: 'Failed to update user ban status' };
    }
};

const deleteUserByIdService = async (id) => {
    try {
        await userModel.deleteUserDependenciesRaw(id);
        
        const affectedRows = await userModel.deleteUserRaw(id);

        if (affectedRows === 0) {
            throw { status: 404, error: 'Người dùng không tồn tại' };
        }

        return { message: 'Xóa vĩnh viễn người dùng thành công' };
    } catch (error) {
        console.error("Admin Delete User error in service:", error);
        throw { status: error.status || 500, error: error.error || 'Failed to delete user' };
    }
};

const updateLevelSystemService = async (userId, systemKey) => {
    await userModel.updateLevelSystemRaw(userId, systemKey);
    const updatedUser = await getMeService(userId);
    return updatedUser;
};

const getPublicUserProfileService = async (targetUserId) => {
    try {
        const user = await userModel.getPublicUserByIdRaw(targetUserId);
        if (!user) throw { status: 404, error: 'Người dùng không tồn tại' };

        const comments = await userModel.getUserRecentCommentsRaw(targetUserId);

        return {
            id: String(user.id),
            fullName: user.fullName || 'Người dùng ẩn danh',
            avatarUrl: user.avatarUrl || 'https://via.placeholder.com/150',
            level: parseInt(user.level) || 1,
            levelSystem: user.levelSystem || 'Bình Thường',
            joinDate: user.createdAt,
            exp: parseFloat(user.exp) || 0,
            
            recentComments: comments.map(c => ({
                id: c.id,
                content: c.message,
                createdAt: c.createdAt,
                comicTitle: c.comicTitle,
                comicCover: c.coverImageUrl,
                comicId: c.comicId,
                chapterNumber: c.chapterNumber,
                chapterTitle: c.chapterTitle
            }))
        };
    } catch (error) {
        console.error("Get public profile error:", error);
        throw { status: error.status || 500, error: 'Lỗi lấy thông tin người dùng' };
    }
};

const getPendingAvatarsService = async () => {
    return await userModel.getPendingAvatarsRaw();
};

const approveAvatarService = async (userId) => {
    const newAvatarUrl = await userModel.approveAvatarRaw(userId);
    
    if (newAvatarUrl) {
        await userModel.createNotificationRaw(
            userId,
            'Hồ sơ',
            'Avatar của bạn đã được thay đổi thành công!',
            'SYSTEM'
        );
    }
    return { message: 'Đã duyệt ảnh đại diện thành công.' };
};

const rejectAvatarService = async (userId) => {
    await userModel.rejectAvatarRaw(userId);
    await userModel.createNotificationRaw(
        userId,
        'Hồ sơ',
        'Ảnh đại diện bị từ chối. Vui lòng chọn hình ảnh hợp lệ (không nhạy cảm, bạo lực).',
        'SYSTEM'
    );
    return { message: 'Đã từ chối ảnh đại diện.' };
};

module.exports = { 
    getMeService, 
    updateProfileService, 
    updateAvatarService, 
    getTopUsersService, 
    getUnlockedChaptersService, 
    getWishlistService, 
    toggleWishlistService,
    getAllUsersService,
    updateUserService,
    toggleUserBanService,
    deleteUserByIdService,
    updateLevelSystemService,
    getPublicUserProfileService,    
    getPendingAvatarsService,
    approveAvatarService,
    rejectAvatarService
};