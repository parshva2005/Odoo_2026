/**
 * AuthContext
 * Provides authentication state (user, loading) and methods (login, signup, logout)
 * to elements inside the application component tree.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // RESTORE SESSION: Load user from localStorage on initial render
    useEffect(() => {
        const storedUser = localStorage.getItem('assetflow_current_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Perform login action and store session
    const login = async (email, password) => {
        setLoading(true);
        try {
            const loggedInUser = await authService.login(email, password);
            setUser(loggedInUser);
            localStorage.setItem('assetflow_current_user', JSON.stringify(loggedInUser));
            return loggedInUser;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Perform signup action and store session
    const signup = async (userData) => {
        setLoading(true);
        try {
            const registeredUser = await authService.signup(userData);
            setUser(registeredUser);
            localStorage.setItem('assetflow_current_user', JSON.stringify(registeredUser));
            return registeredUser;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Remove user session
    const logout = () => {
        setUser(null);
        localStorage.removeItem('assetflow_current_user');
    };

    // Forgot password (simulated call)
    const forgotPassword = async (email) => {
        return await authService.forgotPassword(email);
    };

    const value = {
        user,
        loading,
        login,
        signup,
        logout,
        forgotPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to access Auth Context values easily
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
