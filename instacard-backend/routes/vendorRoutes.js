const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');

router.get('/dashboard/:id', vendorController.getVendorDashboard);
router.get('/revenue/:id', vendorController.getVendorRevenue); 
module.exports = router;