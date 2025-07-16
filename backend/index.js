const Sequelize = require("sequelize");

const sequelize = new Sequelize(
   'users',
   'root',
   'bisite',
    {
      host: 'localhost',
      dialect: 'mysql'
    }
  );

sequelize.authenticate().then(() => {
   console.log('Connection has been established successfully.');
}).catch((error) => {
   console.error('Unable to connect to the database: ', error);
});

// Importar modelos
const Role = require('./models/roles.model');
const Subject = require('./models/subjects.model');
const User = require('./models/users.model');
const Session = require('./models/sessions.model');
const StudentsTeachersRelation = require('./models/students_teachers_relation.model');

// Configurar asociaciones
User.belongsTo(Role, {
   foreignKey: 'role',
   as: 'roleData'
});

Role.hasMany(User, {
   foreignKey: 'role',
   as: 'users'
});

User.hasMany(Session, {
   foreignKey: 'id_user',
   as: 'sessions'
});

Session.belongsTo(User, {
   foreignKey: 'id_user',
   as: 'user'
});

// Relaciones para StudentsTeachersRelation
StudentsTeachersRelation.belongsTo(User, {
   foreignKey: 'id_student',
   as: 'student'
});

StudentsTeachersRelation.belongsTo(User, {
   foreignKey: 'id_teacher',
   as: 'teacher'
});

StudentsTeachersRelation.belongsTo(Subject, {
   foreignKey: 'id_subject',
   as: 'subject'
});

User.hasMany(StudentsTeachersRelation, {
   foreignKey: 'id_student',
   as: 'studentRelations'
});

User.hasMany(StudentsTeachersRelation, {
   foreignKey: 'id_teacher',
   as: 'teacherRelations'
});

Subject.hasMany(StudentsTeachersRelation, {
   foreignKey: 'id_subject',
   as: 'relations'
});

// Sincronización de tablas en orden
sequelize.sync({ force: false }).then(() => {
   console.log('Database synchronized successfully!');
   return Role.sync({ force: false });
}).then(() => {
   console.log('Roles table has been loaded or exists already!');
   return Subject.sync({ force: false });
}).then(() => {
   console.log('Subjects table has been loaded or exists already!');
   return User.sync({ force: false });
}).then(() => {
   console.log('Users table has been loaded or exists already!');
   return Session.sync({ force: false });
}).then(() => {
   console.log('Sessions table has been loaded or exists already!');
   return StudentsTeachersRelation.sync({ force: false });
}).then(() => {
   console.log('Students-Teachers Relation table has been loaded or exists already!');
}).catch((error) => {
   console.error('Unable to create tables: ', error);
});

module.exports = {
   sequelize,
   Role,
   Subject,
   User,
   Session,
   StudentsTeachersRelation
};