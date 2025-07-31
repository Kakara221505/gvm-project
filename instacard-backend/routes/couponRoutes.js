const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
// Define Routes
router.post('/create',authenticate,authorize(['admin', 'vendor']),couponController.createCoupon); 
router.get('/get-all', couponController.getAllCoupons); 
router.put('/:id', couponController.updateCoupon); 
router.get('/:id', couponController.getCouponById); 
router.delete('/:id', couponController.deleteCoupon); 
router.get('/get-activate', couponController.activeCoupon); 
router.post('/apply', couponController.applyCoupon); 


module.exports = router;
