const express = require('express');
const router = express.Router();
const holidayController = require('../controllers/holidayController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');


router.get('/admin-all-holiday',authenticate, authorize(["ADMIN","USER"]), holidayController.getAllholidayDataAdmin);
router.post('/add-holiday',authenticate, authorize(["ADMIN","USER"]), holidayController.holidayAdd);
router.get('/get-all-holiday-data', authenticate, authorize(["ADMIN","USER"]), holidayController.getAllholidayData);
router.put('/:id',authenticate, authorize(["ADMIN","USER"]), holidayController.updateholiday);
router.get('/:id', authenticate, authorize(["ADMIN","USER"]), holidayController.getholidayById);
router.delete('/:id', authenticate,authorize(["ADMIN","USER"]), holidayController.deleteholiday);



module.exports = router;
