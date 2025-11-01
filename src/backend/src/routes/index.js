const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const comicRoutes = require('./comicRoutes');
const userRoutes = require('./userRoutes');
const rewardRoutes = require('./rewardRoutes');
const addressRoutes = require('./addressRoutes');
const uploadRoutes = require('./uploadRoutes');
const chatRoutes = require('./chatRoutes');
const chatbotRoutes = require('./chatbotRoutes');
const paymentRoutes = require('./paymentRoutes'); // THÊM DÒNG NÀY

router.use('/auth', authRoutes);
router.use('/comics', comicRoutes);
router.use('/users', userRoutes);
router.use('/rewards', rewardRoutes);
router.use('/addresses', addressRoutes);
router.use('/upload', uploadRoutes);
router.use('/chat', chatRoutes);
router.use('/chatbot', chatbotRoutes);
router.use('/payment', paymentRoutes); // THÊM DÒNG NÀY

module.exports = router;