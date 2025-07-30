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

  // 🔧 MÉTODO CORREGIDO: Verificar permisos usando cualquier relación del profesor con la asignatura
  async verifyTeacherSubjectPermission(teacherId, subjectId) {
    // Buscar CUALQUIER relación del profesor con esta asignatura
    const relations = await relationRepository.findSubjectsByTeacher(teacherId);
    const hasPermission = relations.some(relation => relation.id_subject == subjectId);
    
    if (!hasPermission) {
      throw new Error('No tienes permisos para gestionar esta asignatura');
    }
    
    return true;
  }

  async getAssignedStudents(teacherId, subjectId) {
    // 🔧 USAR MÉTODO CORREGIDO DE VERIFICACIÓN
    await this.verifyTeacherSubjectPermission(teacherId, subjectId);

    console.log(`🔍 DEBUG: Buscando estudiantes asignados para teacher=${teacherId}, subject=${subjectId}`);

    const relations = await relationRepository.findAssignedStudents(teacherId, subjectId);
    
    console.log(`📊 DEBUG: Encontradas ${relations.length} relaciones`);

    return relations.map(relation => ({
      id: relation.student.id,
      name: relation.student.name,
      surnames: relation.student.surnames,
      email: relation.student.email,
      avatar: this.buildAvatarUrl(relation.student.avatar)
    }));
  }

  async getAvailableStudents(teacherId, subjectId) {
    // 🔧 USAR MÉTODO CORREGIDO DE VERIFICACIÓN
    await this.verifyTeacherSubjectPermission(teacherId, subjectId);

    console.log(`🔍 DEBUG: Buscando estudiantes disponibles para subject=${subjectId}`);

    const students = await relationRepository.findAvailableStudents(subjectId);
    
    console.log(`📊 DEBUG: Encontrados ${students.length} estudiantes disponibles`);

    return students.map(student => ({
      id: student.id,
      name: student.name,
      surnames: student.surnames,
      email: student.email,
      avatar: this.buildAvatarUrl(student.avatar)
    }));
  }

  async assignStudentToSubject(teacherId, studentId, subjectId) {
    // 🔧 USAR MÉTODO CORREGIDO DE VERIFICACIÓN
    await this.verifyTeacherSubjectPermission(teacherId, subjectId);

    console.log(`🔍 DEBUG: Asignando student=${studentId} a subject=${subjectId} por teacher=${teacherId}`);

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

    console.log(`✅ DEBUG: Relación creada exitosamente`);

    return {
      message: 'Estudiante asignado exitosamente',
      student: `${student.name} ${student.surnames}`
    };
  }

  async removeStudentFromSubject(teacherId, studentId, subjectId) {
    // 🔧 USAR MÉTODO CORREGIDO DE VERIFICACIÓN
    await this.verifyTeacherSubjectPermission(teacherId, subjectId);

    console.log(`🔍 DEBUG: Eliminando relación student=${studentId}, teacher=${teacherId}, subject=${subjectId}`);

    // Eliminar la relación
    const deletedRows = await relationRepository.delete(studentId, teacherId, subjectId);
    
    console.log(`📊 DEBUG: Filas eliminadas: ${deletedRows}`);
    
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

  async getSubjects(teacherId) {
    const relations = await relationRepository.findSubjectsByTeacher(teacherId);
    
    // Agrupar por asignatura y contar estudiantes
    const subjectCounts = {};
    relations.forEach(relation => {
      const subjectId = relation.subject.id;
      const subjectName = relation.subject.subject_name;
      
      if (subjectCounts[subjectId]) {
        // Solo contar si no es una relación dummy
        if (relation.id_student !== relation.id_teacher) {
          subjectCounts[subjectId].studentCount++;
        }
      } else {
        subjectCounts[subjectId] = {
          id: subjectId,
          subject_name: subjectName,
          studentCount: relation.id_student !== relation.id_teacher ? 1 : 0,
          isTeaching: true
        };
      }
    });
    
    return Object.values(subjectCounts);
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