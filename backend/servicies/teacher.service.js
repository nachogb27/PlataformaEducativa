const relationRepository = require('../repositories/relation.repository');
const userRepository = require('../repositories/user.repository');

class TeacherService {
  async getStudents(token) {
    // Aquí deberías verificar el token y extraer el userId
    // Por simplicidad, asume que recibes el userId
    return await relationRepository.findStudentsByTeacher(token);
  }

  async updateStudent(token, studentId, data) {
    // Actualiza datos del estudiante
    return await userRepository.update(studentId, data);
  }

  async deleteStudent(token, studentId) {
    // Elimina estudiante
    return await userRepository.delete(studentId);
  }

  async getSubjects(token) {
    return await relationRepository.findSubjectsByTeacher(token);
  }

  async getSubjectStudents(token, subjectId) {
    return await relationRepository.findAssignedStudents(token, subjectId);
  }
}

module.exports = new TeacherService();
