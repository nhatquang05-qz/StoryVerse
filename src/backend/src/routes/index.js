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
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const postRoutes = require('./postRoutes');
const notificationRoutes = require('./notificationRoutes');
const flashSaleRoutes = require('./flashSaleRoutes');
const minigameRoutes = require('./minigameRoutes');
const contactRoutes = require('./contactRoutes');
const reportRoutes = require('./reportRoutes');
const communityRoutes = require('./communityRoutes');
const rankingRoutes = require('./rankingRoutes');
const giftCodeRoutes = require('./giftCodeRoutes');


router.use('/rankings', rankingRoutes);
router.use('/minigame', minigameRoutes);
router.use('/auth', authRoutes);
router.use('/comics', comicRoutes);
router.use('/users', userRoutes);
router.use('/address', addressRoutes);
router.use('/upload', uploadRoutes);
router.use('/rewards', rewardRoutes);
router.use('/chat', chatRoutes);
router.use('/chatbot', chatbotRoutes);
router.use('/admin', adminRoutes);
router.use('/payment', paymentRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/posts', postRoutes);
router.use('/notifications', notificationRoutes);
router.use('/flash-sales', flashSaleRoutes);
router.use('/reports', reportRoutes);
router.use('/contact', contactRoutes);
router.use('/community', communityRoutes);
router.use('/giftcode', giftCodeRoutes);

module.exports = router;