const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { uploadSingle } = require('../middlewares/upload');

router.post("/check-registered", authenticate, userController.getRegisteredUsersByNameAndPhone);
router.get("/all_user_app", authenticate, userController.getAllUsersDataWithPagination);
router.get("/dashboard", authenticate, userController.getUserChatStats);
router.get('/blocked', authenticate, userController.getBlockedUsers);
router.get('/reported', authenticate, userController.getReportedUsers);
router.get('/avtar', userController.getAvtar);
router.get('/all_user', authenticate, userController.getAllUsersWithPagination);
router.get('/', authenticate, userController.getUsers);
router.get('/:id', authenticate, authorize(['admin', 'user']), userController.getUserById);
router.delete('/:userId', authenticate,authorize(['admin', 'user']), userController.deleteUser);
router.post('/update_user', uploadSingle,  authenticate, authorize(['admin', 'user']), userController.updateUser);
router.post("/block/:targetUserId", authenticate, userController.blockUser);
router.post("/unblock/:targetUserId", authenticate, userController.unblockUser);
router.post("/report/:targetUserId", authenticate, userController.reportUser);
router.post('/admin_update_user', uploadSingle,  authenticate, authorize(['admin', 'user']), userController.adminUpdateUser);
router.post("/blockByAdmin/:targetUserId", authenticate, userController.blockUserByAdmin);
router.post("/unblockByAdmin", authenticate, authorize('admin'), userController.unblockUserByAdmin);
router.post("/unblockByAdmin", authenticate, authorize('admin'), userController.unblockUserByAdmin);









module.exports = router;