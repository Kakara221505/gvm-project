const express = require('express');
const router = express.Router();
const shareController = require('../controllers/shareController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');



router.post('/add_update-share',authenticate,authorize(['admin','organization','user']),shareController.addUpdateShare);
router.get('/get_share_all_data',authenticate,authorize(['admin','organization','user']),shareController.getShareAllDataWithPagination);
router.post('/add_share',authenticate,authorize(['admin','organization','user']),shareController.addShare);
router.post('/get_user_type',authenticate,authorize(['admin','organization','user']),shareController.getUserType);
router.post('/get_share_all_data_with_access', authenticate, authorize(['admin', 'organization','user']), shareController.getShareAllData);
router.get('/get_share_project_by_organization',authenticate,authorize(['admin','organization','user']),shareController.getOranizationAllData);

module.exports = router;