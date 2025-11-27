const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const comicRoutes = require('./comicRoutes');
const userRoutes = require('./userRoutes');
const addressRoutes = require('./addressRoutes');
const uploadRoutes = require('./uploadRoutes');
const rewardRoutes = require('./rewardRoutes');
const chatRoutes = require('./chatRoutes');
const chatbotRoutes = require('./chatbotRoutes');
const adminRoutes = require('./adminRoutes');
const paymentRoutes = require('./paymentRoutes');

router.use('/auth', authRoutes);
router.use('/comics', comicRoutes);
router.use('/users', userRoutes);
router.use('/addresses', addressRoutes);
router.use('/upload', uploadRoutes);
router.use('/rewards', rewardRoutes);
router.use('/chat', chatRoutes);
router.use('/chatbot', chatbotRoutes);
router.use('/admin', adminRoutes);
router.use('/payment', paymentRoutes);

module.exports = router;