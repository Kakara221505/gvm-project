const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { uploadSingle,uploadExcel } = require('../middlewares/upload');

router.get('/dropdown_value', authController.dropdownValue);

router.post('/bulk-upload',uploadExcel, authController.bulkEmployeeAdd);
router.get('/export-employees',authenticate,authorize(["ADMIN","USER"]),authController.exportEmployeeData);
router.post('/add-employee',uploadSingle, authController.employeeAdd);
router.post('/login_with_password', authController.loginWithPassword);
router.put('/:employeeId', authenticate,uploadSingle, authorize(["ADMIN","USER"]), authController.updateEmployee);

router.post('/request-otp',  authController.requestOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/forgot-password', authController.resetPassword);

router.get('/getAllEmployeeList', authenticate, authorize(["ADMIN","USER"]), authController.getAllEmployeeData);
router.get('/:employeeId', authenticate, authorize(["ADMIN","USER"]), authController.getEmployeeById);
router.delete('/:employeeId', authenticate,authorize(["ADMIN","USER"]), authController.deleteEmployee);


module.exports = router;
