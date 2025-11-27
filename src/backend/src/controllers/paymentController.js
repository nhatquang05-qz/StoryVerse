// src/backend/src/controllers/paymentController.js
const moment = require('moment');
const qs = require('qs');
const crypto = require('crypto');
const { VNP_TMN_CODE, VNP_HASH_SECRET, VNP_URL, VNP_RETURN_URL } = require('../config/appConfig');
const userModel = require('../models/userModel');
const rewardService = require('../services/rewardService');
const paymentModel = require('../models/paymentModel');
const orderModel = require('../models/orderModel'); 

const rechargePacks = [
    { id: 1, coins: 500, price: 20000, bonus: 50 },
    { id: 2, coins: 1500, price: 50000, bonus: 100 },
    { id: 3, coins: 3100, price: 100000, bonus: 300 },
    { id: 4, coins: 6500, price: 200000, bonus: 800 }, 
    { id: 5, coins: 20000, price: 500000, bonus: 1200 },
    { id: 6, coins: 45000, price: 1000000, bonus: 2000 },
];

function sortObject(obj) {
	let sorted = {};
	let str = [];
	let key;
	for (key in obj){
		if (obj.hasOwnProperty(key)) {
		str.push(encodeURIComponent(key));
		}
	}
	str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

const createPaymentUrl = async (req, res) => {
    try {
        const { paymentType, packId, amount, orderReference } = req.body;
        
        if (!req.userId) {
            return res.status(401).json({ message: 'Không tìm thấy thông tin người dùng' });
        }
        const userId = req.userId;
        
        let finalAmount = 0;
        let orderInfo = '';

        if (paymentType === 'RECHARGE') {
            const pack = rechargePacks.find(p => p.id === packId);
            if (!pack) return res.status(400).json({ message: 'Gói nạp không hợp lệ' });
            
            finalAmount = pack.price;
            orderInfo = `Nap xu goi ${packId} cho user ${userId}`; 

        } else if (paymentType === 'PURCHASE') {
            if (!amount || amount <= 0) return res.status(400).json({ message: 'Số tiền không hợp lệ' });
            
            finalAmount = amount;          
            const ref = orderReference || moment().format('HHmmss'); 
            orderInfo = `Thanh toan don hang ${ref} user ${userId}`;
        } else {
            return res.status(400).json({ message: 'Loại thanh toán không hợp lệ' });
        }

        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');
        const orderId = moment(date).format('DDHHmmss'); 
        
        const ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = VNP_TMN_CODE;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = orderInfo;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = finalAmount * 100;
        vnp_Params['vnp_ReturnUrl'] = VNP_RETURN_URL;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;

        vnp_Params = sortObject(vnp_Params);

        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", VNP_HASH_SECRET);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
        vnp_Params['vnp_SecureHash'] = signed;
        
        const paymentUrl = VNP_URL + '?' + qs.stringify(vnp_Params, { encode: false });

        res.json({ paymentUrl });
    } catch (error) {
        console.error('Lỗi tạo URL thanh toán:', error);
        res.status(500).json({ message: 'Lỗi tạo giao dịch: ' + error.message });
    }
};

const vnpayReturn = async (req, res) => {
    let vnp_Params = req.body;
    let secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", VNP_HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    if (secureHash === signed) {
        if (vnp_Params['vnp_ResponseCode'] === '00') {
            try {
                let orderInfo = vnp_Params['vnp_OrderInfo'];
                try { orderInfo = decodeURIComponent(orderInfo); } catch(e) {}
                orderInfo = orderInfo.replace(/\+/g, ' '); 

                const vnpTxnRef = vnp_Params['vnp_TxnRef']; 
                const vnpAmount = parseInt(vnp_Params['vnp_Amount']) / 100;
              
                const rechargeMatch = orderInfo.match(/Nap xu goi\s*(\d+)\s*cho user\s*(\d+)/);
                
                if (rechargeMatch) {
                    const packId = parseInt(rechargeMatch[1]);
                    const userId = parseInt(rechargeMatch[2]);
                    const pack = rechargePacks.find(p => p.id === packId);

                    if (pack) {
                        const totalCoinsToAdd = pack.coins + pack.bonus;
                        const expToAdd = totalCoinsToAdd; 
                        const result = await rewardService.addExpService(userId, {
                            amount: expToAdd,
                            source: 'recharge',
                            coinIncrease: totalCoinsToAdd
                        });

                        await paymentModel.createTransactionRaw(
                            userId, vnpTxnRef, vnpAmount, 'SUCCESS', 'RECHARGE',
                            `Nạp gói ${packId}: ${totalCoinsToAdd} Xu`
                        );
                        
                        return res.json({ 
                            status: 'success', 
                            type: 'RECHARGE',
                            message: 'Nạp xu thành công', 
                            data: { 
                                amount: totalCoinsToAdd, 
                                newBalance: result.coinBalance,
                                level: result.level,
                                levelUpOccurred: result.levelUpOccurred 
                            } 
                        });
                    }
                }

                const purchaseMatch = orderInfo.match(/Thanh toan don hang\s*([a-zA-Z0-9]+)\s*user\s*(\d+)/);
                
                if (purchaseMatch) {
                    const orderRef = purchaseMatch[1]; 
                    const userId = parseInt(purchaseMatch[2]);

                    await paymentModel.createTransactionRaw(
                        userId, vnpTxnRef, vnpAmount, 'SUCCESS', 'PURCHASE',
                        `Thanh toán đơn hàng #${orderRef}`
                    );

                    await orderModel.updateOrderStatusRaw(orderRef, 'PAID');
                  
                    return res.json({ 
                        status: 'success', 
                        type: 'PURCHASE',
                        message: 'Thanh toán đơn hàng thành công',
                        data: { orderId: orderRef, amount: vnpAmount }
                    });
                }

                res.status(400).json({ status: 'error', message: 'Không nhận diện được loại giao dịch: ' + orderInfo });

            } catch (error) {
                console.error('DB Update Error:', error);
                res.status(500).json({ status: 'error', message: 'Lỗi cập nhật dữ liệu: ' + error.message });
            }
        } else {
            res.json({ status: 'error', message: 'Giao dịch không thành công' });
        }
    } else {
        res.json({ status: 'error', message: 'Chữ ký không hợp lệ' });
    }
};

module.exports = { createPaymentUrl, vnpayReturn };