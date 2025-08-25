const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/activate-account', authController.activateAccount);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.post('/google', authController.loginWithGoogle);
router.post('/google/code', authController.loginWithGoogleCode);

router.post('/logout', authenticateToken, authController.logout);

module.exports = router;