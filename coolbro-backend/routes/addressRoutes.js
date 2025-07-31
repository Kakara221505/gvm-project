const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.post('/add_update_address',authenticate,authorize(['admin', 'user']),addressController.addUpdateAddress);
router.get('/userid/:UserID', authenticate, authorize(['admin', 'user']), addressController.getAddressByUserId);
router.get('/:id', authenticate, authorize(['admin', 'user']), addressController.getAddressById);
router.delete('/:id',authenticate, authorize(['admin', 'user']),addressController.deleteAddress);



module.exports = router;