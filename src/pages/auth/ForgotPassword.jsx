/**
 * ForgotPassword Component
 * Simulates a password reset workflow. For demonstration and debugging,
 * once a valid email is verified, it opens a secure local reset form
 * allowing the user to update the password directly in local storage.
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

export default function ForgotPassword() {
    const { forgotPassword } = useAuth();
    const navigate = useNavigate();

    // Stage control: 'request' or 'reset'
    const [stage, setStage] = useState('request');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Stage 1: Request reset (checks if email is in our database)
    const handleRequestReset = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await forgotPassword(email);
            setSuccess('Email verified! (Demo Mode: Reset password below)');
            // For the demo workflow, progress immediately to password reset stage
            setTimeout(() => {
                setStage('reset');
                setSuccess('');
            }, 1000);
        } catch (err) {
            setError(err.message || 'Email not found in our directory.');
        } finally {
            setLoading(false);
        }
    };

    // Stage 2: Perform simulation reset
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            return setError('Passwords do not match');
        }

        if (newPassword.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        setLoading(true);

        try {
            await authService.resetPassword(email, newPassword);
            setSuccess('Password updated successfully! Redirecting...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.message || 'Failed to clean up password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 w-100 position-fixed top-0 start-0 overflow-auto" style={{ background: 'radial-gradient(ellipse at top right, #1e293b, #090d16)', zIndex: 9999 }}>
            <div className="card shadow-lg p-4 w-100 bg-white" style={{ maxWidth: '420px', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>

                {/* Brand Logo */}
                <div className="text-center mb-4">
                    <div className="d-inline-flex p-2.5 rounded-4 bg-primary-subtle text-primary mb-3">
                        <span className="fw-bold fs-4">AF</span>
                    </div>
                    <h3 className="fw-bold mb-1" style={{ color: '#0f172a', letterSpacing: '-0.5px' }}>AssetFlow</h3>
                    <p className="text-secondary small mb-0">Reset Account Password</p>
                </div>

                {/* Feedback Banners */}
                {error && (
                    <div className="alert alert-danger py-2 px-3 small mb-3 text-start animate-fade-in" role="alert">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="alert alert-success py-2 px-3 small mb-3 text-start animate-fade-in" role="alert">
                        {success}
                    </div>
                )}

                {/* Stage 1 Form: Request Verification */}
                {stage === 'request' && (
                    <form onSubmit={handleRequestReset} className="text-start">
                        <p className="text-muted small mb-4 text-center">
                            Enter the email address registered with your account to simulate a password reset workflow.
                        </p>

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

                        <button
                            type="submit"
                            className="btn btn-primary w-100 py-2.5 mb-3 fw-semibold mt-2"
                            disabled={loading}
                            style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}
                        >
                            {loading ? 'Verifying...' : 'Verify Email Address'}
                        </button>
                    </form>
                )}

                {/* Stage 2 Form: Set New Password */}
                {stage === 'reset' && (
                    <form onSubmit={handleResetPassword} className="text-start">
                        <div className="alert alert-info py-2 px-3 small mb-3 text-start fw-medium" role="alert" style={{ fontSize: '12px' }}>
                            Resetting password for: <strong>{email}</strong>
                        </div>

                        <div className="mb-3">
                            <label className="form-label text-secondary small fw-bold" htmlFor="new-password">New Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="new-password"
                                placeholder="At least 6 characters"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label text-secondary small fw-bold" htmlFor="confirm-new-password">Confirm Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="confirm-new-password"
                                placeholder="Retype new password"
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
                            {loading ? 'Saving...' : 'Update Password'}
                        </button>
                    </form>
                )}

                {/* Navigation Back Link */}
                <div className="text-center small text-secondary mt-2">
                    <Link to="/login" className="text-primary text-decoration-none fw-semibold">
                        Back to Log In
                    </Link>
                </div>

            </div>
        </div>
    );
}
