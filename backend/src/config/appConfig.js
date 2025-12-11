require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key'; 
const PORT = process.env.PORT || 3000;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://localhost:5173';

const VNP_TMN_CODE = process.env.VNP_TMN_CODE || 'YOUR_TMN_CODE'; 
const VNP_HASH_SECRET = process.env.VNP_HASH_SECRET || 'YOUR_HASH_SECRET'; 
const VNP_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const VNP_RETURN_URL = `${FRONTEND_URL}/payment-return`; 

module.exports = {
    JWT_SECRET,
    PORT,
    GOOGLE_CLIENT_ID,
    EMAIL_HOST,
    EMAIL_PORT,
    EMAIL_USER,
    EMAIL_PASS,
    FRONTEND_URL,
    VNP_TMN_CODE,
    VNP_HASH_SECRET,
    VNP_URL,
    VNP_RETURN_URL
};