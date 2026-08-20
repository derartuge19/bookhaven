require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const { sequelize, testConnection } = require('./config/db');

// Import models
const { User, Cart, CartItem, Book, Order } = require('./models');

// Import routes
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);

// Root API endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to the BookHaven API',
    endpoints: {
      auth: '/api/auth',
      books: '/api/books',
      orders: '/api/orders',
      cart: '/api/cart',
      health: '/api/health'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        database: sequelize.config.database,
        username: sequelize.config.username,
        host: sequelize.config.host,
        port: sequelize.config.port
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Welcome to Bookstore API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            books: '/api/books',
            orders: '/api/orders',
            cart: '/api/cart'
        }
    });
});

// Database connection and server start
const startServer = async () => {
    try {
        // Test database connection
        await testConnection();
        
        // Sync all models
        await sequelize.sync({ force: false, alter: true });
        console.log('Database synchronized');
        
        // Start server
        const server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`API URL: http://localhost:${PORT}/api`);
        });

        // Handle server errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use`);
                process.exit(1);
            }
            throw error;
        });
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    // Close server & exit process
    if (server) {
        server.close(() => process.exit(1));
    } else {
        process.exit(1);
    }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// Start the server
startServer();

module.exports = app;
