const { Sequelize, Model, DataTypes } = require("sequelize");

const Cart = global.databaseConnection.define("cart", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV1,
    primaryKey: true
  },
  count: {
    type: DataTypes.STRING(255),
    required: true
  }
},
  {
    paranoid: true
  }
);
Cart.belongsTo(global.databaseConnection.models.inventory, {
    foreignKey: 'itemId', onDelete: 'cascade', hooks: true
  });
Cart.belongsTo(global.databaseConnection.models.users, {
    foreignKey: 'userId', onDelete: 'cascade', hooks: true
  });
module.exports = Cart;