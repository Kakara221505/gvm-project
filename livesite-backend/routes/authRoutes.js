const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middlewares/authenticate');
const { uploadSingleProfile} = require('../middlewares/upload');

router.post('/register',uploadSingleProfile, authController.register);
router.post('/login_with_password', authController.loginWithPassword);
router.post('/logout', authenticate, authController.logout);
router.post('/send_otp', authController.resendOTP);
router.post('/verify_otp', authController.verifyOTP);
router.post('/verify_forgot_password_otp', authController.verifyForgotPasswordOTP);
router.post('/forgot_password', authenticate, authController.forgotPassword);
router.post('/change_password', authenticate, authController.changePassword);

module.exports = router;
