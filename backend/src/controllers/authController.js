/**
 * Authentication Controller
 * Handles all authentication-related requests
 */

const authService = require('../services/authService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const result = await authService.register({ name, email, password });

    res.status(201).json(result);
});

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const deviceInfo = {
        browser: req.useragent.browser,
        os: req.useragent.os,
        platform: req.useragent.platform,
        source: req.useragent.source,
    };
    const ipAddress = req.ip;

    const result = await authService.login({ email, password }, deviceInfo, ipAddress);

    // Set refresh token in HTTP-only cookie if not requiring 2FA
    if (result.refreshToken) {
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    }

    res.json(result);
});

/**
 * Verify email with OTP
 * @route POST /api/auth/verify-email
 * @access Public
 */
const verifyEmail = asyncHandler(async (req, res) => {
    const { userId, otp } = req.body;

    const result = await authService.verifyEmail(userId, otp);

    res.json(result);
});

/**
 * Resend email verification OTP
 * @route POST /api/auth/resend-verification
 * @access Public
 */
const resendVerificationOTP = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    const result = await authService.resendVerificationOTP(userId);

    res.json(result);
});

/**
 * Request password reset
 * @route POST /api/auth/request-password-reset
 * @access Public
 */
const requestPasswordReset = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const result = await authService.requestPasswordReset(email);

    res.json(result);
});

/**
 * Verify password reset OTP
 * @route POST /api/auth/verify-reset-otp
 * @access Public
 */
const verifyResetOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const result = await authService.verifyResetOTP(email, otp);

    res.json(result);
});

/**
 * Reset password with token
 * @route POST /api/auth/reset-password
 * @access Public
 */
const resetPassword = asyncHandler(async (req, res) => {
    const { resetToken, newPassword } = req.body;

    const result = await authService.resetPassword(resetToken, newPassword);

    res.json(result);
});

/**
 * Change password (authenticated)
 * @route PUT /api/auth/change-password
 * @access Private
 */
const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    const result = await authService.changePassword(userId, oldPassword, newPassword);

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.json(result);
});

/**
 * Setup Two-Factor Authentication
 * @route POST /api/auth/2fa/setup
 * @access Private
 */
const setup2FA = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const result = await authService.setup2FA(userId);

    res.json(result);
});

/**
 * Verify and enable 2FA
 * @route POST /api/auth/2fa/verify
 * @access Private
 */
const verify2FA = asyncHandler(async (req, res) => {
    const { token } = req.body;
    const userId = req.user.id;

    const result = await authService.verify2FA(userId, token);

    res.json(result);
});

/**
 * Validate 2FA token during login
 * @route POST /api/auth/2fa/validate
 * @access Public
 */
const validate2FA = asyncHandler(async (req, res) => {
    const { userId, token } = req.body;
    const deviceInfo = {
        browser: req.useragent.browser,
        os: req.useragent.os,
        platform: req.useragent.platform,
        source: req.useragent.source,
    };
    const ipAddress = req.ip;

    const result = await authService.validate2FA(userId, token, deviceInfo, ipAddress);

    // Set refresh token in HTTP-only cookie
    if (result.refreshToken) {
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }

    res.json(result);
});

/**
 * Disable 2FA
 * @route POST /api/auth/2fa/disable
 * @access Private
 */
const disable2FA = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const userId = req.user.id;

    const result = await authService.disable2FA(userId, password);

    res.json(result);
});

/**
 * Refresh access token
 * @route POST /api/auth/refresh
 * @access Public
 */
const refreshToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            success: false,
            message: 'Refresh token not provided',
        });
    }

    const result = await authService.refreshAccessToken(refreshToken);

    res.json(result);
});

/**
 * Logout user
 * @route POST /api/auth/logout
 * @access Private
 */
const logout = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    const userId = req.user ? req.user.id : null;

    if (refreshToken || userId) {
        await authService.logout(userId, refreshToken);
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.json({
        success: true,
        message: 'Logged out successfully',
    });
});

/**
 * Logout from all devices
 * @route POST /api/auth/logout-all
 * @access Private
 */
const logoutAll = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    await authService.logoutAll(userId);

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.json({
        success: true,
        message: 'Logged out from all devices successfully',
    });
});

/**
 * Google OAuth Callback
 * @route GET /api/auth/google/callback
 * @access Public
 */
const googleCallback = asyncHandler(async (req, res) => {
    const deviceInfo = {
        browser: req.useragent.browser,
        os: req.useragent.os,
        platform: req.useragent.platform,
        source: req.useragent.source,
    };
    const ipAddress = req.ip;

    const result = await authService.googleOAuthLogin(req.user, deviceInfo, ipAddress);

    // Set refresh token in HTTP-only cookie
    if (result.refreshToken) {
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }

    // Redirect to frontend with tokens
    const frontendURL = (process.env.CLIENT_URL || 'http://localhost:3000').split(',')[0].trim();
    const redirectURL = `${frontendURL}/auth/callback?token=${result.accessToken}&user=${encodeURIComponent(JSON.stringify(result.user))}`;

    res.redirect(redirectURL);
});

/**
 * GitHub OAuth Callback
 * @route GET /api/auth/github/callback
 * @access Public
 */
const githubCallback = asyncHandler(async (req, res) => {
    const deviceInfo = {
        browser: req.useragent.browser,
        os: req.useragent.os,
        platform: req.useragent.platform,
        source: req.useragent.source,
    };
    const ipAddress = req.ip;

    const result = await authService.githubOAuthLogin(req.user, deviceInfo, ipAddress);

    // Set refresh token in HTTP-only cookie
    if (result.refreshToken) {
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }

    // Redirect to frontend with tokens
    const frontendURL = (process.env.CLIENT_URL || 'http://localhost:3000').split(',')[0].trim();
    const redirectURL = `${frontendURL}/auth/callback?token=${result.accessToken}&user=${encodeURIComponent(JSON.stringify(result.user))}`;

    res.redirect(redirectURL);
});

module.exports = {
    register,
    login,
    verifyEmail,
    resendVerificationOTP,
    requestPasswordReset,
    verifyResetOTP,
    resetPassword,
    changePassword,
    setup2FA,
    verify2FA,
    validate2FA,
    disable2FA,
    refreshToken,
    logout,
    logoutAll,
    googleCallback,
    githubCallback,
};
