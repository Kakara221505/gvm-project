const express = require('express');
const router = express.Router();
const dealerController = require('../controllers/dealerController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { uploadMultiple } = require('../middlewares/upload');

router.post('/add_update_dealerdetail',  uploadMultiple,authenticate, authorize(['admin', 'user']),dealerController.addUpdateDealerDetail);
router.get('/get_dealerdetails_with_pagination', authenticate, authorize(['admin', 'user']),dealerController.getDealerDetailsWithPagination);
router.get('/:id',authenticate, authorize(['admin', 'user']),dealerController.getDealerDetailById);
router.delete('/:UserID',authenticate,authorize(['admin', 'user']),dealerController.deleteDealerDetail);
router.post('/update_kyc',authenticate,authorize(['admin', 'user']),dealerController.updateKycVerification);
router.post('/search-dealer',dealerController.getDealerList);
router.get('/dealer-details/:id',dealerController.getDealerDetail);
router.post('/qrcode',dealerController.generateQRCode);


module.exports = router;