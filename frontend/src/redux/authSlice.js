/**
 * Auth Slice
 * Redux slice for authentication state management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../services/authService';

// Get user from localStorage
const user = authService.getCurrentUser();

const initialState = {
    user: user,
    isAuthenticated: !!user,
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: '',
    requiresTwoFactor: false,
    tempToken: null,
    tempUserId: null,
};

// Register user
export const register = createAsyncThunk(
    'auth/register',
    async (userData, thunkAPI) => {
        try {
            return await authService.register(userData);
        } catch (error) {
            const message =
                error.response?.data?.message || error.message || 'Registration failed';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Login user
export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
    try {
        return await authService.login(credentials);
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Login failed';
        return thunkAPI.rejectWithValue(message);
    }
});

// Logout user
export const logout = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
    try {
        return await authService.logout();
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Logout failed';
        return thunkAPI.rejectWithValue(message);
    }
});

// Validate 2FA
export const validate2FA = createAsyncThunk(
    'auth/validate2FA',
    async ({ userId, token }, thunkAPI) => {
        try {
            return await authService.validate2FA(userId, token);
        } catch (error) {
            const message =
                error.response?.data?.message || error.message || '2FA validation failed';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
        },
        clearError: (state) => {
            state.isError = false;
            state.message = '';
        },
        setAuth: (state, action) => {
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.isSuccess = true;
            state.isLoading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // Register
            .addCase(register.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.message = action.payload.message;
                state.tempUserId = action.payload.userId;
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Login
            .addCase(login.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;

                if (action.payload.requiresTwoFactor) {
                    state.requiresTwoFactor = true;
                    state.tempToken = action.payload.tempToken;
                    state.tempUserId = action.payload.userId;
                    state.message = action.payload.message;
                } else {
                    state.isSuccess = true;
                    state.isAuthenticated = true;
                    state.user = action.payload.user;
                }
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.isAuthenticated = false;
                state.user = null;
            })
            // Logout
            .addCase(logout.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(logout.fulfilled, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.requiresTwoFactor = false;
                state.tempToken = null;
                state.tempUserId = null;
            })
            .addCase(logout.rejected, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
            })
            // Validate 2FA
            .addCase(validate2FA.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(validate2FA.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.requiresTwoFactor = false;
                state.tempToken = null;
                state.tempUserId = null;
            })
            .addCase(validate2FA.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { reset, clearError, setAuth } = authSlice.actions;
export default authSlice.reducer;
