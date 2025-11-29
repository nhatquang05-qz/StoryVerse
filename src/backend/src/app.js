const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes'); 
const app = express();
const compression = require('compression');
const corsOrigin = process.env.CORS_ORIGIN || 'https://localhost:5173';
const packRoutes = require('./routes/packRoutess');
const voucherRoutes = require('./routes/voucherRoutes');

app.use(compression());
app.use(cors({
  origin: corsOrigin, 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); 

app.use('/api', apiRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.use('/api/packs', packRoutes);
app.use('/api/vouchers', voucherRoutes);

module.exports = app;