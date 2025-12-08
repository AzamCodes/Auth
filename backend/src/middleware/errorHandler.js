/**
 * Error Handler Middleware
 * Centralized error handling for the application
 */

const logger = require('../config/logger');

/**
 * 404 Not Found handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

/**
 * General error handler
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    // Log error
    logger.error(`${err.name}: ${err.message}\n${err.stack}`);

    // Send error response
    res.status(statusCode).json({
        success: false,
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            error: err,
        }),
    });
};

/**
 * Async error handler wrapper
 * @param {Function} fn - Async function
 * @returns {Function}
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    notFound,
    errorHandler,
    asyncHandler,
};
