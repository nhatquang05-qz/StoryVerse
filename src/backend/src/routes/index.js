const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const comicRoutes = require('./comicRoutes');
const uploadRoutes = require('./uploadRoutes');
const rewardRoutes = require('./rewardRoutes');
const addressRoutes = require('./addressRoutes');
const chatRoutes = require('./chatRoutes');
const chatbotRoutes = require('./chatbotRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/comics', comicRoutes);
router.use('/upload', uploadRoutes);
router.use('/rewards', rewardRoutes);
router.use('/address', addressRoutes);
router.use('/chat', chatRoutes);
router.use('/chatbot', chatbotRoutes);

module.exports = router;