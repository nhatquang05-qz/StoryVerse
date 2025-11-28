const express = require('express');
const router = express.Router();
const packController = require('../controllers/packController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

router.get('/public', packController.getPublicPacks);

router.get('/admin', authenticateAdmin, packController.getAdminPacks);
router.post('/', authenticateAdmin, packController.createPack);
router.put('/:id', authenticateAdmin, packController.updatePack);
router.delete('/:id', authenticateAdmin, packController.deletePack);

module.exports = router;