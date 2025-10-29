const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const addressRoutes = require('./addressRoutes');
const rewardRoutes = require('./rewardRoutes');

router.use(authRoutes);
router.use(userRoutes);
router.use(addressRoutes);
router.use(rewardRoutes);

module.exports = router;