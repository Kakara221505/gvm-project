const express = require('express');
const router = express.Router();
const employeeAttendanceDataController = require('../controllers/employeeAttendanceController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { uploadSingle } = require('../middlewares/upload');

router.get('/get-all-employee-attendance-data-admin', authenticate, authorize(["ADMIN","USER"]), employeeAttendanceDataController.getAllEmployeeAttendanceDataForAdmin);
router.post('/add-employee-attendance',authenticate, authorize(["ADMIN","USER"]), employeeAttendanceDataController.employeeAttendanceAdd);

router.get('/getAllEmployeeAttendanceData', authenticate, authorize(["ADMIN","USER"]), employeeAttendanceDataController.getAllemployeeAttendanceData);
router.put('/:id',authenticate, authorize(["ADMIN","USER"]), employeeAttendanceDataController.updateEmployeeAttendance);
router.get('/:id', authenticate, authorize(["ADMIN","USER"]), employeeAttendanceDataController.getEmployeeAttendanceById);
router.delete('/:id', authenticate,authorize(["ADMIN","USER"]), employeeAttendanceDataController.deleteEmployeeAttendance);
router.put('/admin/:id',authenticate, authorize(["ADMIN"]), employeeAttendanceDataController.updateEmployeeAttendanceByAdmin);

module.exports = router;
