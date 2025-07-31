const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');




router.get('/get_category_all_data',authenticate,authorize(['admin','organization','user']),categoryController.getCategoryData);
router.post('/get_sub_category_all_data',authenticate,authorize(['admin','organization','user']),categoryController.getSubCategoryData);

module.exports = router;