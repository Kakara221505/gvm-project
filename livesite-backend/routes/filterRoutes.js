const express = require('express');
const router = express.Router();
const filterController = require('../controllers/filterController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');



router.post('/add_update-filter',authenticate,authorize(['admin','organization','user']),filterController.addUpdateFilter);
router.get('/get_filter_all_data',authenticate,authorize(['admin','organization','user']),filterController.getFilterAllData);
router.get('/get_filter_by_id',authenticate,authorize(['admin','organization','user']),filterController.getFilterByID);
router.post('/apply_filter',authenticate,authorize(['admin','organization','user']),filterController.applyFilter);

module.exports = router;