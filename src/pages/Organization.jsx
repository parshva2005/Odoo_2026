/**
 * Organization Component
 * Manages Departments, Asset Categories, and the Employee Directory.
 * Features tabs support, inline CRUD forms, query searching, filters,
 * pagination counters, and role-based action buttons.
 */

import React, { useState, useEffect } from 'react';
import { departmentService } from '../services/departmentService';
import { categoryService } from '../services/categoryService';
import { employeeService } from '../services/employeeService';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiX } from 'react-icons/fi';

export default function Organization() {
    // Current Active Tab: 'departments', 'categories', or 'employees'
    const [activeTab, setActiveTab] = useState('departments');

    // General loading/error state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Shared list data from local API services
    const [departments, setDepartments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [employees, setEmployees] = useState([]);

    // Search and Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [filterOption, setFilterOption] = useState('All');

    // Form showing / editing state details
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [targetId, setTargetId] = useState(null);

    // Form inputs state
    const [deptForm, setDeptForm] = useState({ name: '', code: '', head: '' });
    const [catForm, setCatForm] = useState({ name: '', code: '', description: '' });
    const [empForm, setEmpForm] = useState({ name: '', email: '', role: 'employee', department: '', status: 'Active' });

    // Pagination helper state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Load datasets initially
    const loadAllRecords = async () => {
        try {
            setLoading(true);
            const deptList = await departmentService.getAll();
            const catList = await categoryService.getAll();
            const empList = await employeeService.getAll();

            setDepartments(deptList);
            setCategories(catList);
            setEmployees(empList);

            // Set initial department dropdown choice if empty
            if (deptList.length > 0) {
                setEmpForm(prev => ({ ...prev, department: deptList[0].name }));
            }
        } catch (err) {
            setError('Failed loading organizational datasets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllRecords();
    }, []);

    // Reset forms and search settings on tab swap
    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
        setSearchQuery('');
        setFilterOption('All');
        setShowForm(false);
        setEditMode(false);
        setTargetId(null);
        setError('');
        setSuccess('');
        setCurrentPage(1);
    };

    // Helper alerts flash timings
    const flashSuccess = (message) => {
        setSuccess(message);
        setTimeout(() => setSuccess(''), 3000);
    };

    // ==========================================
    // DEPARTMENTS HANDLERS
    // ==========================================
    const submitDeptForm = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editMode) {
                await departmentService.update(targetId, deptForm);
                flashSuccess('Department updated successfully');
            } else {
                await departmentService.add(deptForm);
                flashSuccess('Department registered successfully');
            }
            // Reset state
            setDeptForm({ name: '', code: '', head: '' });
            setShowForm(false);
            setEditMode(false);
            setTargetId(null);
            await loadAllRecords();
        } catch (err) {
            setError(err.message);
        }
    };

    const editDept = (dept) => {
        setDeptForm({ name: dept.name, code: dept.code, head: dept.head });
        setTargetId(dept.id);
        setEditMode(true);
        setShowForm(true);
    };

    const deleteDept = async (id) => {
        if (!window.confirm('Are you sure you want to delete this department?')) return;
        setError('');
        try {
            await departmentService.delete(id);
            flashSuccess('Department deleted successfully');
            await loadAllRecords();
        } catch (err) {
            setError(err.message || 'Cannot delete department contains active staff listings');
        }
    };

    // ==========================================
    // ASSET CATEGORIES HANDLERS
    // ==========================================
    const submitCatForm = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editMode) {
                await categoryService.update(targetId, catForm);
                flashSuccess('Asset Category updated successfully');
            } else {
                await categoryService.add(catForm);
                flashSuccess('Asset Category registered successfully');
            }
            setCatForm({ name: '', code: '', description: '' });
            setShowForm(false);
            setEditMode(false);
            setTargetId(null);
            await loadAllRecords();
        } catch (err) {
            setError(err.message);
        }
    };

    const editCat = (cat) => {
        setCatForm({ name: cat.name, code: cat.code, description: cat.description });
        setTargetId(cat.id);
        setEditMode(true);
        setShowForm(true);
    };

    const deleteCat = async (id) => {
        if (!window.confirm('Are you sure you want to delete this asset category?')) return;
        setError('');
        try {
            await categoryService.delete(id);
            flashSuccess('Asset category deleted successfully');
            await loadAllRecords();
        } catch (err) {
            setError(err.message || 'Cannot delete category containing registered assets');
        }
    };

    // ==========================================
    // EMPLOYEE DIRECTORY HANDLERS
    // ==========================================
    const submitEmpForm = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editMode) {
                await employeeService.update(targetId, empForm);
                flashSuccess('Employee profile updated successfully');
            } else {
                await employeeService.add(empForm);
                flashSuccess('Employee profile created successfully (Default password: password123)');
            }
            setEmpForm({ name: '', email: '', role: 'employee', department: departments[0]?.name || '', status: 'Active' });
            setShowForm(false);
            setEditMode(false);
            setTargetId(null);
            await loadAllRecords();
        } catch (err) {
            setError(err.message);
        }
    };

    const editEmp = (emp) => {
        setEmpForm({ name: emp.name, email: emp.email, role: emp.role, department: emp.department, status: emp.status });
        setTargetId(emp.id);
        setEditMode(true);
        setShowForm(true);
    };

    const deleteEmp = async (id) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) return;
        setError('');
        try {
            await employeeService.delete(id);
            flashSuccess('Employee profile removed successfully');
            await loadAllRecords();
        } catch (err) {
            setError(err.message || 'Failed to remove employee listing');
        }
    };

    // ==========================================
    // SEARCH & FILTER AGGREGATIONS
    // ==========================================
    const getFilteredData = () => {
        switch (activeTab) {
            case 'departments':
                return departments.filter(d =>
                    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    d.head.toLowerCase().includes(searchQuery.toLowerCase())
                );
            case 'categories':
                return categories.filter(c =>
                    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.description.toLowerCase().includes(searchQuery.toLowerCase())
                );
            case 'employees':
                return employees.filter(e => {
                    const matchSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        e.email.toLowerCase().includes(searchQuery.toLowerCase());

                    const matchDept = filterOption === 'All' || e.department === filterOption;
                    return matchSearch && matchDept;
                });
            default:
                return [];
        }
    };

    const filteredData = getFilteredData();

    // ==========================================
    // PAGINATION LOGIC
    // ==========================================
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItemsItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPagesCount = Math.ceil(filteredData.length / itemsPerPage);

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
            {/* Greeting Header */}
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                <div>
                    <h1 className="h3 mb-1 text-dark fw-bold">Organization Settings</h1>
                    <p className="text-secondary small mb-0">Control departments, categories, and manage organizational staff profile listings.</p>
                </div>
                {!showForm && (
                    <button
                        className="btn btn-primary d-flex align-items-center gap-2"
                        onClick={() => {
                            setShowForm(true);
                            setEditMode(false);
                            // Initial forms reset
                            setDeptForm({ name: '', code: '', head: '' });
                            setCatForm({ name: '', code: '', description: '' });
                            if (departments.length > 0) {
                                setEmpForm({ name: '', email: '', role: 'employee', department: departments[0].name, status: 'Active' });
                            }
                        }}
                        style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}
                    >
                        <FiPlus />
                        <span>Add {activeTab === 'departments' ? 'Department' : activeTab === 'categories' ? 'Category' : 'Employee'}</span>
                    </button>
                )}
            </div>

            {/* Success Details Banner */}
            {success && <div className="alert alert-success py-2 px-3 mb-3 small fw-medium">{success}</div>}
            {error && <div className="alert alert-danger py-2 px-3 mb-3 small fw-medium">{error}</div>}

            {/* Navigation Tabs */}
            <ul className="nav nav-tabs mb-4 border-bottom">
                <li className="nav-item">
                    <button
                        className={`nav-link fw-semibold px-4 border-0 ${activeTab === 'departments' ? 'active border-bottom border-primary text-primary' : 'text-secondary'}`}
                        onClick={() => handleTabChange('departments')}
                        style={activeTab === 'departments' ? { borderBottom: '3px solid #2563eb !important', color: '#2563eb' } : {}}
                    >
                        🏢 Departments
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link fw-semibold px-4 border-0 ${activeTab === 'categories' ? 'active border-bottom border-primary text-primary' : 'text-secondary'}`}
                        onClick={() => handleTabChange('categories')}
                        style={activeTab === 'categories' ? { borderBottom: '3px solid #2563eb !important', color: '#2563eb' } : {}}
                    >
                        🏷️ Asset Categories
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link fw-semibold px-4 border-0 ${activeTab === 'employees' ? 'active border-bottom border-primary text-primary' : 'text-secondary'}`}
                        onClick={() => handleTabChange('employees')}
                        style={activeTab === 'employees' ? { borderBottom: '3px solid #2563eb !important', color: '#2563eb' } : {}}
                    >
                        👥 Employee Directory
                    </button>
                </li>
            </ul>

            {/* ==========================================
                FORM CARD: Renders dynamically on activeTab
                ========================================== */}
            {showForm && (
                <div className="card p-4 mb-4 bg-light border shadow-sm rounded-3">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold mb-0">{editMode ? 'Edit' : 'Add New'} {activeTab === 'departments' ? 'Department' : activeTab === 'categories' ? 'Category' : 'Employee'}</h5>
                        <button className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center p-1 rounded-circle" onClick={() => setShowForm(false)} style={{ width: '28px', height: '28px' }}>
                            <FiX size={16} />
                        </button>
                    </div>

                    {/* Department form */}
                    {activeTab === 'departments' && (
                        <form onSubmit={submitDeptForm}>
                            <div className="row g-3">
                                <div className="col-md-5">
                                    <label className="form-label text-secondary small fw-medium">Department Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={deptForm.name}
                                        onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label text-secondary small fw-medium">Dept Code</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={deptForm.code}
                                        onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                                        placeholder="e.g. SWE"
                                        disabled={editMode}
                                        required
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label text-secondary small fw-medium">Department Head</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={deptForm.head}
                                        onChange={(e) => setDeptForm({ ...deptForm, head: e.target.value })}
                                        placeholder="Enter name"
                                    />
                                </div>
                            </div>
                            <div className="mt-3 text-end">
                                <button type="button" className="btn btn-sm btn-secondary me-2 px-3 py-1.5" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-sm btn-primary px-4 py-1.5" style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}>{editMode ? 'Save Changes' : 'Register'}</button>
                            </div>
                        </form>
                    )}

                    {/* Category Form */}
                    {activeTab === 'categories' && (
                        <form onSubmit={submitCatForm}>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="form-label text-secondary small fw-medium">Category Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={catForm.name}
                                        onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label text-secondary small fw-medium">Code ID</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={catForm.code}
                                        onChange={(e) => setCatForm({ ...catForm, code: e.target.value })}
                                        placeholder="e.g. LPT"
                                        disabled={editMode}
                                        required
                                    />
                                </div>
                                <div className="col-md-5">
                                    <label className="form-label text-secondary small fw-medium">Description</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={catForm.description}
                                        onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="mt-3 text-end">
                                <button type="button" className="btn btn-sm btn-secondary me-2 px-3 py-1.5" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-sm btn-primary px-4 py-1.5" style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}>{editMode ? 'Save Changes' : 'Register'}</button>
                            </div>
                        </form>
                    )}

                    {/* Employee Form */}
                    {activeTab === 'employees' && (
                        <form onSubmit={submitEmpForm}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label text-secondary small fw-medium">Full Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={empForm.name}
                                        onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-secondary small fw-medium">Email Address</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={empForm.email}
                                        disabled={editMode}
                                        onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label text-secondary small fw-medium">Selected Role</label>
                                    <select
                                        className="form-select"
                                        value={empForm.role}
                                        onChange={(e) => setEmpForm({ ...empForm, role: e.target.value })}
                                    >
                                        <option value="employee">Employee</option>
                                        <option value="department_head">Department Head</option>
                                        <option value="asset_manager">Asset Manager</option>
                                        <option value="admin">System Admin</option>
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label text-secondary small fw-medium">Department</label>
                                    <select
                                        className="form-select"
                                        value={empForm.department}
                                        onChange={(e) => setEmpForm({ ...empForm, department: e.target.value })}
                                        required
                                    >
                                        {departments.map(d => (
                                            <option key={d.id} value={d.name}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label text-secondary small fw-medium">Directory Status</label>
                                    <select
                                        className="form-select"
                                        value={empForm.status}
                                        onChange={(e) => setEmpForm({ ...empForm, status: e.target.value })}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-3 text-end">
                                <button type="button" className="btn btn-sm btn-secondary me-2 px-3 py-1.5" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-sm btn-primary px-4 py-1.5" style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}>{editMode ? 'Save Profile' : 'Add Employee'}</button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* ==========================================
                FILTER & SEARCH CONTROL PANEL
                ========================================== */}
            <div className="card p-3 mb-4 shadow-sm border rounded" style={{ backgroundColor: '#fdfdfd' }}>
                <div className="row g-3 align-items-center">
                    <div className="col-md-6 flex-grow-1">
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0 text-muted"><FiSearch /></span>
                            <input
                                type="text"
                                className="form-control border-start-0"
                                placeholder={`Search by name, code/role...`}
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>
                    {activeTab === 'employees' && (
                        <div className="col-md-4 col-lg-3">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0 text-muted"><FiFilter /></span>
                                <select
                                    className="form-select border-start-0 text-secondary"
                                    value={filterOption}
                                    onChange={(e) => {
                                        setFilterOption(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="All">All Departments</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.name}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ==========================================
                GRID DATA TABLES
                ========================================== */}
            <div className="table-responsive border rounded bg-white shadow-xs">

                {/* 🏢 DEPARTMENTS TABLE */}
                {activeTab === 'departments' && (
                    <table className="table table-hover align-middle mb-0 text-sm">
                        <thead className="table-light text-secondary">
                            <tr>
                                <th className="px-4 py-3 text-uppercase small">Code</th>
                                <th className="py-3 text-uppercase small">Department Name</th>
                                <th className="py-3 text-uppercase small">Department Head</th>
                                <th className="py-3 text-uppercase small text-center">Employees</th>
                                <th className="px-4 py-3 text-end text-uppercase small">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItemsItems.length > 0 ? (
                                currentItemsItems.map(dept => (
                                    <tr key={dept.id}>
                                        <td className="px-4 py-3 fw-bold text-secondary">{dept.code}</td>
                                        <td className="py-3 fw-semibold text-dark">{dept.name}</td>
                                        <td className="py-3 text-secondary">{dept.head}</td>
                                        <td className="py-3 text-center">
                                            <span className="badge rounded bg-light text-dark border px-2.5 py-1.5">{dept.employeeCount} Staff</span>
                                        </td>
                                        <td className="px-4 py-3 text-end">
                                            <div className="d-flex justify-content-end gap-2">
                                                <button className="btn btn-sm btn-link text-primary p-0 d-inline-flex align-items-center" onClick={() => editDept(dept)} title="Edit">
                                                    <FiEdit2 size={16} />
                                                </button>
                                                <button className="btn btn-sm btn-link text-danger p-0 d-inline-flex align-items-center" onClick={() => deleteDept(dept.id)} title="Delete">
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-muted small">No departments matched search records.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}

                {/* 🏷️ ASSET CATEGORIES TABLE */}
                {activeTab === 'categories' && (
                    <table className="table table-hover align-middle mb-0 text-sm">
                        <thead className="table-light text-secondary">
                            <tr>
                                <th className="px-4 py-3 text-uppercase small">Code</th>
                                <th className="py-3 text-uppercase small">Category Name</th>
                                <th className="py-3 text-uppercase small">Description</th>
                                <th className="py-3 text-uppercase small text-center">Registered Assets</th>
                                <th className="px-4 py-3 text-end text-uppercase small">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItemsItems.length > 0 ? (
                                currentItemsItems.map(cat => (
                                    <tr key={cat.id}>
                                        <td className="px-4 py-3 fw-bold text-secondary">{cat.code}</td>
                                        <td className="py-3 fw-semibold text-dark">{cat.name}</td>
                                        <td className="py-3 text-secondary text-truncate" style={{ maxWidth: '300px' }}>{cat.description || '--'}</td>
                                        <td className="py-3 text-center">
                                            <span className="badge rounded bg-light text-dark border px-2.5 py-1.5">{cat.assetCount} Items</span>
                                        </td>
                                        <td className="px-4 py-3 text-end">
                                            <div className="d-flex justify-content-end gap-2">
                                                <button className="btn btn-sm btn-link text-primary p-0 d-inline-flex align-items-center" onClick={() => editCat(cat)} title="Edit">
                                                    <FiEdit2 size={16} />
                                                </button>
                                                <button className="btn btn-sm btn-link text-danger p-0 d-inline-flex align-items-center" onClick={() => deleteCat(cat.id)} title="Delete">
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-muted small">No assets categories matched search queries.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}

                {/* 👥 EMPLOYEES TABLE */}
                {activeTab === 'employees' && (
                    <table className="table table-hover align-middle mb-0 text-sm">
                        <thead className="table-light text-secondary">
                            <tr>
                                <th className="px-4 py-3 text-uppercase small">Full Name</th>
                                <th className="py-3 text-uppercase small">Email Address</th>
                                <th className="py-3 text-uppercase small">Department</th>
                                <th className="py-3 text-uppercase small">Access Role</th>
                                <th className="py-3 text-uppercase small text-center">Status</th>
                                <th className="px-4 py-3 text-end text-uppercase small">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItemsItems.length > 0 ? (
                                currentItemsItems.map(emp => (
                                    <tr key={emp.id}>
                                        <td className="px-4 py-3 fw-semibold text-dark">{emp.name}</td>
                                        <td className="py-3 text-secondary font-monospace" style={{ fontSize: '12px' }}>{emp.email}</td>
                                        <td className="py-3 text-secondary">{emp.department}</td>
                                        <td className="py-3">
                                            <span className="badge text-uppercase bg-primary-subtle text-primary border" style={{ fontSize: '10px' }}>
                                                {emp.role.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-3 text-center">
                                            <span className={`badge rounded-pill ${emp.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-end">
                                            <div className="d-flex justify-content-end gap-2">
                                                <button className="btn btn-sm btn-link text-primary p-0 d-inline-flex align-items-center" onClick={() => editEmp(emp)} title="Edit">
                                                    <FiEdit2 size={16} />
                                                </button>
                                                <button className="btn btn-sm btn-link text-danger p-0 d-inline-flex align-items-center" onClick={() => deleteEmp(emp.id)} title="Delete">
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-muted small">No employee matches search parameters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ==========================================
                PAGINATION CONTROLS
                ========================================== */}
            {totalPagesCount > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3 px-3">
                    <span className="text-secondary small">
                        Showing page <strong>{currentPage}</strong> of <strong>{totalPagesCount}</strong> ({filteredData.length} records)
                    </span>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-sm btn-outline-secondary px-3 py-1 fw-semibold"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <button
                            className="btn btn-sm btn-outline-secondary px-3 py-1 fw-semibold"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPagesCount))}
                            disabled={currentPage === totalPagesCount}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
