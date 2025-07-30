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

  async getTeacherSubjects(req, res) {
    try {
      const subjects = await subjectService.getTeacherSubjects(req.user.id);
      res.json(subjects);
    } catch (error) {
      console.error('Error obteniendo asignaturas del profesor:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async createSubject(req, res) {
    try {
      const { name } = req.body;
      const result = await subjectService.createSubject(req.user.id, name);
      res.json(result);
    } catch (error) {
      console.error('Error creando asignatura:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async updateSubject(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const result = await subjectService.updateSubject(req.user.id, id, name);
      res.json(result);
    } catch (error) {
      console.error('Error actualizando asignatura:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async deleteSubject(req, res) {
    try {
      const { id } = req.params;
      const result = await subjectService.deleteSubject(req.user.id, id);
      res.json(result);
    } catch (error) {
      console.error('Error eliminando asignatura:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async joinAsTeacher(req, res) {
    try {
      const { subjectId } = req.body;
      const result = await subjectService.joinAsTeacher(req.user.id, subjectId);
      res.json(result);
    } catch (error) {
      console.error('Error uniéndose como profesor:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new SubjectController();