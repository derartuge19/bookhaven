const jwt = require('jsonwebtoken');
// const { User } = require('../models');
const { Op } = require('sequelize');
const { User, Cart, CartItem } = require('../models');

const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { userId: user.id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret',
        { expiresIn: '7d' }
    );
    
    return { accessToken, refreshToken };
};

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { email },
                    { username }
                ]
            }
        });
        
        if (existingUser) {
            return res.status(400).json({
                message: 'User with this email or username already exists'
            });
        }
        
        // Create new user
        const user = await User.create({
            username,
            email,
            password,
            isAdmin: false
        });
        
        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user);
        
        // Update user with refresh token
        await user.update({ refreshToken });
        
        // Set refresh token in HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        // Return user data and access token
        res.status(201).json({
            user: user.getProfile(),
            accessToken
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Please provide both email and password' 
            });
        }
        
        console.log('Login attempt for email:', email);
        
        // Find user by email
        const user = await User.findOne({ 
            where: { 
                email: email.trim().toLowerCase()
            } 
        });
        
        if (!user) {
            console.log('No user found with email:', email);
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Invalid password for user:', email);
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        console.log('Password valid, generating tokens...');
        
        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user);
        
        // Update user's refresh token in database
        await user.update({ refreshToken });

        // Set refresh token in HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Send response with user data and access token
        res.json({
            success: true,
            token: accessToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                isAdmin: user.isAdmin,
                profileImage: user.profileImage
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error logging in',
            error: error.message 
        });
    }
};

const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        
        if (!refreshToken) {
            return res.status(401).json({ message: 'No refresh token provided' });
        }
        
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret');
        
        // Find user by ID and refresh token
        const user = await User.findOne({
            where: {
                id: decoded.userId,
                refreshToken
            }
        });
        
        if (!user) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }
        
        // Generate new tokens
        const tokens = generateTokens(user);
        
        // Update refresh token in database
        await user.update({ refreshToken: tokens.refreshToken });
        
        // Set new refresh token in cookie
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        // Return new access token
        res.json({ accessToken: tokens.accessToken });
        
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(403).json({ message: 'Invalid refresh token' });
    }
};

const logout = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        
        if (refreshToken) {
            // Clear refresh token from database
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret');
            await User.update(
                { refreshToken: null },
                { where: { id: decoded.userId } }
            );
        }
        
        // Clear cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        
        res.json({ message: 'Logged out successfully' });
        
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Error logging out' });
    }
};

const getProfile = async (req, res) => {
    try {
        // First, verify the token and get user ID
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Find user by ID from token
        const user = await User.findByPk(decoded.userId, {
            attributes: { exclude: ['password', 'refreshToken'] },
            include: [
                {
                    model: Cart,
                    as: 'cart',
                    include: [
                        {
                            model: CartItem,
                            as: 'items'
                        }
                    ]
                }
            ]
        });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
        
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ 
            message: 'Error fetching profile',
            error: error.message 
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { fullName, address, phoneNumber } = req.body;
        
        const user = await User.findByPk(req.userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Update user profile
        await user.update({
            fullName: fullName || user.fullName,
            address: address || user.address,
            phoneNumber: phoneNumber || user.phoneNumber
        });
        
        res.json(user.getProfile());
        
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};

module.exports = {
    register,
    login,
    refreshToken,
    logout,
    getProfile,
    updateProfile
};
