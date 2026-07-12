/**
 * Signup Component
 * Renders the signup/registration screen, updates the simulated user list
 * in localStorage, and performs automatic session login upon registration.
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Signup() {
    const { signup } = useAuth();
    const navigate = useNavigate();

    // Form inputs state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('employee');
    const [department, setDepartment] = useState('Software Engineering');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Basic front-end validations
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        if (password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        setLoading(true);

        try {
            await signup({
                name,
                email,
                role,
                department,
                password
            });
            setSuccess('Account created successfully! Redirecting...');
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 w-100 position-fixed top-0 start-0 overflow-auto" style={{ background: 'radial-gradient(ellipse at top right, #1e293b, #090d16)', zIndex: 9999, padding: '20px 0' }}>
            <div className="card shadow-lg p-4 w-100 bg-white my-auto animate-fade-in" style={{ maxWidth: '480px', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>

                {/* Logo and Typography */}
                <div className="text-center mb-4">
                    <div className="d-inline-flex p-2.5 rounded-4 bg-primary-subtle text-primary mb-3">
                        <span className="fw-bold fs-4">AF</span>
                    </div>
                    <h3 className="fw-bold mb-1" style={{ color: '#0f172a', letterSpacing: '-0.5px' }}>AssetFlow</h3>
                    <p className="text-secondary small mb-0">Register a New Account</p>
                </div>

                {/* Status Messages */}
                {error && (
                    <div className="alert alert-danger py-2 px-3 small mb-3 text-start" role="alert">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="alert alert-success py-2 px-3 small mb-3 text-start" role="alert">
                        {success}
                    </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="text-start">
                    <div className="mb-3">
                        <label className="form-label text-secondary small fw-bold" htmlFor="name-input">Full Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="name-input"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label text-secondary small fw-bold" htmlFor="email-input">Email Address</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email-input"
                            placeholder="username@domain.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label text-secondary small fw-bold" htmlFor="role-select">Access Role</label>
                            <select
                                className="form-select"
                                id="role-select"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="employee">Employee</option>
                                <option value="department_head">Department Head</option>
                                <option value="asset_manager">Asset Manager</option>
                                <option value="admin">System Admin</option>
                            </select>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label text-secondary small fw-bold" htmlFor="dept-select">Department</label>
                            <select
                                className="form-select"
                                id="dept-select"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                            >
                                <option value="Software Engineering">Software Eng</option>
                                <option value="IT Infrastructure">IT Infra</option>
                                <option value="Operations">Operations</option>
                                <option value="Human Resources">HR</option>
                                <option value="Finance">Finance</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label text-secondary small fw-bold" htmlFor="password-input">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password-input"
                            placeholder="At least 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label text-secondary small fw-bold" htmlFor="confirm-password-input">Confirm Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="confirm-password-input"
                            placeholder="Retype password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100 py-2.5 mb-3 fw-semibold mt-2"
                        disabled={loading}
                        style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                {/* Redirect Link */}
                <div className="text-center small text-secondary">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary text-decoration-none fw-semibold">
                        Log In
                    </Link>
                </div>

            </div>
        </div>
    );
}
