const express = require('express');
const router = express.Router();
const subCategoryController = require('../controllers/subCategoryController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { uploadSubCategory } = require('../middlewares/upload');

router.post('/add_update_sub_category', uploadSubCategory,authenticate,authorize(['admin', 'user']),subCategoryController.addUpdateSubCategory);
router.get('/get_sub_category_with_pagination',authenticate, authorize(['admin', 'user']),subCategoryController.getSubCategoryWithPagination);
router.get('/:id', authenticate, authorize(['admin', 'user']), subCategoryController.getSubCategoryById);
router.delete('/:id', authenticate, authorize(['admin', 'user']), subCategoryController.deleteSubCategory);

module.exports = router;