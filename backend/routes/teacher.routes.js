const express = require('express');
const teacherController = require('../controllers/teacher.controller');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/students', teacherController.getStudents);
router.get('/subjects', teacherController.getSubjects);


router.get('/subject/:subjectId/students', teacherController.getAssignedStudents);

router.get('/subject/:subjectId/available-students', teacherController.getAvailableStudents);

router.post('/subject/:subjectId/assign-student', teacherController.assignStudentToSubject);

router.delete('/subject/:subjectId/students/:studentId', teacherController.removeStudentFromSubject);
router.post('/remove-student', teacherController.removeStudentFromSubjectByPost); 

router.post('/assign-student', teacherController.assignStudentToSubjectByPost); 

router.put('/students/:studentId', teacherController.editStudent);
router.delete('/students/:studentId', teacherController.deleteStudent);

router.post('/join-subject', teacherController.joinSubject);

module.exports = router;