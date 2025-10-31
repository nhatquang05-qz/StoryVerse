const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key'; 
const PORT = process.env.PORT || 3000;

module.exports = {
    JWT_SECRET,
    PORT
};