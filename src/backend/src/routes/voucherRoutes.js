const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const { authenticateToken, authenticateAdmin } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

const extractUser = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (!err && user) {
                req.userId = user.id;            }

            next();
        });
    } else {
        next();
    }
};

router.post('/validate', extractUser, voucherController.validateVoucher);

router.get('/admin', authenticateAdmin, voucherController.getAdminVouchers);
router.post('/', authenticateAdmin, voucherController.createVoucher);
router.put('/:id', authenticateAdmin, voucherController.updateVoucher);
router.delete('/:id', authenticateAdmin, voucherController.deleteVoucher);

module.exports = router;