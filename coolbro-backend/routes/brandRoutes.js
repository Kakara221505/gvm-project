const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { uploadBrand } = require('../middlewares/upload');

router.post('/add_update_brand', uploadBrand,authenticate,authorize(['admin', 'user']),brandController.addUpdateBrand);
router.get('/get_brand_with_pagination',brandController.getBrandWithPagination);
router.get('/:id', authenticate, authorize(['admin', 'user']), brandController.getBrandById);
router.delete('/:id', authenticate, authorize(['admin', 'user']), brandController.deleteBrand);

module.exports = router;