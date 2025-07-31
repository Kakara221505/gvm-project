const express = require('express');
const router = express.Router();
const distributorController = require('../controllers/distributorController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { uploadMultiple } = require('../middlewares/upload');

router.post('/add_update_distributordetail',  uploadMultiple,authenticate, authorize(['admin', 'user']),distributorController.addUpdateDistributorDetail);
router.get('/get_distributordetails_with_pagination', authenticate, authorize(['admin', 'user']),distributorController.getDistributorDetailsWithPagination);
router.get('/:id',authenticate, authorize(['admin', 'user']),distributorController.getDistributorDetailById);
router.delete('/:UserID',authenticate,authorize(['admin', 'user']),distributorController.deleteDistributorDetail);
router.post('/update_kyc',authenticate,authorize(['admin', 'user']),distributorController.updateKycVerification);


module.exports = router;