const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const {brandImage} = require('../middlewares/upload');
const authorization = require('../middlewares/authorize');
const authenticate = require('../middlewares/authenticate');

router.post('/add',brandImage,authenticate, brandController.addBrand);
router.get('/get-all',brandImage, brandController.getAllBrands);
router.get('/:id',brandController.getBrandById);
router.put('/update/:id',brandImage ,brandController.updateBrand);
router.delete('/delete/:id',brandController.deleteBrand);
router.delete('/image/:id',brandController.deleteBrandImage);
router.get('/user/:id',brandController.getBrandsByUser);
module.exports = router;
