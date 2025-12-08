/**
 * Auth Service
 * API calls for authentication operations
 */

import api from './api';

const authService = {
    // Register new user
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    // Login user
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    // Verify email
    verifyEmail: async (userId, otp) => {
        const response = await api.post('/auth/verify-email', { userId, otp });
        return response.data;
    },

    // Resend verification OTP
    resendVerificationOTP: async (userId) => {
        const response = await api.post('/auth/resend-verification', { userId });
        return response.data;
    },

    // Request password reset
    requestPasswordReset: async (email) => {
        const response = await api.post('/auth/request-password-reset', { email });
        return response.data;
    },

    // Verify reset OTP
    verifyResetOTP: async (email, otp) => {
        const response = await api.post('/auth/verify-reset-otp', { email, otp });
        return response.data;
    },

    // Reset password
    resetPassword: async (resetToken, newPassword) => {
        const response = await api.post('/auth/reset-password', { resetToken, newPassword });
        return response.data;
    },

    // Change password
    changePassword: async (oldPassword, newPassword) => {
        const response = await api.put('/auth/change-password', { oldPassword, newPassword });
        return response.data;
    },

    // Setup 2FA
    setup2FA: async () => {
        const response = await api.post('/auth/2fa/setup');
        return response.data;
    },

    // Verify 2FA
    verify2FA: async (token) => {
        const response = await api.post('/auth/2fa/verify', { token });
        return response.data;
    },

    // Validate 2FA during login
    validate2FA: async (userId, token) => {
        const response = await api.post('/auth/2fa/validate', { userId, token });
        if (response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    // Disable 2FA
    disable2FA: async (password) => {
        const response = await api.post('/auth/2fa/disable', { password });
        return response.data;
    },

    // Logout
    logout: async () => {
        const response = await api.post('/auth/logout');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        return response.data;
    },

    // Logout from all devices
    logoutAll: async () => {
        const response = await api.post('/auth/logout-all');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        return response.data;
    },

    // Get current user from localStorage
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
};

export default authService;
