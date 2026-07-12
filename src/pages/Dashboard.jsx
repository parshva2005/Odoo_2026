/**
 * Dashboard Page
 * Renders role-specific key performance indicators, dynamic progress metrics,
 * quick action shortcuts, recent alerts, and real-time activity timelines.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assetService } from '../services/assetService';
import { bookingService } from '../services/bookingService';
import { maintenanceService } from '../services/maintenanceService';
import { notificationService } from '../services/notificationService';
import { auditService } from '../services/auditService';
import { departmentService } from '../services/departmentService';
import { employeeService } from '../services/employeeService';
import {
    FiPackage, FiCheckCircle, FiAlertTriangle, FiCalendar,
    FiArrowRight, FiBell, FiActivity, FiBriefcase,
    FiUsers, FiLayers, FiFileText, FiPlus, FiGrid, FiClock, FiSettings, FiCheckSquare
} from 'react-icons/fi';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Data lists state
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        available: 0,
        allocated: 0,
        maintenance: 0,
        bookings: 0,
        pendingTransfers: 0,
        upcomingReturns: 0,
        auditsCount: 0
    });

    const [statusDistribution, setStatusDistribution] = useState({
        available: 0,
        allocated: 0,
        maintenance: 0,
        reserved: 0,
        lost: 0,
        retired: 0,
        disposed: 0
    });

    const [departments, setDepartments] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [activityLogs, setActivityLogs] = useState([]);

    // Fetch all dashboard stats upon mounting
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch datasets concurrently
                const [assets, bookings, maintenances, alerts, auditsList, depts, employees] = await Promise.all([
                    assetService.getAll(),
                    bookingService.getAll(),
                    maintenanceService.getAll(),
                    notificationService.getAll(),
                    auditService.getAll(),
                    departmentService.getAll(),
                    employeeService.getAll()
                ]);

                // Base totals
                const total = assets.length;
                const available = assets.filter(a => a.status === 'Available').length;
                const allocated = assets.filter(a => a.status === 'Allocated').length;
                const underMaint = assets.filter(a => a.status === 'Under Maintenance' || a.status === 'Maintenance').length;
                const reserved = assets.filter(a => a.status === 'Reserved').length;
                const lost = assets.filter(a => a.status === 'Lost').length;
                const retired = assets.filter(a => a.status === 'Retired').length;
                const disposed = assets.filter(a => a.status === 'Disposed').length;

                setStats({
                    total,
                    available,
                    allocated,
                    maintenance: underMaint,
                    bookings: bookings.filter(b => b.status === 'Approved').length,
                    pendingTransfers: bookings.filter(b => b.status === 'Pending').length,
                    upcomingReturns: assets.filter(a => a.status === 'Allocated').length > 0 ? 2 : 0, // Simulated baseline returns
                    auditsCount: auditsList.length
                });

                // Status distribution shares
                setStatusDistribution({
                    available: total > 0 ? Math.round((available / total) * 100) : 0,
                    allocated: total > 0 ? Math.round((allocated / total) * 100) : 0,
                    maintenance: total > 0 ? Math.round((underMaint / total) * 100) : 0,
                    reserved: total > 0 ? Math.round((reserved / total) * 100) : 0,
                    lost: total > 0 ? Math.round((lost / total) * 100) : 0,
                    retired: total > 0 ? Math.round((retired / total) * 100) : 0,
                    disposed: total > 0 ? Math.round((disposed / total) * 100) : 0
                });

                // Populate departments with computed summary details
                const enrichedDepts = depts.map(d => {
                    const deptAssets = assets.filter(a => a.department === d.name).length;
                    const deptPending = bookings.filter(b => b.status === 'Pending' && b.department === d.name).length;
                    return {
                        ...d,
                        assetsCount: deptAssets,
                        pendingCount: deptPending
                    };
                });
                setDepartments(enrichedDepts);

                // Notifications / Alerts
                setNotifications(alerts.slice(0, 4));

                // Activity logs
                const rawLogs = localStorage.getItem('assetflow_activity_logs');
                if (rawLogs) {
                    setActivityLogs(JSON.parse(rawLogs).slice(0, 5));
                } else {
                    const fallbackLogs = [
                        { id: '1', action: 'Asset Assigned', details: 'MacBook Pro assigned to Sarah Connor', user: 'Asset Manager', date: 'Today' },
                        { id: '2', action: 'Maintenance Approved', details: 'iPad repair ticket #M-102 approved', user: 'Sarah Connor', date: 'Today' },
                        { id: '3', action: 'Booking Created', details: 'Conference Room reserved for Q3 Planning', user: 'System Admin', date: 'Yesterday' },
                        { id: '4', action: 'Transfer Requested', details: 'Dell monitor transfer from HR to Engineering', user: 'John Doe', date: '2 days ago' },
                        { id: '5', action: 'Audit Completed', details: 'Q3 Development Hardware Audit campaign wrapped', user: 'System Admin', date: '3 days ago' },
                    ];
                    setActivityLogs(fallbackLogs);
                }
            } catch (err) {
                console.error('Failed loading dashboard statistics:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Format current date
    const formattedDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="page-transition">

            {/* 1. Welcome Section */}
            <div className="card p-4 mb-4 border-0 shadow-sm text-start" style={{ background: 'linear-gradient(135deg, #1E293B, #0F172A)', color: '#FFFFFF', borderRadius: '14px' }}>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                    <div>
                        <span className="badge bg-primary text-white mb-2" style={{ backgroundColor: '#2563EB', fontSize: '11px', textTransform: 'uppercase' }}>
                            {user?.role.replace('_', ' ')}
                        </span>
                        <h2 className="fw-bold mb-1" style={{ color: '#FFFFFF', letterSpacing: '-0.5px' }}>
                            Welcome back, {user?.name}!
                        </h2>
                        <p className="mb-0 text-secondary" style={{ color: '#94A3B8', fontSize: '14px' }}>
                            All corporate systems are running smoothly. Let's work together to construct an organized and efficient workspace today.
                        </p>
                    </div>
                    <div className="text-md-end">
                        <span className="d-block text-secondary small" style={{ color: '#94A3B8' }}>{formattedDate}</span>
                        <h5 className="fw-bold mb-0 text-white mt-1" style={{ color: '#FFFFFF' }}>AssetFlow workspace</h5>
                    </div>
                </div>
            </div>

            {/* 2. Hero Summary Section */}
            <h4 className="fw-bold text-dark text-start mb-3" style={{ letterSpacing: '-0.2px' }}>Operational KPI Overview</h4>
            <div className="row g-3 mb-4">

                {/* Total Assets */}
                <div className="col-6 col-lg-3">
                    <div className="card border-0 shadow-sm p-3 h-100 text-start" style={{ borderRadius: '12px' }}>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="text-secondary small fw-medium">Total Assets</span>
                            <div className="p-2 rounded-3 bg-primary-subtle text-primary" style={{ backgroundColor: '#EEF2FF', color: '#2563EB' }}>
                                <FiPackage size={20} />
                            </div>
                        </div>
                        <h3 className="fw-bold text-dark mb-1">{stats.total}</h3>
                        <div className="d-flex align-items-center gap-1">
                            <span className="badge px-1.5 py-0.5" style={{ fontSize: '10px', backgroundColor: '#EBF7EE', color: '#16A34A' }}>Stable</span>
                            <span className="text-secondary" style={{ fontSize: '11px' }}>Global inventory catalog</span>
                        </div>
                    </div>
                </div>

                {/* Available Assets */}
                <div className="col-6 col-lg-3">
                    <div className="card border-0 shadow-sm p-3 h-100 text-start" style={{ borderRadius: '12px' }}>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="text-secondary small fw-medium">Available</span>
                            <div className="p-2 rounded-3 text-success" style={{ backgroundColor: '#DCFCE7', color: '#22C55E' }}>
                                <FiCheckCircle size={20} />
                            </div>
                        </div>
                        <h3 className="fw-bold text-dark mb-1">{stats.available}</h3>
                        <div className="d-flex align-items-center gap-1">
                            <span className="badge px-1.5 py-0.5" style={{ fontSize: '10px', backgroundColor: '#EBF7EE', color: '#16A34A' }}>Ready</span>
                            <span className="text-secondary" style={{ fontSize: '11px' }}>Available for assignment</span>
                        </div>
                    </div>
                </div>

                {/* Allocated Assets */}
                <div className="col-6 col-lg-3">
                    <div className="card border-0 shadow-sm p-3 h-100 text-start" style={{ borderRadius: '12px' }}>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="text-secondary small fw-medium">Allocated</span>
                            <div className="p-2 rounded-3 text-primary" style={{ backgroundColor: '#DBEAFE', color: '#2563EB' }}>
                                <FiBriefcase size={20} />
                            </div>
                        </div>
                        <h3 className="fw-bold text-dark mb-1">{stats.allocated}</h3>
                        <div className="d-flex align-items-center gap-1">
                            <span className="badge px-1.5 py-0.5" style={{ fontSize: '10px', backgroundColor: '#DBEAFE', color: '#2563EB' }}>Active</span>
                            <span className="text-secondary" style={{ fontSize: '11px' }}>In use by department staff</span>
                        </div>
                    </div>
                </div>

                {/* Maintenance */}
                <div className="col-6 col-lg-3">
                    <div className="card border-0 shadow-sm p-3 h-100 text-start" style={{ borderRadius: '12px' }}>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="text-secondary small fw-medium">In Maintenance</span>
                            <div className="p-2 rounded-3 text-danger" style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}>
                                <FiAlertTriangle size={20} />
                            </div>
                        </div>
                        <h3 className="fw-bold text-dark mb-1">{stats.maintenance}</h3>
                        <div className="d-flex align-items-center gap-1">
                            <span className="badge px-1.5 py-0.5" style={{ fontSize: '10px', backgroundColor: '#FEE2E2', color: '#EF4444' }}>Notice</span>
                            <span className="text-secondary" style={{ fontSize: '11px' }}>Troubleshooting tickets raised</span>
                        </div>
                    </div>
                </div>

                {/* Bookings */}
                <div className="col-6 col-lg-3">
                    <div className="card border-0 shadow-sm p-3 h-100 text-start" style={{ borderRadius: '12px' }}>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="text-secondary small fw-medium">Active Bookings</span>
                            <div className="p-2 rounded-3 text-warning" style={{ backgroundColor: '#FEF3C7', color: '#F59E0B' }}>
                                <FiCalendar size={20} />
                            </div>
                        </div>
                        <h3 className="fw-bold text-dark mb-1">{stats.bookings}</h3>
                        <div className="d-flex align-items-center gap-1">
                            <span className="badge px-1.5 py-0.5" style={{ fontSize: '10px', backgroundColor: '#FEF3C7', color: '#F59E0B' }}>Confirmed</span>
                            <span className="text-secondary" style={{ fontSize: '11px' }}>Approved reservations</span>
                        </div>
                    </div>
                </div>

                {/* Pending Transfers */}
                <div className="col-6 col-lg-3">
                    <div className="card border-0 shadow-sm p-3 h-100 text-start" style={{ borderRadius: '12px' }}>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="text-secondary small fw-medium">Pending Requests</span>
                            <div className="p-2 rounded-3" style={{ backgroundColor: '#F3E8FF', color: '#8B5CF6' }}>
                                <FiArrowRight size={20} />
                            </div>
                        </div>
                        <h3 className="fw-bold text-dark mb-1">{stats.pendingTransfers}</h3>
                        <div className="d-flex align-items-center gap-1">
                            <span className="badge px-1.5 py-0.5" style={{ fontSize: '10px', backgroundColor: '#F3E8FF', color: '#8B5CF6' }}>Pending</span>
                            <span className="text-secondary" style={{ fontSize: '11px' }}>Awaiting head review</span>
                        </div>
                    </div>
                </div>

                {/* Upcoming Returns */}
                <div className="col-6 col-lg-3">
                    <div className="card border-0 shadow-sm p-3 h-100 text-start" style={{ borderRadius: '12px' }}>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="text-secondary small fw-medium">Returns Due</span>
                            <div className="p-2 rounded-3 text-secondary" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                                <FiClock size={20} />
                            </div>
                        </div>
                        <h3 className="fw-bold text-dark mb-1">{stats.upcomingReturns}</h3>
                        <div className="d-flex align-items-center gap-1">
                            <span className="badge px-1.5 py-0.5" style={{ fontSize: '10px', backgroundColor: '#F3F4F6', color: '#6B7280' }}>This Week</span>
                            <span className="text-secondary" style={{ fontSize: '11px' }}>Scheduled items return</span>
                        </div>
                    </div>
                </div>

                {/* Audit campaigns */}
                <div className="col-6 col-lg-3">
                    <div className="card border-0 shadow-sm p-3 h-100 text-start" style={{ borderRadius: '12px' }}>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="text-secondary small fw-medium">Audit Cycles</span>
                            <div className="p-2 rounded-3 text-info" style={{ backgroundColor: '#E0F2FE', color: '#0284C7' }}>
                                <FiCheckSquare size={20} />
                            </div>
                        </div>
                        <h3 className="fw-bold text-dark mb-1">{stats.auditsCount}</h3>
                        <div className="d-flex align-items-center gap-1">
                            <span className="badge px-1.5 py-0.5" style={{ fontSize: '10px', backgroundColor: '#E0F2FE', color: '#0284C7' }}>Ongoing</span>
                            <span className="text-secondary" style={{ fontSize: '11px' }}>Total campaigns status</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* 3. Quick Actions */}
            <div className="card border-0 shadow-sm p-4 mb-4 text-start" style={{ borderRadius: '12px' }}>
                <h5 className="fw-bold text-dark mb-3">Quick Administrative Actions</h5>
                <div className="row g-2">
                    <div className="col-6 col-md-4 col-lg-2">
                        <button className="btn btn-primary w-100 py-3 d-flex flex-column align-items-center gap-2" onClick={() => navigate('/assets')}>
                            <FiPlus size={20} />
                            <span className="fw-semibold small">Register Asset</span>
                        </button>
                    </div>
                    <div className="col-6 col-md-4 col-lg-2">
                        <button className="btn btn-primary w-100 py-3 d-flex flex-column align-items-center gap-2" onClick={() => navigate('/allocation')}>
                            <FiArrowRight size={20} />
                            <span className="fw-semibold small">Allocate Asset</span>
                        </button>
                    </div>
                    <div className="col-6 col-md-4 col-lg-2">
                        <button className="btn btn-primary w-100 py-3 d-flex flex-column align-items-center gap-2" onClick={() => navigate('/bookings')}>
                            <FiCalendar size={20} />
                            <span className="fw-semibold small">Book Resource</span>
                        </button>
                    </div>
                    <div className="col-6 col-md-4 col-lg-2">
                        <button className="btn btn-primary w-100 py-3 d-flex flex-column align-items-center gap-2" onClick={() => navigate('/maintenance')}>
                            <FiAlertTriangle size={20} />
                            <span className="fw-semibold small">Request Repair</span>
                        </button>
                    </div>
                    <div className="col-6 col-md-4 col-lg-2">
                        <button className="btn btn-primary w-100 py-3 d-flex flex-column align-items-center gap-2" onClick={() => navigate('/audit')}>
                            <FiCheckSquare size={20} />
                            <span className="fw-semibold small">Start Audit</span>
                        </button>
                    </div>
                    <div className="col-6 col-md-4 col-lg-2">
                        <button className="btn btn-primary w-100 py-3 d-flex flex-column align-items-center gap-2" onClick={() => navigate('/reports')}>
                            <FiFileText size={20} />
                            <span className="fw-semibold small">View Reports</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Core Split: Distributions & Timeline reports */}
            <div className="row g-4 mb-4">

                {/* 6. Asset Status Distribution & Category shares */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm p-4 h-100 text-start" style={{ borderRadius: '12px' }}>
                        <h5 className="fw-bold text-dark mb-3">Asset Portfolio Status Distribution</h5>
                        <p className="text-secondary small mb-4">Real-time status percentage metrics of physical asset catalogue details.</p>

                        <div className="d-grid gap-3">
                            {/* Available */}
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-1 text-sm small">
                                    <span className="fw-semibold text-dark">Available</span>
                                    <span className="text-success fw-bold">{statusDistribution.available}%</span>
                                </div>
                                <div className="progress" style={{ height: '8px', backgroundColor: '#F1F5F9' }}>
                                    <div className="progress-bar rounded-3" role="progressbar" style={{ width: `${statusDistribution.available}%`, backgroundColor: '#22C55E' }}></div>
                                </div>
                            </div>

                            {/* Allocated */}
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-1 text-sm small">
                                    <span className="fw-semibold text-dark">Allocated</span>
                                    <span className="text-primary fw-bold">{statusDistribution.allocated}%</span>
                                </div>
                                <div className="progress" style={{ height: '8px', backgroundColor: '#F1F5F9' }}>
                                    <div className="progress-bar rounded-3" role="progressbar" style={{ width: `${statusDistribution.allocated}%`, backgroundColor: '#2563EB' }}></div>
                                </div>
                            </div>

                            {/* Maintenance */}
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-1 text-sm small">
                                    <span className="fw-semibold text-dark">Maintenance</span>
                                    <span className="text-danger fw-bold">{statusDistribution.maintenance}%</span>
                                </div>
                                <div className="progress" style={{ height: '8px', backgroundColor: '#F1F5F9' }}>
                                    <div className="progress-bar rounded-3" role="progressbar" style={{ width: `${statusDistribution.maintenance}%`, backgroundColor: '#EF4444' }}></div>
                                </div>
                            </div>

                            {/* Reserved */}
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-1 text-sm small">
                                    <span className="fw-semibold text-dark">Reserved</span>
                                    <span className="text-warning fw-bold">{statusDistribution.reserved}%</span>
                                </div>
                                <div className="progress" style={{ height: '8px', backgroundColor: '#F1F5F9' }}>
                                    <div className="progress-bar rounded-3" role="progressbar" style={{ width: `${statusDistribution.reserved}%`, backgroundColor: '#F59E0B' }}></div>
                                </div>
                            </div>

                            {/* Lost */}
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-1 text-sm small">
                                    <span className="fw-semibold text-dark">Lost</span>
                                    <span className="text-danger fw-bold">{statusDistribution.lost}%</span>
                                </div>
                                <div className="progress" style={{ height: '8px', backgroundColor: '#F1F5F9' }}>
                                    <div className="progress-bar rounded-3" role="progressbar" style={{ width: `${statusDistribution.lost}%`, backgroundColor: '#EF4444' }}></div>
                                </div>
                            </div>

                            {/* Retired */}
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-1 text-sm small">
                                    <span className="fw-semibold text-dark">Retired</span>
                                    <span className="text-secondary fw-bold">{statusDistribution.retired}%</span>
                                </div>
                                <div className="progress" style={{ height: '8px', backgroundColor: '#F1F5F9' }}>
                                    <div className="progress-bar rounded-3" role="progressbar" style={{ width: `${statusDistribution.retired}%`, backgroundColor: '#6B7280' }}></div>
                                </div>
                            </div>

                            {/* Disposed */}
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-1 text-sm small">
                                    <span className="fw-semibold text-dark">Disposed</span>
                                    <span className="text-dark fw-bold">{statusDistribution.disposed}%</span>
                                </div>
                                <div className="progress" style={{ height: '8px', backgroundColor: '#F1F5F9' }}>
                                    <div className="progress-bar rounded-3" role="progressbar" style={{ width: `${statusDistribution.disposed}%`, backgroundColor: '#374151' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Recent Activities */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm p-4 h-100 text-start" style={{ borderRadius: '12px' }}>
                        <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                            <FiActivity size={18} className="text-primary" /> Recent Logged Activities
                        </h5>
                        <p className="text-secondary small mb-4">Latest catalog assignments, book approvals, and status events feed.</p>

                        <div className="position-relative ps-3 my-2" style={{ borderLeft: '2px solid #E5E7EB' }}>
                            {activityLogs.map((log) => {
                                // Decide icon type based on label
                                let itemIcon = <FiBell />;
                                if (log.action.includes('Asset')) itemIcon = <FiPackage />;
                                else if (log.action.includes('Maint') || log.action.includes('Repair')) itemIcon = <FiAlertTriangle />;
                                else if (log.action.includes('Book')) itemIcon = <FiCalendar />;
                                else if (log.action.includes('Transfer')) itemIcon = <FiArrowRight />;
                                else if (log.action.includes('Audit')) itemIcon = <FiCheckSquare />;

                                return (
                                    <div key={log.id} className="position-relative mb-3">
                                        <div className="position-absolute bg-primary rounded-circle d-flex align-items-center justify-content-center text-white"
                                            style={{ width: '22px', height: '22px', left: '-27px', top: '2px', backgroundColor: '#2563EB', fontSize: '10px' }}>
                                            {itemIcon}
                                        </div>
                                        <div className="ms-2">
                                            <div className="d-flex justify-content-between">
                                                <strong className="small text-dark">{log.action}</strong>
                                                <span className="text-secondary" style={{ fontSize: '10px' }}>{log.date}</span>
                                            </div>
                                            <p className="text-secondary small mb-0 mt-0.5">
                                                {log.details} by <span className="font-monospace text-dark fw-medium" style={{ fontSize: '11px' }}>{log.user}</span>
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </div>

            {/* Row: 5. Upcoming Events & 7. Department Summary */}
            <div className="row g-4">

                {/* 5. Upcoming Events */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm p-4 h-100 text-start" style={{ borderRadius: '12px' }}>
                        <h5 className="fw-bold text-dark mb-3">Upcoming Schedules</h5>
                        <p className="text-secondary small mb-4">Imminent returns, maintenance sessions, bookings, and audit deadlines.</p>

                        <div className="d-grid gap-3">
                            <div className="p-3 rounded-3 bg-light border-0 d-flex justify-content-between align-items-center" style={{ backgroundColor: '#F8FAFC' }}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="p-2 rounded bg-indigo-subtle text-indigo" style={{ backgroundColor: '#EEF2FF', color: '#2563EB' }}>
                                        <FiCalendar size={18} />
                                    </div>
                                    <div>
                                        <strong className="d-block small text-dark">Q3 Planning Lab Room</strong>
                                        <span className="text-secondary small">Lab #1 Reservation</span>
                                    </div>
                                </div>
                                <span className="badge text-secondary small" style={{ backgroundColor: '#F1F5F9', color: '#4B5563' }}>Jul 15</span>
                            </div>

                            <div className="p-3 rounded-3 bg-light border-0 d-flex justify-content-between align-items-center" style={{ backgroundColor: '#F8FAFC' }}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="p-2 rounded bg-warning-subtle text-warning" style={{ backgroundColor: '#FEF3C7', color: '#F59E0B' }}>
                                        <FiClock size={18} />
                                    </div>
                                    <div>
                                        <strong className="d-block small text-dark">Asset Tag returns</strong>
                                        <span className="text-secondary small">Sarah Connor - MacBook return due</span>
                                    </div>
                                </div>
                                <span className="badge text-secondary small" style={{ backgroundColor: '#F1F5F9', color: '#4B5563' }}>Jul 18</span>
                            </div>

                            <div className="p-3 rounded-3 bg-light border-0 d-flex justify-content-between align-items-center" style={{ backgroundColor: '#F8FAFC' }}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="p-2 rounded bg-danger-subtle text-danger" style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}>
                                        <FiAlertTriangle size={18} />
                                    </div>
                                    <div>
                                        <strong className="d-block small text-dark">Preventive iPad Repair</strong>
                                        <span className="text-secondary small">Routine touch-pad inspection</span>
                                    </div>
                                </div>
                                <span className="badge text-secondary small" style={{ backgroundColor: '#F1F5F9', color: '#4B5563' }}>Jul 20</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 7. Department Summary */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm p-4 h-100 text-start" style={{ borderRadius: '12px' }}>
                        <h5 className="fw-bold text-dark mb-3">Department Summary Overview</h5>
                        <p className="text-secondary small mb-4">Total registered employees, assets count, and pending booking approvals.</p>

                        <div className="d-grid gap-3">
                            {departments.map((dept) => (
                                <div key={dept.id} className="p-3 rounded-3 border-0 d-flex justify-content-between align-items-center" style={{ backgroundColor: '#F8FAFC' }}>
                                    <div>
                                        <h6 className="fw-bold text-dark mb-1">{dept.name}</h6>
                                        <span className="text-secondary small">Head: <strong>{dept.head}</strong> | Code: {dept.code}</span>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <span className="badge rounded bg-primary-subtle text-primary border px-2.5 py-1" style={{ fontSize: '10px' }}>
                                            {dept.employeeCount} Employees
                                        </span>
                                        <span className="badge rounded bg-success-subtle text-success border px-2.5 py-1" style={{ fontSize: '10px' }}>
                                            {dept.assetsCount} Assets
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}
