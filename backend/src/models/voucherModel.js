const { getConnection } = require('../db/connection');

const getAllVouchers = async (isAdmin = false) => {
    const connection = getConnection();
    
    const query = isAdmin 
        ? 'SELECT * FROM vouchers ORDER BY id DESC'
        : 'SELECT * FROM vouchers WHERE isActive = 1 AND (usageLimit IS NULL OR usedCount < usageLimit) AND (endDate IS NULL OR endDate > NOW())';
    const [rows] = await connection.execute(query);
    return rows;
};

const getVoucherByCode = async (code) => {
    const connection = getConnection();
    const [rows] = await connection.execute('SELECT * FROM vouchers WHERE code = ?', [code]);
    return rows[0];
};

const createVoucher = async (data) => {
    const connection = getConnection();
    const { 
        code, discountType, discountValue, minOrderValue, 
        maxDiscountAmount, startDate, endDate, usageLimit, isActive 
    } = data;

    const [result] = await connection.execute(
        `INSERT INTO vouchers 
        (code, discountType, discountValue, minOrderValue, maxDiscountAmount, startDate, endDate, usageLimit, isActive) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            code, 
            discountType, 
            discountValue, 
            minOrderValue || 0, 
            maxDiscountAmount || null, 
            startDate || null, 
            endDate || null, 
            usageLimit || null, 
            isActive ? 1 : 0
        ]
    );
    return result.insertId;
};

const updateVoucher = async (id, data) => {
    const connection = getConnection();
    const { 
        code, discountType, discountValue, minOrderValue, 
        maxDiscountAmount, startDate, endDate, usageLimit, isActive 
    } = data;

    await connection.execute(
        `UPDATE vouchers SET 
        code = ?, discountType = ?, discountValue = ?, minOrderValue = ?, 
        maxDiscountAmount = ?, startDate = ?, endDate = ?, usageLimit = ?, isActive = ? 
        WHERE id = ?`,
        [
            code, 
            discountType, 
            discountValue, 
            minOrderValue || 0, 
            maxDiscountAmount || null, 
            startDate || null, 
            endDate || null, 
            usageLimit || null, 
            isActive ? 1 : 0, 
            id
        ]
    );
};

const deleteVoucher = async (id) => {
    const connection = getConnection();
    await connection.execute('DELETE FROM vouchers WHERE id = ?', [id]);
};


const incrementVoucherUsage = async (code, userId) => {
    const connection = getConnection();
    
    
    await connection.execute('UPDATE vouchers SET usedCount = usedCount + 1 WHERE code = ?', [code]);    
    
    
    if (userId) {
        const [voucher] = await connection.execute('SELECT id FROM vouchers WHERE code = ?', [code]);
        if (voucher.length > 0) {
            await connection.execute(
                'INSERT IGNORE INTO user_voucher_usage (userId, voucherId) VALUES (?, ?)',
                [userId, voucher[0].id]
            );
        }
    }
};


const checkUserUsage = async (userId, voucherId) => {
    const connection = getConnection();
    const [rows] = await connection.execute(
        'SELECT id FROM user_voucher_usage WHERE userId = ? AND voucherId = ?',
        [userId, voucherId]
    );
    return rows.length > 0; 
};

module.exports = { 
    getAllVouchers, 
    getVoucherByCode, 
    createVoucher, 
    updateVoucher, 
    deleteVoucher, 
    incrementVoucherUsage,
    checkUserUsage 
};