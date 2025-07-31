const express = require('express');
const router = express.Router();
const variationController = require('../controllers/variationController');
const authenticate = require('../middlewares/authenticate');



router.post('/add', authenticate, variationController.addVariation);
router.get('/get', authenticate, variationController.getVariations);
router.get('/:id', authenticate, variationController.getVariationById);
router.put('/update/:id', authenticate, variationController.updateVariation);
router.delete('/delete/:id', authenticate, variationController.deleteVariation);

module.exports = router;