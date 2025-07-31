const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const authenticate = require('../middlewares/authenticate');

router.post('/add', authenticate,wishlistController.addToWishlist);
router.delete('/remove/:id', authenticate,wishlistController.removeFromWishlist);
router.get('/get-all', authenticate,wishlistController.getWishlist);

module.exports = router;
