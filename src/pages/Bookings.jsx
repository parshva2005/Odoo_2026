/**
 * Bookings Component
 * Handles booking resource slots, logs calendars, and checks overlapping schedule collisions.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';
import {
    FiCalendar, FiClock, FiPlus, FiAlertTriangle,
    FiInfo, FiTrash2, FiSearch, FiGrid, FiList
} from 'react-icons/fi';

export default function Bookings() {
    const { user } = useAuth();

    // Data lists state
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Active sub-layout: 'list' or 'calendar'
    const [viewMode, setViewMode] = useState('list');

    // Default bookable items database (simulating rooms/hardware)
    const resourceCatalogue = [
        { id: 'res_1', name: 'Main Conference Room A' },
        { id: 'res_2', name: 'Hardware Testing Lab Suite' },
        { id: 'res_3', name: 'AV Projection Equipment Pack' },
        { id: 'res_4', name: 'Staging Server Node (Dev)' }
    ];

    // Form inputs state
    const [formInput, setFormInput] = useState({
        resourceId: 'res_1',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        purpose: ''
    });

    // Calendar visual filters state
    const [selectedResourceFilter, setSelectedResourceFilter] = useState('res_1');
    const [searchQuery, setSearchQuery] = useState('');

    // Load bookings
    const fetchReservationsList = async () => {
        try {
            setLoading(true);
            const list = await bookingService.getAll();
            setBookings(list);
        } catch (err) {
            setError('Failed loading reservations.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservationsList();
    }, []);

    // Flash success alert helper
    const flashSuccess = (message) => {
        setSuccess(message);
        setTimeout(() => setSuccess(''), 4000);
    };

    // Submits booking
    const handleNewBooking = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const targetRes = resourceCatalogue.find(r => r.id === formInput.resourceId);
            if (!targetRes) throw new Error('Selected resource not valid.');

            const result = await bookingService.create({
                resourceId: formInput.resourceId,
                resourceName: targetRes.name,
                date: formInput.date,
                startTime: formInput.startTime,
                endTime: formInput.endTime,
                purpose: formInput.purpose,
                requestedBy: user?.email,
                requestedByName: user?.name
            });

            // Log activity log
            const currentLogs = JSON.parse(localStorage.getItem('assetflow_activity_logs') || '[]');
            currentLogs.unshift({
                id: 'al_' + Date.now().toString(),
                action: 'Resource Reserved',
                user: user?.email,
                details: `Reserved: ${targetRes.name} on ${formInput.date} (${formInput.startTime}-${formInput.endTime})`,
                date: new Date().toLocaleString()
            });
            localStorage.setItem('assetflow_activity_logs', JSON.stringify(currentLogs));

            flashSuccess(`Reservation confirmed! Locked: ${targetRes.name} for ${formInput.startTime}-${formInput.endTime}`);
            setFormInput(prev => ({ ...prev, purpose: '' }));
            await fetchReservationsList();
        } catch (err) {
            setError(err.message || 'Booking failed.');
        }
    };

    // Cancels booking
    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        setError('');
        try {
            await bookingService.cancel(bookingId);
            flashSuccess('Reservation cancelled.');
            await fetchReservationsList();
        } catch (err) {
            setError(err.message || 'Cancellation failed.');
        }
    };

    // Filtered bookings list for tabular view
    const filteredBookings = bookings.filter(b => {
        const resourceNameStr = (b.resourceName || b.assetName || '').toLowerCase();
        const requestedByNameStr = (b.requestedByName || b.bookedByName || '').toLowerCase();
        const purposeStr = (b.purpose || b.title || '').toLowerCase();
        const q = searchQuery.toLowerCase();
        return resourceNameStr.includes(q) || requestedByNameStr.includes(q) || purposeStr.includes(q);
    });

    // Bookings for visual calendar filter
    const calendarBookings = bookings.map(b => ({
        ...b,
        resourceId: b.resourceId || b.assetId || '',
        resourceName: b.resourceName || b.assetName || '',
        requestedByName: b.requestedByName || b.bookedByName || '',
        requestedBy: b.requestedBy || b.bookedBy || '',
        purpose: b.purpose || b.title || '',
        date: b.date || (b.startDate ? b.startDate.split('T')[0] : ''),
        startTime: b.startTime || (b.startDate ? b.startDate.split('T')[1] : ''),
        endTime: b.endTime || (b.endDate ? b.endDate.split('T')[1] : '')
    })).filter(b => b.resourceId === selectedResourceFilter && b.status === 'Approved');

    // Generating list of next 5 operational days for visual calendar mock
    const getNextDays = () => {
        const days = [];
        const baseDate = new Date();
        for (let i = 0; i < 5; i++) {
            const temp = new Date(baseDate);
            temp.setDate(baseDate.getDate() + i);
            days.push({
                dayName: temp.toLocaleDateString('en-US', { weekday: 'short' }),
                dateStr: temp.toISOString().split('T')[0],
                formattedDate: temp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            });
        }
        return days;
    };
    const upcomingDays = getNextDays();

    // Time subdivisions for Mock Calendar Grid View (9 AM to 5 PM)
    const timeSlots = [
        { label: '09:00 - 11:00', start: '09:00', end: '11:00' },
        { label: '11:00 - 13:00', start: '11:00', end: '13:00' },
        { label: '13:00 - 15:00', start: '13:00', end: '15:00' },
        { label: '15:00 - 17:00', start: '15:00', end: '17:00' }
    ];

    // Helper checks if a sub-slot falls inside any reservation
    const isSlotReserved = (dayStr, startStr, endStr) => {
        const parseMinutes = (t) => {
            const [h, m] = t.split(':').map(Number);
            return (h * 60) + m;
        };
        const sM = parseMinutes(startStr);
        const eM = parseMinutes(endStr);

        return calendarBookings.find(b => {
            if (b.date === dayStr) {
                const bS = parseMinutes(b.startTime);
                const bE = parseMinutes(b.endTime);
                // Overlap condition
                return (sM < bE && eM > bS);
            }
            return false;
        });
    };

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
                    <h1 className="h3 mb-1 text-dark fw-bold">Resource Bookings</h1>
                    <p className="text-secondary small mb-0">Reserve conferences, shared equipment devices, and staging environments.</p>
                </div>
                <div className="btn-group shadow-xs">
                    <button
                        className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setViewMode('list')}
                        style={viewMode === 'list' ? { backgroundColor: '#2563eb', borderColor: '#2563eb' } : {}}
                    >
                        <FiList className="me-1" />
                        Tabular List
                    </button>
                    <button
                        className={`btn btn-sm ${viewMode === 'calendar' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setViewMode('calendar')}
                        style={viewMode === 'calendar' ? { backgroundColor: '#2563eb', borderColor: '#2563eb' } : {}}
                    >
                        <FiGrid className="me-1" />
                        Calendar Board
                    </button>
                </div>
            </div>

            {/* Alert feeds logs */}
            {success && <div className="alert alert-success py-2.5 px-3 mb-4 small fw-medium">{success}</div>}
            {error && <div className="alert alert-danger py-2.5 px-3 mb-4 small fw-medium d-flex align-items-center gap-2">
                <FiAlertTriangle size={18} className="text-danger flex-shrink-0" />
                <span>{error}</span>
            </div>}

            <div className="row g-4">

                {/* 1. Scheduler reserve input form */}
                <div className="col-lg-4">
                    <div className="card shadow-sm p-4 border rounded-3 bg-white text-start">
                        <h5 className="fw-bold text-dark border-bottom pb-2 mb-3">Reserve a Resource</h5>

                        <form onSubmit={handleNewBooking}>
                            <div className="mb-3">
                                <label className="form-label text-secondary small fw-medium">Applicable Equipment</label>
                                <select
                                    className="form-select text-secondary small"
                                    value={formInput.resourceId}
                                    onChange={(e) => setFormInput({ ...formInput, resourceId: e.target.value })}
                                    required
                                >
                                    {resourceCatalogue.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label text-secondary small fw-medium">Calendar Date</label>
                                <input
                                    type="date"
                                    className="form-control text-secondary small"
                                    value={formInput.date}
                                    onChange={(e) => setFormInput({ ...formInput, date: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="row g-3 mb-3">
                                <div className="col-6">
                                    <label className="form-label text-secondary small fw-medium">Start Time slot</label>
                                    <input
                                        type="time"
                                        className="form-control text-secondary small"
                                        value={formInput.startTime}
                                        onChange={(e) => setFormInput({ ...formInput, startTime: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="col-6">
                                    <label className="form-label text-secondary small fw-medium">End Time slot</label>
                                    <input
                                        type="time"
                                        className="form-control text-secondary small"
                                        value={formInput.endTime}
                                        onChange={(e) => setFormInput({ ...formInput, endTime: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label text-secondary small fw-medium">Booking Purpose</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    placeholder="Explain reservation purpose (e.g. UI layout workshop)"
                                    value={formInput.purpose}
                                    onChange={(e) => setFormInput({ ...formInput, purpose: e.target.value })}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-100 py-2.5 fw-medium d-flex align-items-center justify-content-center gap-2 mt-3"
                                style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}
                            >
                                <FiPlus />
                                <span>Lock Resource Slot</span>
                            </button>
                        </form>
                    </div>
                </div>

                {/* 2. Right-Hand: List visual calendar board vs Table view */}
                <div className="col-lg-8">

                    {/* VIEW 1: TABULAR LIST */}
                    {viewMode === 'list' && (
                        <div className="card shadow-sm p-4 border rounded-3 bg-white h-100Style">
                            <div className="d-flex justify-content-between align-items-center mb-4 gap-3">
                                <h5 className="fw-bold text-dark mb-0">Upcoming Bookings Register</h5>
                                <div className="input-group" style={{ maxWidth: '280px' }}>
                                    <span className="input-group-text bg-white border-end-0 text-muted py-1"><FiSearch size={14} /></span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0 py-1 text-sm small"
                                        placeholder="Search schedules..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="table-responsive border rounded text-start">
                                <table className="table table-hover align-middle mb-0 text-sm">
                                    <thead className="table-light text-secondary">
                                        <tr>
                                            <th className="px-4 py-3 text-uppercase small">Resource Device</th>
                                            <th className="py-3 text-uppercase small">Timeline</th>
                                            <th className="py-3 text-uppercase small">Booked Name</th>
                                            <th className="py-3 text-uppercase small">Purpose</th>
                                            <th className="px-4 py-3 text-end text-uppercase small">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredBookings.length > 0 ? (
                                            filteredBookings.map(b => {
                                                const resName = b.resourceName || b.assetName || 'System Resource';
                                                const reqName = b.requestedByName || b.bookedByName || 'System User';
                                                const reqEmail = b.requestedBy || b.bookedBy || '';
                                                const dateVal = b.date || (b.startDate ? b.startDate.split('T')[0] : '');
                                                const startVal = b.startTime || (b.startDate ? b.startDate.split('T')[1] : '');
                                                const endVal = b.endTime || (b.endDate ? b.endDate.split('T')[1] : '');
                                                const purposeVal = b.purpose || b.title || 'Corporate Booking';
                                                const canCancel = b.status === 'Approved' &&
                                                    (reqEmail === user?.email || user?.role === 'admin' || user?.role === 'asset_manager');

                                                return (
                                                    <tr key={b.id} style={b.status === 'Cancelled' ? { opacity: 0.5 } : {}}>
                                                        <td className="px-4 py-3">
                                                            <div className="fw-semibold text-dark">{resName}</div>
                                                            <span className={`badge mt-1 ${b.status === 'Approved' ? 'bg-success' : 'bg-secondary'
                                                                }`} style={{ fontSize: '9px' }}>{b.status}</span>
                                                        </td>
                                                        <td className="py-3">
                                                            <div className="small text-dark font-monospace d-flex align-items-center gap-1">
                                                                <FiCalendar size={12} className="text-primary" /> {dateVal}
                                                            </div>
                                                            {startVal && (
                                                                <div className="small text-secondary mt-1 font-monospace d-flex align-items-center gap-1" style={{ fontSize: '11px' }}>
                                                                    <FiClock size={12} /> {startVal} - {endVal}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-3">
                                                            <div className="fw-medium text-dark">{reqName}</div>
                                                            <div className="text-secondary" style={{ fontSize: '10px' }}>{reqEmail}</div>
                                                        </td>
                                                        <td className="py-3 text-secondary text-truncate" style={{ maxWidth: '150px' }} title={purposeVal}>
                                                            {purposeVal}
                                                        </td>
                                                        <td className="px-4 py-3 text-end">
                                                            {canCancel && (
                                                                <button
                                                                    className="btn btn-sm btn-link text-danger p-0 border-0"
                                                                    onClick={() => handleCancelBooking(b.id)}
                                                                    title="Cancel Booking"
                                                                >
                                                                    <FiTrash2 size={16} />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center py-4 text-muted small">No upcoming scheduled bookings tracked.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* VIEW 2: MOCK SCHEDULE CALENDAR BOARD */}
                    {viewMode === 'calendar' && (
                        <div className="card shadow-sm p-4 border rounded-3 bg-white text-start">
                            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3 border-bottom pb-3">
                                <div>
                                    <h5 className="fw-bold text-dark mb-1">Visual Booking Grid</h5>
                                    <p className="text-muted small mb-0">Select equipment to browse time slots reservation layout boards.</p>
                                </div>
                                <select
                                    className="form-select border text-secondary"
                                    style={{ maxWidth: '260px' }}
                                    value={selectedResourceFilter}
                                    onChange={(e) => setSelectedResourceFilter(e.target.value)}
                                >
                                    {resourceCatalogue.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* visual calendar block row */}
                            <div className="row g-2 text-center mb-4">
                                {upcomingDays.map(day => (
                                    <div key={day.dateStr} className="col">
                                        <div className="p-2 border rounded bg-light">
                                            <div className="fw-bold small text-secondary">{day.dayName}</div>
                                            <div className="fw-bold text-dark small" style={{ fontSize: '11px' }}>{day.formattedDate}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Linear slot checker table */}
                            <div className="d-flex flex-column gap-3">
                                {timeSlots.map(slot => (
                                    <div key={slot.label} className="p-3 border rounded shadow-xs" style={{ backgroundColor: '#fafafa' }}>
                                        <div className="row align-items-center">
                                            <div className="col-sm-3 text-start">
                                                <span className="small text-secondary fw-semibold font-monospace d-flex align-items-center gap-1">
                                                    <FiClock size={13} className="text-secondary" /> {slot.label}
                                                </span>
                                            </div>
                                            <div className="col-sm-9">
                                                {/* Map horizontally across next days */}
                                                <div className="row g-1 mt-2 mt-sm-0">
                                                    {upcomingDays.map(day => {
                                                        const matchReserve = isSlotReserved(day.dateStr, slot.start, slot.end);
                                                        return (
                                                            <div key={day.dateStr} className="col">
                                                                <div
                                                                    className={`p-1.5 rounded text-truncate`}
                                                                    style={{
                                                                        fontSize: '9px',
                                                                        fontWeight: 'semi-bold',
                                                                        backgroundColor: matchReserve ? '#fee2e2' : '#dcfce7',
                                                                        color: matchReserve ? '#991b1b' : '#166534',
                                                                        border: matchReserve ? '1px solid #fecaca' : '1px solid #bbf7d0',
                                                                        textOverflow: 'ellipsis'
                                                                    }}
                                                                    title={matchReserve ? `Booked by: ${matchReserve.requestedByName} for ${matchReserve.purpose}` : 'Available'}
                                                                >
                                                                    {matchReserve ? matchReserve.requestedByName.split(' ')[0] : 'Available'}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="d-flex align-items-start gap-2 bg-light-subtle border rounded p-3 mt-4">
                                <FiInfo size={18} className="text-primary flex-shrink-0 mt-0.5" />
                                <span className="small text-secondary">
                                    Our collision engine evaluates reservations down to the exact overlapping minute range to ensure there are no double bookings on selected items.
                                </span>
                            </div>
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
}
