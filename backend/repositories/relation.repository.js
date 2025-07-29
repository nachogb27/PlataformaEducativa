const { StudentsTeachersRelation, User, Subject, sequelize } = require('../models');
const { Op } = require('sequelize');

class RelationRepository {
  async findStudentsByTeacher(teacherId) {
    return await StudentsTeachersRelation.findAll({
      where: {
        id_teacher: teacherId,
        id_student: { [Op.ne]: teacherId } // Excluir relaciones dummy
      },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'surnames', 'email', 'avatar']
        },
        {
          model: Subject,
          as: 'subject'
        }
      ]
    });
  }

  async findTeachersByStudent(studentId) {
    return await StudentsTeachersRelation.findAll({
      where: { id_student: studentId },
      include: [
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'name', 'surnames', 'email', 'avatar']
        },
        {
          model: Subject,
          as: 'subject'
        }
      ]
    });
  }

  async findSubjectsByTeacher(teacherId) {
    return await StudentsTeachersRelation.findAll({
      where: { id_teacher: teacherId },
      include: [{
        model: Subject,
        as: 'subject'
      }]
    });
  }

  async findAssignedStudents(teacherId, subjectId) {
    return await StudentsTeachersRelation.findAll({
      where: {
        id_teacher: teacherId,
        id_subject: subjectId,
        id_student: { [Op.ne]: teacherId }
      },
      include: [{
        model: User,
        as: 'student',
        attributes: ['id', 'name', 'surnames', 'email', 'avatar']
      }]
    });
  }

 // ALTERNATIVA MÁS SIMPLE para findAvailableStudents
async findAvailableStudents(subjectId) {
  // Paso 1: Obtener TODAS las relaciones de esta asignatura
  const allRelations = await StudentsTeachersRelation.findAll({
    where: { id_subject: subjectId },
    attributes: ['id_student', 'id_teacher']
  });

  // Paso 2: Filtrar solo estudiantes reales (no relaciones dummy)
  const assignedStudentIds = allRelations
    .filter(relation => relation.id_student !== relation.id_teacher)
    .map(relation => relation.id_student);

  // Paso 3: Construir consulta para estudiantes disponibles
  let whereClause = { role: 1 }; // Solo estudiantes

  if (assignedStudentIds.length > 0) {
    whereClause.id = { [Op.notIn]: assignedStudentIds };
  }

  // Paso 4: Obtener estudiantes disponibles
  return await User.findAll({
    where: whereClause,
    attributes: ['id', 'name', 'surnames', 'email', 'avatar'],
    order: [['name', 'ASC'], ['surnames', 'ASC']]
  });
}

  async create(relationData) {
    return await StudentsTeachersRelation.create(relationData);
  }

  async delete(studentId, teacherId, subjectId) {
    return await StudentsTeachersRelation.destroy({
      where: {
        id_student: studentId,
        id_teacher: teacherId,
        id_subject: subjectId
      }
    });
  }

  async findRelation(studentId, teacherId, subjectId) {
    return await StudentsTeachersRelation.findOne({
      where: {
        id_student: studentId,
        id_teacher: teacherId,
        id_subject: subjectId
      }
    });
  }

  async deleteBySubject(subjectId) {
    return await StudentsTeachersRelation.destroy({
      where: { id_subject: subjectId }
    });
  }

  // 🔧 AGREGAR ESTE MÉTODO A TU relation.repository.js

// Método mejorado para verificar si un profesor puede gestionar una asignatura
async canTeacherManageSubject(teacherId, subjectId) {
  const relation = await StudentsTeachersRelation.findOne({
    where: {
      id_teacher: teacherId,
      id_subject: subjectId
    }
  });
  
  return !!relation; // Devuelve true si existe alguna relación
}

// Método para crear relación dummy si no existe
async ensureTeacherSubjectRelation(teacherId, subjectId) {
  // Verificar si ya existe alguna relación del profesor con esta asignatura
  const existingRelation = await this.canTeacherManageSubject(teacherId, subjectId);
  
  if (!existingRelation) {
    // Crear relación dummy
    await this.create({
      id_student: teacherId,  // Relación dummy
      id_teacher: teacherId,
      id_subject: subjectId
    });
    
    console.log(`✅ Relación dummy creada: teacher=${teacherId}, subject=${subjectId}`);
  }
  
  return true;
}
}

module.exports = new RelationRepository();