const express = require('express');
const router = express.Router();
const contactUsController = require('../controllers/contactUsController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.post('/add_contactus',authenticate,authorize(['user']),contactUsController.addContactUs);
router.get('/get_contactus_with_pagination',authenticate, authorize(['admin']),contactUsController.getContactUsPagination);

module.exports = router;