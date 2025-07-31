const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { uploadSingle } = require('../middlewares/upload');

router.get('/get-all-leave-data-admin', authenticate, authorize(["ADMIN","USER"]), leaveController.getAllLeaveDataForAdmin);
router.post('/add-leave',authenticate, authorize(["ADMIN","USER"]), leaveController.leaveAdd);

router.get('/get-all-leave-data', authenticate, authorize(["ADMIN","USER"]), leaveController.getAllLeaveData);
router.put('/:id',authenticate, authorize(["ADMIN","USER"]), leaveController.updateLeave);
router.get('/:id', authenticate, authorize(["ADMIN","USER"]), leaveController.getLeaveById);
router.delete('/:id', authenticate,authorize(["ADMIN","USER"]), leaveController.deleteLeave);
router.get('/get-all-leave-data-admin', authenticate, authorize(["ADMIN","USER"]), leaveController.getAllLeaveDataForAdmin);
router.get('/project-manager/get-leave-data-pm', authenticate, authorize(["ADMIN","USER"]), leaveController.getAllEmployeeLeaveDataForPm);
router.get('/get-all-employee-data/:employeeId', authenticate, authorize(["ADMIN","USER"]), leaveController.getAllLeaveDataEmployeeBasis);

module.exports = router;
