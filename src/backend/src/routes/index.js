const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const addressRoutes = require('./addressRoutes');
const rewardRoutes = require('./rewardRoutes');
const uploadRoutes = require('./uploadRoutes'); 
const comicRoutes = require('./comicRoutes');   
const chatRoutes = require('./chatRoutes');
const chatbotRoutes = require('./chatbotRoutes');

router.use(authRoutes);
router.use(userRoutes);
router.use(addressRoutes);
router.use(rewardRoutes);
router.use(uploadRoutes); 
router.use(comicRoutes);   
router.use(chatRoutes);
router.use(chatbotRoutes);

module.exports = router;