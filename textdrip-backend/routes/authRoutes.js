const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { uploadSingle } = require('../middlewares/upload');

router.post('/register', authController.register);
router.post('/send_otp', authController.resendOTP);

router.post('/verify_otp', authController.verifyOTP);
router.post('/login_with_password', authController.loginWithPassword);
router.post('/request_login_otp', authController.requestLoginOTP);
router.post('/login_with_otp', authController.loginWithOTP);
router.post('/verify_forgot_password_otp', authController.verifyForgotPasswordOTP);
router.post('/forgot_password', authenticate, authController.forgotPassword);
router.post('/change_password', authenticate, authController.changePassword);
router.post('/logout', authenticate, authController.logout);
router.post('/admin_forgot_password', authController.adminForgotPassword);
router.post('/admin_add_user',uploadSingle, authController.adminUserRegister);

module.exports = router;
