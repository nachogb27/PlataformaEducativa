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

const Session = sequelize.define("sessions", {
   id: {
     type: DataTypes.INTEGER,
     allowNull: false,
     primaryKey: true,
     autoIncrement: true
   },
   id_user: {
     type: DataTypes.INTEGER,
     allowNull: false,
     references: {
      model: 'users',  
      key: 'id',       
    },
   },
   signed_at: {
     type: DataTypes.DATE,
     allowNull: false,
     defaultValue: DataTypes.NOW
   }
}, {
   timestamps: false 
});


Session.createSession = async function(userId) {
   return await this.create({
      id_user: userId,
      signed_at: new Date()
   });
};

Session.closeSession = async function(userId) {
   return await this.destroy({
      where: {
         id_user: userId
      }
   });
};

Session.getActiveSession = async function(userId) {
   return await this.findOne({
      where: {
         id_user: userId
      }
   });
};

module.exports = Session;