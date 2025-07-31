const express = require('express');
const router = express.Router();
const calenderController = require('../controllers/calenderController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');



router.post('/add_calender',authenticate,authorize(['admin', 'user','organization']),calenderController.addUpdateCalender);
router.get('/get_calender_with_pagination',authenticate,authorize(['admin','user','organization']),calenderController.getCalendarWithPagination);
router.get('/:id', authenticate, authorize(['admin','organization', 'user']), calenderController.getCalendarById);
router.delete('/:id', authenticate,authorize(['admin','organization','user']), calenderController.deleteCalendar);

module.exports = router;