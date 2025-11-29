const orderModel = require('../models/orderModel');
const cartModel = require('../models/cartModel'); 
const comicModel = require('../models/comicModel');
const voucherModel = require('../models/voucherModel');

const createOrder = async (req, res) => {
    try {
        const userId = req.userId;
        // Lấy voucherCode từ request body
        const { fullName, phone, address, totalAmount, paymentMethod, items, voucherCode } = req.body;
        console.log("=== DEBUG CREATE ORDER ===");
        console.log("User ID:", userId);
        console.log("Payment Method:", paymentMethod);
        console.log("Voucher Code nhận được từ Frontend:", voucherCode); 

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Giỏ hàng trống' });
        }

        const orderId = await orderModel.createOrderRaw(
            userId, fullName, phone, address, totalAmount, paymentMethod, items
        );

        // Logic tăng lượt dùng Voucher
        if (voucherCode) {
            console.log(`Đang tăng lượt dùng cho voucher: ${voucherCode}`);
            try {
                await voucherModel.incrementVoucherUsage(voucherCode);
                console.log("-> Đã tăng lượt dùng thành công!");
            } catch (vErr) {
                console.error("-> LỖI khi tăng lượt dùng voucher:", vErr);
            }
        } else {
            console.log("-> KHÔNG thực hiện tăng voucher vì voucherCode bị rỗng hoặc undefined.");
        }

        if (paymentMethod === 'COD') {
            await cartModel.clearCartRaw(userId);

            try {
                for (const item of items) {
                    await comicModel.incrementSoldCount(item.id, item.quantity);
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

module.exports = { createOrder, getMyOrders };