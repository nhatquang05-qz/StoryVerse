const orderModel = require('../models/orderModel');
const cartModel = require('../models/cartModel'); 
const comicModel = require('../models/comicModel');
const voucherModel = require('../models/voucherModel');
const FlashSaleModel = require('../models/flashSaleModel');

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
                for (const item of items) {
                    await comicModel.incrementSoldCount(item.id, item.quantity);
                    
                    const saleInfo = await FlashSaleModel.getActiveFlashSaleForComic(item.id);
                    if (saleInfo) {
                        const remaining = saleInfo.quantityLimit - saleInfo.soldQuantity;
                        if (remaining > 0) {
                            const qtyToUpdate = Math.min(item.quantity, remaining);
                            await FlashSaleModel.updateSold(item.id, qtyToUpdate);
                        }
                    }
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