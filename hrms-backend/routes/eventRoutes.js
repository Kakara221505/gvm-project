const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.post('/add-event',authenticate, authorize(["ADMIN","USER"]), eventController.eventAdd);

router.get('/get-all-event-data', authenticate, authorize(["ADMIN","USER"]), eventController.getAlleventData);
router.put('/:id',authenticate, authorize(["ADMIN","USER"]), eventController.updateevent);
router.get('/:id', authenticate, authorize(["ADMIN","USER"]), eventController.geteventById);
router.delete('/:id', authenticate,authorize(["ADMIN","USER"]), eventController.deleteevent);

module.exports = router;
