const express = require('express');
const router = express.Router();
const { getAddresses, updateAddresses } = require('../controllers/addressController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/addresses', authenticateToken, getAddresses);
router.put('/addresses', authenticateToken, updateAddresses);

module.exports = router;