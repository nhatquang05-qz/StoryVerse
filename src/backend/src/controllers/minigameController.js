const service = require('../services/christmasService');
const voucherModel = require('../models/voucherModel');

const generateRandomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

exports.spin = async (req, res) => {
    try {        
        const data = await service.spinWheel(req.userId);  
        if (data.result && data.result.type === 'voucher') {
            const isPercent = Math.random() < 0.5;
            let discountType = 'FIXED';
            let discountValue = 0;
            let maxDiscountAmount = null;

            if (isPercent) {                
                discountType = 'PERCENT';
                discountValue = Math.floor(Math.random() * (15 - 10 + 1)) + 10;
                maxDiscountAmount = 50000; 
            } else {                
                discountType = 'FIXED';
                discountValue = (Math.floor(Math.random() * 5) + 1) * 10000;
            }
            
            const voucherCode = `GIFT${Date.now().toString().slice(-4)}${generateRandomString(4)}`;            
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + 7);
            
            await voucherModel.createVoucher({
                code: voucherCode,
                discountType: discountType,
                discountValue: discountValue,
                minOrderValue: 0,
                maxDiscountAmount: maxDiscountAmount,
                startDate: startDate,
                endDate: endDate,
                usageLimit: 1, 
                isActive: 1
            });

            
            if (data.historyId) {
                await service.updateHistoryReward(data.historyId, voucherCode);
            }
            
            data.result.value = voucherCode; 
            data.result.label = `Voucher giảm ${isPercent ? discountValue + '%' : (discountValue / 1000) + 'k'}`;
        }

        
        res.json(data);

    } catch (err) {
        console.error('Lỗi Minigame:', err);
        res.status(400).json({ message: err.message });
    }
};

exports.postWish = async (req, res) => {
    try {
        if (!req.body.content) return res.status(400).json({ message: "Nội dung trống" });
        const result = await service.addWish(req.userId, req.body.content);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getWishList = async (req, res) => {
    try {
        const list = await service.getWishes();
        res.json(list);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getInfo = async (req, res) => {
    try {
        const info = await service.getUserGameInfo(req.userId);
        res.json(info);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const history = await service.getEventHistory(req.userId);
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};