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
        <div className="container d-flex align-items-center justify-content-center min-vh-100" style={{ backgroundColor: '#f4f6f9' }}>
            <div className="card shadow-sm p-4 w-100" style={{ maxWidth: '480px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>

                {/* Logo and Typography */}
                <div className="text-center mb-4">
                    <h2 className="fw-bold mb-1" style={{ color: '#0f172a' }}>AssetFlow</h2>
                    <p className="text-secondary small font-weight-normal">Register a New Account</p>
                </div>

                {/* Status Messages */}
                {error && (
                    <div className="alert alert-danger py-2 px-3 small mb-3" role="alert">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="alert alert-success py-2 px-3 small mb-3" role="alert">
                        {success}
                    </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label text-secondary small fw-medium" htmlFor="name-input">Full Name</label>
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
                        <label className="form-label text-secondary small fw-medium" htmlFor="email-input">Email Address</label>
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
                            <label className="form-label text-secondary small fw-medium" htmlFor="role-select">Access Role</label>
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
                            <label className="form-label text-secondary small fw-medium" htmlFor="dept-select">Department</label>
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
                        <label className="form-label text-secondary small fw-medium" htmlFor="password-input">Password</label>
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
                        <label className="form-label text-secondary small fw-medium" htmlFor="confirm-password-input">Confirm Password</label>
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
                        className="btn btn-primary w-100 py-2 mb-3 fw-medium"
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
