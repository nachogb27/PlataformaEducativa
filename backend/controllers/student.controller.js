const studentService = require('../services/student.service');

class StudentController {
  async getTeachers(req, res) {
    try {
      const teachers = await studentService.getTeachers(req.user.id);
      res.json(teachers);
    } catch (error) {
      console.error('Error obteniendo profesores:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getSubjects(req, res) {
    try {
      const subjects = await studentService.getSubjects(req.user.id);
      res.json(subjects);
    } catch (error) {
      console.error('Error obteniendo asignaturas:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new StudentController();