const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.post('/add_update_cart',authenticate,authorize(['admin', 'user']),cartController.addUpdateCart);
router.get('/get_cart_with_pagination',authenticate,authorize(['admin', 'user']),cartController.getCartWithPagination);
router.delete('/:id', authenticate,authenticate,authorize(['admin', 'user']), authorize(['admin', 'user']), cartController.deleteCart);
router.get('/cart_item_count',authenticate,authorize(['admin', 'user']),cartController.getCartItemCount);

module.exports = router;