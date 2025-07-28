const express = require('express');
const teacherController = require('../controllers/teacher.controller');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Todas las rutas de teacher requieren autenticación
router.use(authenticateToken);

// Obtener estudiantes del profesor
router.get('/students', teacherController.getStudents);

// Obtener asignaturas que imparte el profesor
router.get('/subjects', teacherController.getSubjects);

// Obtener estudiantes asignados a una asignatura específica
router.get('/subjects/:subjectId/students', teacherController.getAssignedStudents);

// Obtener estudiantes disponibles para asignar a una asignatura
router.get('/subjects/:subjectId/available-students', teacherController.getAvailableStudents);

// Asignar estudiante a asignatura
router.post('/subjects/:subjectId/assign-student', teacherController.assignStudentToSubject);

// Quitar estudiante de asignatura
router.delete('/subjects/:subjectId/students/:studentId', teacherController.removeStudentFromSubject);

// Editar estudiante
router.put('/students/:studentId', teacherController.editStudent);

// Eliminar estudiante de todas las asignaturas del profesor
router.delete('/students/:studentId', teacherController.deleteStudent);

module.exports = router;