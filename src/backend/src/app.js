const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss'); 
const apiRoutes = require('./routes'); 
const app = express();
const compression = require('compression');
const corsOrigin = process.env.CORS_ORIGIN || 'https://localhost:5173';
const packRoutes = require('./routes/packRoutess');
const voucherRoutes = require('./routes/voucherRoutes');

app.use(helmet());
app.use(compression());
app.use(cors({
  origin: corsOrigin, 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const xssOptions = {
    whiteList: {},        
    stripIgnoreTag: true, 
    stripIgnoreTagBody: ['script', 'style'] 
};
const myXss = new xss.FilterXSS(xssOptions);

const cleanData = (data) => {
    if (!data) return;
    if (typeof data === 'object') {
        for (const key in data) {
            const value = data[key];
            if (typeof value === 'string') {
                data[key] = myXss.process(value);
            } else if (typeof value === 'object') {
                cleanData(value);
            }
        }
    }
};

app.use((req, res, next) => {
    if (req.body) cleanData(req.body);
    if (req.query) cleanData(req.query);
    if (req.params) cleanData(req.params);
    next();
});

app.use('/api', apiRoutes);
app.use('/api/packs', packRoutes);
app.use('/api/vouchers', voucherRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: err.message || 'Something broke!' 
    });
});

module.exports = app;