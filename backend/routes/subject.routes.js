const express = require('express');
const router = express.Router();
const SubjectController = require('../controllers/subject.controller');

// Obtener todas las asignaturas
router.get('/', SubjectController.getAllSubjects);

// Crear asignatura
router.post('/', SubjectController.createSubject);

// Actualizar asignatura
router.put('/:id', SubjectController.updateSubject);

// Eliminar asignatura
router.delete('/:id', SubjectController.deleteSubject);

// ...agrega aquí el resto de endpoints de asignatura

module.exports = router;
