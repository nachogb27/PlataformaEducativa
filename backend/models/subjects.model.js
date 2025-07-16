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

const Subject = sequelize.define("subjects", {
   id: {
     type: DataTypes.INTEGER,
     allowNull: false,
     primaryKey: true,
     autoIncrement: true
   },
   subject_name: {
     type: DataTypes.STRING,
     allowNull: false,
     unique: true
   }
}, {
   timestamps: false 
});

module.exports = Subject;