const express = require('express');
const router = express.Router();
const designationController = require('../controllers/designationController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.post('/add-designation',authenticate, authorize(["ADMIN","USER"]), designationController.designationAdd);

router.get('/get-all-designation-data', authenticate, authorize(["ADMIN","USER"]), designationController.getAlldesignationData);
router.put('/:id',authenticate, authorize(["ADMIN","USER"]), designationController.updatedesignation);
router.get('/:id', authenticate, authorize(["ADMIN","USER"]), designationController.getdesignationById);
router.delete('/:id', authenticate,authorize(["ADMIN","USER"]), designationController.deletedesignation);

module.exports = router;
