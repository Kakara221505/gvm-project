const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.post('/add_order',authenticate,authorize(['user']),orderController.addOrder);
router.post('/get_order_list',authenticate,authorize(['user']),orderController.getOrderList);
router.get('/get_order_with_pagination', authenticate, authorize(['admin']), orderController.getOrderDetailsWithPagination);
router.get('/:id',authenticate,authorize(['admin', 'user']),orderController.getOrderDetails);

module.exports = router;