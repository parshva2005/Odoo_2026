/**
 * AppRoutes Component
 * Manages all application routing rules. Enforces role-based permissions
 * using ProtectedRoute, and applies Layout styling to authenticated pages.
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../Components/ProtectedRoute';
import Layout from '../Components/layouts/layout';

// Authentication Pages
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Application Core Pages
import Dashboard from '../pages/Dashboard';
import Organization from '../pages/Organization';
import Assets from '../pages/Assets';
import Allocation from '../pages/Allocation';
import Bookings from '../pages/Bookings';
import Maintenance from '../pages/Maintenance';
import Audit from '../pages/Audit';
import Reports from '../pages/Reports';
import ActivityLogs from '../pages/ActivityLogs';
import PlaceholderPage from '../pages/PlaceholderPage';

export default function AppRoutes() {
    return (
        <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Private Protected Routes wrapped in common Navigation Layout */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Dashboard />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/organization"
                element={
                    <ProtectedRoute allowedRoles={['admin', 'department_head']}>
                        <Layout>
                            <Organization />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/assets"
                element={
                    <ProtectedRoute allowedRoles={['admin', 'asset_manager', 'department_head', 'employee']}>
                        <Layout>
                            <Assets />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/allocation"
                element={
                    <ProtectedRoute allowedRoles={['admin', 'asset_manager', 'department_head', 'employee']}>
                        <Layout>
                            <Allocation />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/bookings"
                element={
                    <ProtectedRoute allowedRoles={['admin', 'asset_manager', 'department_head', 'employee']}>
                        <Layout>
                            <Bookings />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/maintenance"
                element={
                    <ProtectedRoute allowedRoles={['admin', 'asset_manager', 'department_head', 'employee']}>
                        <Layout>
                            <Maintenance />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/audit"
                element={
                    <ProtectedRoute allowedRoles={['admin', 'asset_manager', 'department_head', 'employee']}>
                        <Layout>
                            <Audit />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/reports"
                element={
                    <ProtectedRoute allowedRoles={['admin', 'asset_manager', 'department_head']}>
                        <Layout>
                            <Reports />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/logs"
                element={
                    <ProtectedRoute allowedRoles={['admin', 'employee']}>
                        <Layout>
                            <ActivityLogs />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            {/* Fallback Catch-All Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
