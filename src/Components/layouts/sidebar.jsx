/**
 * Sidebar Component
 * Renders navigation hyperlinks dynamically filtered according to the user's role.
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FiGrid, FiUsers, FiSliders, FiPackage,
    FiFileText, FiCalendar, FiBookOpen,
    FiAlertTriangle, FiCheckSquare, FiClipboard
} from 'react-icons/fi';

export default function Sidebar() {
    const { user } = useAuth();

    if (!user) return null;

    // Defines the full list of navigation items mapping to modules
    const navItems = [
        {
            path: '/',
            label: 'Dashboard',
            icon: <FiGrid />,
            allowedRoles: ['admin', 'asset_manager', 'department_head', 'employee']
        },
        {
            path: '/organization',
            label: 'Organization Setup',
            icon: <FiUsers />,
            allowedRoles: ['admin', 'department_head']
        },
        {
            path: '/assets',
            label: 'Asset Directory',
            icon: <FiPackage />,
            allowedRoles: ['admin', 'asset_manager', 'department_head', 'employee']
        },
        {
            path: '/allocation',
            label: 'Asset Allocation',
            icon: <FiSliders />,
            allowedRoles: ['admin', 'asset_manager', 'department_head', 'employee']
        },
        {
            path: '/bookings',
            label: 'Resource Booking',
            icon: <FiCalendar />,
            allowedRoles: ['admin', 'asset_manager', 'department_head', 'employee']
        },
        {
            path: '/maintenance',
            label: 'Maintenance',
            icon: <FiAlertTriangle />,
            allowedRoles: ['admin', 'asset_manager', 'department_head', 'employee']
        },
        {
            path: '/audit',
            label: 'Asset Audit',
            icon: <FiCheckSquare />,
            allowedRoles: ['admin', 'asset_manager', 'department_head', 'employee']
        },
        {
            path: '/reports',
            label: 'Reports',
            icon: <FiFileText />,
            allowedRoles: ['admin', 'asset_manager', 'department_head']
        },
        {
            path: '/logs',
            label: 'Activity Logs',
            icon: <FiClipboard />,
            allowedRoles: ['admin', 'employee']
        }
    ];

    // Filter items based on logged-in user's role
    const filteredNavItems = navItems.filter(item => item.allowedRoles.includes(user.role));

    return (
        <aside className="d-flex flex-column flex-shrink-0 p-3 bg-white border-end shadow-sm" style={{ width: '260px', minHeight: 'calc(100vh - 56px)' }}>
            <ul className="nav nav-pills flex-column mb-auto gap-1">
                {filteredNavItems.map((item) => (
                    <li key={item.path}>
                        <NavLink
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-link d-flex align-items-center gap-3 py-2 px-3 fw-medium ${isActive
                                    ? 'active bg-primary-light text-primary'
                                    : 'text-secondary'
                                }`
                            }
                            style={({ isActive }) =>
                                isActive
                                    ? { backgroundColor: '#EEF2FF', color: '#2563EB', borderRadius: '8px' }
                                    : { borderRadius: '8px', transition: 'background-color 0.2s', color: '#4B5563' }
                            }
                        >
                            <span className="fs-5 d-flex align-items-center">{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
            <div className="mt-4 pt-3 border-top text-center text-secondary" style={{ fontSize: '11px' }}>
                Signed in as: <strong className="text-dark">{user.name.split(' ')[0]}</strong>
            </div>
        </aside>
    );
}
