const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { uploadProductMedia } = require('../middlewares/upload');


router.get('/product-filter', productController.getProductFilter);
router.post('/search-product', productController.getProductList);
router.get('/product-details/:id', productController.getProductDetail);
router.get('/get_new_arrival_product', productController.getNewArrivalProducts);
router.post('/add_update_product', uploadProductMedia, authenticate, authorize(['admin', 'user']), productController.addUpdateProductDetail);
router.get('/get_product_with_pagination', authenticate, authorize(['admin', 'user']), productController.getProductDetailsWithPagination);
router.get('/:id', authenticate, authorize(['admin', 'user']), productController.getProductDetailById);
router.delete('/:id', authenticate, authorize(['admin']), productController.deleteProductDetail);



module.exports = router;