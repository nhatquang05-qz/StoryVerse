const db = require('../db/connection');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const axios = require('axios');

// Lấy cấu hình từ .env
const { 
    SEPAY_API_ENDPOINT, 
    SEPAY_STORE_ID, 
    SEPAY_SECRET_KEY,
    FRONTEND_URL,
    BACKEND_URL 
} = process.env;

// Tỷ giá (ví dụ: 1 VNĐ = 1 xu)
const COIN_CONVERSION_RATE = 1; 

/**
 * Hàm trợ giúp tạo chữ ký Sepay (SHA256)
 * @param {string} rawString - Chuỗi dữ liệu thô
 * @returns {string} Chữ ký
 */
function createSepayChecksum(rawString) {
    return crypto.createHash('sha256').update(rawString).digest('hex');
}

/**
 * Hàm chung để tạo yêu cầu thanh toán Sepay
 * @param {string} orderId - ID giao dịch/đơn hàng (từ hệ thống của bạn)
 * @param {number} amount - Số tiền
 * @param {string} orderDescription - Mô tả đơn hàng
 * @returns {Promise<string>} paymentUrl - URL thanh toán của Sepay
 */
async function createSepayPayment(orderId, amount, orderDescription) {
    const returnUrl = `${FRONTEND_URL}/payment/callback`;
    const ipnUrl = `${BACKEND_URL}/api/payment/sepay-ipn`;
    
    // 1. Tạo chuỗi checksum cho yêu cầu
    // Format: store_id + order_id + amount + secret_key
    const rawSignature = `${SEPAY_STORE_ID}${orderId}${amount}${SEPAY_SECRET_KEY}`;
    const checksum = createSepayChecksum(rawSignature);

    // 2. Chuẩn bị dữ liệu gửi sang Sepay
    const requestBody = {
        store_id: SEPAY_STORE_ID,
        order_id: orderId,
        amount: amount,
        order_description: orderDescription,
        return_url: returnUrl,
        ipn_url: ipnUrl,
        checksum: checksum,
    };

    // 3. Gửi yêu cầu sang Sepay
    try {
        const sepayResponse = await axios.post(SEPAY_API_ENDPOINT, requestBody);

        // Sepay trả về JSON, data.success = true và data.data.payment_url
        if (sepayResponse.data && sepayResponse.data.success) {
            return sepayResponse.data.data.payment_url;
        } else {
            // Ghi log lỗi từ Sepay
            console.error('Lỗi khi tạo thanh toán Sepay:', sepayResponse.data.message);
            throw new Error(sepayResponse.data.message || 'Sepay API trả về lỗi');
        }
    } catch (error) {
        console.error('Lỗi khi gọi API Sepay:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// 1. TẠO YÊU CẦU NẠP XU
exports.createCoinRecharge = async (req, res) => {
    const { amount } = req.body;
    const userId = req.user.id; // Lấy từ authMiddleware

    if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Số tiền không hợp lệ' });
    }

    const transaction_id = `COIN_${uuidv4()}`; // ID giao dịch (cần là duy nhất)
    const coins_received = Math.floor(amount * COIN_CONVERSION_RATE);
    const orderDescription = `Nap ${coins_received} xu vao tai khoan ${req.user.username}`;

    try {
        // 1. Lưu giao dịch 'pending' vào DB
        const query = 'INSERT INTO coin_transactions (transaction_id, user_id, amount, coins_received, status) VALUES (?, ?, ?, ?, ?)';
        await db.promise().query(query, [transaction_id, userId, amount, coins_received, 'pending']);

        // 2. Gọi hàm tạo thanh toán Sepay
        const paymentUrl = await createSepayPayment(transaction_id, amount, orderDescription);

        // 3. Trả URL về cho frontend
        res.status(200).json({ paymentUrl: paymentUrl });

    } catch (error) {
        console.error('Lỗi khi tạo giao dịch nạp xu:', error.message);
        // Nếu gọi Sepay lỗi, cập nhật DB
        await db.promise().query("UPDATE coin_transactions SET status = 'failed' WHERE transaction_id = ?", [transaction_id]);
        res.status(500).json({ message: 'Lỗi khi tạo yêu cầu thanh toán' });
    }
};

// 2. TẠO YÊU CẦU THANH TOÁN ĐƠN HÀNG (TRUYỆN IN)
exports.createOrderPayment = async (req, res) => {
    const { orderId, amount } = req.body; // orderId này là ID từ bảng `orders` của BẠN
    const userId = req.user.id;

    if (!orderId || !amount || amount <= 0) {
        return res.status(400).json({ message: 'Thông tin đơn hàng không hợp lệ' });
    }
    
    // Tạo 1 ID thanh toán duy nhất để gửi cho Sepay
    const payment_id = `ORDER_${orderId}_${uuidv4().substring(0, 8)}`;
    const orderDescription = `Thanh toan don hang #${orderId}`;

    try {
        // 1. Lưu thanh toán 'pending' vào DB
        // (Lưu ý: `orderId` là ID đơn hàng của bạn, `payment_id` là ID gửi cho Sepay)
        const query = 'INSERT INTO order_payments (payment_id, order_id, user_id, amount, status) VALUES (?, ?, ?, ?, ?)';
        await db.promise().query(query, [payment_id, orderId, userId, amount, 'pending']);

        // 2. Gọi hàm tạo thanh toán Sepay
        const paymentUrl = await createSepayPayment(payment_id, amount, orderDescription);

        // 3. Trả URL về cho frontend
        res.status(200).json({ paymentUrl: paymentUrl });

    } catch (error) {
        console.error('Lỗi khi tạo thanh toán đơn hàng:', error.message);
        await db.promise().query("UPDATE order_payments SET status = 'failed' WHERE payment_id = ?", [payment_id]);
        res.status(500).json({ message: 'Lỗi khi tạo yêu cầu thanh toán' });
    }
};

// 3. XỬ LÝ IPN (WEBHOOK) TỪ SEPAY
// Đây là nơi xác thực thanh toán (Server-to-Server)
// *** SỬ DỤNG `coinBalance` NHƯ BẠN YÊU CẦU ***
exports.handleSepayIPN = async (req, res) => {
    const {
        store_id,
        order_id, // Đây là transaction_id hoặc payment_id của chúng ta
        amount,
        status,
        tran_id, // ID giao dịch của Sepay
        checksum
    } = req.body;

    console.log('--- Received Sepay IPN: ---', req.body);

    try {
        // 1. Xác thực checksum
        // Format IPN: sha256(store_id + order_id + amount + status + tran_id + secret_key)
        const rawSignature = `${store_id}${order_id}${amount}${status}${tran_id}${SEPAY_SECRET_KEY}`;
        const expectedChecksum = createSepayChecksum(rawSignature);

        if (checksum !== expectedChecksum) {
            console.error('IPN Checksum mismatch!');
            // Trả lỗi cho Sepay (họ sẽ thử gửi lại)
            return res.status(400).json({ success: false, message: 'Invalid checksum' });
        }
        
        // 2. Checksum hợp lệ -> Xử lý nghiệp vụ (DÙNG TRANSACTION)
        const connection = await db.promise().getConnection();
        await connection.beginTransaction();

        try {
            // Kiểm tra xem `order_id` này là nạp xu hay thanh toán đơn hàng
            const isCoinRecharge = order_id.startsWith('COIN_');
            const isOrderPayment = order_id.startsWith('ORDER_');

            if (status === 1) { // Thanh toán THÀNH CÔNG (status=1 là thành công theo docs)
                
                if (isCoinRecharge) {
                    // Lấy giao dịch nạp xu
                    const [rows] = await connection.query('SELECT * FROM coin_transactions WHERE transaction_id = ? AND status = ? FOR UPDATE', [order_id, 'pending']);
                    const transaction = rows[0];

                    if (!transaction) {
                        console.warn(`IPN: Giao dịch nạp xu ${order_id} không tìm thấy hoặc đã xử lý.`);
                    } else {
                        // Cập nhật giao dịch
                        await connection.query('UPDATE coin_transactions SET status = ?, provider_transaction_id = ? WHERE transaction_id = ?', ['success', tran_id, order_id]);
                        
                        // ***SỬ DỤNG CỘT `coinBalance` CỦA BẠN***
                        await connection.query('UPDATE users SET coinBalance = coinBalance + ? WHERE id = ?', [transaction.coins_received, transaction.user_id]);
                        console.log(`IPN: Nạp xu ${transaction.coins_received} cho user ${transaction.user_id} thành công.`);
                    }

                } else if (isOrderPayment) {
                    // Lấy thanh toán đơn hàng
                    const [rows] = await connection.query('SELECT * FROM order_payments WHERE payment_id = ? AND status = ? FOR UPDATE', [order_id, 'pending']);
                    const payment = rows[0];

                    if (!payment) {
                        console.warn(`IPN: Thanh toán đơn hàng ${order_id} không tìm thấy hoặc đã xử lý.`);
                    } else {
                        // Cập nhật thanh toán
                        await connection.query('UPDATE order_payments SET status = ?, provider_transaction_id = ? WHERE payment_id = ?', ['success', tran_id, order_id]);
                        
                        // TODO: Cập nhật trạng thái đơn hàng (trong bảng `orders` của bạn)
                        // Ví dụ: await connection.query('UPDATE orders SET payment_status = ? WHERE id = ?', ['paid', payment.order_id]);
                        console.log(`IPN: Thanh toán cho đơn hàng ${payment.order_id} thành công.`);
                    }
                }

            } else { // Thanh toán THẤT BẠI (status != 1)
                
                if (isCoinRecharge) {
                    await connection.query("UPDATE coin_transactions SET status = 'failed' WHERE transaction_id = ? AND status = 'pending'", [order_id]);
                } else if (isOrderPayment) {
                    await connection.query("UPDATE order_payments SET status = 'failed' WHERE payment_id = ? AND status = 'pending'", [order_id]);
                }
                console.log(`IPN: Giao dịch ${order_id} thất bại (status: ${status}).`);
            }
            
            // Commit transaction
            await connection.commit();

        } catch (error) {
            // Nếu lỗi DB, rollback
            await connection.rollback();
            console.error('IPN: Lỗi xử lý DB:', error);
            // Trả lỗi 500 để Sepay thử gửi lại IPN
            return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        } finally {
            connection.release();
        }

        // 3. Phản hồi cho Sepay (bắt buộc)
        // Trả 200 và JSON { success: true } để Sepay biết đã nhận IPN
        res.status(200).json({ success: true });

    } catch (error) {
        console.error('IPN: Lỗi chung:', error);
        res.status(500).json({ success: false, message: 'Lỗi không xác định' });
    }
};