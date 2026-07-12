/**
 * Allocation Component
 * Directs corporate resource assignments, inter-department transfers,
 * and checked-out asset returns with detailed approval tracking.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { assetService } from '../services/assetService';
import { allocationService } from '../services/allocationService';
import { employeeService } from '../services/employeeService';
import {
    FiPlus, FiCheck, FiX, FiRefreshCw, FiGrid,
    FiGitPullRequest, FiChevronRight, FiUsers, FiCpu, FiUserCheck
} from 'react-icons/fi';

export default function Allocation() {
    const { user } = useAuth();

    // Data lists state
    const [assets, setAssets] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Selected Sub-View tabs (Depends on user role)
    // admin/manager: 'all_allocations', 'requests_inbox', 'direct_assign'
    // head: 'dept_allocations', 'dept_requests', 'transfer_request'
    // employee: 'my_allocations', 'new_request'
    const [activeTab, setActiveTab] = useState('');

    // Form inputs state
    const [directInput, setDirectInput] = useState({
        assetId: '',
        employeeEmail: '',
        returnDate: '',
        notes: ''
    });

    const [requestInput, setRequestInput] = useState({
        assetId: '',
        type: 'Allocation', // 'Allocation', 'Return', 'Transfer'
        notes: ''
    });

    // Toggle return request form inside employee My Assets
    const [returningAsset, setReturningAsset] = useState(null);
    const [returnNotes, setReturnNotes] = useState('');

    // Fetch lists
    const loadAllData = async () => {
        try {
            setLoading(true);
            const aList = await assetService.getAll();
            const eList = await employeeService.getAll();
            const rList = await allocationService.getAllRequests();

            setAssets(aList);
            setEmployees(eList);
            setRequests(rList);

            // Populate default select input values
            const availableList = aList.filter(a => a.status === 'Available');
            if (availableList.length > 0) {
                setDirectInput(prev => ({ ...prev, assetId: availableList[0].id }));
                setRequestInput(prev => ({ ...prev, assetId: availableList[0].id }));
            }
            const activeEmps = eList.filter(e => e.status === 'Active');
            if (activeEmps.length > 0) {
                setDirectInput(prev => ({ ...prev, employeeEmail: activeEmps[0].email }));
            }
        } catch (err) {
            setError('Failed loading allocation ledger records.');
        } finally {
            setLoading(false);
        }
    };

    // Auto load tab and data on mount
    useEffect(() => {
        loadAllData();
        // Adjust default tab according to active user role
        if (user?.role === 'admin' || user?.role === 'asset_manager') {
            setActiveTab('all_allocations');
        } else if (user?.role === 'department_head') {
            setActiveTab('dept_allocations');
        } else {
            setActiveTab('my_allocations');
        }
    }, [user]);

    // Flash success alert helper
    const flashSuccess = (message) => {
        setSuccess(message);
        setTimeout(() => setSuccess(''), 3500);
    };

    // Form submission handlers
    // 1. Direct assignments (Admin / Manager)
    const handleDirectAllocation = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const targetAsset = assets.find(a => a.id === directInput.assetId);
            const targetEmp = employees.find(emp => emp.email === directInput.employeeEmail);
            if (!targetAsset || !targetEmp) throw new Error('Invalid Asset or Employee selection');

            await allocationService.allocateDirectly(
                directInput.assetId,
                targetEmp.email,
                targetEmp.name,
                targetEmp.department,
                directInput.returnDate,
                directInput.notes,
                user?.email || 'manager@assetflow.com'
            );

            // Log activity log
            const listLogs = JSON.parse(localStorage.getItem('assetflow_activity_logs') || '[]');
            listLogs.unshift({
                id: 'al_' + Date.now().toString(),
                action: 'Direct Allocation',
                user: user?.email,
                details: `Directly allocated ${targetAsset.name} to ${targetEmp.name}`,
                date: new Date().toLocaleString()
            });
            localStorage.setItem('assetflow_activity_logs', JSON.stringify(listLogs));

            flashSuccess(`Directly allocated ${targetAsset.name} to ${targetEmp.name} successfully!`);
            // Reset input values
            setDirectInput(prev => ({ ...prev, notes: '', returnDate: '' }));
            await loadAllData();
        } catch (err) {
            setError(err.message);
        }
    };

    // 2. Direct Process Return (Admin / Manager force return)
    const handleForceReturn = async (assetId) => {
        if (!window.confirm('Mark this asset as returned to central inventory?')) return;
        setError('');
        try {
            const target = assets.find(a => a.id === assetId);
            await allocationService.processReturnDirectly(assetId, user?.email);

            // Log activity log
            const listLogs = JSON.parse(localStorage.getItem('assetflow_activity_logs') || '[]');
            listLogs.unshift({
                id: 'al_' + Date.now().toString(),
                action: 'Direct Return Audit',
                user: user?.email,
                details: `Checked back in asset: ${target?.name} (${target?.tag})`,
                date: new Date().toLocaleString()
            });
            localStorage.setItem('assetflow_activity_logs', JSON.stringify(listLogs));

            flashSuccess(`Checked in ${target?.name} back to storage.`);
            await loadAllData();
        } catch (err) {
            setError(err.message);
        }
    };

    // 3. Employee submits allocation request
    const handleCreateRequest = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const targetAsset = assets.find(a => a.id === requestInput.assetId);
            if (!targetAsset) throw new Error('Asset selection error');

            await allocationService.createRequest({
                assetId: requestInput.assetId,
                assetName: targetAsset.name,
                assetTag: targetAsset.tag,
                requestedBy: user?.email,
                requestedByName: user?.name,
                department: user?.department,
                type: requestInput.type,
                notes: requestInput.notes
            });

            flashSuccess('Request submitted successfully! Pending approval stream.');
            setRequestInput(prev => ({ ...prev, notes: '' }));
            // Swap tab to view list depending on roles
            if (user?.role === 'employee') {
                setActiveTab('my_allocations');
            } else {
                setActiveTab('dept_allocations');
            }
            await loadAllData();
        } catch (err) {
            setError(err.message);
        }
    };

    // 4. Employee initiates return request from My Assets list
    const submitEmployeeReturnRequest = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (!returningAsset) return;

            await allocationService.createRequest({
                assetId: returningAsset.id,
                assetName: returningAsset.name,
                assetTag: returningAsset.tag,
                requestedBy: user?.email,
                requestedByName: user?.name,
                department: user?.department,
                type: 'Return',
                notes: returnNotes
            });

            flashSuccess(`Return request for ${returningAsset.name} submitted successfully.`);
            setReturningAsset(null);
            setReturnNotes('');
            await loadAllData();
        } catch (err) {
            setError(err.message);
        }
    };

    // 5. Approvals: Approve/Reject requests
    const processApproval = async (reqId, isApproved) => {
        setError('');
        try {
            const req = requests.find(r => r.id === reqId);
            if (!req) return;

            if (isApproved) {
                await allocationService.approveRequest(reqId, user?.email);

                // Trigger notification alerts simulation
                const listAlerts = JSON.parse(localStorage.getItem('assetflow_notifications') || '[]');
                listAlerts.unshift({
                    id: 'not_' + Date.now().toString(),
                    title: 'Allocation Request Approved',
                    message: `Request for ${req.assetName} approved by ${user?.name}.`,
                    date: new Date().toLocaleString(),
                    read: false
                });
                localStorage.setItem('assetflow_notifications', JSON.stringify(listAlerts));

                // Log system activity simulation
                const listLogs = JSON.parse(localStorage.getItem('assetflow_activity_logs') || '[]');
                listLogs.unshift({
                    id: 'al_' + Date.now().toString(),
                    action: 'Request Approved',
                    user: user?.email,
                    details: `Approved ${req.type} request #${reqId} of ${req.requestedByName}`,
                    date: new Date().toLocaleString()
                });
                localStorage.setItem('assetflow_activity_logs', JSON.stringify(listLogs));

                flashSuccess(`Approved request for ${req.requestedByName}. Allocation processed.`);
            } else {
                await allocationService.rejectRequest(reqId, user?.email);
                flashSuccess(`Rejected request of ${req.requestedByName}.`);
            }
            await loadAllData();
        } catch (err) {
            setError(err.message);
        }
    };

    // Filter calculations depending on views
    const myAllocatedAssets = assets.filter(a => a.allocatedTo === user?.email && a.status === 'Allocated');
    const deptAllocatedAssets = assets.filter(a => a.department === user?.department && a.status === 'Allocated');
    const allAllocatedAssets = assets.filter(a => a.status === 'Allocated');
    const availableAssets = assets.filter(a => a.status === 'Available');

    // Requests lists filters:
    // Department Head sees pending requests belonging to their department
    const deptRequests = requests.filter(r => r.department === user?.department);
    // Admins see all requests
    const allRequests = requests;

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
            {/* Header greeting summary */}
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                <div>
                    <h1 className="h3 mb-1 text-dark fw-bold">Asset Allocation</h1>
                    <p className="text-secondary small mb-0">Control equipment hand-overs, departmental transfers, and check back returns.</p>
                </div>
                <button className="btn btn-outline-secondary d-flex align-items-center gap-1.5 fs-7 btn-sm py-1.5" onClick={loadAllData}>
                    <FiRefreshCw />
                    <span>Synchronize</span>
                </button>
            </div>

            {/* Alert boxes */}
            {success && <div className="alert alert-success py-2 px-3 mb-3 small fw-medium">{success}</div>}
            {error && <div className="alert alert-danger py-2 px-3 mb-3 small fw-medium">{error}</div>}

            {/* Render subnavigation tabs based on authorizations role */}
            <ul className="nav nav-tabs mb-4 border-bottom">

                {/* Admin/Asset Manager specific views */}
                {(user?.role === 'admin' || user?.role === 'asset_manager') && (
                    <>
                        <li className="nav-item">
                            <button
                                className={`nav-link fw-semibold px-4 border-0 ${activeTab === 'all_allocations' ? 'active border-bottom border-primary text-primary' : 'text-secondary'}`}
                                onClick={() => { setActiveTab('all_allocations'); setReturningAsset(null); }}
                                style={activeTab === 'all_allocations' ? { borderBottom: '3px solid #2563eb !important', color: '#2563eb' } : {}}
                            >
                                📦 All Allocations
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link fw-semibold px-4 border-0 ${activeTab === 'requests_inbox' ? 'active border-bottom border-primary text-primary' : 'text-secondary'}`}
                                onClick={() => { setActiveTab('requests_inbox'); setReturningAsset(null); }}
                                style={activeTab === 'requests_inbox' ? { borderBottom: '3px solid #2563eb !important', color: '#2563eb' } : {}}
                            >
                                🔔 Request Inbox ({requests.filter(r => r.status === 'Pending').length})
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link fw-semibold px-4 border-0 ${activeTab === 'direct_assign' ? 'active border-bottom border-primary text-primary' : 'text-secondary'}`}
                                onClick={() => { setActiveTab('direct_assign'); setReturningAsset(null); }}
                                style={activeTab === 'direct_assign' ? { borderBottom: '3px solid #2563eb !important', color: '#2563eb' } : {}}
                            >
                                ➕ Direct Allocate Assignment
                            </button>
                        </li>
                    </>
                )}

                {/* Department Head views */}
                {user?.role === 'department_head' && (
                    <>
                        <li className="nav-item">
                            <button
                                className={`nav-link fw-semibold px-4 border-0 ${activeTab === 'dept_allocations' ? 'active border-bottom border-primary text-primary' : 'text-secondary'}`}
                                onClick={() => { setActiveTab('dept_allocations'); setReturningAsset(null); }}
                                style={activeTab === 'dept_allocations' ? { borderBottom: '3px solid #2563eb !important', color: '#2563eb' } : {}}
                            >
                                🏢 Department Assets
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link fw-semibold px-4 border-0 ${activeTab === 'dept_requests' ? 'active border-bottom border-primary text-primary' : 'text-secondary'}`}
                                onClick={() => { setActiveTab('dept_requests'); setReturningAsset(null); }}
                                style={activeTab === 'dept_requests' ? { borderBottom: '3px solid #2563eb !important', color: '#2563eb' } : {}}
                            >
                                🔔 Dept Approvals ({deptRequests.filter(r => r.status === 'Pending').length})
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link fw-semibold px-4 border-0 ${activeTab === 'transfer_request' ? 'active border-bottom border-primary text-primary' : 'text-secondary'}`}
                                onClick={() => { setActiveTab('transfer_request'); setReturningAsset(null); }}
                                style={activeTab === 'transfer_request' ? { borderBottom: '3px solid #2563eb !important', color: '#2563eb' } : {}}
                            >
                                📝 Initiate Transfer Request
                            </button>
                        </li>
                    </>
                )}

                {/* Standard Employee view options */}
                {user?.role === 'employee' && (
                    <>
                        <li className="nav-item">
                            <button
                                className={`nav-link fw-semibold px-4 border-0 ${activeTab === 'my_allocations' ? 'active border-bottom border-primary text-primary' : 'text-secondary'}`}
                                onClick={() => { setActiveTab('my_allocations'); setReturningAsset(null); }}
                                style={activeTab === 'my_allocations' ? { borderBottom: '3px solid #2563eb !important', color: '#2563eb' } : {}}
                            >
                                💻 Assigned Assets
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link fw-semibold px-4 border-0 ${activeTab === 'new_request' ? 'active border-bottom border-primary text-primary' : 'text-secondary'}`}
                                onClick={() => { setActiveTab('new_request'); setReturningAsset(null); }}
                                style={activeTab === 'new_request' ? { borderBottom: '3px solid #2563eb !important', color: '#2563eb' } : {}}
                            >
                                📋 Submit Device Request
                            </button>
                        </li>
                    </>
                )}

            </ul>

            {/* ==========================================
                EMPLOYEE VIEW 1: MY ALLOCATIONS
                ========================================== */}
            {activeTab === 'my_allocations' && (
                <div>
                    {returningAsset && (
                        <div className="card p-4 mb-4 bg-light shadow-xs border text-start">
                            <h5 className="fw-bold mb-2">Request Asset Return Process</h5>
                            <p className="text-secondary small">Request to return: <strong>{returningAsset.name}</strong> ({returningAsset.tag})</p>
                            <form onSubmit={submitEmployeeReturnRequest}>
                                <div className="mb-3">
                                    <label className="form-label text-secondary small fw-medium mt-1">Reason / Condition return notes</label>
                                    <textarea
                                        className="form-control"
                                        rows="2"
                                        placeholder="Explain reason for return (e.g. upgrades needed, project ended)"
                                        value={returnNotes}
                                        onChange={(e) => setReturnNotes(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="text-end">
                                    <button type="button" className="btn btn-sm btn-secondary me-2 px-3 py-1.5" onClick={() => setReturningAsset(null)}>Cancel</button>
                                    <button type="submit" className="btn btn-sm btn-primary px-4 py-1.5" style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}>Submit Request</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="table-responsive border rounded bg-white">
                        <table className="table table-hover align-middle mb-0 text-sm">
                            <thead className="table-light text-secondary">
                                <tr>
                                    <th className="px-4 py-3 text-uppercase small">Asset Details</th>
                                    <th className="py-3 text-uppercase small">Category</th>
                                    <th className="py-3 text-uppercase small">Usage Location</th>
                                    <th className="px-4 py-3 text-end text-uppercase small">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myAllocatedAssets.length > 0 ? (
                                    myAllocatedAssets.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3">
                                                <div className="fw-semibold text-dark">{item.name}</div>
                                                <div className="text-secondary mt-1 font-monospace" style={{ fontSize: '11px' }}>{item.tag}</div>
                                            </td>
                                            <td className="py-3 text-secondary">{item.category}</td>
                                            <td className="py-3 text-secondary">{item.location}</td>
                                            <td className="px-4 py-3 text-end">
                                                {/* Check if there is already a pending return request */}
                                                {requests.some(r => r.assetId === item.id && r.status === 'Pending' && r.type === 'Return') ? (
                                                    <span className="badge bg-warning text-dark px-2.5 py-1.5">Return Pending Approval</span>
                                                ) : (
                                                    <button
                                                        className="btn btn-sm btn-outline-danger px-3"
                                                        onClick={() => { setReturningAsset(item); setReturnNotes(''); }}
                                                    >
                                                        Request Return
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4 text-muted small">No assets currently allocated to your profile profile.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ==========================================
                EMPLOYEE VIEW 2 / GENERAL: INTAKE REQUEST FORM
                ========================================== */}
            {((activeTab === 'new_request') || (activeTab === 'transfer_request')) && (
                <div className="card p-4 bg-white border border border-shadow-sm rounded-3 text-start mx-auto" style={{ maxWidth: '600px', border: '1px solid #cbd5e1' }}>
                    <h5 className="fw-bold mb-3 border-bottom pb-2">
                        {activeTab === 'transfer_request' ? 'Request Department Resource Transfer' : 'Submit Allocation Device Request'}
                    </h5>

                    <form onSubmit={handleCreateRequest}>
                        <div className="mb-3">
                            <label className="form-label text-secondary small fw-medium">Select Resource Device</label>
                            {activeTab === 'transfer_request' ? (
                                <select
                                    className="form-select text-secondary small fw-medium"
                                    value={requestInput.assetId}
                                    onChange={(e) => setRequestInput({ ...requestInput, assetId: e.target.value })}
                                    required
                                >
                                    {assets.filter(a => a.status === 'Allocated' && a.department !== user?.department).map(a => (
                                        <option key={a.id} value={a.id}>{a.name} ({a.tag}) - Dept: {a.department}</option>
                                    ))}
                                </select>
                            ) : (
                                <select
                                    className="form-select text-secondary small"
                                    value={requestInput.assetId}
                                    onChange={(e) => setRequestInput({ ...requestInput, assetId: e.target.value })}
                                    required
                                >
                                    {availableAssets.map(a => (
                                        <option key={a.id} value={a.id}>{a.name} ({a.tag})</option>
                                    ))}
                                    {availableAssets.length === 0 && (
                                        <option value="">No available assets inside storage catalog</option>
                                    )}
                                </select>
                            )}
                        </div>

                        <div className="mb-3">
                            <label className="form-label text-secondary small fw-medium">Request Action Type</label>
                            <input
                                type="text"
                                className="form-control bg-light text-secondary font-monospace"
                                value={activeTab === 'transfer_request' ? 'Transfer' : 'Allocation'}
                                disabled
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label text-secondary small fw-medium">Justification Statement & Notes</label>
                            <textarea
                                className="form-control"
                                rows="3"
                                placeholder={activeTab === 'transfer_request' ? "Why does your department team require this device?" : "Provide reason justifications for this device checkout request."}
                                value={requestInput.notes}
                                onChange={(e) => setRequestInput({ ...requestInput, notes: e.target.value, type: activeTab === 'transfer_request' ? 'Transfer' : 'Allocation' })}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100 py-2 mt-2 fw-medium"
                            style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}
                            disabled={activeTab === 'new_request' && availableAssets.length === 0}
                        >
                            Submit Transaction Request
                        </button>
                    </form>
                </div>
            )}

            {/* ==========================================
                DEPARTMENT HEAD VIEW 1: DEPT ASSETS
                ========================================== */}
            {activeTab === 'dept_allocations' && (
                <div className="table-responsive border rounded bg-white">
                    <table className="table table-hover align-middle mb-0 text-sm">
                        <thead className="table-light text-secondary">
                            <tr>
                                <th className="px-4 py-3 text-uppercase small">Asset Details</th>
                                <th className="py-3 text-uppercase small">Category</th>
                                <th className="py-3 text-uppercase small">Assigned To</th>
                                <th className="py-3 text-uppercase small">Location</th>
                                <th className="px-4 py-3 text-end text-uppercase small">History</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deptAllocatedAssets.length > 0 ? (
                                deptAllocatedAssets.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3">
                                            <div className="fw-semibold text-dark">{item.name}</div>
                                            <div className="text-secondary font-monospace mt-0.5" style={{ fontSize: '11px' }}>{item.tag}</div>
                                        </td>
                                        <td className="py-3 text-secondary">{item.category}</td>
                                        <td className="py-3 fw-medium text-dark">{item.allocatedToName}</td>
                                        <td className="py-3 text-secondary">{item.location}</td>
                                        <td className="px-4 py-3 text-end">
                                            <span className="small text-muted font-monospace">{item.history[0]?.date || 'None'}</span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-muted small">No department assets registered matches.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ==========================================
                APPROVALS TAB INBOX: FOR HEADS & ADMINS
                ========================================== */}
            {((activeTab === 'requests_inbox') || (activeTab === 'dept_requests')) && (
                <div className="table-responsive border rounded bg-white">
                    <table className="table table-hover align-middle mb-0 text-sm">
                        <thead className="table-light text-secondary">
                            <tr>
                                <th className="px-4 py-3 text-uppercase small">Target Resource</th>
                                <th className="py-3 text-uppercase small">Type</th>
                                <th className="py-3 text-uppercase small">Requested By</th>
                                <th className="py-3 text-uppercase small">Justification & Notes</th>
                                <th className="py-3 text-uppercase small text-center">Status</th>
                                <th className="px-4 py-3 text-end text-uppercase small">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(activeTab === 'requests_inbox' ? allRequests : deptRequests).length > 0 ? (
                                (activeTab === 'requests_inbox' ? allRequests : deptRequests).map(req => (
                                    <tr key={req.id}>
                                        <td className="px-4 py-3">
                                            <div className="fw-semibold text-dark">{req.assetName}</div>
                                            <div className="text-secondary font-monospace mt-0.5" style={{ fontSize: '11px' }}>{req.assetTag}</div>
                                        </td>
                                        <td className="py-3">
                                            <span className={`badge ${req.type === 'Allocation' ? 'bg-success' : req.type === 'Transfer' ? 'bg-primary' : 'bg-danger'
                                                }`}>{req.type}</span>
                                        </td>
                                        <td className="py-3">
                                            <div className="fw-medium text-dark">{req.requestedByName}</div>
                                            <div className="text-secondary fs-7" style={{ fontSize: '11px' }}>{req.department}</div>
                                        </td>
                                        <td className="py-3 text-secondary text-truncate" style={{ maxWidth: '240px' }} title={req.notes}>
                                            {req.notes}
                                        </td>
                                        <td className="py-3 text-center">
                                            <span className={`badge ${req.status === 'Pending' ? 'bg-warning text-dark' : req.status === 'Approved' ? 'bg-success' : 'bg-danger'
                                                }`}>{req.status}</span>
                                        </td>
                                        <td className="px-4 py-3 text-end">
                                            {req.status === 'Pending' ? (
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button
                                                        className="btn btn-sm btn-success rounded-circle d-flex align-items-center justify-content-center p-0"
                                                        onClick={() => processApproval(req.id, true)}
                                                        title="Approve Request"
                                                        style={{ width: '28px', height: '28px' }}
                                                    >
                                                        <FiCheck size={14} />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-danger rounded-circle d-flex align-items-center justify-content-center p-0"
                                                        onClick={() => processApproval(req.id, false)}
                                                        title="Reject Request"
                                                        style={{ width: '28px', height: '28px' }}
                                                    >
                                                        <FiX size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="small text-muted font-monospace text-xs">Closed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-muted small">No request tasks inside Inbox.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ==========================================
                ADMIN VIEW: DIRECT ALLOCATE FORM
                ========================================== */}
            {activeTab === 'direct_assign' && (
                <div className="card p-4 bg-white border border border shadow-sm rounded-3 text-start mx-auto" style={{ maxWidth: '600px', border: '1px solid #cbd5e1' }}>
                    <h5 className="fw-bold mb-3 border-bottom pb-2">Direct Allocate Assignment Form</h5>

                    <form onSubmit={handleDirectAllocation}>
                        <div className="mb-3">
                            <label className="form-label text-secondary small fw-medium">Select Available Device</label>
                            <select
                                className="form-select text-secondary small"
                                value={directInput.assetId}
                                onChange={(e) => setDirectInput({ ...directInput, assetId: e.target.value })}
                                required
                            >
                                {availableAssets.map(a => (
                                    <option key={a.id} value={a.id}>{a.name} ({a.tag}) - Location: {a.location}</option>
                                ))}
                                {availableAssets.length === 0 && (
                                    <option value="">No available assets inside storage catalog</option>
                                )}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label text-secondary small fw-medium">Allocate To employee profile</label>
                            <select
                                className="form-select text-secondary small"
                                value={directInput.employeeEmail}
                                onChange={(e) => setDirectInput({ ...directInput, employeeEmail: e.target.value })}
                                required
                            >
                                {employees.filter(emp => emp.status === 'Active').map(emp => (
                                    <option key={emp.id} value={emp.email}>{emp.name} ({emp.department})</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label text-secondary small fw-medium">Expected Return Date (Optional)</label>
                            <input
                                type="date"
                                className="form-control"
                                value={directInput.returnDate}
                                onChange={(e) => setDirectInput({ ...directInput, returnDate: e.target.value })}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label text-secondary small fw-medium">Transaction Action Notes</label>
                            <textarea
                                className="form-control"
                                rows="3"
                                placeholder="Additional details, serial tracking notes..."
                                value={directInput.notes}
                                onChange={(e) => setDirectInput({ ...directInput, notes: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100 py-2 mt-2 fw-medium"
                            style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}
                            disabled={availableAssets.length === 0}
                        >
                            Assign Resource Hand-Over
                        </button>
                    </form>
                </div>
            )}

            {/* ==========================================
                ADMIN VIEW: ALL ALLOCATIONS LIST
                ========================================== */}
            {activeTab === 'all_allocations' && (
                <div className="table-responsive border rounded bg-white">
                    <table className="table table-hover align-middle mb-0 text-sm">
                        <thead className="table-light text-secondary">
                            <tr>
                                <th className="px-4 py-3 text-uppercase small">Asset Details</th>
                                <th className="py-3 text-uppercase small">Allocated To</th>
                                <th className="py-3 text-uppercase small">Department Group</th>
                                <th className="py-3 text-uppercase small">Last Checked Out</th>
                                <th className="px-4 py-3 text-end text-uppercase small">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allAllocatedAssets.length > 0 ? (
                                allAllocatedAssets.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3">
                                            <div className="fw-semibold text-dark">{item.name}</div>
                                            <div className="text-secondary font-monospace mt-0.5" style={{ fontSize: '11px' }}>{item.tag}</div>
                                        </td>
                                        <td className="py-3 fw-medium text-dark">{item.allocatedToName}</td>
                                        <td className="py-3 text-secondary">{item.department}</td>
                                        <td className="py-3 text-secondary font-monospace" style={{ fontSize: '11px' }}>
                                            {item.history[0]?.date || 'Not Tracked'}
                                        </td>
                                        <td className="px-4 py-3 text-end">
                                            <button
                                                className="btn btn-sm btn-outline-danger px-3 py-1 fw-medium"
                                                onClick={() => handleForceReturn(item.id)}
                                            >
                                                Unassign & Return
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-muted small">No active checked-out assets detected.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    );
}
