const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.post('/add',authenticate, authorize(["ADMIN","USER"]), notificationController.addNotification);
router.get('/get-user',authenticate, authorize(["ADMIN","USER"]), notificationController.getUsersNotification);
router.get('/mark-read',authenticate, authorize(["ADMIN","USER"]), notificationController.markAllNotificationAsRead);
router.get('/mark-read/:notifyId',authenticate, authorize(["ADMIN","USER"]), notificationController.markNotificationReadById);
router.get('/get-hr',authenticate, authorize(["ADMIN","USER"]), notificationController.getAllHRNotification);
router.get('/get-pm',authenticate, authorize(["ADMIN","USER"]), notificationController.getAllPMNotification);


module.exports = router;
