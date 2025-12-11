const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');
 
router.post('/subscribe', newsletterController.subscribe); 
router.post('/broadcast', newsletterController.sendBroadcast);

module.exports = router;