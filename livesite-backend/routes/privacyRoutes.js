const express = require('express');
const router = express.Router();
const privacyController = require('../controllers/privacyController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');



router.post('/add_update_privacy',authenticate,authorize(['admin', 'user','organization']),privacyController.addUpdatePrivacy);
router.get('/get_privacy',authenticate,authorize(['admin','organization','user']),privacyController.getPrivacy);



module.exports = router;