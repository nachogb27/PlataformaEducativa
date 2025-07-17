const { User, StudentsTeachersRelation, sequelize } = require('./index');

async function createTestData() {
  try {
    // Sincronizar tablas (esto recreará las tablas con la nueva columna avatar)
    console.log('Sincronizando base de datos...');
    await sequelize.sync({ force: true });
    
    console.log('Limpiando datos existentes...');
    await StudentsTeachersRelation.destroy({ where: {} });
    await User.destroy({ where: {} });
    
    console.log('Creando nuevos usuarios...');
    
    // Usuario activo
    const student = await User.create({
      username: 'estudiante1',
      name: 'Juan',
      surnames: 'Pérez García',
      email: 'nachogb@usal.es',
      role: 1,
      password_token: '123456',
      active: 1
    });

    // Usuario inactivo para probar
    const inactiveUser = await User.create({
      username: 'inactivo1',
      name: 'Usuario',
      surnames: 'Inactivo',
      email: 'inactivo@test.com',
      role: 1,
      password_token: '123456',
      active: 0
    });

    const teacher = await User.create({
      username: 'profesor1',
      name: 'María',
      surnames: 'González López',
      email: 'maria.gonzalez@email.com',
      role: 2,
      password_token: '123456',
      active: 1
    });

    // Crear relaciones estudiante-profesor-asignatura
    await StudentsTeachersRelation.create({
      id_student: student.id,
      id_teacher: teacher.id,
      id_subject: 1 // Inglés
    });

    await StudentsTeachersRelation.create({
      id_student: student.id,
      id_teacher: teacher.id,
      id_subject: 9 // Matemáticas
    });

    console.log('Datos de prueba creados exitosamente');
    console.log('Usuario activo:', student.username, '/ 123456');
    console.log('Usuario inactivo:', inactiveUser.username, '/ 123456');
    console.log('Usuario profesor:', teacher.username, '/ 123456');
    
  } catch (error) {
    console.error('Error creando datos de prueba:', error);
  }
}

createTestData();