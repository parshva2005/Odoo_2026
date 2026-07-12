/**
 * Maintenance Component
 * Manages filing malfunction reports, updating processing stages,
 * assigning technical engineers, and recording service cost transactions.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { assetService } from '../services/assetService';
import { maintenanceService } from '../services/maintenanceService';
import {
    FiAlertTriangle, FiCheckCircle, FiTool, FiDollarSign,
    FiPlus, FiFilter, FiUser, FiCalendar, FiClock
} from 'react-icons/fi';

export default function Maintenance() {
    const { user } = useAuth();

    // Data lists state
    const [tickets, setTickets] = useState([]);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Active sub-filters
    const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'Pending', 'In Progress', 'Resolved'

    // Form inputs state
    const [newTicketInput, setNewTicketInput] = useState({
        assetId: '',
        description: '',
        priority: 'Medium'
    });

    // Update ticket state (Admin/Manager only)
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [updateInput, setUpdateInput] = useState({
        status: 'In Progress',
        technician: '',
        cost: 0,
        notes: ''
    });

    // Load data
    const loadAllTickets = async () => {
        try {
            setLoading(true);
            const tList = await maintenanceService.getAll();
            const aList = await assetService.getAll();
            setTickets(tList);
            setAssets(aList);

            // Populate default select input values
            if (aList.length > 0) {
                setNewTicketInput(prev => ({ ...prev, assetId: aList[0].id }));
            }
        } catch (err) {
            setError('Failed loading maintenance records list.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllTickets();
    }, []);

    // Flash success alert helper
    const flashSuccess = (message) => {
        setSuccess(message);
        setTimeout(() => setSuccess(''), 3000);
    };

    // Submits new ticket
    const handleCreateTicket = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const targetAsset = assets.find(a => a.id === newTicketInput.assetId);
            if (!targetAsset) throw new Error('Asset selection invalid');

            await maintenanceService.create({
                assetId: newTicketInput.assetId,
                assetName: targetAsset.name,
                assetTag: targetAsset.tag,
                reportedBy: user?.email,
                reportedByName: user?.name,
                description: newTicketInput.description,
                priority: newTicketInput.priority
            });

            // Log activity log
            const listLogs = JSON.parse(localStorage.getItem('assetflow_activity_logs') || '[]');
            listLogs.unshift({
                id: 'al_' + Date.now().toString(),
                action: 'Maintenance Lodged',
                user: user?.email,
                details: `Reported issue on ${targetAsset.name} (#${targetAsset.tag})`,
                date: new Date().toLocaleString()
            });
            localStorage.setItem('assetflow_activity_logs', JSON.stringify(listLogs));

            flashSuccess('Maintenance ticket logged successfully. Asset status updated.');
            setNewTicketInput(prev => ({ ...prev, description: '' }));
            await loadAllTickets();
        } catch (err) {
            setError(err.message);
        }
    };

    // Submits resolution/status updates (For Admins/Managers)
    const handleUpdateTicket = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (!selectedTicket) return;

            const updated = await maintenanceService.update(
                selectedTicket.id,
                {
                    status: updateInput.status,
                    technician: updateInput.technician,
                    cost: Number(updateInput.cost),
                    notes: updateInput.notes
                },
                user?.email || 'manager@assetflow.com'
            );

            // Log system activity simulation
            const listLogs = JSON.parse(localStorage.getItem('assetflow_activity_logs') || '[]');
            listLogs.unshift({
                id: 'al_' + Date.now().toString(),
                action: 'Ticket Updated',
                user: user?.email,
                details: `Updated ticket #${selectedTicket.id} to ${updateInput.status}`,
                date: new Date().toLocaleString()
            });
            localStorage.setItem('assetflow_activity_logs', JSON.stringify(listLogs));

            flashSuccess(`Ticket details updated successfully.`);
            setSelectedTicket(null);
            await loadAllTickets();
        } catch (err) {
            setError(err.message);
        }
    };

    // Filter list
    const filteredTickets = tickets.filter(t => {
        if (statusFilter === 'ALL') return true;
        return t.status === statusFilter;
    });

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
                    <h1 className="h3 mb-1 text-dark fw-bold">Maintenance Management</h1>
                    <p className="text-secondary small mb-0">Lodge diagnostic tickets, view work logs, assign engineers, and track repair costs.</p>
                </div>
            </div>

            {/* Alert feeds logs */}
            {success && <div className="alert alert-success py-2.5 px-3 mb-4 small fw-medium">{success}</div>}
            {error && <div className="alert alert-danger py-2.5 px-3 mb-4 small fw-medium">{error}</div>}

            <div className="row g-4">
                {/* 1. Ticket Submission (Left-hand column) */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white text-start">
                        <div className="p-4 text-white" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}>
                            <h5 className="mb-1 fw-bold"><FiTool className="me-2" />File Repair Ticket</h5>
                            <p className="small mb-0 opacity-75">Report any physical defects or soft errors of devices.</p>
                        </div>
                        <div className="p-4">
                            <form onSubmit={handleCreateTicket}>
                                <div className="mb-3">
                                    <label className="form-label text-secondary small fw-bold">Select malfunctioning device</label>
                                    <select
                                        className="form-select border-secondary-subtle"
                                        value={newTicketInput.assetId}
                                        onChange={(e) => setNewTicketInput({ ...newTicketInput, assetId: e.target.value })}
                                        required
                                    >
                                        {assets.map(a => (
                                            <option key={a.id} value={a.id}>{a.name} ({a.tag}) [{a.status}]</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label text-secondary small fw-bold">Ticket priority severity</label>
                                    <select
                                        className="form-select border-secondary-subtle"
                                        value={newTicketInput.priority}
                                        onChange={(e) => setNewTicketInput({ ...newTicketInput, priority: e.target.value })}
                                        required
                                    >
                                        <option value="Low">🟢 Low Priority</option>
                                        <option value="Medium">🟡 Medium Priority</option>
                                        <option value="High">🔴 High Priority / Critical</option>
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label text-secondary small fw-bold">Defect & issue description</label>
                                    <textarea
                                        className="form-control border-secondary-subtle"
                                        rows="3"
                                        placeholder="Explain defect symptoms details (e.g. key mechanism sticky, power unit failure)..."
                                        value={newTicketInput.description}
                                        onChange={(e) => setNewTicketInput({ ...newTicketInput, description: e.target.value })}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 py-2.5 fw-semibold mt-2"
                                    style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}
                                >
                                    Log Defect Ticket
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* 2. Right-Hand: Tickets dashboard list */}
                <div className="col-lg-8">

                    {/* Status filter tabs */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex gap-1.5 flex-wrap">
                            {['ALL', 'Pending', 'In Progress', 'Resolved'].map(st => (
                                <button
                                    key={st}
                                    className={`btn btn-sm px-3 rounded-pill fw-medium ${statusFilter === st ? 'btn-dark' : 'btn-outline-secondary'}`}
                                    onClick={() => setStatusFilter(st)}
                                >
                                    {st}
                                </button>
                            ))}
                        </div>
                        <span className="text-secondary small font-monospace">Count: {filteredTickets.length} tickets</span>
                    </div>

                    {/* Interactive update pane (Admin/Manager role only) */}
                    {selectedTicket && (user?.role === 'admin' || user?.role === 'asset_manager') && (
                        <div className="card border-warning mb-4 shadow bg-light-subtle text-start rounded-4 p-4 border">
                            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                                <h5 className="fw-bold mb-0 text-dark">Update Diagnosis Ticket Details</h5>
                                <button className="btn btn-sm btn-close" onClick={() => setSelectedTicket(null)}></button>
                            </div>
                            <p className="small text-secondary">
                                Ticket ID: <strong>{selectedTicket.id}</strong> | Asset: <strong>{selectedTicket.assetName}</strong>
                            </p>

                            <form onSubmit={handleUpdateTicket}>
                                <div className="row g-3">
                                    <div className="col-sm-6">
                                        <label className="form-label text-secondary small fw-bold">Service Process Status</label>
                                        <select
                                            className="form-select"
                                            value={updateInput.status}
                                            onChange={(e) => setUpdateInput({ ...updateInput, status: e.target.value })}
                                            required
                                        >
                                            <option value="Pending">Pending Assignment</option>
                                            <option value="In Progress">In Progress Repair</option>
                                            <option value="Resolved">Resolved & Completed</option>
                                        </select>
                                    </div>
                                    <div className="col-sm-6">
                                        <label className="form-label text-secondary small fw-bold">Assign Repair Expert</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. Alex Tech Engineer"
                                            value={updateInput.technician}
                                            onChange={(e) => setUpdateInput({ ...updateInput, technician: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-sm-6">
                                        <label className="form-label text-secondary small fw-bold">Accumulated Repair Cost ($)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            min="0"
                                            placeholder="e.g. 150"
                                            value={updateInput.cost}
                                            onChange={(e) => setUpdateInput({ ...updateInput, cost: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-sm-6">
                                        <label className="form-label text-secondary small fw-bold">Action / Resolution notes</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Diagnostics details..."
                                            value={updateInput.notes}
                                            onChange={(e) => setUpdateInput({ ...updateInput, notes: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="text-end mt-3">
                                    <button type="button" className="btn btn-sm btn-secondary me-2 px-3 py-1.5" onClick={() => setSelectedTicket(null)}>Cancel</button>
                                    <button type="submit" className="btn btn-sm btn-success px-4 py-1.5">Apply updates</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Tickets layout items feed */}
                    <div className="d-flex flex-column gap-3 text-start">
                        {filteredTickets.length > 0 ? (
                            filteredTickets.map(tkt => (
                                <div key={tkt.id} className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white p-4 position-relative">
                                    {/* Priority top edge stripe */}
                                    <div
                                        className="position-absolute top-0 start-0 end-0"
                                        style={{
                                            height: '4px',
                                            backgroundColor: tkt.priority === 'High' ? '#ef4444' : tkt.priority === 'Medium' ? '#f59e0b' : '#10b981'
                                        }}
                                    />

                                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-start gap-2">
                                        <div>
                                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                                <h6 className="fw-bold mb-0 text-dark">{tkt.assetName}</h6>
                                                <span className="font-monospace text-secondary" style={{ fontSize: '11px' }}>{tkt.assetTag}</span>
                                                <span className={`badge ${tkt.priority === 'High' ? 'bg-danger-subtle text-danger' :
                                                        tkt.priority === 'Medium' ? 'bg-warning-subtle text-warning-emphasis' : 'bg-success-subtle text-success'
                                                    }`} style={{ fontSize: '10px' }}>
                                                    {tkt.priority} Priority
                                                </span>
                                            </div>
                                            <p className="mt-2 text-secondary small mb-3" style={{ fontSize: '13px' }}>
                                                {tkt.description}
                                            </p>
                                        </div>
                                        <div className="text-sm-end flex-shrink-0">
                                            <span className={`badge px-2.5 py-1.5 ${tkt.status === 'Resolved' ? 'bg-success text-white' :
                                                    tkt.status === 'In Progress' ? 'bg-primary text-white' : 'bg-warning text-dark'
                                                }`}>{tkt.status}</span>
                                            <div className="text-secondary mt-1 font-monospace" style={{ fontSize: '10px' }}><FiCalendar className="me-1" />{tkt.reportedDate}</div>
                                        </div>
                                    </div>

                                    {/* Footer logistics detail banner */}
                                    <div className="d-flex flex-wrap align-items-center justify-content-between border-top pt-3 mt-1.5 bg-light-subtle rounded px-2 gap-3 small text-secondary">
                                        <span className="d-flex align-items-center gap-1.5"><FiUser size={13} /> Reported: <strong>{tkt.reportedByName}</strong></span>
                                        <span className="d-flex align-items-center gap-1.5"><FiTool size={13} /> Tech Assigned: <strong>{tkt.technician || 'Pending'}</strong></span>
                                        <span className="d-flex align-items-center gap-1.5"><FiDollarSign size={13} /> Cost: <strong>${tkt.cost}</strong></span>

                                        {/* Action edit clicker for Admins */}
                                        {(user?.role === 'admin' || user?.role === 'asset_manager') && tkt.status !== 'Resolved' && (
                                            <button
                                                className="btn btn-xs btn-outline-primary py-0.5 px-2.5 fs-7 btn-sm"
                                                onClick={() => {
                                                    setSelectedTicket(tkt);
                                                    setUpdateInput({
                                                        status: tkt.status,
                                                        technician: tkt.technician,
                                                        cost: tkt.cost,
                                                        notes: ''
                                                    });
                                                }}
                                            >
                                                Update Ticket
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="card p-5 text-center text-secondary small border-shadow-sm bg-white">
                                <FiCheckCircle size={32} className="text-success mb-2 mx-auto" />
                                No active maintenance tickets under this filter.
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
