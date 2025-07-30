const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
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

  return Role;
};