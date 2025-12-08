/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting request rates
 */

const rateLimit = require('express-rate-limit');

/**
 * General rate limiter
 */
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Auth rate limiter (stricter for auth endpoints)
 */
const authLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5'), // 5 requests
    skipSuccessfulRequests: true, // Don't count successful requests
    message: {
        success: false,
        message: 'Too many login attempts. Please try again after 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Password reset rate limiter
 */
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Increased to 10 requests per hour
    skipFailedRequests: true, // Don't count failed requests (like validation errors)
    message: {
        success: false,
        message: 'Too many password reset requests. Please try again after 1 hour.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Email verification rate limiter
 */
const emailVerificationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 requests per hour
    message: {
        success: false,
        message: 'Too many verification requests. Please try again after 1 hour.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    generalLimiter,
    authLimiter,
    passwordResetLimiter,
    emailVerificationLimiter,
};
