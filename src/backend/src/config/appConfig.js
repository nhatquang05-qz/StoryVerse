const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key'; 
const PORT = process.env.PORT || 3000;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

module.exports = {
    JWT_SECRET,
    PORT,
    GOOGLE_CLIENT_ID,
    EMAIL_HOST,
    EMAIL_PORT,
    EMAIL_USER,
    EMAIL_PASS,
    FRONTEND_URL
};