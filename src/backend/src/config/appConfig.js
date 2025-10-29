// backend/src/config/appConfig.js
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key'; // Lấy từ .env
const PORT = process.env.PORT || 3000;

module.exports = {
    JWT_SECRET,
    PORT
};