const { Sequelize } = require('sequelize');
const Subject = require('./models/subjects.model');

const sequelize = new Sequelize('users', 'root', 'bisite', {
  host: 'localhost',
  dialect: 'mysql',
});

async function createSubjects() {
  try {
    await sequelize.sync();

    await Subject.bulkCreate([
      { id: 1, subject_name: 'Inglés' },
      { id: 2, subject_name: 'Lengua Castellana' },
      { id: 3, subject_name: 'Física' },
      { id: 4, subject_name: 'Química' },
      { id: 5, subject_name: 'Latín' },
      { id: 6, subject_name: 'Economía' },
      { id: 7, subject_name: 'Historia' },
      { id: 8, subject_name: 'Dibujo Técnico' },
      { id: 9, subject_name: 'Matemáticas' },
      { id: 10, subject_name: 'Francés' },
      { id: 11, subject_name: 'Alemán' },
      { id: 12, subject_name: 'Filosofía' },
      { id: 13, subject_name: 'Biología' },
      { id: 14, subject_name: 'Geología' },
      { id: 15, subject_name: 'Tecnología Industrial' },
      { id: 16, subject_name: 'Griego' },
      { id: 17, subject_name: 'Tecnologías de la información' },
      { id: 18, subject_name: 'Educación Física' },
      { id: 19, subject_name: 'Música' },
      { id: 20, subject_name: 'Historia del arte' },
    ], {
      ignoreDuplicates: true
    });

    console.log('Subjects inserted successfully!');
  } catch (error) {
    console.error('Error inserting subjects:', error);
  } finally {
    await sequelize.close();
  }
}

createSubjects();