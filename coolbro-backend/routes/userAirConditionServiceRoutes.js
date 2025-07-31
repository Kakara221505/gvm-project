const express = require('express');
const router = express.Router();
const userAirConditionServiceController = require('../controllers/userAirConditionServiceController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { uploadUserAirConditionService } = require('../middlewares/upload');

router.post('/add_update_service', uploadUserAirConditionService,authenticate,authorize(['admin', 'user']),userAirConditionServiceController.addUpdateService);
router.get('/get_service_with_pagination',authenticate, authorize(['admin', 'user']),userAirConditionServiceController.getServiceWithPagination);
router.get('/:id', authenticate, authorize(['admin', 'user']), userAirConditionServiceController.getServiceById);
router.delete('/:id', authenticate, authorize(['admin', 'user']), userAirConditionServiceController.deleteServiceBYID);
router.get('/get_all_data/:id', authenticate, authorize(['admin', 'user']), userAirConditionServiceController.getAllServiceByUserID);


module.exports = router;