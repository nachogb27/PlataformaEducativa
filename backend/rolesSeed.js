const { Sequelize } = require('sequelize');
const Role = require('./models/roles.model');

const sequelize = new Sequelize('users', 'root', 'bisite', {
  host: 'localhost',
  dialect: 'mysql',
});

async function createRoles() {
  try {
    await sequelize.sync();

    await Role.bulkCreate([
      { id: 1, role_name: 'student' },
      { id: 2, role_name: 'teacher' }
    ], {
      ignoreDuplicates: true
    });

    console.log('Roles inserted successfully!');
  } catch (error) {
    console.error('Error inserting roles:', error);
  } finally {
    await sequelize.close();
  }
}

createRoles();