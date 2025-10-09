const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Book = sequelize.define('Book', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    coverImage: {
        type: DataTypes.STRING,
        allowNull: true
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    publishedDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    rating: {
        type: DataTypes.DECIMAL(3, 1),
        defaultValue: 0.0
    },
    reviews: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    timestamps: true
});

module.exports = Book;
