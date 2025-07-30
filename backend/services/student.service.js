const relationRepository = require('../repositories/relation.repository');

class StudentService {
  async getTeachers(studentId) {
    const relations = await relationRepository.findTeachersByStudent(studentId);
    
    return relations.map(relation => ({
      teacherId: relation.teacher.id,
      subjectId: relation.subject.id,
      name: relation.teacher.name,
      surnames: relation.teacher.surnames,
      email: relation.teacher.email,
      avatar: this.buildAvatarUrl(relation.teacher.avatar),
      subjectName: relation.subject.subject_name
    }));
  }

  async getSubjects(studentId) {
    const relations = await relationRepository.findTeachersByStudent(studentId);
    
    return relations.map(relation => ({
      id: relation.subject.id,
      name: relation.subject.subject_name,
      teacher: `${relation.teacher.name} ${relation.teacher.surnames}`,
      credits: Math.floor(Math.random() * 6) + 3, // Temporal
      status: 'Cursando'
    }));
  }

  buildAvatarUrl(avatarPath) {
    if (!avatarPath) return null;
    
    if (avatarPath.startsWith('http')) {
      return avatarPath;
    }
    
    return `http://localhost:3000/uploads/avatars/${avatarPath}`;
  }
}

module.exports = new StudentService();