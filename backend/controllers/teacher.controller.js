const teacherService = require('../services/teacher.service');

class TeacherController {
  async getStudents(req, res) {
    try {
      const teacherId = req.user.userId;
      const students = await teacherService.getStudents(teacherId);
      res.json(students);
    } catch (error) {
      console.error('Error en getStudents:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getSubjects(req, res) {
    try {
      const teacherId = req.user.userId;
      const subjects = await teacherService.getSubjects(teacherId);
      res.json(subjects);
    } catch (error) {
      console.error('Error en getSubjects:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getAssignedStudents(req, res) {
    try {
      const teacherId = req.user.userId;
      const { subjectId } = req.params;
      const students = await teacherService.getAssignedStudents(teacherId, subjectId);
      res.json(students);
    } catch (error) {
      console.error('Error en getAssignedStudents:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getAvailableStudents(req, res) {
    try {
      const teacherId = req.user.userId;
      const { subjectId } = req.params;
      const students = await teacherService.getAvailableStudents(teacherId, subjectId);
      res.json(students);
    } catch (error) {
      console.error('Error en getAvailableStudents:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async assignStudentToSubject(req, res) {
    try {
      const teacherId = req.user.userId;
      const { subjectId } = req.params;
      const { studentId } = req.body;
      
      const result = await teacherService.assignStudentToSubject(teacherId, studentId, subjectId);
      res.json(result);
    } catch (error) {
      console.error('Error en assignStudentToSubject:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async removeStudentFromSubject(req, res) {
    try {
      const teacherId = req.user.userId;
      const { subjectId, studentId } = req.params;
      
      const result = await teacherService.removeStudentFromSubject(teacherId, studentId, subjectId);
      res.json(result);
    } catch (error) {
      console.error('Error en removeStudentFromSubject:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async editStudent(req, res) {
    try {
      const teacherId = req.user.userId;
      const { studentId } = req.params;
      
      const result = await teacherService.editStudent(teacherId, studentId, req.body);
      res.json(result);
    } catch (error) {
      console.error('Error en editStudent:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async deleteStudent(req, res) {
    try {
      const teacherId = req.user.userId;
      const { studentId } = req.params;
      
      const result = await teacherService.deleteStudent(teacherId, studentId);
      res.json(result);
    } catch (error) {
      console.error('Error en deleteStudent:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new TeacherController();