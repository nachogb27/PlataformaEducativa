const { User, StudentsTeachersRelation } = require('./index');

async function createTestData() {
  try {
    // Limpiar datos existentes
    console.log('Limpiando datos existentes...');
    await StudentsTeachersRelation.destroy({ where: {} });
    await User.destroy({ where: {} });
    
    console.log('Creando nuevos usuarios...');
    
    // Crear usuarios de prueba
    const student = await User.create({
      username: 'estudiante1',
      name: 'Juan',
      surnames: 'Pérez García',
      email: 'nachogb@usal.es',
      role: 1,
      password_token: '123456',
      active: 1
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

    const teacher2 = await User.create({
      username: 'fernandoalonso',
      name: 'Fernando',
      surnames: 'Alonso',
      email: 'fernando.alonso@email.com',
      role: 2,
      password_token: '123456',
      active: 0
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
    console.log('Usuario estudiante:', student.username);
    console.log('Usuario profesor:', teacher.username);
    console.log('Contraseña para ambos: 123456');
    console.log('Email del estudiante:', student.email);
    
  } catch (error) {
    console.error('Error creando datos de prueba:', error);
  }
}

createTestData();