const express = require('express');
const orderController = require('../controllers/orderController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

// Define routes
router.post('/place-order',authenticate, orderController.placeOrder);
// router.get('/orders/:id', orderController.);
router.get('/my-order',authenticate, orderController.getMyOrders);
router.put('/orders/:id', orderController.updateShippingAddress);
router.put('/cancel/:id',authenticate, orderController.cancelOrder);
router.get('/cancel-orders',authenticate, orderController.getCancelledOrders);
router.get('/seller/:id',orderController.getOrdersBySellerId);


module.exports = router;