const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');


router.get('/digital', rankingController.getDigitalComicsRanking);
router.get('/physical', rankingController.getPhysicalComicsRanking);
router.get('/members', rankingController.getMemberRanking);

module.exports = router;