const subjectRepository = require('../repositories/subject.repository');
const relationRepository = require('../repositories/relation.repository');

class SubjectService {
  async getAllSubjects() {
    return await subjectRepository.findAll();
  }

  async getTeacherSubjects(teacherId) {
    const relations = await relationRepository.findSubjectsByTeacher(teacherId);
    
    const subjectCounts = {};
    relations.forEach(relation => {
      const subjectId = relation.subject.id;
      const subjectName = relation.subject.subject_name;
      
      if (subjectCounts[subjectId]) {
        if (relation.id_student !== relation.id_teacher) {
          subjectCounts[subjectId].studentCount++;
        }
      } else {
        subjectCounts[subjectId] = {
          id: subjectId,
          subject_name: subjectName,
          studentCount: relation.id_student !== relation.id_teacher ? 1 : 0
        };
      }
    });
    
    return Object.values(subjectCounts);
  }

  async createSubject(teacherId, subjectName) {
    const existingSubject = await subjectRepository.findByName(subjectName);
    if (existingSubject) {
      throw new Error('Ya existe una asignatura con este nombre');
    }
    
    const newSubject = await subjectRepository.create({
      subject_name: subjectName
    });
    
    await relationRepository.create({
      id_student: teacherId,
      id_teacher: teacherId,
      id_subject: newSubject.id
    });
    
    return {
      message: 'Asignatura creada exitosamente',
      subject: newSubject
    };
  }

  async updateSubject(teacherId, subjectId, subjectName) {
    const teacherRelation = await relationRepository.findRelation(teacherId, teacherId, subjectId);
    if (!teacherRelation) {
      throw new Error('No tienes permisos para editar esta asignatura');
    }
    
    const existingSubject = await subjectRepository.findByName(subjectName);
    if (existingSubject && existingSubject.id !== parseInt(subjectId)) {
      throw new Error('Ya existe otra asignatura con este nombre');
    }
    
    const updatedSubject = await subjectRepository.update(subjectId, {
      subject_name: subjectName
    });
    
    if (!updatedSubject) {
      throw new Error('Asignatura no encontrada');
    }
    
    return {
      message: 'Asignatura actualizada exitosamente',
      subject: updatedSubject
    };
  }

  async deleteSubject(teacherId, subjectId) {
    const teacherRelation = await relationRepository.findRelation(teacherId, teacherId, subjectId);
    if (!teacherRelation) {
      throw new Error('No tienes permisos para eliminar esta asignatura');
    }
    
    await relationRepository.deleteBySubject(subjectId);
    
    const deletedRows = await subjectRepository.delete(subjectId);
    if (deletedRows === 0) {
      throw new Error('Asignatura no encontrada');
    }
    
    return { message: 'Asignatura eliminada exitosamente' };
  }

  async joinAsTeacher(teacherId, subjectId) {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) {
      throw new Error('Asignatura no encontrada');
    }
    
    const existingRelation = await relationRepository.findRelation(teacherId, teacherId, subjectId);
    if (existingRelation) {
      throw new Error('Ya estás dando esta asignatura');
    }
    
    await relationRepository.create({
      id_student: teacherId,
      id_teacher: teacherId,
      id_subject: subjectId
    });
    
    return {
      message: 'Te has unido exitosamente a la asignatura',
      subject: subject.subject_name
    };
  }
}

module.exports = new SubjectService();