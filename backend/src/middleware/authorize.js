/**
 * Authorization Middleware
 * Role-based access control (RBAC)
 */

const logger = require('../config/logger');

/**
 * Check if user has required role(s)
 * @param {...string} roles - Required roles
 * @returns {Function}
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        if (!roles.includes(req.user.role)) {
            logger.warn(`Unauthorized access attempt by user: ${req.user.email} (role: ${req.user.role})`);

            return res.status(403).json({
                success: false,
                message: 'You do not have permission to perform this action',
            });
        }

        next();
    };
};

/**
 * Check if user is admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isAdmin = (req, res, next) => {
    return authorize('admin')(req, res, next);
};

/**
 * Check if user is accessing their own resource
 * @param {string} paramName - Parameter name containing user ID
 * @returns {Function}
 */
const isOwner = (paramName = 'userId') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        const resourceUserId = req.params[paramName] || req.body[paramName];

        // Allow if user is admin or accessing their own resource
        if (req.user.role === 'admin' || req.user.id.toString() === resourceUserId.toString()) {
            return next();
        }

        logger.warn(`Unauthorized resource access by user: ${req.user.email}`);

        res.status(403).json({
            success: false,
            message: 'You can only access your own resources',
        });
    };
};

module.exports = {
    authorize,
    isAdmin,
    isOwner,
};
