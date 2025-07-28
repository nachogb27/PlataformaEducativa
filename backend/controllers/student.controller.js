const studentService = require('../services/student.service');

class StudentController {
  async getSubjects(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const subjects = await studentService.getSubjects(token);
      res.json(subjects);
    } catch (error) {
      console.error('Error obteniendo asignaturas del estudiante:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getTeachers(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const teachers = await studentService.getTeachers(token);
      res.json(teachers);
    } catch (error) {
      console.error('Error obteniendo profesores del estudiante:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new StudentController();
