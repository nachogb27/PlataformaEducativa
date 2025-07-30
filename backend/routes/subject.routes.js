const express = require('express');
const subjectController = require('../controllers/subject.controller');
const { authenticateToken } = require('../middleware/auth');
const { validateTeacherRole } = require('../middleware/roleValidation');

const router = express.Router();

// Rutas que requieren autenticación
router.use(authenticateToken);

// Rutas para todos los usuarios autenticados
router.get('/', subjectController.getAllSubjects);

// Rutas específicas para profesores
router.get('/teacher', validateTeacherRole, subjectController.getTeacherSubjects);
router.post('/', validateTeacherRole, subjectController.createSubject);
router.put('/:id', validateTeacherRole, subjectController.updateSubject);
router.delete('/:id', validateTeacherRole, subjectController.deleteSubject);
router.post('/join', validateTeacherRole, subjectController.joinAsTeacher);

module.exports = router;