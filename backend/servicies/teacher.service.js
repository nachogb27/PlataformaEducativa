const userRepository = require('../repositories/user.repository');
const relationRepository = require('../repositories/relation.repository');

class TeacherService {
  async getStudents(teacherId) {
    const relations = await relationRepository.findStudentsByTeacher(teacherId);
    
    return relations.map(relation => ({
      id: relation.student.id,
      name: relation.student.name,
      lastName: relation.student.surnames,
      email: relation.student.email,
      avatar: this.buildAvatarUrl(relation.student.avatar),
      subject: relation.subject.subject_name,
      grade: (Math.random() * 3 + 7).toFixed(1) // Temporal
    }));
  }

  async getAssignedStudents(teacherId, subjectId) {
    // Verificar que el profesor imparte esta asignatura
    const teacherRelation = await relationRepository.findRelation(teacherId, teacherId, subjectId);
    if (!teacherRelation) {
      throw new Error('No tienes permisos para ver estudiantes de esta asignatura');
    }

    const relations = await relationRepository.findAssignedStudents(teacherId, subjectId);
    
    return relations.map(relation => ({
      id: relation.student.id,
      name: relation.student.name,
      surnames: relation.student.surnames,
      email: relation.student.email,
      avatar: this.buildAvatarUrl(relation.student.avatar)
    }));
  }

  async getAvailableStudents(teacherId, subjectId) {
    // Verificar que el profesor imparte esta asignatura
    const teacherRelation = await relationRepository.findRelation(teacherId, teacherId, subjectId);
    if (!teacherRelation) {
      throw new Error('No tienes permisos para gestionar esta asignatura');
    }

    const students = await relationRepository.findAvailableStudents(subjectId);
    
    return students.map(student => ({
      id: student.id,
      name: student.name,
      surnames: student.surnames,
      email: student.email,
      avatar: this.buildAvatarUrl(student.avatar)
    }));
  }

  async assignStudentToSubject(teacherId, studentId, subjectId) {
    // Verificar que el profesor imparte esta asignatura
    const teacherRelation = await relationRepository.findRelation(teacherId, teacherId, subjectId);
    if (!teacherRelation) {
      throw new Error('No tienes permisos para asignar estudiantes a esta asignatura');
    }

    // Verificar que el estudiante existe
    const student = await userRepository.findById(studentId);
    if (!student || student.role !== 1) {
      throw new Error('Estudiante no encontrado');
    }

    // Verificar que no esté ya asignado
    const existingRelation = await relationRepository.findRelation(studentId, teacherId, subjectId);
    if (existingRelation) {
      throw new Error('El estudiante ya está asignado a esta asignatura');
    }

    // Crear la relación
    await relationRepository.create({
      id_student: studentId,
      id_teacher: teacherId,
      id_subject: subjectId
    });

    return {
      message: 'Estudiante asignado exitosamente',
      student: `${student.name} ${student.surnames}`
    };
  }

  async removeStudentFromSubject(teacherId, studentId, subjectId) {
    // Verificar que el profesor imparte esta asignatura
    const teacherRelation = await relationRepository.findRelation(teacherId, teacherId, subjectId);
    if (!teacherRelation) {
      throw new Error('No tienes permisos para desasignar estudiantes de esta asignatura');
    }

    // Eliminar la relación
    const deletedRows = await relationRepository.delete(studentId, teacherId, subjectId);
    if (deletedRows === 0) {
      throw new Error('Relación no encontrada');
    }

    return { message: 'Estudiante desasignado exitosamente' };
  }

  async editStudent(teacherId, studentId, studentData) {
    // Verificar que el profesor puede editar este estudiante
    const relations = await relationRepository.findStudentsByTeacher(teacherId);
    const hasPermission = relations.some(relation => relation.student.id === parseInt(studentId));
    
    if (!hasPermission) {
      throw new Error('No tienes permisos para editar este estudiante');
    }

    // Actualizar estudiante
    const updatedStudent = await userRepository.update(studentId, {
      name: studentData.name,
      surnames: studentData.surnames
    });

    if (!updatedStudent) {
      throw new Error('Estudiante no encontrado');
    }

    return {
      message: 'Estudiante actualizado exitosamente',
      student: updatedStudent
    };
  }

  async deleteStudent(teacherId, studentId) {
    // Eliminar todas las relaciones del estudiante con este profesor
    const relations = await relationRepository.findStudentsByTeacher(teacherId);
    const studentRelations = relations.filter(relation => relation.student.id === parseInt(studentId));
    
    if (studentRelations.length === 0) {
      throw new Error('Relación no encontrada');
    }

    // Eliminar todas las relaciones
    for (const relation of studentRelations) {
      await relationRepository.delete(studentId, teacherId, relation.id_subject);
    }

    return { message: 'Estudiante eliminado de tu lista exitosamente' };
  }

  buildAvatarUrl(avatarPath) {
    if (!avatarPath) return null;
    
    // Si ya es una URL completa (S3), devolverla tal como está
    if (avatarPath.startsWith('http')) {
      return avatarPath;
    }
    
    // Si es un path local, construir URL completa
    return `http://localhost:3000/uploads/avatars/${avatarPath}`;
  }
}

module.exports = new TeacherService();