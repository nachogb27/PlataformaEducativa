const { StudentsTeachersRelation, User, Subject, sequelize } = require('../models');
const { Op } = require('sequelize');

class RelationRepository {
  async findStudentsByTeacher(teacherId) {
    return await StudentsTeachersRelation.findAll({
      where: {
        id_teacher: teacherId,
        id_student: { [Op.ne]: teacherId } 
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
  const allRelations = await StudentsTeachersRelation.findAll({
    where: { id_subject: subjectId },
    attributes: ['id_student', 'id_teacher']
  });

  const assignedStudentIds = allRelations
    .filter(relation => relation.id_student !== relation.id_teacher)
    .map(relation => relation.id_student);

  let whereClause = { role: 1 }; 

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

async canTeacherManageSubject(teacherId, subjectId) {
  const relation = await StudentsTeachersRelation.findOne({
    where: {
      id_teacher: teacherId,
      id_subject: subjectId
    }
  });
  
  return !!relation; 
}

async ensureTeacherSubjectRelation(teacherId, subjectId) {
  const existingRelation = await this.canTeacherManageSubject(teacherId, subjectId);
  
  if (!existingRelation) {
    await this.create({
      id_student: teacherId,  
      id_teacher: teacherId,
      id_subject: subjectId
    });
    
    console.log(`✅ Relación dummy creada: teacher=${teacherId}, subject=${subjectId}`);
  }
  
  return true;
}
}

module.exports = new RelationRepository();