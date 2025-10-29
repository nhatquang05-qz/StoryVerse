// backend/src/routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const addressRoutes = require('./addressRoutes');
const rewardRoutes = require('./rewardRoutes');
const uploadRoutes = require('./uploadRoutes'); // Đã thêm
const comicRoutes = require('./comicRoutes');   // Thêm

router.use(authRoutes);
router.use(userRoutes);
router.use(addressRoutes);
router.use(rewardRoutes);
router.use(uploadRoutes); // Đã thêm
router.use(comicRoutes);   // Thêm

module.exports = router;