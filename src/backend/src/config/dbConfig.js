// backend/src/config/dbConfig.js
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // Lấy từ .env
  database: process.env.DB_NAME || 'storyverse_db'
};

module.exports = dbConfig;