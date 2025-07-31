const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { uploadCategory } = require('../middlewares/upload');

router.post('/add_update_category', uploadCategory,authenticate,authorize(['admin', 'user']),categoryController.addUpdateCategory);
router.get('/get_category_with_pagination',authenticate, authorize(['admin', 'user']),categoryController.getCategoryWithPagination);
router.get('/:id', authenticate, authorize(['admin', 'user']), categoryController.getCategoryById);
router.delete('/:id', authenticate, authorize(['admin', 'user']), categoryController.deleteCategory);

module.exports = router;