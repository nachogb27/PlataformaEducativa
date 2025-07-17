const { User, StudentsTeachersRelation, sequelize } = require('./index');

async function createTestData() {
  try {
    // Sincronizar tablas
    console.log('Sincronizando base de datos...');
    await sequelize.sync({ force: true });
    
    console.log('Limpiando datos existentes...');
    await StudentsTeachersRelation.destroy({ where: {} });
    await User.destroy({ where: {} });
    
    console.log('Creando usuarios...');
    
    // Crear 10 estudiantes
    const students = [];
    const studentNames = [
      { name: 'Juan', surname: 'Pérez García', email: 'juan.perez@email.es' },
      { name: 'María', surname: 'González López', email: 'maria.gonzalez@email.es' },
      { name: 'Carlos', surname: 'Ruiz Martín', email: 'carlos.ruiz@email.es' },
      { name: 'Ana', surname: 'Jiménez Ramos', email: 'ana.jimenez@email.es' },
      { name: 'Luis', surname: 'Hernández Vila', email: 'luis.hernandez@email.es' },
      { name: 'Elena', surname: 'Moreno Sanz', email: 'elena.moreno@email.es' },
      { name: 'David', surname: 'Torres Blanco', email: 'david.torres@email.es' },
      { name: 'Laura', surname: 'Romero Cruz', email: 'laura.romero@email.es' },
      { name: 'Pablo', surname: 'Vargas Díez', email: 'pablo.vargas@email.es' },
      { name: 'Carmen', surname: 'Delgado Vega', email: 'carmen.delgado@email.es' }
    ];

    for (let i = 0; i < studentNames.length; i++) {
      const student = await User.create({
        username: `estudiante${i + 1}`,
        name: studentNames[i].name,
        surnames: studentNames[i].surname,
        email: studentNames[i].email,
        role: 1,
        password_token: '1234',
        active: 1
      });
      students.push(student);
    }

    // Crear 5 profesores
    const teachers = [];
    const teacherData = [
      { name: 'Roberto', surname: 'García Fernández', email: 'roberto.garcia@usal.es', subject: 1 }, // Inglés
      { name: 'Isabel', surname: 'López Martínez', email: 'isabel.lopez@usal.es', subject: 2 }, // Lengua Castellana
      { name: 'Miguel', surname: 'Rodríguez Santos', email: 'miguel.rodriguez@usal.es', subject: 9 }, // Matemáticas
      { name: 'Patricia', surname: 'Sánchez Ruiz', email: 'patricia.sanchez@usal.es', subject: 7 }, // Historia
      { name: 'Fernando', surname: 'Martín Iglesias', email: 'fernando.martin@usal.es', subject: 3 } // Física
    ];

    for (let i = 0; i < teacherData.length; i++) {
      const teacher = await User.create({
        username: `profesor${i + 1}`,
        name: teacherData[i].name,
        surnames: teacherData[i].surname,
        email: teacherData[i].email,
        role: 2,
        password_token: '1234',
        active: 1
      });
      teachers.push({ ...teacher.toJSON(), subjectId: teacherData[i].subject });
    }

    // Crear un usuario inactivo para probar
    await User.create({
      username: 'inactivo1',
      name: 'Usuario',
      surnames: 'Inactivo',
      email: 'inactivo@test.com',
      role: 1,
      password_token: '1234',
      active: 0
    });

    // Crear relaciones: cada estudiante cursa todas las asignaturas de los profesores
    console.log('Creando relaciones estudiante-profesor-asignatura...');
    for (const student of students) {
      for (const teacher of teachers) {
        await StudentsTeachersRelation.create({
          id_student: student.id,
          id_teacher: teacher.id,
          id_subject: teacher.subjectId
        });
      }
    }

    console.log('Datos de prueba creados exitosamente');
    console.log(`- ${students.length} estudiantes creados`);
    console.log(`- ${teachers.length} profesores creados`);
    console.log(`- ${students.length * teachers.length} relaciones creadas`);
    console.log('Contraseña para todos: 1234');
    
  } catch (error) {
    console.error('Error creando datos de prueba:', error);
  }
}

createTestData();