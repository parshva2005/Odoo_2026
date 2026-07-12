/**
 * Audit Component
 * Guides asset verification audits, schedules audits,
 * and tracks discrepencies on hardware assets.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { auditService } from '../services/auditService';
import { assetService } from '../services/assetService';
import { employeeService } from '../services/employeeService';
import { FiCheckSquare, FiAlertCircle, FiPlus, FiUser, FiCalendar, FiActivity, FiTag, FiSearch } from 'react-icons/fi';

export default function Audit() {
    const { user } = useAuth();

    // Data lists state
    const [campaigns, setCampaigns] = useState([]);
    const [assets, setAssets] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Toggle active view tab: 'active_audits', 'schedule_new', 'audit_history'
    const [activeTab, setActiveTab] = useState('active_audits');

    // Create campaign input form state
    const [campaignInput, setCampaignInput] = useState({
        title: '',
        department: '',
        assignedAuditor: ''
    });

    // Single item verification drawer state
    const [verifyingItem, setVerifyingItem] = useState(null); // { campaignId, asset }
    const [verificationField, setVerificationField] = useState({
        status: 'Verified', // 'Verified', 'Discrepancy'
        notes: ''
    });

    // Dynamic departments list
    const [departments, setDepartments] = useState([]);

    // Load data
    const loadAuditData = async () => {
        try {
            setLoading(true);
            const cList = await auditService.getAll();
            const aList = await assetService.getAll();
            const eList = await employeeService.getAll();

            setCampaigns(cList);
            setAssets(aList);
            setEmployees(eList);

            // Dynamically build unique departments list
            const depts = [...new Set(aList.map(a => a.department).filter(Boolean))];
            setDepartments(depts);

            // Setup default form selectors
            if (depts.length > 0) {
                setCampaignInput(prev => ({
                    ...prev,
                    department: depts[0],
                    assignedAuditor: eList[0]?.email || ''
                }));
            }
        } catch (err) {
            setError('Failed loading audit records database.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAuditData();
    }, []);

    // Flash success helper
    const flashSuccess = (message) => {
        setSuccess(message);
        setTimeout(() => setSuccess(''), 3000);
    };

    // Submits new audit campaign
    const handleCreateCampaign = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // Find all assets in that department
            const targetAssets = assets.filter(a => a.department === campaignInput.department && a.status !== 'Under Maintenance');
            if (targetAssets.length === 0) {
                throw new Error(`No active assets found under Department: ${campaignInput.department} to construct audit cycle.`);
            }

            const auditorObj = employees.find(emp => emp.email === campaignInput.assignedAuditor);
            if (!auditorObj) throw new Error('Selected Auditor email was invalid.');

            // Build item verification list
            const campaignItems = targetAssets.map(a => ({
                assetId: a.id,
                assetName: a.name,
                tag: a.tag,
                status: 'Pending',
                verificationStatus: '',
                notes: ''
            }));

            await auditService.create({
                title: campaignInput.title,
                department: campaignInput.department,
                assignedAuditor: campaignInput.assignedAuditor,
                assignedAuditorName: auditorObj.name,
                items: campaignItems
            });

            // Add activity log
            const listLogs = JSON.parse(localStorage.getItem('assetflow_activity_logs') || '[]');
            listLogs.unshift({
                id: 'al_' + Date.now().toString(),
                action: 'Audit Scheduled',
                user: user?.email,
                details: `Scheduled new audit: ${campaignInput.title} for ${campaignInput.department}`,
                date: new Date().toLocaleString()
            });
            localStorage.setItem('assetflow_activity_logs', JSON.stringify(listLogs));

            flashSuccess(`Successfully scheduled "${campaignInput.title}".`);
            setCampaignInput(prev => ({ ...prev, title: '' }));
            setActiveTab('active_audits');
            await loadAuditData();
        } catch (err) {
            setError(err.message);
        }
    };

    // Submits single item verification
    const handleVerifyItem = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (!verifyingItem) return;

            await auditService.verifyItem(
                verifyingItem.campaignId,
                verifyingItem.asset.assetId,
                verificationField.status,
                verificationField.notes,
                user?.email || 'auditor@assetflow.com'
            );

            // Log activity log
            const listLogs = JSON.parse(localStorage.getItem('assetflow_activity_logs') || '[]');
            listLogs.unshift({
                id: 'al_' + Date.now().toString(),
                action: 'Item Audited',
                user: user?.email,
                details: `Verified item ${verifyingItem.asset.assetName} status: ${verificationField.status}`,
                date: new Date().toLocaleString()
            });
            localStorage.setItem('assetflow_activity_logs', JSON.stringify(listLogs));

            flashSuccess(`Logged verification for ${verifyingItem.asset.assetName}.`);
            setVerifyingItem(null);
            setVerificationField({ status: 'Verified', notes: '' });
            await loadAuditData();
        } catch (err) {
            setError(err.message);
        }
    };

    const activeCampaigns = campaigns.filter(c => c.status === 'In Progress');
    const completedCampaigns = campaigns.filter(c => c.status === 'Completed');

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: '300px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header section view */}
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                <div>
                    <h1 className="h3 mb-1 text-dark fw-bold">Asset Auditing</h1>
                    <p className="text-secondary small mb-0">Verify physical tags inventory matching, assign auditors, and report discrepancies.</p>
                </div>
                {/* Action buttons triggers */}
                {(user?.role === 'admin' || user?.role === 'asset_manager') && (
                    <button
                        className={`btn btn-sm ${activeTab === 'schedule_new' ? 'btn-dark' : 'btn-primary'} d-flex align-items-center gap-1.5 fw-semibold`}
                        onClick={() => setActiveTab(activeTab === 'schedule_new' ? 'active_audits' : 'schedule_new')}
                        style={activeTab !== 'schedule_new' ? { backgroundColor: '#2563eb', borderColor: '#2563eb' } : {}}
                    >
                        <FiPlus />
                        Schedule Audit Campaign
                    </button>
                )}
            </div>

            {/* Alert feeds */}
            {success && <div className="alert alert-success py-2.5 px-3 mb-4 small fw-medium">{success}</div>}
            {error && <div className="alert alert-danger py-2.5 px-3 mb-4 small fw-medium">{error}</div>}

            {/* Sub navigation Tabs */}
            <ul className="nav nav-tabs mb-4 border-bottom">
                <li className="nav-item">
                    <button
                        className={`nav-link fw-semibold px-4 border-0 ${activeTab === 'active_audits' ? 'active border-bottom border-primary text-primary' : 'text-secondary'}`}
                        onClick={() => { setActiveTab('active_audits'); setVerifyingItem(null); }}
                        style={activeTab === 'active_audits' ? { borderBottom: '3px solid #2563eb !important', color: '#2563eb' } : {}}
                    >
                        📋 Active Audits ({activeCampaigns.length})
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link fw-semibold px-4 border-0 ${activeTab === 'audit_history' ? 'active border-bottom border-primary text-primary' : 'text-secondary'}`}
                        onClick={() => { setActiveTab('audit_history'); setVerifyingItem(null); }}
                        style={activeTab === 'audit_history' ? { borderBottom: '3px solid #2563eb !important', color: '#2563eb' } : {}}
                    >
                        📜 Audit Campaigns History ({completedCampaigns.length})
                    </button>
                </li>
            </ul>

            {/* ==========================================
                VIEW 1: SCHEDULE NEW AUDIT (FORM)
                ========================================== */}
            {activeTab === 'schedule_new' && (
                <div className="card p-4 bg-white border border border shadow-sm rounded-3 text-start mx-auto" style={{ maxWidth: '600px', border: '1px solid #cbd5e1' }}>
                    <h5 className="fw-bold mb-3 border-bottom pb-2">Schedule New Audit Campaign</h5>

                    <form onSubmit={handleCreateCampaign}>
                        <div className="mb-3">
                            <label className="form-label text-secondary small fw-medium">Campaign Description Title</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="e.g. Q3 Software Laptop Audit"
                                value={campaignInput.title}
                                onChange={(e) => setCampaignInput({ ...campaignInput, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label text-secondary small fw-medium">Target Physical Department</label>
                            <select
                                className="form-select text-secondary small"
                                value={campaignInput.department}
                                onChange={(e) => setCampaignInput({ ...campaignInput, department: e.target.value })}
                                required
                            >
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label text-secondary small fw-medium">Assign Auditor Technician</label>
                            <select
                                className="form-select text-secondary small"
                                value={campaignInput.assignedAuditor}
                                onChange={(e) => setCampaignInput({ ...campaignInput, assignedAuditor: e.target.value })}
                                required
                            >
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.email}>{emp.name} ({emp.role})</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100 py-2.5 mt-2 fw-medium"
                            style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}
                        >
                            Publish Verification Cycle
                        </button>
                    </form>
                </div>
            )}

            {/* ==========================================
                VIEW 2: ACTIVE AUDITS CAMPAIGNS LIST & ITEMS
                ========================================== */}
            {activeTab === 'active_audits' && (
                <div className="row g-4 text-start">

                    {/* Verifying single item drawer panel */}
                    {verifyingItem && (
                        <div className="col-12">
                            <div className="card p-4 bg-light shadow-xs border text-start border-warning rounded-3">
                                <h5 className="fw-bold mb-2">Verify Asset: {verifyingItem.asset.assetName}</h5>
                                <p className="text-secondary small">
                                    Asset Tag: <code>{verifyingItem.asset.tag}</code> | Campaign: {campaigns.find(c => c.id === verifyingItem.campaignId)?.title}
                                </p>

                                <form onSubmit={handleVerifyItem}>
                                    <div className="row g-3">
                                        <div className="col-sm-6">
                                            <label className="form-label text-secondary small fw-bold">Verification Result</label>
                                            <select
                                                className="form-select"
                                                value={verificationField.status}
                                                onChange={(e) => setVerificationField({ ...verificationField, status: e.target.value })}
                                                required
                                            >
                                                <option value="Verified">Verified (Details match perfectly)</option>
                                                <option value="Discrepancy">Discrepancy (Damages, missing decal tags, mismatch)</option>
                                            </select>
                                        </div>
                                        <div className="col-sm-6">
                                            <label className="form-label text-secondary small fw-bold">Resolution Notes / Discrepancy details</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="..."
                                                value={verificationField.notes}
                                                onChange={(e) => setVerificationField({ ...verificationField, notes: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="text-end mt-3">
                                        <button type="button" className="btn btn-sm btn-secondary me-2 px-3 py-1.5" onClick={() => setVerifyingItem(null)}>Cancel</button>
                                        <button type="submit" className="btn btn-sm btn-primary px-4 py-1.5" style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}>Record Verification</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeCampaigns.map(c => (
                        <div key={c.id} className="col-12">
                            <div className="card border p-4 bg-white shadow-xs rounded-4">
                                <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3 flex-wrap gap-2">
                                    <div>
                                        <h5 className="fw-bold mb-1">{c.title}</h5>
                                        <div className="d-flex align-items-center gap-3 text-secondary small flex-wrap">
                                            <span className="d-flex align-items-center gap-1 font-monospace" style={{ fontSize: '11px' }}><FiCalendar size={13} /> Scheduled: {c.scheduledDate}</span>
                                            <span>Department: <strong>{c.department}</strong></span>
                                            <span className="d-flex align-items-center gap-1"><FiUser size={13} /> Auditor: <strong>{c.assignedAuditorName}</strong></span>
                                        </div>
                                    </div>
                                    <span className="badge bg-warning text-dark px-3 py-1.5">In Progress</span>
                                </div>

                                <div className="table-responsive">
                                    <table className="table align-middle table-hover text-sm">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="px-3">Asset Details</th>
                                                <th>Physical ID Tag</th>
                                                <th>Audit State</th>
                                                <th>Verification feedback</th>
                                                <th className="text-end px-3">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {c.items.map(item => (
                                                <tr key={item.assetId}>
                                                    <td className="px-3 fw-semibold text-dark">{item.assetName}</td>
                                                    <td><code className="text-danger small">{item.tag}</code></td>
                                                    <td>
                                                        <span className={`badge ${item.status === 'Pending' ? 'bg-secondary' :
                                                                item.status === 'Verified' ? 'bg-success' : 'bg-danger'
                                                            }`}>{item.status}</span>
                                                    </td>
                                                    <td className="text-truncate text-secondary small" style={{ maxWidth: '200px' }} title={item.notes}>
                                                        {item.notes || 'No notes filed'}
                                                    </td>
                                                    <td className="text-end px-3">
                                                        {/* Check if user is the assigned auditor or admin */}
                                                        {item.status === 'Pending' && (user?.email === c.assignedAuditor || user?.role === 'admin') ? (
                                                            <button
                                                                className="btn btn-xs btn-outline-primary py-0.5 px-2 fs-7 btn-sm"
                                                                onClick={() => {
                                                                    setVerifyingItem({ campaignId: c.id, asset: item });
                                                                    setVerificationField({ status: 'Verified', notes: '' });
                                                                }}
                                                            >
                                                                Audit Item
                                                            </button>
                                                        ) : (
                                                            <span className="small text-secondary font-monospace" style={{ fontSize: '11px' }}>Verify Locked</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ))}

                    {activeCampaigns.length === 0 && (
                        <div className="col-12 card p-5 text-center text-muted border-shadow-sm bg-white">
                            No active inventory audit cycles. Use the "Schedule Audit Campaign" scheduler.
                        </div>
                    )}
                </div>
            )}

            {/* ==========================================
                VIEW 3: AUDITS HISTORY
                ========================================== */}
            {activeTab === 'audit_history' && (
                <div className="d-flex flex-column gap-4 text-start">
                    {completedCampaigns.map(c => (
                        <div key={c.id} className="card border p-4 bg-white shadow-xs rounded-4">
                            <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
                                <div>
                                    <h5 className="fw-bold mb-1">{c.title}</h5>
                                    <div className="d-flex align-items-center gap-3 text-secondary small">
                                        <span className="d-flex align-items-center gap-1 font-monospace" style={{ fontSize: '11px' }}><FiCalendar size={13} /> {c.scheduledDate}</span>
                                        <span>Dept: <strong>{c.department}</strong></span>
                                        <span className="d-flex align-items-center gap-1"><FiUser size={13} /> Auditor: {c.assignedAuditorName}</span>
                                    </div>
                                </div>
                                <span className="badge bg-success text-white px-3 py-1.5">Completed</span>
                            </div>

                            <div className="table-responsive">
                                <table className="table align-middle text-sm table-hover">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="px-3">Asset Details</th>
                                            <th>Physical ID Tag</th>
                                            <th>Feedback Status</th>
                                            <th className="px-3">Audit Details / Discrepancy logs</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {c.items.map(item => (
                                            <tr key={item.assetId}>
                                                <td className="px-3 fw-semibold text-dark">{item.assetName}</td>
                                                <td><code>{item.tag}</code></td>
                                                <td>
                                                    <span className={`badge ${item.verificationStatus === 'Verified' ? 'bg-success' : 'bg-danger'
                                                        }`}>{item.verificationStatus}</span>
                                                </td>
                                                <td className="px-3 small text-secondary">{item.notes}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}

                    {completedCampaigns.length === 0 && (
                        <div className="card p-5 text-center text-muted border-shadow-sm bg-white">
                            No completed audit history campaigns.
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}
