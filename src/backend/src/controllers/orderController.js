const orderModel = require('../models/orderModel');
const cartModel = require('../models/cartModel'); 
const comicModel = require('../models/comicModel');
const voucherModel = require('../models/voucherModel');
const paymentModel = require('../models/paymentModel'); 
const Notification = require('../models/notificationModel'); 
const FlashSaleModel = require('../models/flashSaleModel'); 
const { generateTransactionCode } = require('../utils/transactionGenerator'); 

const createOrder = async (req, res) => {
    try {
        const userId = req.userId;
        const { fullName, phone, address, totalAmount, paymentMethod, items, voucherCode } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Giỏ hàng trống' });
        }

        const orderId = await orderModel.createOrderRaw(
            userId, fullName, phone, address, totalAmount, paymentMethod, items
        );

        if (voucherCode) {
            try {
                await voucherModel.incrementVoucherUsage(voucherCode);
            } catch (vErr) {
                console.error("Lỗi voucher:", vErr);
            }
        }

        if (paymentMethod === 'COD') {
            await cartModel.clearCartRaw(userId);

            try {
                const transCode = generateTransactionCode('SV', orderId);
                await paymentModel.createTransactionRaw(
                    userId,
                    orderId,      
                    totalAmount,  
                    'PENDING',      
                    'PURCHASE',     
                    `Đặt hàng #${orderId} (Thanh toán khi nhận hàng)`,
                    transCode
                );
            } catch (transErr) {
                console.error('Lỗi tạo transaction COD:', transErr);
            }

            try {
                await Notification.create({
                    userId: userId,
                    type: 'ORDER',
                    title: 'Đặt hàng thành công',
                    message: `Đơn hàng <b>#${orderId}</b> đã được ghi nhận. Vui lòng thanh toán ${totalAmount.toLocaleString('vi-VN')}đ khi nhận hàng.`,
                    referenceId: orderId,
                    referenceType: 'ORDER'
                });
            } catch (notifErr) {
                console.error('Lỗi tạo thông báo COD:', notifErr);
            }

            try {
                for (const item of items) {
                    await comicModel.incrementSoldCount(item.id, item.quantity);
                    await FlashSaleModel.updateSold(item.id, item.quantity);
                }
            } catch (err) {
                console.error('Error incrementing sold count for COD:', err);
            }
        }

        res.json({ message: 'Tạo đơn hàng thành công', orderId });
    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({ message: 'Lỗi tạo đơn hàng' });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const userId = req.userId;
        const orders = await orderModel.getOrdersByUserIdRaw(userId);
        res.json(orders);
    } catch (error) {
        console.error('Get Orders Error:', error);
        res.status(500).json({ message: 'Lỗi lấy lịch sử đơn hàng' });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const orders = await orderModel.getAllOrdersRaw(limit, offset);
        const total = await orderModel.getOrderCountRaw();

        res.json({
            data: orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get All Orders Error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const adminUpdateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        await orderModel.updateOrderStatusRaw(id, status);

        const connection = require('../db/connection').getConnection();

        if (status === 'COMPLETED') {
            const [existing] = await connection.execute(
                'SELECT id FROM payment_transactions WHERE orderId = ? AND type = ?',
                [id, 'PURCHASE']
            );

            if (existing.length > 0) {
                await connection.execute(
                    `UPDATE payment_transactions SET status = 'SUCCESS' WHERE orderId = ? AND type = 'PURCHASE'`,
                    [id]
                );
            } else {
                const [orderRows] = await connection.execute('SELECT userId, totalAmount FROM orders WHERE id = ?', [id]);
                if (orderRows.length > 0) {
                    const { userId, totalAmount } = orderRows[0];
                    const transCode = generateTransactionCode('COD', id);
                    
                    await paymentModel.createTransactionRaw(
                        userId,
                        id,
                        totalAmount,
                        'SUCCESS',
                        'PURCHASE',
                        `Thanh toán đơn hàng #${id} (Hoàn tất bởi Admin)`,
                        transCode
                    );
                }
            }
            
            const [rows] = await connection.execute('SELECT userId FROM orders WHERE id = ?', [id]);
            if (rows.length > 0) {
                 await Notification.create({
                    userId: rows[0].userId,
                    type: 'ORDER',
                    title: 'Đơn hàng hoàn tất',
                    message: `Đơn hàng <b>#${id}</b> đã được giao thành công. Cảm ơn bạn đã mua sắm!`,
                    referenceId: id,
                    referenceType: 'ORDER'
                });
            }
        }
        else if (status === 'PAID') {
             await connection.execute(
                `UPDATE payment_transactions SET status = 'SUCCESS' WHERE orderId = ? AND type = 'PURCHASE'`,
                [id]
            );
        }
        else if (status === 'CANCELLED') {
             await connection.execute(
                `UPDATE payment_transactions SET status = 'FAILED' WHERE orderId = ? AND type = 'PURCHASE'`,
                [id]
            );
        }

        res.json({ message: 'Cập nhật trạng thái thành công' });
    } catch (error) {
        console.error('Update Status Error:', error);
        res.status(500).json({ message: 'Lỗi cập nhật trạng thái' });
    }
};

const getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const items = await orderModel.getOrderItemsRaw(id);
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy chi tiết' });
    }
};

module.exports = { 
    createOrder, 
    getMyOrders,
    getAllOrders,      
    adminUpdateStatus,
    getOrderDetails 
};