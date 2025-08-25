const { DataTypes, Op } = require("sequelize");

module.exports = (sequelize) => {
  const StudentsTeachersRelation = sequelize.define("students_teachers_relation", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    id_student: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',  
        key: 'id',       
      },
      validate: {
        async isValidStudent(value) {
          const User = sequelize.models.users;
          const user = await User.findByPk(value);
          if (!user) {
            throw new Error('El usuario estudiante no existe');
          }
          
          if (user.role === 1) {
            return;
          }
          
          if (user.role === 2 && value === this.id_teacher) {
            return;
          }
          
          throw new Error('El usuario debe tener rol de estudiante (role = 1) o ser una relación dummy de profesor');
        }
      }
    },
    id_teacher: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',  
        key: 'id',       
      },
      validate: {
        async isValidTeacher(value) {
          const User = sequelize.models.users;
          const user = await User.findByPk(value);
          if (!user) {
            throw new Error('El usuario profesor no existe');
          }
          if (user.role !== 2) {
            throw new Error('El usuario debe tener rol de profesor (role = 2)');
          }
        }
      }
    },
    id_subject: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'subjects',  
        key: 'id',       
      },
    }
  }, {
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['id_student', 'id_teacher', 'id_subject']
      }
    ]
  });

  StudentsTeachersRelation.getStudentsByTeacher = async function(teacherId) {
    return await this.findAll({
      where: {
        id_teacher: teacherId,
        id_student: {
          [Op.ne]: teacherId
        }
      }
    });
  };

  StudentsTeachersRelation.getTeachersByStudent = async function(studentId) {
    return await this.findAll({
      where: {
        id_student: studentId
      }
    });
  };

  StudentsTeachersRelation.getSubjectsByTeacher = async function(teacherId) {
    return await this.findAll({
      where: {
        id_teacher: teacherId
      }
    });
  };

  StudentsTeachersRelation.createTeacherSubjectRelation = async function(teacherId, subjectId) {
    const User = sequelize.models.users;
    const Subject = sequelize.models.subjects;
    
    const teacher = await User.findByPk(teacherId);
    if (!teacher) {
      throw new Error('El profesor no existe');
    }
    if (teacher.role !== 2) {
      throw new Error('El usuario debe ser un profesor (role = 2)');
    }
    
    const subject = await Subject.findByPk(subjectId);
    if (!subject) {
      throw new Error('La asignatura no existe');
    }
    
    return await this.create({
      id_student: teacherId, 
      id_teacher: teacherId,
      id_subject: subjectId
    });
  };

  StudentsTeachersRelation.assignTeacherToStudent = async function(studentId, teacherId, subjectId) {
    const User = sequelize.models.users;
    const Subject = sequelize.models.subjects;
    
    const student = await User.findByPk(studentId);
    if (!student) {
      throw new Error('El estudiante no existe');
    }
    if (student.role !== 1) {
      throw new Error('El usuario debe ser un estudiante (role = 1)');
    }
    
    const teacher = await User.findByPk(teacherId);
    if (!teacher) {
      throw new Error('El profesor no existe');
    }
    if (teacher.role !== 2) {
      throw new Error('El usuario debe ser un profesor (role = 2)');
    }
    
    const subject = await Subject.findByPk(subjectId);
    if (!subject) {
      throw new Error('La asignatura no existe');
    }
    
    return await this.create({
      id_student: studentId,
      id_teacher: teacherId,
      id_subject: subjectId
    });
  };

  return StudentsTeachersRelation;
};