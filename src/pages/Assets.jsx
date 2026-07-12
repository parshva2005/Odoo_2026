/**
 * Assets Component
 * Manages the corporate Asset Catalog, asset registration, item details,
 * QR representation, asset timeline logs history, and state badge toggles.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { assetService } from '../services/assetService';
import { categoryService } from '../services/categoryService';
import {
    FiPlus, FiChevronRight, FiSearch, FiFilter,
    FiCalendar, FiTag, FiMapPin, FiActivity, FiX, FiCheck, FiCpu
} from 'react-icons/fi';

export default function Assets() {
    const { user } = useAuth();

    // Data lists state
    const [assets, setAssets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Search and Filter constraints
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');

    // UI Panel toggles
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);

    // Form inputs state
    const [formInput, setFormInput] = useState({
        name: '',
        tag: '',
        category: '',
        serial: '',
        value: '',
        location: '',
        purchaseDate: new Date().toISOString().split('T')[0]
    });

    // Image Upload dummy state
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageName, setImageName] = useState('');

    // Pagination helper
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Load assets and categories
    const loadRecords = async () => {
        try {
            setLoading(true);
            const list = await assetService.getAll();
            const catList = await categoryService.getAll();
            setAssets(list);
            setCategories(catList);

            if (catList.length > 0) {
                setFormInput(prev => ({ ...prev, category: catList[0].name }));
            }
        } catch (err) {
            setError('Failed loading asset logs catalog.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRecords();
    }, []);

    // Flash success alert helper
    const flashSuccess = (message) => {
        setSuccess(message);
        setTimeout(() => setSuccess(''), 3000);
    };

    // Role permissions checker
    const canRegister = user?.role === 'admin' || user?.role === 'asset_manager';

    // Handle dummy image upload selection
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageName(file.name);
            // Construct a local URL for standard visual presentation
            setSelectedImage(URL.createObjectURL(file));
        }
    };

    // Submits new asset to service
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const result = await assetService.register({
                ...formInput,
                value: parseFloat(formInput.value) || 0
            });

            // Trigger category count increment locally (simulation)
            const storedCats = JSON.parse(localStorage.getItem('assetflow_categories') || '[]');
            const cIndex = storedCats.findIndex(c => c.name === formInput.category);
            if (cIndex !== -1) {
                storedCats[cIndex].assetCount = (storedCats[cIndex].assetCount || 0) + 1;
                localStorage.setItem('assetflow_categories', JSON.stringify(storedCats));
            }

            // Register Activity Log (simulation)
            const currentLogs = JSON.parse(localStorage.getItem('assetflow_activity_logs') || '[]');
            currentLogs.unshift({
                id: 'al_' + Date.now().toString(),
                action: 'Asset Registered',
                user: user?.email || 'admin@assetflow.com',
                details: `Registered item: ${result.name} (${result.tag})`,
                date: new Date().toLocaleString()
            });
            localStorage.setItem('assetflow_activity_logs', JSON.stringify(currentLogs));

            flashSuccess('Asset registered successfully!');
            // Reset form fields
            setFormInput({
                name: '',
                tag: '',
                category: categories[0]?.name || '',
                serial: '',
                value: '',
                location: '',
                purchaseDate: new Date().toISOString().split('T')[0]
            });
            setSelectedImage(null);
            setImageName('');
            setShowRegisterForm(false);
            await loadRecords();
        } catch (err) {
            setError(err.message);
        }
    };

    // Filter Assets based on UI inputs
    const filteredAssets = assets.filter(item => {
        const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.serial.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
        const matchesStatus = filterStatus === 'All' || item.status === filterStatus;

        return matchesQuery && matchesCategory && matchesStatus;
    });

    // Pagination slice indices
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAssetsList = filteredAssets.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

    // Status Badge generator
    const renderStatusBadge = (status) => {
        let bgStyle = 'bg-secondary';
        switch (status) {
            case 'Available':
                bgStyle = 'bg-success';
                break;
            case 'Allocated':
                bgStyle = 'bg-primary';
                break;
            case 'Reserved':
                bgStyle = 'bg-info text-dark';
                break;
            case 'Under Maintenance':
                bgStyle = 'bg-warning text-dark';
                break;
            case 'Lost':
                bgStyle = 'bg-danger';
                break;
            case 'Retired':
                bgStyle = 'bg-dark';
                break;
            case 'Disposed':
                bgStyle = 'bg-dark opacity-50';
                break;
            default:
                bgStyle = 'bg-secondary';
        }
        return <span className={`badge ${bgStyle}`}>{status}</span>;
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
            {/* Header Title Section */}
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                <div>
                    <h1 className="h3 mb-1 text-dark fw-bold">Company Asset Catalog</h1>
                    <p className="text-secondary small mb-0">Browse company hardware inventory, check lifecycles, and view logs history.</p>
                </div>
                {canRegister && !showRegisterForm && (
                    <button
                        className="btn btn-primary d-flex align-items-center gap-2"
                        onClick={() => {
                            setShowRegisterForm(true);
                            setSelectedAsset(null);
                        }}
                        style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}
                    >
                        <FiPlus />
                        <span>Register Tag Card</span>
                    </button>
                )}
            </div>

            {/* Notifications Feed */}
            {success && <div className="alert alert-success py-2 px-3 mb-3 small fw-medium">{success}</div>}
            {error && <div className="alert alert-danger py-2 px-3 mb-3 small fw-medium">{error}</div>}

            {/* ==========================================
                REGISTER ASSET FORM CARD
                ========================================== */}
            {showRegisterForm && (
                <div className="card p-4 mb-4 bg-light border shadow-sm rounded-3">
                    <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                        <h5 className="fw-bold mb-0">Register Corporate Physical Asset</h5>
                        <button className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center p-1 rounded-circle" onClick={() => setShowRegisterForm(false)} style={{ width: '28px', height: '28px' }}>
                            <FiX size={16} />
                        </button>
                    </div>

                    <form onSubmit={handleRegisterSubmit}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label text-secondary small fw-medium">Asset Name / Title</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. MacBook Pro M3"
                                    value={formInput.name}
                                    onChange={(e) => setFormInput({ ...formInput, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-secondary small fw-medium">Asset Tag ID (Unique)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. AST-2026-004"
                                    value={formInput.tag}
                                    onChange={(e) => setFormInput({ ...formInput, tag: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label text-secondary small fw-medium">Asset Category</label>
                                <select
                                    className="form-select"
                                    value={formInput.category}
                                    onChange={(e) => setFormInput({ ...formInput, category: e.target.value })}
                                    required
                                >
                                    {categories.map(c => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label text-secondary small fw-medium">Vendor Serial Number</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. SN-998822A"
                                    value={formInput.serial}
                                    onChange={(e) => setFormInput({ ...formInput, serial: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label text-secondary small fw-medium">Purchase Value (USD)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="e.g. 1500"
                                    value={formInput.value}
                                    onChange={(e) => setFormInput({ ...formInput, value: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label text-secondary small fw-medium">Storage Location Room</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. Lab Room B, Ground Floor"
                                    value={formInput.location}
                                    onChange={(e) => setFormInput({ ...formInput, location: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-secondary small fw-medium">Purchase Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={formInput.purchaseDate}
                                    onChange={(e) => setFormInput({ ...formInput, purchaseDate: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Image Placeholder Upload Section */}
                            <div className="col-md-12">
                                <label className="form-label text-secondary small fw-medium d-block">Asset Photo Image Intake</label>
                                <div className="border border-2 border-dashed rounded p-3 text-center bg-white" style={{ borderColor: '#cbd5e1' }}>
                                    {selectedImage ? (
                                        <div className="d-flex flex-column align-items-center">
                                            <img src={selectedImage} alt="Preview" className="img-thumbnail mb-2" style={{ maxHeight: '100px' }} />
                                            <span className="small text-muted">{imageName}</span>
                                            <button type="button" className="btn btn-sm btn-link text-danger text-decoration-none mt-1" onClick={() => { setSelectedImage(null); setImageName(''); }}>Remove file</button>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-secondary small mb-2">Drag and drop resource images here, or browse local device files</p>
                                            <input
                                                type="file"
                                                className="form-control form-control-sm d-none"
                                                id="asset-image-file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                            <label htmlFor="asset-image-file" className="btn btn-sm btn-secondary px-3 py-1 cursor-pointer">
                                                Browse Photos
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 text-end pt-2">
                            <button type="button" className="btn btn-sm btn-secondary me-2 px-3 py-1.5" onClick={() => setShowRegisterForm(false)}>Cancel</button>
                            <button type="submit" className="btn btn-sm btn-primary px-4 py-1.5" style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}>Intake Device</button>
                        </div>
                    </form>
                </div>
            )}

            {/* ==========================================
                FILTER & SEARCH CONTROL PANEL
                ========================================== */}
            <div className="card p-3 mb-4 shadow-sm border rounded bg-white">
                <div className="row g-3">
                    <div className="col">
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0 text-muted"><FiSearch /></span>
                            <input
                                type="text"
                                className="form-control border-start-0"
                                placeholder="Search by name, Tag ID, serial..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                    </div>
                    <div className="col-md-3 col-lg-2.5">
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0 text-muted"><FiFilter /></span>
                            <select
                                className="form-select border-start-0 text-secondary"
                                value={filterCategory}
                                onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                            >
                                <option value="All">All Categories</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="col-md-3 col-lg-2.5">
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0 text-muted"><FiFilter /></span>
                            <select
                                className="form-select border-start-0 text-secondary"
                                value={filterStatus}
                                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Available">Available</option>
                                <option value="Allocated">Allocated</option>
                                <option value="Reserved">Reserved</option>
                                <option value="Under Maintenance">Under Maintenance</option>
                                <option value="Lost">Lost</option>
                                <option value="Retired">Retired</option>
                                <option value="Disposed">Disposed</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==========================================
                SPLIT VIEW: ASSETS CATALOG vs SELECTED DETAILS
                ========================================== */}
            <div className="row g-4">

                {/* 1. Main Directory Listing */}
                <div className={selectedAsset ? "col-lg-7" : "col-12"}>
                    <div className="table-responsive border rounded bg-white shadow-xs">
                        <table className="table table-hover align-middle mb-0 text-sm">
                            <thead className="table-light text-secondary">
                                <tr>
                                    <th className="px-4 py-3 text-uppercase small">Tag ID</th>
                                    <th className="py-3 text-uppercase small">Asset Details</th>
                                    <th className="py-3 text-uppercase small">Category</th>
                                    <th className="py-3 text-uppercase small text-center">Status</th>
                                    <th className="px-4 py-3 text-end text-uppercase small">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentAssetsList.length > 0 ? (
                                    currentAssetsList.map(item => (
                                        <tr key={item.id} className={selectedAsset?.id === item.id ? "table-primary-clear" : ""} style={selectedAsset?.id === item.id ? { backgroundColor: '#eff6ff' } : {}}>
                                            <td className="px-4 py-3 fw-bold text-secondary">{item.tag}</td>
                                            <td className="py-3">
                                                <div className="fw-semibold text-dark">{item.name}</div>
                                                <div className="text-secondary" style={{ fontSize: '11px' }}>
                                                    {item.allocatedToName ? `Allocated: ${item.allocatedToName}` : 'In Storage'}
                                                </div>
                                            </td>
                                            <td className="py-3 text-secondary">{item.category}</td>
                                            <td className="py-3 text-center">{renderStatusBadge(item.status)}</td>
                                            <td className="px-4 py-3 text-end">
                                                <button
                                                    className="btn btn-sm btn-outline-secondary px-3 py-1 d-inline-flex align-items-center gap-1"
                                                    onClick={() => setSelectedAsset(selectedAsset?.id === item.id ? null : item)}
                                                >
                                                    <span>Details</span>
                                                    <FiChevronRight size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4 text-muted small">No assets registered match search parameters.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center mt-3 px-3">
                            <span className="text-secondary small">
                                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredAssets.length} records)
                            </span>
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-sm btn-outline-secondary px-3 py-1"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    Prev
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-secondary px-3 py-1"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Detailed view and timeline history logs */}
                {selectedAsset && (
                    <div className="col-lg-5">
                        <div className="card shadow-sm p-4 border rounded-3 mb-0" style={{ border: '1px solid #e2e8f0' }}>
                            <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
                                <div>
                                    <span className="text-secondary small fw-semibold text-uppercase tracking-wider">{selectedAsset.category}</span>
                                    <h4 className="fw-bold mb-1 mt-0 text-dark">{selectedAsset.name}</h4>
                                    <div className="small font-monospace text-secondary">{selectedAsset.tag}</div>
                                </div>
                                <button className="btn btn-sm btn-outline-secondary p-1 rounded-circle" onClick={() => setSelectedAsset(null)} style={{ width: '28px', height: '28px' }}>
                                    <FiX size={16} />
                                </button>
                            </div>

                            {/* Visual Asset Details Grid */}
                            <div className="row g-3 mb-4">
                                <div className="col-6">
                                    <div className="bg-light p-2.5 rounded text-start">
                                        <div className="text-secondary small fw-medium" style={{ fontSize: '11px' }}>SERIAL NO</div>
                                        <div className="fw-semibold small overflow-x-hidden text-truncate font-monospace" title={selectedAsset.serial}>
                                            {selectedAsset.serial}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="bg-light p-2.5 rounded text-start">
                                        <div className="text-secondary small fw-medium" style={{ fontSize: '11px' }}>PURCHASE VALUE</div>
                                        <div className="fw-semibold small text-primary">${selectedAsset.value} USD</div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="bg-light p-2.5 rounded text-start">
                                        <div className="text-secondary small fw-medium" style={{ fontSize: '11px' }}>STATUS STATE</div>
                                        <div className="mt-1">{renderStatusBadge(selectedAsset.status)}</div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="bg-light p-2.5 rounded text-start">
                                        <div className="text-secondary small fw-medium" style={{ fontSize: '11px' }}>LOCATION</div>
                                        <div className="fw-semibold small text-dark d-flex align-items-center gap-1">
                                            <FiMapPin size={12} className="text-danger" /> {selectedAsset.location}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* QR Code and Image Double Placeholder Segment */}
                            <div className="row g-3 border rounded p-3 mb-4 bg-light align-items-center">
                                {/* Simulated QR tag code box */}
                                <div className="col-sm-5 text-center">
                                    <div className="bg-white p-2 d-inline-block border rounded shadow-xs" style={{ border: '2px solid #000' }}>
                                        {/* Classic generated QR CSS matrix simulation */}
                                        <div style={{ width: '80px', height: '80px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px' }}>
                                            <div className="bg-dark"></div><div className="bg-dark"></div><div className="bg-light"></div><div className="bg-dark"></div>
                                            <div className="bg-light"></div><div className="bg-dark"></div><div className="bg-dark"></div><div className="bg-light"></div>
                                            <div className="bg-dark"></div><div className="bg-light"></div><div className="bg-dark"></div><div className="bg-dark"></div>
                                            <div className="bg-dark"></div><div className="bg-dark"></div><div className="bg-light"></div><div className="bg-dark"></div>
                                        </div>
                                    </div>
                                    <div className="text-muted mt-2 fw-semibold" style={{ fontSize: '9px' }}>SCAN QR CODE</div>
                                </div>
                                {/* Asset catalog image placeholder */}
                                <div className="col-sm-7">
                                    <div className="bg-white border rounded d-flex align-items-center justify-content-center text-secondary small p-2" style={{ height: '94px', borderStyle: 'dashed !important' }}>
                                        <div className="text-center">
                                            <FiCpu size={24} className="text-muted mb-1" />
                                            <div className="fw-semibold text-secondary" style={{ fontSize: '10px' }}>Asset Image Placement</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Lifecycle History Log Timeline */}
                            <div>
                                <h6 className="fw-bold text-dark border-bottom pb-2 mb-3 d-flex align-items-center gap-2">
                                    <FiActivity /> Life Cycle History Timeline
                                </h6>
                                <div className="position-relative ps-3 my-2" style={{ borderLeft: '2.5px solid #cbd5e1' }}>
                                    {selectedAsset.history?.map((log, lIdx) => (
                                        <div key={log.id || lIdx} className="mb-3 position-relative text-start">
                                            <div className="position-absolute bg-primary rounded-circle border border-white" style={{ width: '10px', height: '10px', left: '-20px', top: '5px', backgroundColor: '#3b82f6' }}></div>
                                            <div className="d-flex justify-content-between align-items-start leading-none mb-1">
                                                <strong className="small text-dark text-uppercase" style={{ fontSize: '10.5px' }}>{log.action}</strong>
                                                <span className="text-muted small" style={{ fontSize: '10px' }}>{log.date}</span>
                                            </div>
                                            <div className="text-secondary small mt-0.5" style={{ fontSize: '11px' }}>
                                                {log.notes} by <span className="font-monospace text-secondary text-xs">{log.user}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
