const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');



router.post('/add_contact',authenticate,authorize(['admin', 'user','organization']),contactController.addContact);


module.exports = router;