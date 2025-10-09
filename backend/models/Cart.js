const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Cart = sequelize.define('Cart', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      validate: {
        min: 0
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true
  });

  // Set up associations
  Cart.associate = (models) => {
    Cart.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    Cart.hasMany(models.CartItem, {
      foreignKey: 'cartId',
      as: 'items'
    });
  };

  // Instance method to update cart total
  Cart.prototype.updateTotal = async function() {
    const items = await this.getItems();
    this.total = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    await this.save();
    return this.total;
  };

  return Cart;
};
