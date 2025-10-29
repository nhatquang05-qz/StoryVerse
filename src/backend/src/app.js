// backend/src/app.js
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes'); // Đã bao gồm tất cả routes

const app = express();

// Cấu hình CORS chặt chẽ hơn nếu cần
app.use(cors({
  origin: 'http://localhost:5173', // Chỉ cho phép frontend này truy cập
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // Middleware để parse JSON body

// Gắn tất cả API routes vào tiền tố /api
app.use('/api', apiRoutes);

// Middleware xử lý lỗi cơ bản (nên đặt cuối cùng)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


module.exports = app;