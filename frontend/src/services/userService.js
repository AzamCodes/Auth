/**
 * User Service
 * API calls for user operations
 */

import api from './api';

const userService = {
    // Get user profile
    getProfile: async () => {
        const response = await api.get('/users/profile');
        return response.data;
    },

    // Update user profile
    updateProfile: async (userData) => {
        const response = await api.put('/users/profile', userData);
        if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    // Upload profile picture
    uploadProfilePicture: async (file) => {
        const formData = new FormData();
        formData.append('picture', file);

        const response = await api.post('/users/profile/picture', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        // Update user in localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.profilePicture = response.data.profilePicture;
        localStorage.setItem('user', JSON.stringify(user));

        return response.data;
    },
};

export default userService;
