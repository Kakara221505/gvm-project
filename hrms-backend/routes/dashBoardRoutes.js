const express = require('express');
const router = express.Router();
const dashBoardController = require('../controllers/dashBoardController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { uploadSingle } = require('../middlewares/upload');

router.get('/get-all-dashboard-data-admin', authenticate, authorize(["ADMIN","USER"]), dashBoardController.getAllDashboardDataForAdmin);
router.get('/get-all-dashboard-data', authenticate, authorize(["ADMIN","USER"]), dashBoardController.getAllDashboardData);
router.get('/send-notifications', dashBoardController.sendLeaveAndBirthdayNotifications);
router.get('/annivesary-birthday-list', authenticate, authorize(["ADMIN"]), dashBoardController.anniversaryBirthdayList);
router.post('/send-email', authenticate, authorize(["ADMIN"]), dashBoardController.sendLeaveAndBirthdayEmail);
router.post('/schedule-email', authenticate, authorize(["ADMIN"]), dashBoardController.scheduleEmail);
router.get('/get-schedule-email', authenticate, authorize(["ADMIN"]), dashBoardController.getScheduleEmail);
router.put('/update-schedule-email/:id', authenticate, authorize(["ADMIN"]), dashBoardController.updateScheduleMail);
router.delete('/delete-schedule-email/:id', authenticate, authorize(["ADMIN"]), dashBoardController.deleteScheduleMail);

module.exports = router;
