const GiftCode = require('../models/giftcodeModel');
const { getConnection } = require('../db/connection');

const redeemGiftCode = async (req, res) => {

    const { code } = req.body;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    let connection;
    try {
        const giftCode = await GiftCode.findByCode(code);
        if (!giftCode || !giftCode.isActive) return res.status(404).json({ success: false, message: 'Mã không tồn tại hoặc đã bị khóa.' });
        
        if (giftCode.expiryDate && new Date(giftCode.expiryDate) < new Date()) {
             return res.status(400).json({ success: false, message: 'Mã quà tặng đã hết hạn.' });
        }
        if (giftCode.usageLimit > 0 && giftCode.usedCount >= giftCode.usageLimit) {
             return res.status(400).json({ success: false, message: 'Mã quà tặng đã hết lượt sử dụng.' });
        }

        const isUsed = await GiftCode.checkUsage(userId, giftCode.id);
        if (isUsed) return res.status(400).json({ success: false, message: 'Bạn đã sử dụng mã này rồi.' });

        connection = await getConnection();
        await connection.beginTransaction();

        try {
            await GiftCode.recordUsage(userId, giftCode.id, connection);
            await GiftCode.incrementUsedCount(giftCode.id, connection);
            await GiftCode.updateUserRewards(userId, giftCode.coinReward, giftCode.expReward, connection);
            
            if (giftCode.voucherId) {
                await GiftCode.addVoucherToUser(userId, giftCode.voucherId, connection);
            }

            await connection.commit();
            res.status(200).json({ success: true, message: 'Đổi quà thành công!' });
        } catch (err) {
            await connection.rollback();
            throw err;
        }
    } catch (error) {
        console.error(error);
        if (connection) try { await connection.rollback(); } catch(e){}
        res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
};


const getAllGiftCodes = async (req, res) => {
    try {
        const codes = await GiftCode.getAll();
        res.status(200).json(codes);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách giftcode' });
    }
};

const createGiftCode = async (req, res) => {
    try {
        await GiftCode.create(req.body);
        res.status(201).json({ success: true, message: 'Tạo giftcode thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi tạo giftcode (Có thể trùng mã)' });
    }
};

const updateGiftCode = async (req, res) => {
    try {
        const { id } = req.params;
        await GiftCode.update(id, req.body);
        res.status(200).json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi cập nhật' });
    }
};

const deleteGiftCode = async (req, res) => {
    try {
        const { id } = req.params;
        await GiftCode.delete(id);
        res.status(200).json({ success: true, message: 'Xóa thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi xóa giftcode' });
    }
};

module.exports = { 
    redeemGiftCode,
    getAllGiftCodes,
    createGiftCode,
    updateGiftCode,
    deleteGiftCode
};