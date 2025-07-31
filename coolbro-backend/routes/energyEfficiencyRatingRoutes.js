const express = require('express');
const router = express.Router();
const energyEfficiencyRatingController = require('../controllers/energyEfficiencyRatingController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.post('/add_update_energyfficiencyrating',authenticate,authorize(['admin', 'user']),energyEfficiencyRatingController.addUpdateEnergyEfficiencyRating);
router.get('/get_energyfficiencyrating_with_pagination',authenticate, authorize(['admin', 'user']),energyEfficiencyRatingController.getEnergyEfficiencyRatingWithPagination);
router.get('/:id', authenticate, authorize(['admin', 'user']), energyEfficiencyRatingController.getEnergyEfficiencyRatingId);
router.delete('/:id', authenticate, authorize(['admin', 'user']), energyEfficiencyRatingController.deleteEnergyEfficiencyRating);

module.exports = router;