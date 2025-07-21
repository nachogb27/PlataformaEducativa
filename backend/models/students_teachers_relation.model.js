const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
   'users',
   'root',
   'bisite',
    {
      host: 'localhost',
      dialect: 'mysql'
    }
  );

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
      // 🔧 VALIDACIÓN CORREGIDA PARA PERMITIR RELACIONES DUMMY DE PROFESORES
      async isValidStudent(value) {
        const User = require('./users.model');
        const user = await User.findByPk(value);
        if (!user) {
          throw new Error('El usuario estudiante no existe');
        }
        
        // ✅ PERMITIR ESTUDIANTES NORMALES (role = 1)
        if (user.role === 1) {
          return; // Válido
        }
        
        // ✅ PERMITIR PROFESORES EN RELACIONES DUMMY (role = 2 Y id_student = id_teacher)
        if (user.role === 2 && value === this.id_teacher) {
          return; // Válido - es una relación dummy donde el profesor se asigna a sí mismo
        }
        
        // ❌ RECHAZAR CUALQUIER OTRO CASO
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
        const User = require('./users.model');
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

// 🔧 MÉTODOS ESTÁTICOS MEJORADOS PARA EXCLUIR RELACIONES DUMMY
StudentsTeachersRelation.getStudentsByTeacher = async function(teacherId) {
   return await this.findAll({
      where: {
         id_teacher: teacherId,
         // 🔧 EXCLUIR RELACIONES DUMMY (donde id_student = id_teacher)
         id_student: {
           [Sequelize.Op.ne]: teacherId
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

// 🆕 MÉTODO PARA OBTENER ASIGNATURAS QUE DA UN PROFESOR (INCLUYENDO RELACIONES DUMMY)
StudentsTeachersRelation.getSubjectsByTeacher = async function(teacherId) {
   return await this.findAll({
      where: {
         id_teacher: teacherId
      }
   });
};

// 🆕 MÉTODO PARA CREAR RELACIÓN DUMMY DE PROFESOR
StudentsTeachersRelation.createTeacherSubjectRelation = async function(teacherId, subjectId) {
   const User = require('./users.model');
   const Subject = require('./subjects.model');
   
   // Verificar que el profesor existe y tiene rol correcto
   const teacher = await User.findByPk(teacherId);
   if (!teacher) {
     throw new Error('El profesor no existe');
   }
   if (teacher.role !== 2) {
     throw new Error('El usuario debe ser un profesor (role = 2)');
   }
   
   // Verificar que la asignatura existe
   const subject = await Subject.findByPk(subjectId);
   if (!subject) {
     throw new Error('La asignatura no existe');
   }
   
   // Crear relación dummy (id_student = id_teacher)
   return await this.create({
      id_student: teacherId,  // 🔧 Mismo ID para crear relación dummy
      id_teacher: teacherId,
      id_subject: subjectId
   });
};

StudentsTeachersRelation.assignTeacherToStudent = async function(studentId, teacherId, subjectId) {
   // Validaciones adicionales antes de crear
   const User = require('./users.model');
   const Subject = require('./subjects.model');
   
   // Verificar que el estudiante existe y tiene rol correcto
   const student = await User.findByPk(studentId);
   if (!student) {
     throw new Error('El estudiante no existe');
   }
   if (student.role !== 1) {
     throw new Error('El usuario debe ser un estudiante (role = 1)');
   }
   
   // Verificar que el profesor existe y tiene rol correcto
   const teacher = await User.findByPk(teacherId);
   if (!teacher) {
     throw new Error('El profesor no existe');
   }
   if (teacher.role !== 2) {
     throw new Error('El usuario debe ser un profesor (role = 2)');
   }
   
   // Verificar que la asignatura existe
   const subject = await Subject.findByPk(subjectId);
   if (!subject) {
     throw new Error('La asignatura no existe');
   }
   
   // Si todo es correcto, crear la relación
   return await this.create({
      id_student: studentId,
      id_teacher: teacherId,
      id_subject: subjectId
   });
};

module.exports = StudentsTeachersRelation;