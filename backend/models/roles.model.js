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

const Role = sequelize.define("roles", {
   id: {
     type: DataTypes.INTEGER,
     allowNull: false,
     primaryKey: true,
     autoIncrement: true
   },
   role_name: {
     type: DataTypes.STRING,
     allowNull: false,
     unique: true
   }
}, {
   timestamps: false 
});

module.exports = Role;