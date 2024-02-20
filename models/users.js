const { Sequelize, Model, DataTypes } = require("sequelize");

const User = global.databaseConnection.define("users", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV1,
    primaryKey: true
  },
  role: {
    type: DataTypes.STRING(255),
    required: true
  },
  userName: {
    type: DataTypes.STRING(255),
    required: true, unique: true
  }
},
{
    freezeTableName: true
}
);

module.exports = User;