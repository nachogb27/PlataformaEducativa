const { StudentsTeachersRelation, User, Subject } = require('../models');
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

  async findAvailableStudents(subjectId) {
    // Obtener IDs de estudiantes ya asignados
    const assignedRelations = await StudentsTeachersRelation.findAll({
      where: {
        id_subject: subjectId,
        id_student: { [Op.ne]: require('sequelize').col('id_teacher') }
      },
      attributes: ['id_student']
    });

    const assignedStudentIds = assignedRelations.map(r => r.id_student);

    // Construir consulta para estudiantes disponibles
    let whereClause = { role: 1 }; // Solo estudiantes

    if (assignedStudentIds.length > 0) {
      whereClause.id = { [Op.notIn]: assignedStudentIds };
    }

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
}

module.exports = new RelationRepository();