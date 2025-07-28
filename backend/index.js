const { Sequelize } = require('sequelize');

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

// Importar modelos pasándoles la instancia de sequelize
const User = require('./models/user.model')(sequelize);
const Role = require('./models/roles.model')(sequelize);
const Subject = require('./models/subjects.model')(sequelize);
const Session = require('./models/sessions.model')(sequelize);
const StudentsTeachersRelation = require('./models/students_teachers_relation.model')(sequelize);

// ✅ CONFIGURAR ASOCIACIONES DESPUÉS DE CARGAR TODOS LOS MODELOS
console.log('⚙️ Configurando asociaciones...');

// User - Role
User.belongsTo(Role, {
   foreignKey: 'role',
   as: 'roleData'
});

Role.hasMany(User, {
   foreignKey: 'role',
   as: 'users'
});

// User - Session
User.hasMany(Session, {
   foreignKey: 'id_user',
   as: 'sessions'
});

Session.belongsTo(User, {
   foreignKey: 'id_user',
   as: 'user'
});

// StudentsTeachersRelation - User (como estudiante)
StudentsTeachersRelation.belongsTo(User, {
   foreignKey: 'id_student',
   as: 'student'
});

// StudentsTeachersRelation - User (como profesor)
StudentsTeachersRelation.belongsTo(User, {
   foreignKey: 'id_teacher',
   as: 'teacher'
});

// StudentsTeachersRelation - Subject
StudentsTeachersRelation.belongsTo(Subject, {
   foreignKey: 'id_subject',
   as: 'subject'
});

// User - StudentsTeachersRelation (como estudiante)
User.hasMany(StudentsTeachersRelation, {
   foreignKey: 'id_student',
   as: 'studentRelations'
});

// User - StudentsTeachersRelation (como profesor)
User.hasMany(StudentsTeachersRelation, {
   foreignKey: 'id_teacher',
   as: 'teacherRelations'
});

// Subject - StudentsTeachersRelation
Subject.hasMany(StudentsTeachersRelation, {
   foreignKey: 'id_subject',
   as: 'relations'
});

console.log('✅ Asociaciones configuradas');

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

// ✅ EXPORTAR MODELOS CON ASOCIACIONES YA CONFIGURADAS
module.exports = {
   sequelize,
   User,
   Role,
   Subject,
   Session,
   StudentsTeachersRelation
};