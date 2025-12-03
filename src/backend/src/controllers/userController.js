const userService = require('../services/userService');
const paymentModel = require('../models/paymentModel');

const getMe = async (req, res) => {
  try {
    const finalUserData = await userService.getMeService(req.userId);
    res.json(finalUserData);
  } catch (error) {
    const status = error.status || 500;
    console.error("Get me error:", error);
    res.status(status).json({ error: error.error || 'Failed to fetch user data' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    const finalUserData = await userService.updateProfileService(req.userId, { fullName, phone });

    res.json(finalUserData);
  } catch (error) {
    const status = error.status || 500;
    console.error('Update profile error:', error);
    res.status(status).json({ error: error.error || 'Failed to update profile' });
  }
};

const updateAvatar = async (req, res) => {
    try {
        const { avatarUrl } = req.body;
        const result = await userService.updateAvatarService(req.userId, avatarUrl);

        res.json({ message: result.message, user: result.user });

    } catch (error) {
        const status = error.status || 500;
        console.error('Update avatar error:', error);
        res.status(status).json({ error: error.error || 'Failed to update avatar' });
    }
};

const getTopUsers = async (req, res) => {
    try {
        const limit = req.query.limit;
        const topUsers = await userService.getTopUsersService(limit);

        res.json(topUsers);

    } catch (error) {
        const status = error.status || 500;
        console.error("Get top users error:", error);
        res.status(status).json({ error: error.error || 'Failed to fetch top users' });
    }
};

const getUnlockedChapters = async (req, res) => {
    try {
        const { userId } = req;
        const rows = await userService.getUnlockedChaptersService(userId);
        res.json(rows);
    } catch (error) {
        const status = error.status || 500;
        console.error("Get unlocked chapters error:", error);
        res.status(status).json({ error: error.error || 'Failed to fetch unlocked chapters' });
    }
};

const getWishlist = async (req, res) => {
    try {
        const { userId } = req;
        const comicsWithRating = await userService.getWishlistService(userId);

        res.json(comicsWithRating);
    } catch (error) {
        const status = error.status || 500;
        console.error("Get wishlist error:", error);
        res.status(status).json({ error: error.error || 'Failed to fetch wishlist' });
    }
};

const toggleWishlist = async (req, res) => {
    try {
        const { userId } = req;
        const { comicId } = req.body;
        
        const result = await userService.toggleWishlistService(userId, comicId);

        res.json({ message: result.message, isAdded: result.isAdded });
    } catch (error) {
        const status = error.status || 500;
        console.error("Toggle wishlist error:", error);
        res.status(status).json({ error: error.error || 'Failed to update wishlist' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsersService();
        res.json(users);
    } catch (error) {
        const status = error.status || 500;
        console.error("Admin Get All Users error:", error);
        res.status(status).json({ error: error.error || 'Failed to fetch users' });
    }
};

const updateUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const { coinBalance, level, exp } = req.body;
        
        const result = await userService.updateUserService(id, { coinBalance, level, exp });

        res.json({ message: result.message });
    } catch (error) {
        const status = error.status || 500;
        console.error("Admin Update User error:", error);
        res.status(status).json({ error: error.error || 'Failed to update user' });
    }
};

const toggleUserBan = async (req, res) => {
    try {
        const { id } = req.params;
        const { isBanned } = req.body;
        
        const result = await userService.toggleUserBanService(id, isBanned);

        res.json({ message: result.message });
    } catch (error) {
        const status = error.status || 500;
        console.error("Admin Toggle Ban error:", error);
        res.status(status).json({ error: error.error || 'Failed to update user ban status' });
    }
};

const deleteUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await userService.deleteUserByIdService(id);

        res.json({ message: result.message });
    } catch (error) {
        const status = error.status || 500;
        console.error("Admin Delete User error:", error);
        res.status(status).json({ error: error.error || 'Failed to delete user' });
    }
};

const getTransactionHistory = async (req, res) => {
    try {
        const userId = req.userId;
        const history = await paymentModel.getTransactionHistoryRaw(userId);
        res.json(history);
    } catch (error) {
        console.error('Get History Error:', error);
        res.status(500).json({ message: 'Lỗi lấy lịch sử giao dịch' });
    }
};

const getUserDetailsAdmin = async (req, res) => {
    try {
        const { id } = req.params;        
        const [userProfile, transactions, unlockedChapters] = await Promise.all([
            userService.getMeService(id),
            paymentModel.getTransactionHistoryRaw(id),
            userService.getUnlockedChaptersService(id)
        ]);

        res.json({
            profile: userProfile,
            transactions: transactions,
            library: unlockedChapters
        });
    } catch (error) {
        console.error('Admin Get User Details Error:', error);
        res.status(500).json({ message: 'Lỗi lấy chi tiết người dùng' });
    }
};

const updateLevelSystem = async (req, res) => {
    try {
        const { systemKey } = req.body;
        const updatedUser = await userService.updateLevelSystemService(req.userId, systemKey);
        res.json({ message: 'Updated level system successfully', user: updatedUser });
    } catch (error) {
        const status = error.status || 500;
        console.error("Update Level System Error:", error);
        res.status(status).json({ error: error.error || 'Failed to update level system' });
    }
};

const getPublicUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const profile = await userService.getPublicUserProfileService(id);
        res.json(profile);
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ error: error.error || 'Failed to fetch user profile' });
    }
};

module.exports = { 
    getMe, 
    updateProfile, 
    updateAvatar, 
    getTopUsers, 
    getUnlockedChapters, 
    getWishlist, 
    toggleWishlist,
    getAllUsers,
    updateUserById,
    toggleUserBan,
    deleteUserById,
    getTransactionHistory,
    getUserDetailsAdmin,
    updateLevelSystem,
    getPublicUserProfile
};