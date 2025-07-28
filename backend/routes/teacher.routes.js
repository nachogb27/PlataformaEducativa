const express = require('express');
const router = express.Router();
const TeacherController = require('../controllers/teacher.controller');

// Obtener estudiantes del profesor
router.get('/students', TeacherController.getStudents);

// Asignar estudiante a asignatura
router.post('/assign-student', TeacherController.assignStudent);

// Desasignar estudiante de asignatura
router.post('/remove-student', TeacherController.removeStudent);

// ...agrega aquí el resto de endpoints del profesor

module.exports = router;
