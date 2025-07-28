const subjectService = require('../services/subject.service');

class SubjectController {
  async getAllSubjects(req, res) {
    try {
      const subjects = await subjectService.getAllSubjects();
      res.json(subjects);
    } catch (error) {
      console.error('Error obteniendo asignaturas:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getSubjectsWithTeachers(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const result = await subjectService.getSubjectsWithTeachers(token);
      res.json(result);
    } catch (error) {
      console.error('Error obteniendo asignaturas con profesores:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async createSubject(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const { name } = req.body;
      const result = await subjectService.createSubject(token, name);
      res.json(result);
    } catch (error) {
      console.error('Error creando asignatura:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async updateSubject(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const subjectId = req.params.id;
      const { name } = req.body;
      const result = await subjectService.updateSubject(token, subjectId, name);
      res.json(result);
    } catch (error) {
      console.error('Error actualizando asignatura:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async deleteSubject(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const subjectId = req.params.id;
      const result = await subjectService.deleteSubject(token, subjectId);
      res.json(result);
    } catch (error) {
      console.error('Error eliminando asignatura:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new SubjectController();
