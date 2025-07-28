const teacherService = require('../services/teacher.service');

class TeacherController {
  async getStudents(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const students = await teacherService.getStudents(token);
      res.json(students);
    } catch (error) {
      console.error('Error obteniendo estudiantes:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async updateStudent(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const studentId = req.params.id;
      const result = await teacherService.updateStudent(token, studentId, req.body);
      res.json(result);
    } catch (error) {
      console.error('Error actualizando estudiante:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async deleteStudent(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const studentId = req.params.id;
      const result = await teacherService.deleteStudent(token, studentId);
      res.json(result);
    } catch (error) {
      console.error('Error eliminando estudiante:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getTeacherSubjects(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const result = await teacherService.getSubjects(token);
      res.json(result);
    } catch (error) {
      console.error('Error obteniendo asignaturas del profesor:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getSubjectStudents(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const subjectId = req.params.subjectId;
      const result = await teacherService.getSubjectStudents(token, subjectId);
      res.json(result);
    } catch (error) {
      console.error('Error obteniendo estudiantes de asignatura:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getAvailableStudents(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const subjectId = req.params.subjectId;
      const result = await teacherService.getAvailableStudents(token, subjectId);
      res.json(result);
    } catch (error) {
      console.error('Error obteniendo estudiantes disponibles:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async assignStudent(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const { studentId, subjectId } = req.body;
      const result = await teacherService.assignStudent(token, studentId, subjectId);
      res.json(result);
    } catch (error) {
      console.error('Error asignando estudiante:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async removeStudent(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const { studentId, subjectId } = req.body;
      const result = await teacherService.removeStudent(token, studentId, subjectId);
      res.json(result);
    } catch (error) {
      console.error('Error desasignando estudiante:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async joinSubject(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const { subjectId } = req.body;
      const result = await teacherService.joinSubject(token, subjectId);
      res.json(result);
    } catch (error) {
      console.error('Error uniéndose a asignatura:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getDetailedSubjects(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const result = await teacherService.getDetailedSubjects(token);
      res.json(result);
    } catch (error) {
      console.error('Error obteniendo asignaturas detalladas:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new TeacherController();
