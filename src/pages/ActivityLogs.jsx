/**
 * ActivityLogs Component
 * Renders audit trails of ledger and asset transactions.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiClipboard, FiSearch, FiTrash2, FiUser, FiCalendar, FiActivity } from 'react-icons/fi';

export default function ActivityLogs() {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState('ALL');

    const fetchLogs = () => {
        const data = localStorage.getItem('assetflow_activity_logs') || '[]';
        setLogs(JSON.parse(data));
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    // Clear logs (Admin only action)
    const handleClearLogs = () => {
        if (!window.confirm('Delete all activity log history? This cannot be undone.')) return;
        localStorage.setItem('assetflow_activity_logs', JSON.stringify([]));
        setLogs([]);
    };

    // Calculate filter tabs/buttons
    const uniqueActions = ['ALL', ...new Set(logs.map(log => log.action).filter(Boolean))];

    // Filter logs list
    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.action.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
        return matchesSearch && matchesAction;
    });

    return (
        <div>
            {/* Header section view */}
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4 flex-wrap gap-2 text-start">
                <div>
                    <h1 className="h3 mb-1 text-dark fw-bold">Activity Logs & Audit Trail</h1>
                    <p className="text-secondary small mb-0">Review system tracking, user operations, and asset allocations changes.</p>
                </div>
                {user?.role === 'admin' && logs.length > 0 && (
                    <button className="btn btn-outline-danger btn-sm px-3 py-2 fw-medium d-flex align-items-center gap-1.5" onClick={handleClearLogs}>
                        <FiTrash2 />
                        <span>Purge Action Logs</span>
                    </button>
                )}
            </div>

            <div className="card shadow-sm border rounded-4 bg-white p-4 text-start">
                {/* Search and drop logs filter controls */}
                <div className="row g-3 mb-4 align-items-center">
                    <div className="col-12 col-md-5">
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0 text-muted"><FiSearch size={15} /></span>
                            <input
                                type="text"
                                className="form-control border-start-0 text-sm small"
                                placeholder="Search trails by keywords, user..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="col-12 col-md-7 text-md-end">
                        <div className="d-flex gap-1.5 flex-wrap justify-content-md-end">
                            {uniqueActions.slice(0, 5).map(act => (
                                <button
                                    key={act}
                                    className={`btn btn-xs btn-sm px-2.5 py-1 fw-semibold rounded-pill ${actionFilter === act ? 'btn-dark' : 'btn-outline-secondary'
                                        }`}
                                    onClick={() => setActionFilter(act)}
                                    style={{ fontSize: '11px' }}
                                >
                                    {act}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Audit vertical feed list */}
                <div className="d-flex flex-column gap-3">
                    {filteredLogs.length > 0 ? (
                        filteredLogs.map(item => (
                            <div key={item.id} className="p-3 border rounded shadow-xs bg-light-subtle d-flex align-items-start gap-3 transition">
                                <div className="p-2 rounded-circle bg-primary-subtle text-primary mt-1 d-flex flex-shrink-0">
                                    <FiActivity size={16} />
                                </div>
                                <div className="w-100">
                                    <div className="d-flex justify-content-between align-items-center flex-wrap mb-1 gap-2">
                                        <span className="badge bg-secondary px-2.5 py-1 text-uppercase fw-bold" style={{ fontSize: '10px' }}>
                                            {item.action}
                                        </span>
                                        <span className="text-secondary small font-monospace d-flex align-items-center gap-1" style={{ fontSize: '11px' }}>
                                            <FiCalendar size={12} /> {item.date}
                                        </span>
                                    </div>
                                    <p className="text-dark small mb-2 fw-medium" style={{ fontSize: '13.5px' }}>
                                        {item.details}
                                    </p>
                                    <div className="d-flex align-items-center gap-1.5 text-secondary fs-7" style={{ fontSize: '11px' }}>
                                        <FiUser size={13} /> Triggered Action: <code>{item.user}</code>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-5 text-center text-secondary small text-semibold">
                            <FiClipboard size={32} className="text-secondary mb-2 mx-auto" />
                            No activity logged records matching filters.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
