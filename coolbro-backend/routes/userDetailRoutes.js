const express = require('express');
const router = express.Router();
const userDetailController = require('../controllers/userDetailController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { uploadSingle } = require('../middlewares/upload');

router.post('/update_userdetail', uploadSingle,  authenticate, authorize(['admin', 'user']),userDetailController.updateUserDetail);
router.get('/get_userdetails_with_pagination', authenticate, authorize(['admin', 'user']), userDetailController.getUserDetailsWithPagination);
router.get('/:UserID', authenticate, authorize(['admin', 'user']), userDetailController.getUserDetailById);
router.delete('/:UserID', authenticate, authorize(['admin', 'user']),userDetailController.deleteUserDetail);

module.exports = router;