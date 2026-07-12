/**
 * AuthService
 * Handles login, registration, password reset, and session management.
 * Simulates API requests using local storage for data persistence.
 */

import axios from 'axios';

// API Base URL (Placeholder for future backend integration)
const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

// Pre-defined dummy users for different roles
const DEFAULT_USERS = [
    {
        id: '1',
        name: 'System Admin',
        email: 'admin@assetflow.com',
        password: 'password123',
        role: 'admin',
        department: 'IT Infrastructure'
    },
    {
        id: '2',
        name: 'John AssetMgr',
        email: 'manager@assetflow.com',
        password: 'password123',
        role: 'asset_manager',
        department: 'Operations'
    },
    {
        id: '3',
        name: 'Sarah Head',
        email: 'head@assetflow.com',
        password: 'password123',
        role: 'department_head',
        department: 'Software Engineering'
    },
    {
        id: '4',
        name: 'David Employee',
        email: 'employee@assetflow.com',
        password: 'password123',
        role: 'employee',
        department: 'Software Engineering'
    }
];

// Initialize users in local storage if not already present
if (!localStorage.getItem('assetflow_users')) {
    localStorage.setItem('assetflow_users', JSON.stringify(DEFAULT_USERS));
}

export const authService = {
    /**
     * Authenticates a user with email and password.
     * Uses Axios placeholder and performs credential validation against localStorage.
     */
    login: async (email, password) => {
        try {
            // Simulated Axios request (for layout template completeness)
            await axios.get(`${API_BASE_URL}/users/1`);

            // Fetch users from localStorage
            const users = JSON.parse(localStorage.getItem('assetflow_users') || '[]');
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

            if (!user) {
                throw new Error('Invalid email or password');
            }

            // Return user without password for safety
            const { password: _, ...safeUser } = user;
            return safeUser;
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message || 'Login failed');
        }
    },

    /**
     * Registers a new employee/user in the system.
     */
    signup: async (userData) => {
        try {
            // Simulated Axios request
            await axios.post(`${API_BASE_URL}/posts`, { title: 'Signup Simulation' });

            const users = JSON.parse(localStorage.getItem('assetflow_users') || '[]');

            // Check if user already exists
            const exists = users.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
            if (exists) {
                throw new Error('A user with this email already exists');
            }

            const newUser = {
                id: Date.now().toString(),
                name: userData.name,
                email: userData.email,
                password: userData.password,
                role: userData.role || 'employee', // Default to employee
                department: userData.department || 'General'
            };

            users.push(newUser);
            localStorage.setItem('assetflow_users', JSON.stringify(users));

            const { password: _, ...safeUser } = newUser;
            return safeUser;
        } catch (error) {
            throw new Error(error.message || 'Registration failed');
        }
    },

    /**
     * Resets password using user email.
     */
    forgotPassword: async (email) => {
        try {
            // Simulated Axios request
            await axios.post(`${API_BASE_URL}/posts`, { title: 'Password Reset Simulation' });

            const users = JSON.parse(localStorage.getItem('assetflow_users') || '[]');
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

            if (!user) {
                throw new Error('Email address not found');
            }

            // In a real application, a reset link would be emailed.
            // We simulate success.
            return { message: 'Password reset link sent to your email.' };
        } catch (error) {
            throw new Error(error.message || 'Request failed');
        }
    },

    /**
     * Updates password (simulation).
     */
    resetPassword: async (email, newPassword) => {
        try {
            const users = JSON.parse(localStorage.getItem('assetflow_users') || '[]');
            const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

            if (userIndex === -1) {
                throw new Error('User not found');
            }

            users[userIndex].password = newPassword;
            localStorage.setItem('assetflow_users', JSON.stringify(users));
            return { message: 'Password updated successfully' };
        } catch (error) {
            throw new Error(error.message || 'Update failed');
        }
    }
};
