# 📚 BookHaven

A modern, full-stack book e-commerce application built with React, TypeScript, Node.js, Express, and PostgreSQL. Browse, search, and purchase books using the Google Books API.

## 📁 Project Structure

```
BookHaven/
├── backend/      # Express + PostgreSQL API
├── frontend/     # Vite + React + TypeScript client
├── .env          # Shared environment variables (backend + Vite)
├── .gitignore
└── README.md
```

![BookHaven](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

- 🔍 **Advanced Book Search** - Search books by title, author, category with real-time results
- 📖 **Book Details** - Detailed book information including ratings, reviews, and descriptions
- 🛒 **Shopping Cart** - Add books to cart and manage your purchases
- 🔐 **User Authentication** - Secure JWT-based authentication with refresh tokens
- 📱 **Responsive Design** - Beautiful UI built with Material-UI that works on all devices
- 🎯 **Category Filtering** - Browse books by categories (Fiction, Science, History, etc.)
- ⚡ **Fast Performance** - Optimized with caching and rate limiting
- 🔄 **Real-time Updates** - Dynamic cart updates and user session management

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Material-UI (MUI)** - Component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Formik & Yup** - Form handling and validation
- **React Toastify** - Toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **PostgreSQL** - Relational database
- **Sequelize** - ORM for database operations
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### External APIs
- **Google Books API** - Book data and search functionality

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14.0.0 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v12 or higher)
- **Git**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone [https://github.com/derartuge19/bookhaven.git](https://github.com/derartuge19/bookhaven)
cd BookHaven


2. Install Dependencies
# Install frontend dependencies
npm install --prefix frontend

# Install backend dependencies
npm install --prefix backend

3. Set Up PostgreSQL Database
CREATE DATABASE bookhaven;

4. Configure Environment Variables

The `.env` file stays at the project root and is shared by both the backend and the Vite frontend (via `envDir: '..'`)`. Update it with your configuration:
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_NAME=bookhaven
DB_USER=postgres
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_here
REFRESH_TOKEN_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Google Books API
VITE_GOOGLE_BOOKS_API_KEY=your_google_books_api_key_here
GOOGLE_BOOKS_API_KEY=your_google_books_api_key_here

