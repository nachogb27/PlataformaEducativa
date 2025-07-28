const express = require('express');
const router = express.Router();
const StudentController = require('../controllers/student.controller');

// Obtener profesores del estudiante
router.get('/teachers', StudentController.getTeachers);

// Obtener asignaturas del estudiante
router.get('/subjects', StudentController.getSubjects);

// ...agrega aquí el resto de endpoints de estudiante

module.exports = router;
