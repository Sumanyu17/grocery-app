const { Sequelize, Model, DataTypes } = require("sequelize");

let removeItemsFromCart = function (item, options) {
  try {
    let time = new Date();
    global.databaseConnection.models.cart.update({ count: 0 }, { where: { itemId: item.id } }).then((result) => {
      if (result) {
        console.log("removed deleted item from carts");
      }
      else {
        console.log("failed to removed deleted item from carts");
      }
      return;
    });
    return;
  } catch (error) {
    console.log(error);
  }

}
const Inventory = global.databaseConnection.define("inventory", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV1,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    required: true
  },
  description: {
    type: DataTypes.STRING(255),
  },
  price: {
    type: DataTypes.INTEGER,
    required: true
  },
  count: {
    type: DataTypes.STRING(255),
    required: true
  }
},
  {
    freezeTableName: true,
    paranoid: true,
    hooks: {
      afterDestroy: removeItemsFromCart,
    }
  }
);

module.exports = Inventory;