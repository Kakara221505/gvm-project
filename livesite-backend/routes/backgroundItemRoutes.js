const express = require('express');
const router = express.Router();
const backgroundController = require('../controllers/backgroundItemController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { uploadSingleBackGround} = require('../middlewares/upload');



router.post('/add_background',uploadSingleBackGround, authenticate,authorize(['admin', 'user','organization']),backgroundController.addBackground);
router.post('/add_background-initiate',uploadSingleBackGround, authenticate,authorize(['admin', 'user','organization']),backgroundController.addBackgroundInitiate);
router.get('/get_background_with_pagination',authenticate,authorize(['user','organization']),backgroundController.getBackgroundAllDataWithPagination);
router.post('/unassign-background', authenticate,authorize(['admin', 'user','organization']),backgroundController.unassignBackground);


module.exports = router;