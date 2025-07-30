const express = require('express');
const teacherController = require('../controllers/teacher.controller');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Todas las rutas de teacher requieren autenticación
router.use(authenticateToken);

// 🔧 RUTAS BÁSICAS (sin parámetros)
router.get('/students', teacherController.getStudents);
router.get('/subjects', teacherController.getSubjects);


// Obtener estudiantes asignados a una asignatura específica
router.get('/subject/:subjectId/students', teacherController.getAssignedStudents);

// Obtener estudiantes disponibles para asignar a una asignatura
router.get('/subject/:subjectId/available-students', teacherController.getAvailableStudents);

// Asignar estudiante a asignatura  
router.post('/subject/:subjectId/assign-student', teacherController.assignStudentToSubject);

// Quitar estudiante de asignatura (dos rutas para compatibilidad)
router.delete('/subject/:subjectId/students/:studentId', teacherController.removeStudentFromSubject);
router.post('/remove-student', teacherController.removeStudentFromSubjectByPost); // ← NUEVA RUTA

// Asignar estudiante (ruta alternativa para compatibilidad)
router.post('/assign-student', teacherController.assignStudentToSubjectByPost); // ← NUEVA RUTA

// 🔧 RUTAS DE GESTIÓN DE ESTUDIANTES (sin cambios)
router.put('/students/:studentId', teacherController.editStudent);
router.delete('/students/:studentId', teacherController.deleteStudent);

router.post('/join-subject', teacherController.joinSubject);

module.exports = router;