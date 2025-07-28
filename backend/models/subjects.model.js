const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
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

  return Subject;
};