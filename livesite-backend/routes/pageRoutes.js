const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');



router.post('/add_page',authenticate,authorize(['admin', 'user','organization']),pageController.addUpdatePage);
router.get('/get_page_all_data',authenticate,authorize(['admin','user','organization']),pageController.getPageAllDataWithPagination);
router.post('/get_page_all_data_by_project_id',authenticate,authorize(['admin','user','organization']),pageController.getPageAllDataByProjectId);
router.delete('/:id', authenticate,authorize(['admin','organization','user']), pageController.deletePage);


module.exports = router;