const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { uploadRatingMedia} = require('../middlewares/upload');
const ratingController = require('../controllers/ratingController');

router.post('/add_update_rating',uploadRatingMedia,authenticate,ratingController.addUpdateRatingDetail);
router.post('/get_rating', ratingController.getRatingDetail);
router.post('/get_currentuser_rating',authenticate, ratingController.getCurrentRatingDetail);



module.exports = router;