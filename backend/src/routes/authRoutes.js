/**
 * Authentication Routes
 * Defines all authentication-related API endpoints
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, optionalAuthenticate } = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const {
    authLimiter,
    passwordResetLimiter,
    emailVerificationLimiter,
} = require('../middleware/rateLimiter');
const {
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
} = require('../utils/validators');

// Public routes
router.post('/register', authLimiter, registerValidation, validate, authController.register);
router.post('/login', authLimiter, loginValidation, validate, authController.login);
router.post(
    '/verify-email',
    emailVerificationLimiter,
    emailVerificationValidation,
    validate,
    authController.verifyEmail
);
router.post(
    '/resend-verification',
    emailVerificationLimiter,
    resendVerificationValidation,
    validate,
    authController.resendVerificationOTP
);
router.post(
    '/request-password-reset',
    passwordResetLimiter,
    passwordResetRequestValidation,
    validate,
    authController.requestPasswordReset
);
router.post(
    '/verify-reset-otp',
    passwordResetLimiter,
    verifyResetOTPValidation,
    validate,
    authController.verifyResetOTP
);
router.post(
    '/reset-password',
    passwordResetLimiter,
    resetPasswordValidation,
    validate,
    authController.resetPassword
);
router.post('/refresh', authController.refreshToken);
router.post(
    '/2fa/validate',
    authLimiter,
    validate2FAValidation,
    validate,
    authController.validate2FA
);

// Protected routes (require authentication)
router.put(
    '/change-password',
    authenticate,
    changePasswordValidation,
    validate,
    authController.changePassword
);
router.post('/2fa/setup', authenticate, authController.setup2FA);
router.post(
    '/2fa/verify',
    authenticate,
    twoFactorTokenValidation,
    validate,
    authController.verify2FA
);
router.post(
    '/2fa/disable',
    authenticate,
    disable2FAValidation,
    validate,
    authController.disable2FA
);
router.post('/logout', optionalAuthenticate, authController.logout);
router.post('/logout-all', authenticate, authController.logoutAll);

// Google OAuth routes
router.get(
    '/google',
    require('passport').authenticate('google', {
        scope: ['profile', 'email'],
    })
);

router.get(
    '/google/callback',
    require('passport').authenticate('google', {
        failureRedirect: (process.env.CLIENT_URL || 'http://localhost:3000').split(',')[0].trim(),
        session: false,
    }),
    authController.googleCallback
);

// GitHub OAuth routes
router.get(
    '/github',
    require('passport').authenticate('github', {
        scope: ['user:email'],
    })
);

router.get(
    '/github/callback',
    require('passport').authenticate('github', {
        failureRedirect: (process.env.CLIENT_URL || 'http://localhost:3000').split(',')[0].trim(),
        session: false,
    }),
    authController.githubCallback
);

module.exports = router;
