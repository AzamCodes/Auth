/**
 * Redux Store Configuration
 * Configures the Redux store with all slices
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import themeReducer from './themeSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        theme: themeReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;
