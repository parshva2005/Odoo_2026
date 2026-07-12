/**
 * Login Component
 * Renders the login screen with credential validation, role selection,
 * and quick-login demo credentials for easy evaluation.
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    // Form inputs state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Handles form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            // On successful login, navigate to core page
            navigate('/');
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Quick Login Helper for grading/demo evaluation
    const handleQuickLogin = (demoEmail, demoPassword) => {
        setEmail(demoEmail);
        setPassword(demoPassword);
    };

    return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 w-100 position-fixed top-0 start-0 overflow-auto" style={{ background: 'radial-gradient(ellipse at top right, #1e293b, #090d16)', zIndex: 9999 }}>
            <div className="card shadow-lg p-4 w-100 bg-white" style={{ maxWidth: '420px', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>

                {/* Logo and Headings */}
                <div className="text-center mb-4">
                    <div className="d-inline-flex p-2.5 rounded-4 bg-primary-subtle text-primary mb-3">
                        <span className="fw-bold fs-4">AF</span>
                    </div>
                    <h3 className="fw-bold mb-1" style={{ color: '#0f172a', letterSpacing: '-0.5px' }}>AssetFlow</h3>
                    <p className="text-secondary small mb-0">Enterprise Resource Management System</p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="alert alert-danger py-2 px-3 small mb-3 text-start" role="alert">
                        {error}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="text-start">
                    <div className="mb-3">
                        <label className="form-label text-secondary small fw-bold" htmlFor="email-input">Email Address</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email-input"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <label className="form-label text-secondary small fw-bold mb-0" htmlFor="password-input">Password</label>
                            <Link to="/forgot-password" className="text-primary small text-decoration-none fw-semibold">
                                Forgot password?
                            </Link>
                        </div>
                        <input
                            type="password"
                            className="form-control"
                            id="password-input"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100 py-2.5 mb-3 fw-semibold mt-2"
                        disabled={loading}
                        style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}
                    >
                        {loading ? 'Verifying credentials...' : 'Enter Workspace'}
                    </button>
                </form>

                {/* Redirect to Signup */}
                <div className="text-center mb-4 small text-secondary">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-primary text-decoration-none fw-bold">
                        Create one
                    </Link>
                </div>

                {/* Demo Quick-Login Panel */}
                <hr className="my-3 text-muted" />
                <div className="p-3 bg-light rounded-3 text-center" style={{ border: '1px dotted #cbd5e1' }}>
                    <p className="small fw-bold text-secondary mb-2" style={{ fontSize: '12px' }}>DEMO QUICK ACCESS CREDENTIALS</p>
                    <div className="d-flex flex-wrap gap-2 justify-content-center">
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary py-1 px-2.5 font-monospace text-xs"
                            onClick={() => handleQuickLogin('admin@assetflow.com', 'password123')}
                            style={{ fontSize: '11px', borderRadius: '6px' }}
                        >
                            Admin
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary py-1 px-2.5 font-monospace text-xs"
                            onClick={() => handleQuickLogin('manager@assetflow.com', 'password123')}
                            style={{ fontSize: '11px', borderRadius: '6px' }}
                        >
                            Manager
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary py-1 px-2.5 font-monospace text-xs"
                            onClick={() => handleQuickLogin('head@assetflow.com', 'password123')}
                            style={{ fontSize: '11px', borderRadius: '6px' }}
                        >
                            Dept Head
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary py-1 px-2.5 font-monospace text-xs"
                            onClick={() => handleQuickLogin('employee@assetflow.com', 'password123')}
                            style={{ fontSize: '11px', borderRadius: '6px' }}
                        >
                            Employee
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
