/**
 * Authentication Middleware
 * Protects routes by verifying JWT access tokens
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

/**
 * Verify JWT access token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Please login to access this resource.',
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        // Get user from database
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Please login again.',
            });
        }

        // Check if user is suspended
        if (user.isSuspended) {
            logger.warn(`Suspended user attempted access: ${user.email}`);
            return res.status(403).json({
                success: false,
                message: 'Your account has been suspended. Please contact support.',
            });
        }

        // Attach user to request
        req.user = {
            id: user._id,
            email: user.email,
            role: user.role,
        };

        next();
    } catch (error) {
        logger.error(`Authentication error: ${error.message}`);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please login again.',
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please refresh your token or login again.',
            });
        }

        res.status(500).json({
            success: false,
            message: 'Authentication failed',
        });
    }
};

/**
 * Optional authentication - doesn't throw error if no token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuthenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        const user = await User.findById(decoded.userId);

        if (user && !user.isSuspended) {
            req.user = {
                id: user._id,
                email: user.email,
                role: user.role,
            };
        }

        next();
    } catch (error) {
        // Silently fail - token is optional
        next();
    }
};

module.exports = {
    authenticate,
    optionalAuthenticate,
};
