const relationRepository = require('../repositories/relation.repository');

class StudentService {
  async getSubjects(token) {
    // Aquí deberías verificar el token y extraer el userId
    return await relationRepository.findSubjectsByTeacher(token);
  }

  async getTeachers(token) {
    return await relationRepository.findTeachersByStudent(token);
  }
}

module.exports = new StudentService();
