/**
 * Input Validation Middleware
 * Validates request data using express-validator
 */

const { validationResult } = require('express-validator');

/**
 * Validate request and return errors if any
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const extractedErrors = errors.array().map((err) => ({
            field: err.path,
            message: err.msg,
        }));

        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: extractedErrors,
        });
    }

    next();
};

module.exports = validate;
