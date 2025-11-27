const orderModel = require('../models/orderModel');
const cartModel = require('../models/cartModel'); 

const createOrder = async (req, res) => {
    try {
        const userId = req.userId;
        const { fullName, phone, address, totalAmount, paymentMethod, items } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Giỏ hàng trống' });
        }

        const orderId = await orderModel.createOrderRaw(
            userId, fullName, phone, address, totalAmount, paymentMethod, items
        );

        if (paymentMethod === 'COD') {
            await cartModel.clearCartRaw(userId);
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