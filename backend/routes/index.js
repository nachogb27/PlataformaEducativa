const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const subjectRoutes = require('./subject.routes');
const teacherRoutes = require('./teacher.routes');
const studentRoutes = require('./student.routes');
const chatRoutes = require('./chat.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/profile', userRoutes);
router.use('/subjects', subjectRoutes);
router.use('/teacher', teacherRoutes);
router.use('/student', studentRoutes);
router.use('/chat', chatRoutes);

module.exports = router;