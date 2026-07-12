/**
 * Header Component
 * Renders the top navigation bar with user profile details, active role,
 * and a logout action button.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLogOut, FiUser, FiActivity } from 'react-icons/fi';

export default function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Helper to format role names clean
    const formatRole = (role) => {
        if (!role) return '';
        return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <nav className="navbar navbar-expand-lg px-4 py-2 border-bottom shadow-xs bg-white" style={{ minHeight: '60px' }}>
            <div className="container-fluid d-flex justify-content-between align-items-center">

                {/* Brand Logo */}
                <div className="d-flex align-items-center text-dark" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <FiActivity size={22} className="me-2" style={{ color: '#2563EB' }} />
                    <span className="fw-bold fs-5 tracking-tight text-dark" style={{ color: '#1F2937' }}>AssetFlow</span>
                    <span className="badge bg-secondary ms-2 small" style={{ fontSize: '10px', backgroundColor: '#F3F4F6', color: '#4B5563' }}>v1.0</span>
                </div>

                {/* User Session profile / Actions */}
                {user ? (
                    <div className="d-flex align-items-center gap-3">
                        <div className="text-end d-none d-sm-block">
                            <div className="fw-semibold small text-dark">{user.name}</div>
                            <div className="text-secondary" style={{ fontSize: '11px', color: '#6B7280' }}>
                                {formatRole(user.role)} | {user.department}
                            </div>
                        </div>

                        {/* User Avatar Circle */}
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', backgroundColor: '#2563EB' }}>
                            <FiUser size={16} />
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 border-0"
                            style={{ color: '#DC2626' }}
                            title="Log Out"
                        >
                            <FiLogOut size={16} />
                            <span className="d-none d-md-inline">Log Out</span>
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => navigate('/login')}
                        className="btn btn-sm btn-primary px-3"
                        style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}
                    >
                        Login
                    </button>
                )}

            </div>
        </nav>
    );
}
