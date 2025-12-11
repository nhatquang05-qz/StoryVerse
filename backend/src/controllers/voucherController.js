const voucherModel = require('../models/voucherModel');
const jwt = require('jsonwebtoken');

const getAdminVouchers = async (req, res) => {
    try {
        const vouchers = await voucherModel.getAllVouchers(true);
        res.json(vouchers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi lấy danh sách voucher' });
    }
};

const createVoucher = async (req, res) => {
    try {
        const existing = await voucherModel.getVoucherByCode(req.body.code);
        if (existing) {
            return res.status(400).json({ message: 'Mã voucher đã tồn tại' });
        }
        await voucherModel.createVoucher(req.body);
        res.json({ success: true, message: 'Tạo voucher thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi tạo voucher' });
    }
};

const updateVoucher = async (req, res) => {
    try {
        await voucherModel.updateVoucher(req.params.id, req.body);
        res.json({ success: true, message: 'Cập nhật voucher thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi cập nhật voucher' });
    }
};

const deleteVoucher = async (req, res) => {
    try {
        await voucherModel.deleteVoucher(req.params.id);
        res.json({ success: true, message: 'Xóa voucher thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi xóa voucher' });
    }
};

const validateVoucher = async (req, res) => {
    try {
        const { code, totalAmount } = req.body;
        
        let userId = null;
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        
        if (token) {
            try {
                
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id; 
            } catch (err) {
                
                console.log("Validate Voucher: Không lấy được UserID từ token.", err.message);
            }
        }
        

        const voucher = await voucherModel.getVoucherByCode(code);

        if (!voucher) {
            return res.status(404).json({ valid: false, message: 'Mã giảm giá không tồn tại' });
        }

        if (!voucher.isActive) {
            return res.status(400).json({ valid: false, message: 'Mã giảm giá đã bị khóa' });
        }

        const now = new Date();
        if (voucher.startDate && new Date(voucher.startDate) > now) {
            return res.status(400).json({ valid: false, message: 'Mã giảm giá chưa đến đợt áp dụng' });
        }
        if (voucher.endDate && new Date(voucher.endDate) < now) {
            return res.status(400).json({ valid: false, message: 'Mã giảm giá đã hết hạn' });
        }

        if (voucher.usageLimit !== null && voucher.usedCount >= voucher.usageLimit) {
            return res.status(400).json({ valid: false, message: 'Mã giảm giá đã hết lượt sử dụng' });
        }

        
        if (userId) {
            const hasUsed = await voucherModel.checkUserUsage(userId, voucher.id);
            if (hasUsed) {
                return res.status(400).json({ valid: false, message: 'Bạn đã sử dụng mã giảm giá này rồi' });
            }
        }

        if (totalAmount < voucher.minOrderValue) {
            return res.status(400).json({ 
                valid: false, 
                message: `Đơn hàng tối thiểu phải từ ${Number(voucher.minOrderValue).toLocaleString('vi-VN')}đ` 
            });
        }

        let discountAmount = 0;
        if (voucher.discountType === 'PERCENT') {
            discountAmount = (totalAmount * voucher.discountValue) / 100;
            if (voucher.maxDiscountAmount && discountAmount > voucher.maxDiscountAmount) {
                discountAmount = voucher.maxDiscountAmount;
            }
        } else {
            discountAmount = voucher.discountValue;
        }

        if (discountAmount > totalAmount) discountAmount = totalAmount;

        res.json({
            valid: true,
            message: 'Áp dụng thành công',
            data: {
                ...voucher,
                calculatedDiscount: discountAmount
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi kiểm tra voucher' });
    }
};

module.exports = { getAdminVouchers, createVoucher, updateVoucher, deleteVoucher, validateVoucher };