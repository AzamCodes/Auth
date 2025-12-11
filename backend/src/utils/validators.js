/**
 * Validation Rules
 * Input validation rules using express-validator
 */

const { body, param } = require('express-validator');

/**
 * Registration validation
 */
const registerValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
];

/**
 * Login validation
 */
const loginValidation = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

/**
 * Email verification validation
 */
const emailVerificationValidation = [
    body('userId')
        .notEmpty()
        .withMessage('User ID is required')
        .isMongoId()
        .withMessage('Invalid user ID'),

    body('otp')
        .notEmpty()
        .withMessage('OTP is required')
        .isLength({ min: 6, max: 6 })
        .withMessage('OTP must be 6 digits')
        .isNumeric()
        .withMessage('OTP must contain only numbers'),
];

/**
 * Resend verification validation
 */
const resendVerificationValidation = [
    body('userId')
        .notEmpty()
        .withMessage('User ID is required')
        .isMongoId()
        .withMessage('Invalid user ID'),
];

/**
 * Password reset request validation
 */
const passwordResetRequestValidation = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
];

/**
 * Verify reset OTP validation
 */
const verifyResetOTPValidation = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('otp')
        .notEmpty()
        .withMessage('OTP is required')
        .isLength({ min: 6, max: 6 })
        .withMessage('OTP must be 6 digits')
        .isNumeric()
        .withMessage('OTP must contain only numbers'),
];

/**
 * Reset password validation
 */
const resetPasswordValidation = [
    body('resetToken')
        .notEmpty()
        .withMessage('Reset token is required'),

    body('newPassword')
        .notEmpty()
        .withMessage('New password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
];

/**
 * Change password validation
 */
const changePasswordValidation = [
    body('oldPassword')
        .notEmpty()
        .withMessage('Current password is required'),

    body('newPassword')
        .notEmpty()
        .withMessage('New password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
];

/**
 * 2FA token validation
 */
const twoFactorTokenValidation = [
    body('token')
        .notEmpty()
        .withMessage('2FA token is required')
        .isLength({ min: 6, max: 6 })
        .withMessage('2FA token must be 6 digits')
        .isNumeric()
        .withMessage('2FA token must contain only numbers'),
];

/**
 * 2FA validation with user ID
 */
const validate2FAValidation = [
    body('userId')
        .notEmpty()
        .withMessage('User ID is required')
        .isMongoId()
        .withMessage('Invalid user ID'),

    body('token')
        .notEmpty()
        .withMessage('2FA token is required')
        .isLength({ min: 6, max: 6 })
        .withMessage('2FA token must be 6 digits')
        .isNumeric()
        .withMessage('2FA token must contain only numbers'),
];

/**
 * Disable 2FA validation
 */
const disable2FAValidation = [
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

/**
 * Update profile validation
 */
const updateProfileValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),

    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
];

/**
 * Update role validation
 */
const updateRoleValidation = [
    body('role')
        .notEmpty()
        .withMessage('Role is required')
        .isIn(['user', 'admin'])
        .withMessage('Role must be either user or admin'),
];

/**
 * Suspend user validation
 */
const suspendUserValidation = [
    body('reason')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Reason cannot exceed 500 characters'),
];

/**
 * MongoDB ID parameter validation
 */
const mongoIdValidation = [
    param('id')
        .isMongoId()
        .withMessage('Invalid ID'),
];

module.exports = {
    registerValidation,
    loginValidation,
    emailVerificationValidation,
    resendVerificationValidation,
    passwordResetRequestValidation,
    verifyResetOTPValidation,
    resetPasswordValidation,
    changePasswordValidation,
    twoFactorTokenValidation,
    validate2FAValidation,
    disable2FAValidation,
    updateProfileValidation,
    updateRoleValidation,
    suspendUserValidation,
    mongoIdValidation,
};
