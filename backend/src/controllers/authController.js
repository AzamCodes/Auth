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
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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
    // Set refresh token in HTTP-only cookie
    if (result.refreshToken) {
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }

    // Redirect to frontend with tokens
    const frontendURL = (process.env.CLIENT_URL || 'http://localhost:3000').split(',')[0].trim();

    // Professional "Step-Stone" Redirect
    // Instead of res.redirect() which can cause "Header Overflow" (502) due to long URLs/Cookies,
    // we send a lightweight HTML page that client-side redirects to the frontend.
    // This is how major auth providers handle handoffs safely.

    const redirectUrl = `${frontendURL}/auth/callback?token=${result.accessToken}`;

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Authenticating...</title>
        <style>
            body { 
                background-color: #f4f6f9; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                height: 100vh; 
                margin: 0; 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
            .loader {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #667eea;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            p {
                margin-top: 20px;
                color: #555;
                font-size: 14px;
            }
            .container {
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="loader"></div>
            <p>Securely redirecting to dashboard...</p>
        </div>
        <script>
            // Store user data in localStorage if needed, or better yet, fetch it on the frontend
            // using the token to keep the URL short.
            const user = ${JSON.stringify(result.user)};
            try {
                localStorage.setItem('user', JSON.stringify(user));
            } catch (e) {
                console.error('Storage access denied');
            }

            // Redirect immediately
            window.location.href = "${redirectUrl}&user=" + encodeURIComponent(JSON.stringify(user));
        </script>
    </body>
    </html>
    `;

    res.send(html);
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
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }

    // Redirect to frontend with tokens
    const frontendURL = (process.env.CLIENT_URL || 'http://localhost:3000').split(',')[0].trim();

    // Professional "Step-Stone" Redirect
    const redirectUrl = `${frontendURL}/auth/callback?token=${result.accessToken}`;

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Authenticating...</title>
        <style>
            body { 
                background-color: #f4f6f9; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                height: 100vh; 
                margin: 0; 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
            .loader {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #667eea;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            p {
                margin-top: 20px;
                color: #555;
                font-size: 14px;
            }
            .container {
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="loader"></div>
            <p>Securely redirecting to dashboard...</p>
        </div>
        <script>
            const user = ${JSON.stringify(result.user)};
            try {
                // Pre-seed user data to avoid long URL
                localStorage.setItem('user', JSON.stringify(user));
            } catch (e) {}

            window.location.href = "${redirectUrl}&user=" + encodeURIComponent(JSON.stringify(user));
        </script>
    </body>
    </html>
    `;

    res.send(html);
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
