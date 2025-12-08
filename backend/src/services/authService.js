/**
 * Authentication Service
 * Core business logic for authentication operations
 * This service can be published as a reusable NPM package
 */

const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../config/email');
const logger = require('../config/logger');

class AuthService {
    /**
     * Generate OTP (6 digits)
     * @returns {string}
     */
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Generate JWT access token
     * @param {Object} user - User object
     * @returns {string}
     */
    generateAccessToken(user) {
        const payload = {
            userId: user._id,
            email: user.email,
            role: user.role,
        };

        return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
            expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m',
        });
    }

    /**
     * Generate JWT refresh token
     * @param {Object} user - User object
     * @returns {string}
     */
    generateRefreshToken(user) {
        const payload = {
            userId: user._id,
            type: 'refresh',
        };

        return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
            expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
        });
    }

    /**
     * Generate password reset token
     * @returns {string}
     */
    generateResetToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Store refresh token in database
     * @param {string} userId - User ID
     * @param {string} token - Refresh token
     * @param {Object} deviceInfo - Device information
     * @param {string} ipAddress - IP address
     * @returns {Promise<Object>}
     */
    async storeRefreshToken(userId, token, deviceInfo = {}, ipAddress = '') {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        const refreshToken = await RefreshToken.create({
            userId,
            token,
            deviceInfo,
            ipAddress,
            expiresAt,
        });

        logger.info(`Refresh token created for user: ${userId}`);
        return refreshToken;
    }

    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @param {string} userData.name - User name
     * @param {string} userData.email - User email
     * @param {string} userData.password - User password
     * @returns {Promise<Object>}
     */
    async register({ name, email, password }) {
        try {
            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            // Generate email verification OTP
            const otp = this.generateOTP();
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            // Create user
            const user = await User.create({
                name,
                email,
                password,
                emailVerificationOTP: otp,
                emailVerificationExpires: otpExpires,
            });

            // Send verification email
            await sendVerificationEmail(email, otp, name);

            logger.info(`User registered: ${email}`);

            return {
                success: true,
                message: 'Registration successful. Please check your email for verification code.',
                userId: user._id,
            };
        } catch (error) {
            logger.error(`Registration error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Login a user
     * @param {Object} credentials - Login credentials
     * @param {string} credentials.email - User email
     * @param {string} credentials.password - User password
     * @param {Object} deviceInfo - Device information
     * @param {string} ipAddress - IP address
     * @returns {Promise<Object>}
     */
    async login({ email, password }, deviceInfo = {}, ipAddress = '') {
        try {
            // Find user with password field
            const user = await User.findOne({ email }).select('+password');

            if (!user) {
                throw new Error('Invalid email or password');
            }

            // Check if account is locked
            if (user.isLocked()) {
                throw new Error('Account is temporarily locked. Please try again later.');
            }

            // Check if account is suspended
            if (user.isSuspended) {
                throw new Error('Account has been suspended. Please contact support.');
            }

            // Verify password
            const isPasswordValid = await user.comparePassword(password);

            if (!isPasswordValid) {
                await user.incLoginAttempts();
                throw new Error('Invalid email or password');
            }

            // Check if email is verified
            if (!user.isEmailVerified) {
                throw new Error('Please verify your email before logging in');
            }

            // Check if 2FA is enabled
            if (user.twoFactorEnabled) {
                // Return temporary token for 2FA verification
                const tempToken = jwt.sign(
                    { userId: user._id, requiresTwoFactor: true },
                    process.env.JWT_ACCESS_SECRET,
                    { expiresIn: '5m' }
                );

                return {
                    success: true,
                    requiresTwoFactor: true,
                    tempToken,
                    message: 'Please provide your 2FA code',
                };
            }

            // Reset login attempts on successful login
            await user.resetLoginAttempts();

            // Update last login info
            user.lastLogin = new Date();
            user.lastLoginDevice = `${deviceInfo.browser || 'Unknown'} on ${deviceInfo.os || 'Unknown'}`;
            await user.save();

            // Generate tokens
            const accessToken = this.generateAccessToken(user);
            const refreshToken = this.generateRefreshToken(user);

            // Store refresh token
            await this.storeRefreshToken(user._id, refreshToken, deviceInfo, ipAddress);

            logger.info(`User logged in: ${email}`);

            return {
                success: true,
                accessToken,
                refreshToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profilePicture: user.profilePicture,
                    twoFactorEnabled: user.twoFactorEnabled,
                },
            };
        } catch (error) {
            logger.error(`Login error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Verify email with OTP
     * @param {string} userId - User ID
     * @param {string} otp - One-time password
     * @returns {Promise<Object>}
     */
    async verifyEmail(userId, otp) {
        try {
            const user = await User.findById(userId).select('+emailVerificationOTP +emailVerificationExpires');

            if (!user) {
                throw new Error('User not found');
            }

            if (user.isEmailVerified) {
                throw new Error('Email is already verified');
            }

            if (!user.emailVerificationOTP || !user.emailVerificationExpires) {
                throw new Error('Verification code not found. Please request a new one.');
            }

            if (user.emailVerificationExpires < Date.now()) {
                throw new Error('Verification code has expired. Please request a new one.');
            }

            if (user.emailVerificationOTP !== otp) {
                throw new Error('Invalid verification code');
            }

            // Mark email as verified
            user.isEmailVerified = true;
            user.emailVerificationOTP = undefined;
            user.emailVerificationExpires = undefined;
            await user.save();

            logger.info(`Email verified for user: ${user.email}`);

            return {
                success: true,
                message: 'Email verified successfully',
            };
        } catch (error) {
            logger.error(`Email verification error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Resend email verification OTP
     * @param {string} userId - User ID
     * @returns {Promise<Object>}
     */
    async resendVerificationOTP(userId) {
        try {
            const user = await User.findById(userId);

            if (!user) {
                throw new Error('User not found');
            }

            if (user.isEmailVerified) {
                throw new Error('Email is already verified');
            }

            // Generate new OTP
            const otp = this.generateOTP();
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

            user.emailVerificationOTP = otp;
            user.emailVerificationExpires = otpExpires;
            await user.save();

            // Send verification email
            await sendVerificationEmail(user.email, otp, user.name);

            logger.info(`Verification OTP resent to: ${user.email}`);

            return {
                success: true,
                message: 'Verification code sent to your email',
            };
        } catch (error) {
            logger.error(`Resend verification error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Request password reset
     * @param {string} email - User email
     * @returns {Promise<Object>}
     */
    async requestPasswordReset(email) {
        try {
            const user = await User.findOne({ email });

            if (!user) {
                // Don't reveal if user exists
                return {
                    success: true,
                    message: 'If an account exists with this email, a password reset code has been sent.',
                };
            }

            // Generate OTP and reset token
            const otp = this.generateOTP();
            const resetToken = this.generateResetToken();
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

            user.passwordResetOTP = otp;
            user.passwordResetToken = resetToken;
            user.passwordResetExpires = otpExpires;
            await user.save();

            // Send password reset email
            await sendPasswordResetEmail(email, otp, user.name);

            logger.info(`Password reset requested for: ${email}`);

            return {
                success: true,
                message: 'If an account exists with this email, a password reset code has been sent.',
            };
        } catch (error) {
            logger.error(`Password reset request error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Verify password reset OTP
     * @param {string} email - User email
     * @param {string} otp - One-time password
     * @returns {Promise<Object>}
     */
    async verifyResetOTP(email, otp) {
        try {
            const user = await User.findOne({ email }).select('+passwordResetOTP +passwordResetExpires +passwordResetToken');

            if (!user) {
                throw new Error('Invalid request');
            }

            if (!user.passwordResetOTP || !user.passwordResetExpires) {
                throw new Error('Reset code not found. Please request a new one.');
            }

            if (user.passwordResetExpires < Date.now()) {
                throw new Error('Reset code has expired. Please request a new one.');
            }

            if (user.passwordResetOTP !== otp) {
                throw new Error('Invalid reset code');
            }

            logger.info(`Reset OTP verified for: ${email}`);

            return {
                success: true,
                resetToken: user.passwordResetToken,
                message: 'Code verified. You can now reset your password.',
            };
        } catch (error) {
            logger.error(`Reset OTP verification error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Reset password with token
     * @param {string} resetToken - Password reset token
     * @param {string} newPassword - New password
     * @returns {Promise<Object>}
     */
    async resetPassword(resetToken, newPassword) {
        try {
            const user = await User.findOne({
                passwordResetToken: resetToken,
            }).select('+passwordResetExpires +passwordResetToken');

            if (!user) {
                throw new Error('Invalid or expired reset token');
            }

            if (user.passwordResetExpires < Date.now()) {
                throw new Error('Reset token has expired');
            }

            // Update password
            user.password = newPassword;
            user.passwordResetOTP = undefined;
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();

            // Revoke all refresh tokens for security
            await RefreshToken.updateMany(
                { userId: user._id },
                { isRevoked: true, revokedAt: new Date() }
            );

            logger.info(`Password reset successful for: ${user.email}`);

            return {
                success: true,
                message: 'Password reset successful. Please login with your new password.',
            };
        } catch (error) {
            logger.error(`Password reset error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Change password (authenticated user)
     * @param {string} userId - User ID
     * @param {string} oldPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise<Object>}
     */
    async changePassword(userId, oldPassword, newPassword) {
        try {
            const user = await User.findById(userId).select('+password');

            if (!user) {
                throw new Error('User not found');
            }

            // Verify old password
            const isPasswordValid = await user.comparePassword(oldPassword);

            if (!isPasswordValid) {
                throw new Error('Current password is incorrect');
            }

            // Update password
            user.password = newPassword;
            await user.save();

            // Revoke all refresh tokens for security
            await RefreshToken.updateMany(
                { userId: user._id },
                { isRevoked: true, revokedAt: new Date() }
            );

            logger.info(`Password changed for user: ${user.email}`);

            return {
                success: true,
                message: 'Password changed successfully. Please login again.',
            };
        } catch (error) {
            logger.error(`Change password error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Setup Two-Factor Authentication
     * @param {string} userId - User ID
     * @returns {Promise<Object>}
     */
    async setup2FA(userId) {
        try {
            const user = await User.findById(userId);

            if (!user) {
                throw new Error('User not found');
            }

            if (user.twoFactorEnabled) {
                throw new Error('2FA is already enabled');
            }

            // Generate secret
            const secret = speakeasy.generateSecret({
                name: `${process.env.TWO_FA_APP_NAME || 'MERN Auth'} (${user.email})`,
                length: 32,
            });

            // Generate QR code
            const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

            // Save secret temporarily (will be confirmed on verification)
            user.twoFactorSecret = secret.base32;
            await user.save();

            logger.info(`2FA setup initiated for user: ${user.email}`);

            return {
                success: true,
                secret: secret.base32,
                qrCode: qrCodeUrl,
                message: 'Scan the QR code with Google Authenticator or enter the secret manually',
            };
        } catch (error) {
            logger.error(`2FA setup error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Verify and enable Two-Factor Authentication
     * @param {string} userId - User ID
     * @param {string} token - TOTP token
     * @returns {Promise<Object>}
     */
    async verify2FA(userId, token) {
        try {
            const user = await User.findById(userId).select('+twoFactorSecret');

            if (!user) {
                throw new Error('User not found');
            }

            if (!user.twoFactorSecret) {
                throw new Error('2FA setup not initiated. Please setup 2FA first.');
            }

            // Verify token
            const isValid = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token,
                window: 2, // Allow 2 time steps (60 seconds) window
            });

            if (!isValid) {
                throw new Error('Invalid 2FA code');
            }

            // Enable 2FA
            user.twoFactorEnabled = true;
            await user.save();

            logger.info(`2FA enabled for user: ${user.email}`);

            return {
                success: true,
                message: '2FA enabled successfully',
            };
        } catch (error) {
            logger.error(`2FA verification error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Validate 2FA token during login
     * @param {string} userId - User ID
     * @param {string} token - TOTP token
     * @param {Object} deviceInfo - Device information
     * @param {string} ipAddress - IP address
     * @returns {Promise<Object>}
     */
    async validate2FA(userId, token, deviceInfo = {}, ipAddress = '') {
        try {
            const user = await User.findById(userId).select('+twoFactorSecret');

            if (!user) {
                throw new Error('User not found');
            }

            if (!user.twoFactorEnabled || !user.twoFactorSecret) {
                throw new Error('2FA is not enabled for this account');
            }

            // Verify token
            const isValid = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token,
                window: 2,
            });

            if (!isValid) {
                throw new Error('Invalid 2FA code');
            }

            // Update last login info
            user.lastLogin = new Date();
            user.lastLoginDevice = `${deviceInfo.browser || 'Unknown'} on ${deviceInfo.os || 'Unknown'}`;
            await user.save();

            // Generate tokens
            const accessToken = this.generateAccessToken(user);
            const refreshToken = this.generateRefreshToken(user);

            // Store refresh token
            await this.storeRefreshToken(user._id, refreshToken, deviceInfo, ipAddress);

            logger.info(`2FA validated for user: ${user.email}`);

            return {
                success: true,
                accessToken,
                refreshToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profilePicture: user.profilePicture,
                    twoFactorEnabled: user.twoFactorEnabled,
                },
            };
        } catch (error) {
            logger.error(`2FA validation error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Disable Two-Factor Authentication
     * @param {string} userId - User ID
     * @param {string} password - User password for confirmation
     * @returns {Promise<Object>}
     */
    async disable2FA(userId, password) {
        try {
            const user = await User.findById(userId).select('+password +twoFactorSecret');

            if (!user) {
                throw new Error('User not found');
            }

            if (!user.twoFactorEnabled) {
                throw new Error('2FA is not enabled');
            }

            // Verify password
            const isPasswordValid = await user.comparePassword(password);

            if (!isPasswordValid) {
                throw new Error('Invalid password');
            }

            // Disable 2FA
            user.twoFactorEnabled = false;
            user.twoFactorSecret = undefined;
            await user.save();

            logger.info(`2FA disabled for user: ${user.email}`);

            return {
                success: true,
                message: '2FA disabled successfully',
            };
        } catch (error) {
            logger.error(`2FA disable error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Refresh access token
     * @param {string} refreshToken - Refresh token
     * @returns {Promise<Object>}
     */
    async refreshAccessToken(refreshToken) {
        try {
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

            // Check if token exists in database and is valid
            const tokenDoc = await RefreshToken.findOne({ token: refreshToken });

            if (!tokenDoc || !tokenDoc.isValid()) {
                throw new Error('Invalid or expired refresh token');
            }

            // Get user
            const user = await User.findById(decoded.userId);

            if (!user) {
                throw new Error('User not found');
            }

            // Generate new access token
            const accessToken = this.generateAccessToken(user);

            logger.info(`Access token refreshed for user: ${user.email}`);

            return {
                success: true,
                accessToken,
            };
        } catch (error) {
            logger.error(`Token refresh error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Logout user
     * @param {string} userId - User ID
     * @param {string} refreshToken - Refresh token to revoke
     * @returns {Promise<Object>}
     */
    async logout(userId, refreshToken) {
        try {
            // Revoke the specific refresh token
            if (refreshToken) {
                const query = { token: refreshToken };
                if (userId) query.userId = userId;

                await RefreshToken.updateOne(
                    query,
                    { isRevoked: true, revokedAt: new Date() }
                );
            } else if (userId) {
                // Fallback: if no token provided but userId exists, maybe log it or do nothing specific
                // Ideally we need the token to revoke it specifically
                logger.warn(`Logout called without refresh token for user: ${userId}`);
            }

            if (userId) {
                logger.info(`User logged out: ${userId}`);
            }

            return {
                success: true,
                message: 'Logged out successfully',
            };
        } catch (error) {
            logger.error(`Logout error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Logout from all devices
     * @param {string} userId - User ID
     * @returns {Promise<Object>}
     */
    async logoutAll(userId) {
        try {
            // Revoke all refresh tokens
            await RefreshToken.updateMany(
                { userId },
                { isRevoked: true, revokedAt: new Date() }
            );

            logger.info(`User logged out from all devices: ${userId}`);

            return {
                success: true,
                message: 'Logged out from all devices successfully',
            };
        } catch (error) {
            logger.error(`Logout all error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Google OAuth Login/Register
     * @param {Object} user - User from Google OAuth
     * @param {Object} deviceInfo - Device information
     * @param {string} ipAddress - IP address
     * @returns {Promise<Object>}
     */
    async googleOAuthLogin(user, deviceInfo = {}, ipAddress = '') {
        try {
            // Generate tokens
            const accessToken = this.generateAccessToken(user);
            const refreshToken = this.generateRefreshToken(user);

            // Store refresh token
            await this.storeRefreshToken(user._id, refreshToken, deviceInfo, ipAddress);

            logger.info(`Google OAuth login successful for: ${user.email}`);

            return {
                success: true,
                accessToken,
                refreshToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profilePicture: user.profilePicture,
                    twoFactorEnabled: user.twoFactorEnabled,
                },
            };
        } catch (error) {
            logger.error(`Google OAuth login error: ${error.message}`);
            throw error;
        }
    }

    /**
     * GitHub OAuth Login/Register
     * @param {Object} user - User from GitHub OAuth
     * @param {Object} deviceInfo - Device information
     * @param {string} ipAddress - IP address
     * @returns {Promise<Object>}
     */
    async githubOAuthLogin(user, deviceInfo = {}, ipAddress = '') {
        try {
            // Generate tokens
            const accessToken = this.generateAccessToken(user);
            const refreshToken = this.generateRefreshToken(user);

            // Store refresh token
            await this.storeRefreshToken(user._id, refreshToken, deviceInfo, ipAddress);

            logger.info(`GitHub OAuth login successful for: ${user.email}`);

            return {
                success: true,
                accessToken,
                refreshToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profilePicture: user.profilePicture,
                    twoFactorEnabled: user.twoFactorEnabled,
                },
            };
        } catch (error) {
            logger.error(`GitHub OAuth login error: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new AuthService();
