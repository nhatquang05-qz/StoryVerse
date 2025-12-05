const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', contactController.getContacts); 
router.post('/reply', upload.single('attachment'), contactController.replyContact);
router.post('/', contactController.submitContact); 

module.exports = router;