const express = require('express');
const studentController = require('../controllers/student.controller');
const { authenticateToken } = require('../middleware/auth');
const { validateStudentRole } = require('../middleware/roleValidation');

const router = express.Router();

router.use(authenticateToken);
router.use(validateStudentRole);

router.get('/teachers', studentController.getTeachers);
router.get('/subjects', studentController.getSubjects);

module.exports = router;