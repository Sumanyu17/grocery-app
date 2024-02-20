let User = require('./models/users');
let Task = require('./models/inventory');
let Cart = require('./models/cart')

const models = {
  User: User,
  Task: Task,
  Cart: Cart
};

module.exports = models;