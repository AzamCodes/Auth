/**
 * Admin Service
 * API calls for admin operations
 */

import api from './api';

const adminService = {
    // Get all users
    getUsers: async (params = {}) => {
        const response = await api.get('/admin/users', { params });
        return response.data;
    },

    // Get user by ID
    getUserById: async (userId) => {
        const response = await api.get(`/admin/users/${userId}`);
        return response.data;
    },

    // Suspend user
    suspendUser: async (userId, reason) => {
        const response = await api.put(`/admin/users/${userId}/suspend`, { reason });
        return response.data;
    },

    // Unsuspend user
    unsuspendUser: async (userId) => {
        const response = await api.put(`/admin/users/${userId}/unsuspend`);
        return response.data;
    },

    // Delete user
    deleteUser: async (userId) => {
        const response = await api.delete(`/admin/users/${userId}`);
        return response.data;
    },

    // Update user role
    updateUserRole: async (userId, role) => {
        const response = await api.put(`/admin/users/${userId}/role`, { role });
        return response.data;
    },

    // Get system statistics
    getStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },
};

export default adminService;
