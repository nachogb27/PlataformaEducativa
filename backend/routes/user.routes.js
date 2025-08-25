const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth');
const { uploadToS3 } = require('../config/aws');

const router = express.Router();

router.use(authenticateToken);

router.get('/', userController.getProfile);
router.put('/', userController.updateProfile);
router.post('/avatar', uploadToS3.single('avatar'), userController.updateAvatar);
router.delete('/avatar', userController.deleteAvatar);

module.exports = router;