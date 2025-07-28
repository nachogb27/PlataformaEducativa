const express = require('express');
const teacherController = require('../controllers/teacher.controller');
const { authenticateToken } = require('../middleware/auth');
const { validateTeacherRole } = require('../middleware/roleValidation');

const router = express.Router();

// Todas las rutas requieren autenticación y rol de profesor
router.use(authenticateToken);
router.use(validateTeacherRole);

router.get('/students', teacherController.getStudents);
router.get('/subject/:subjectId/students', teacherController.getAssignedStudents);
router.get('/subject/:subjectId/available-students', teacherController.getAvailableStudents);
router.post('/assign-student', teacherController.assignStudent);
router.post('/remove-student', teacherController.removeStudent);
router.put('/student/:id', teacherController.editStudent);
router.delete('/student/:id', teacherController.deleteStudent);

module.exports = router;