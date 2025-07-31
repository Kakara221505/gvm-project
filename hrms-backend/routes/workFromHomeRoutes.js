const express = require('express');
const router = express.Router();
const workFromHomeController = require('../controllers/workFromHomeControlle');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { uploadSingle } = require('../middlewares/upload');

router.get('/get-all-work-from-home-data-admin', authenticate, authorize(["ADMIN","USER"]), workFromHomeController.getAllWorkFromHomeDataForAdmin);
router.post('/add-work-from-home',authenticate, authorize(["ADMIN","USER"]), workFromHomeController.workFromHomeAdd);

router.get('/getAllWorkFromHomeData', authenticate, authorize(["ADMIN","USER"]), workFromHomeController.getAllWorkFromHomeData);
router.get('/project-manager/get-work-from-home-data-pm', authenticate, authorize(["ADMIN","USER"]), workFromHomeController.getAllEmployeeWorkFromHomeDataForPm);
router.put('/:id',authenticate, authorize(["ADMIN","USER"]), workFromHomeController.updateWorkFromHome);
router.get('/:id', authenticate, authorize(["ADMIN","USER"]), workFromHomeController.getWorkFromHomeById);
router.delete('/:id', authenticate,authorize(["ADMIN","USER"]), workFromHomeController.deleteWorkFromHome);
router.get('/get-all-employee-data/:employeeId', authenticate, authorize(["ADMIN","USER"]), workFromHomeController.getAllWfhDataEmployeeBasis);

module.exports = router;
