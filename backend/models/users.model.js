const { Sequelize, DataTypes } = require("sequelize");
const { v4: uuidv4 } = require('uuid');

const sequelize = new Sequelize(
   'users',
   'root',
   'bisite',
    {
      host: 'localhost',
      dialect: 'mysql'
    }
  );

const User = sequelize.define("users", {
   id: {
     type: DataTypes.INTEGER,
     allowNull: false,
     primaryKey: true,
     autoIncrement: true
   },
   username: {
     type: DataTypes.STRING,
     allowNull: false,
     unique: true,
   },
   name: {
     type: DataTypes.STRING,
     allowNull: false
   },
   surnames: {
     type: DataTypes.STRING,
     allowNull: false
   },
   email: {
     type: DataTypes.STRING,
     allowNull: false,
     unique: true
   },
   role: {
     type: DataTypes.INTEGER,
     allowNull: false,
     references: {
      model: 'roles',  
      key: 'id',       
    },
   },
   access_token: {
     type: DataTypes.STRING, 
     defaultValue: () => uuidv4(), 
   },
   password_token: {
      type: DataTypes.STRING, 
     defaultValue: () => uuidv4(),
   },
   active: {
     type: DataTypes.INTEGER,
     defaultValue: 0,
     validate: {
       isIn: [[0, 1]]
     }
   }
}, {
   timestamps: true 
});


User.prototype.generateTokens = function() {
   this.access_token = uuidv4(); 
   this.password_token = uuidv4(); 
   return this.save();
};

User.prototype.activate = function() {
   this.active = 1;
   return this.save();
};

User.prototype.deactivate = function() {
   this.active = 0;
   return this.save();
};

module.exports = User;