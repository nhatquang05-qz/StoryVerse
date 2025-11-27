const moment = require('moment');
const qs = require('qs');
const crypto = require('crypto');
const { VNP_TMN_CODE, VNP_HASH_SECRET, VNP_URL, VNP_RETURN_URL } = require('../config/appConfig');
const userModel = require('../models/userModel');
const rewardService = require('../services/rewardService');

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
        const { packId } = req.body;
        
        if (!req.userId) {
            return res.status(401).json({ message: 'Không tìm thấy thông tin người dùng' });
        }
        const userId = req.userId;
        
        const pack = rechargePacks.find(p => p.id === packId);
        if (!pack) {
            return res.status(400).json({ message: 'Gói nạp không hợp lệ' });
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
        vnp_Params['vnp_OrderInfo'] = `Nap xu goi ${packId} cho user ${userId}`;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = pack.price * 100;
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

                const packIdMatch = orderInfo.match(/goi\s*(\d+)/);
                const userIdMatch = orderInfo.match(/user\s*(\d+)/);

                if (packIdMatch && userIdMatch) {
                    const packId = parseInt(packIdMatch[1]);
                    const userId = parseInt(userIdMatch[1]);
                    const pack = rechargePacks.find(p => p.id === packId);

                    if (pack) {
                        const totalCoinsToAdd = pack.coins + pack.bonus;
                        const expToAdd = totalCoinsToAdd; 

                        // [SỬA LỖI TẠI ĐÂY]: Gọi đúng tên hàm addExpService và truyền Object
                        const result = await rewardService.addExpService(userId, {
                            amount: expToAdd,
                            source: 'recharge',
                            coinIncrease: totalCoinsToAdd
                        });
                        
                        return res.json({ 
                            status: 'success', 
                            message: 'Nạp xu thành công', 
                            data: { 
                                amount: totalCoinsToAdd, 
                                newBalance: result.coinBalance,
                                level: result.level,
                                exp: result.exp,
                                levelUpOccurred: result.levelUpOccurred 
                            } 
                        });
                    }
                }
                res.status(400).json({ status: 'error', message: 'Dữ liệu đơn hàng không khớp' });
            } catch (error) {
                console.error('DB Update Error:', error);
                // Trả về chi tiết lỗi để dễ debug
                res.status(500).json({ 
                    status: 'error', 
                    message: 'Lỗi cập nhật dữ liệu: ' + (error.error || error.message) 
                });
            }
        } else {
            res.json({ status: 'error', message: 'Giao dịch không thành công' });
        }
    } else {
        res.json({ status: 'error', message: 'Chữ ký không hợp lệ' });
    }
};

module.exports = { createPaymentUrl, vnpayReturn };