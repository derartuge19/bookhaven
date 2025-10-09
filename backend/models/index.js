const { Sequelize } = require('sequelize');
const { sequelize } = require('../config/db');

// Import model functions
const userModel = require('./user');
const cartModel = require('./Cart');
const cartItemModel = require('./CartItem');

// Initialize models
const User = userModel(sequelize);
const Cart = cartModel(sequelize);
const CartItem = cartItemModel(sequelize);

// Set up associations
if (User.associate) {
  User.associate({ Cart, CartItem });
}

if (Cart.associate) {
  Cart.associate({ User, CartItem });
}

if (CartItem.associate) {
  CartItem.associate({ Cart });
}

// Add methods to User model
User.prototype.getActiveCart = async function() {
  let cart = await Cart.findOne({
    where: {
      userId: this.id,
      isActive: true
    },
    include: [
      {
        model: CartItem,
        as: 'items'
      }
    ]
  });
  
  if (!cart) {
    cart = await Cart.create({
      userId: this.id,
      total: 0,
      isActive: true
    });
  }
  
  return cart;
};

// Add method to update cart total
Cart.prototype.updateTotal = async function() {
  const items = await this.getItems();
  this.total = items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  await this.save();
  return this.total;
};

// Export models and sequelize instance
module.exports = {
  sequelize,
  Sequelize,
  User,
  Cart,
  CartItem
};
