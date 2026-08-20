const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  class User extends Model {
    // Method to validate password
    async comparePassword(candidatePassword) {
      return await bcrypt.compare(candidatePassword, this.password);
    }

    // Method to get user profile without sensitive data
    getProfile() {
      return {
        id: this.id,
        username: this.username,
        email: this.email,
        fullName: this.fullName,
        isAdmin: this.isAdmin,
        profileImage: this.profileImage,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      };
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [3, 30]
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [6, 100]
        }
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: true
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          is: /^[0-9\-\+]{9,15}$/
        }
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      profileImage: {
        type: DataTypes.STRING,
        allowNull: true
      },
      refreshToken: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'User',
      timestamps: true,
      hooks: {
        // Hash password before creating/updating
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        }
      }
    }
  );

  User.associate = (models) => {
    User.hasOne(models.Cart, {
      as: 'cart',
      foreignKey: 'userId',
    });
  };

  return User;
};
