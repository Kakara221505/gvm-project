const express = require('express');
const addressController = require('../controllers/addressController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

// Define routes
router.post('/add', authenticate ,addressController.createAddress);
router.put('/:id', addressController.updateAddress);
router.get('/get-all', addressController.getAllAddresses);
router.delete('/:id', addressController.deleteAddress);
router.get('/:id', addressController.getAddressById);


module.exports = router;