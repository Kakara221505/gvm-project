const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { uploadSingle } = require('../middlewares/upload');

router.get('/', authenticate, userController.getUsers);
router.get('/:id', authenticate, authorize(['admin', 'user','vendor']), userController.getUserById);
router.delete('/:userId', authenticate,authorize(['admin', 'user','vendor']), userController.deleteUser);
router.post('/update_user', uploadSingle,  authenticate, authorize(['admin', 'user']), userController.updateUser);
router.get('/admin/userlist',  userController.getUsersForAdminDashboard);
module.exports = router;