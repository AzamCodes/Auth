/**
 * Theme Slice
 * Redux slice for theme management (dark/light mode)
 */

import { createSlice } from '@reduxjs/toolkit';

// Get theme from localStorage
const savedTheme = localStorage.getItem('theme') || 'light';

const initialState = {
    mode: savedTheme,
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.mode = state.mode === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', state.mode);
        },
        setTheme: (state, action) => {
            state.mode = action.payload;
            localStorage.setItem('theme', state.mode);
        },
    },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
