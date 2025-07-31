const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const upload = require('../middlewares/upload');
router.get('/vendors',adminController.getVendorsWithStats);
router.post('/add-user',adminController.addUser)
router.post('/cms/create', adminController.createCMS);
router.post('/upload', upload.uploadBannerImage,adminController.uploadCMSImage);
router.get('/dashboard', adminController.getAdminDashboardStats);
router.post('/add-vendor',upload.uploadSingle, adminController.createUserWithDetails)
module.exports = router;