const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key'; 
const PORT = process.env.PORT || 3000;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

module.exports = {
    JWT_SECRET,
    PORT,
    GOOGLE_CLIENT_ID
};