const express = require('express');
const subjectController = require('../controllers/subject.controller');
const { authenticateToken } = require('../middleware/auth');
const { validateTeacherRole } = require('../middleware/roleValidation');

const router = express.Router();

router.use(authenticateToken);

router.get('/', subjectController.getAllSubjects);

router.get('/teacher', validateTeacherRole, subjectController.getTeacherSubjects);
router.post('/', validateTeacherRole, subjectController.createSubject);
router.put('/:id', validateTeacherRole, subjectController.updateSubject);
router.delete('/:id', validateTeacherRole, subjectController.deleteSubject);
router.post('/join', validateTeacherRole, subjectController.joinAsTeacher);

module.exports = router;