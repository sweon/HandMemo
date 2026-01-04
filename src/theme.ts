import type { DefaultTheme } from 'styled-components';

export const lightTheme: DefaultTheme = {
    mode: 'light',
    fontSize: 16,
    colors: {
        background: '#f7f8fa', // Softer off-white
        surface: '#ffffff', // Pure white for cards/surfaces
        border: '#e6e8eb', // gray-200
        text: '#1f2937', // gray-800
        textSecondary: '#4b5563', // gray-600
        primary: '#3b82f6', // blue-500
        primaryHover: '#2563eb', // blue-600
        danger: '#ef4444', // red-500
        success: '#10b981', // green-500
    },
};

export const darkTheme: DefaultTheme = {
    mode: 'dark',
    fontSize: 16,
    colors: {
        background: '#202124', // Google Dark Gray - softer than slate-900
        surface: '#2f3136', // Lighter Gray for surfaces
        border: '#40444b', // Distinct border
        text: '#e8eaed', // Off-white text
        textSecondary: '#9aa0a6', // Soft gray text
        primary: '#5c9aff', // Slightly lighter blue for dark mode contrast
        primaryHover: '#4285f4', // Google blue
        danger: '#f28b82', // Pastel red
        success: '#81c995', // Pastel green
    },
};
