const express = require('express');
const router = express.Router();
const variationController = require('../controllers/variationController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.post('/add_update_variation', authenticate,authorize(['admin', 'user']),variationController.addUpdateVariation);
router.get('/get_all_variation/:id',authenticate, authorize(['admin', 'user']),variationController.getAllVariationByProductID);
router.get('/:id', authenticate, authorize(['admin', 'user']), variationController.getVariationById);
router.delete('/:id', authenticate, authorize(['admin', 'user']), variationController.deleteVariation);

module.exports = router;