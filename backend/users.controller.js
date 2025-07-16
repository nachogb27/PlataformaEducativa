const User = require('./models/users.model'); 
const { v4: uuidv4 } = require('uuid');

// Función para crear usuario
async function createUser() {
  try {
    const newUser = await User.create({
       username: "PedritoR",
       name: "Pedro",
       surnames: "Rodriguez", 
       email : "pr@usal.es",
       role : 2 ,
       active : 0 , 
   });
   
   console.log('Usuario creado exitosamente:', newUser.toJSON());
  } catch (error) {
    console.error('Error al crear usuario:', error);
  }
}

// Función para mostrar todos los usuarios
async function getAllUsers() {
  try {
    const users = await User.findAll();
    console.log('Todos los usuarios:', users.map(user => user.toJSON()));
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
  }
}

// Función para buscar un usuario
async function findUser(id) {
  try {
    const user = await User.findOne({
        where: {
            id : id
        }
    });
    
    if (user) {
      console.log('Usuario encontrado:', user.toJSON());
    } else {
      console.log('Usuario no encontrado');
    }
  } catch (error) {
    console.error('Error al buscar usuario:', error);
  }
}

// Función para borrar un usuario
async function deleteUser(id) {
  try {
    const deletedRows = await User.destroy({
        where: {
          id: id
        }
    });
    
    if (deletedRows > 0) {
      console.log("Usuario eliminado exitosamente.");
    } else {
      console.log("No se encontró el usuario a eliminar.");
    }
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
  }
}

//createUser();
//getAllUsers();
//findUser(3);
//deleteUser(3);