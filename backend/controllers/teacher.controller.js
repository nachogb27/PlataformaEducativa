const teacherService = require('../services/teacher.service');

class TeacherController {
  async getStudents(req, res) {
    try {
      const students = await teacherService.getStudents(req.user.id);
      res.json(students);
    } catch (error) {
      console.error('Error obteniendo estudiantes:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getAssignedStudents(req, res) {
    try {
      const { subjectId } = req.params;
      const students = await teacherService.getAssignedStudents(req.user.id, subjectId);
      res.json(students);
    } catch (error) {
      console.error('Error obteniendo estudiantes asignados:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getAvailableStudents(req, res) {
    try {
      const { subjectId } = req.params;
      const students = await teacherService.getAvailableStudents(req.user.id, subjectId);
      res.json(students);
    } catch (error) {
      console.error('Error obteniendo estudiantes disponibles:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async assignStudent(req, res) {
    try {
      const { studentId, subjectId } = req.body;
      const result = await teacherService.assignStudentToSubject(req.user.id, studentId, subjectId);
      res.json(result);
    } catch (error) {
      console.error('Error asignando estudiante:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async removeStudent(req, res) {
    try {
      const { studentId, subjectId } = req.body;
      const result = await teacherService.removeStudentFromSubject(req.user.id, studentId, subjectId);
      res.json(result);
    } catch (error) {
      console.error('Error removiendo estudiante:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async editStudent(req, res) {
    try {
      const { id } = req.params;
      const result = await teacherService.editStudent(req.user.id, id, req.body);
      res.json(result);
    } catch (error) {
      console.error('Error editando estudiante:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async deleteStudent(req, res) {
    try {
      const { id } = req.params;
      const result = await teacherService.deleteStudent(req.user.id, id);
      res.json(result);
    } catch (error) {
      console.error('Error eliminando estudiante:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new TeacherController();