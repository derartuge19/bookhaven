const { Sequelize } = require('sequelize');
const path = require('path');

// Load environment variables from the project root .env file
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Debug: Log environment variables (remove in production)
console.log('DB Configuration:', {
  DB_NAME: process.env.DB_NAME ? '***' : 'Not set',
  DB_USER: process.env.DB_USER ? '***' : 'Not set',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || '5432'
});

// Ensure environment variables are loaded.....
if (!process.env.DB_NAME || !process.env.DB_USER || !process.env.DB_PASSWORD) {
  console.error('Missing required database configuration in .env file');
  console.error('Current working directory:', process.cwd());
  process.exit(1);
}

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: false
  }
});

// Test the database connection....
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection
};
