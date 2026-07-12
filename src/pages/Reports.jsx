/**
 * Reports Component
 * Aggregates statistics, capital asset values, maintenance costs,
 * and distributes allocation percentages.
 */

import React, { useState, useEffect } from 'react';
import { assetService } from '../services/assetService';
import { maintenanceService } from '../services/maintenanceService';
import { categoryService } from '../services/categoryService';
import {
    FiFileText, FiTrendingUp, FiDollarSign, FiTool,
    FiCompass, FiDownload, FiCheckCircle, FiPieChart
} from 'react-icons/fi';

export default function Reports() {
    // Analytics lists state
    const [assets, setAssets] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadAllMetrics = async () => {
        try {
            setLoading(true);
            const aList = await assetService.getAll();
            const tList = await maintenanceService.getAll();
            const cList = await categoryService.getAll();

            setAssets(aList);
            setTickets(tList);
            setCategories(cList);
        } catch (err) {
            setError('Failed loading metrics reports.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllMetrics();
    }, []);

    // Flash success alert helper
    const flashSuccess = (message) => {
        setSuccess(message);
        setTimeout(() => setSuccess(''), 3000);
    };

    // Calculate details
    const totalAssets = assets.length;
    const allocatedCount = assets.filter(a => a.status === 'Allocated').length;
    const availableCount = assets.filter(a => a.status === 'Available').length;
    const maintenanceCount = assets.filter(a => a.status === 'Under Maintenance').length;

    // Total book cost
    const totalCostValue = assets.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);

    // Total maintenance repairs cost
    const totalMaintenanceExpense = tickets.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);

    // Category distribution calculations
    const categoryMetrics = categories.map(cat => {
        const count = assets.filter(a => a.category === cat.name).length;
        const percentage = totalAssets > 0 ? Math.round((count / totalAssets) * 100) : 0;
        return {
            name: cat.name,
            count,
            percentage
        };
    });

    // Simulate downloading reports
    const handleDownloadReport = (format) => {
        setSuccess('');
        try {
            const dataToExport = {
                metadata: {
                    generatedDate: new Date().toLocaleString(),
                    totalAssets,
                    totalCapitalValue: `$${totalCostValue}`,
                    totalMaintenanceInvested: `$${totalMaintenanceExpense}`
                },
                assets: assets.map(a => ({
                    tag: a.tag,
                    name: a.name,
                    category: a.category,
                    department: a.department || 'Central storage',
                    cost: a.cost,
                    status: a.status
                }))
            };

            const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
                JSON.stringify(dataToExport, null, 2)
            )}`;

            // Initiate a virtual link click download
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute('href', jsonString);
            downloadAnchor.setAttribute('download', `AssetFlow_Inventory_Report_2026.${format}`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();

            flashSuccess(`Report compiled and downloaded as JSON/CSV sequence.`);
        } catch (err) {
            setError('Export sequence collapsed.');
        }
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
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4 flex-wrap gap-2 text-start">
                <div>
                    <h1 className="h3 mb-1 text-dark fw-bold">Inventory Reports</h1>
                    <p className="text-secondary small mb-0">Review capital evaluations, repair logs, and asset allocations distribution metrics.</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary btn-sm px-3 py-2 fw-medium d-flex align-items-center gap-1.5" onClick={() => handleDownloadReport('json')}>
                        <FiDownload />
                        <span>Export JSON</span>
                    </button>
                    <button className="btn btn-primary btn-sm px-3 py-2 fw-semibold d-flex align-items-center gap-1.5" style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }} onClick={() => handleDownloadReport('csv')}>
                        <FiFileText />
                        <span>Pull Audit Ledger (CSV)</span>
                    </button>
                </div>
            </div>

            {/* Alert feeds */}
            {success && <div className="alert alert-success py-2.5 px-3 mb-4 small fw-medium">{success}</div>}
            {error && <div className="alert alert-danger py-2.5 px-3 mb-4 small fw-medium">{error}</div>}

            {/* KPI details cards grid */}
            <div className="row g-4 mb-4 text-start">
                <div className="col-12 col-md-6 col-lg-3">
                    <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden p-4">
                        <div className="d-flex align-items-center gap-3">
                            <div className="p-3 rounded-3 bg-primary-subtle text-primary">
                                <FiCompass size={22} />
                            </div>
                            <div>
                                <span className="small text-secondary fw-semibold text-uppercase">Assets Count</span>
                                <h3 className="fw-bold text-dark mb-0 mt-0.5">{totalAssets}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-6 col-lg-3">
                    <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden p-4">
                        <div className="d-flex align-items-center gap-3">
                            <div className="p-3 rounded-3 bg-success-subtle text-success">
                                <FiDollarSign size={22} />
                            </div>
                            <div>
                                <span className="small text-secondary fw-semibold text-uppercase">Capital valuation</span>
                                <h3 className="fw-bold text-dark mb-0 mt-0.5">${totalCostValue.toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-6 col-lg-3">
                    <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden p-4">
                        <div className="d-flex align-items-center gap-3">
                            <div className="p-3 rounded-3 bg-danger-subtle text-danger">
                                <FiTool size={22} />
                            </div>
                            <div>
                                <span className="small text-secondary fw-semibold text-uppercase">Servicing Fees</span>
                                <h3 className="fw-bold text-dark mb-0 mt-0.5">${totalMaintenanceExpense.toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-6 col-lg-3">
                    <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden p-4">
                        <div className="d-flex align-items-center gap-3">
                            <div className="p-3 rounded-3 bg-info-subtle text-info">
                                <FiTrendingUp size={22} />
                            </div>
                            <div>
                                <span className="small text-secondary fw-semibold text-uppercase">Allocated checks</span>
                                <h3 className="fw-bold text-dark mb-0 mt-0.5">{allocatedCount} <span className="text-secondary small fw-normal">/{totalAssets}</span></h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4 text-start">
                {/* Left: Category distribution list */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm p-4 rounded-4 bg-white h-100">
                        <h5 className="fw-bold text-dark mb-3"><FiPieChart className="me-2" />Category Density Spread</h5>

                        <div className="d-flex flex-column gap-3 mt-2">
                            {categoryMetrics.map(item => (
                                <div key={item.name}>
                                    <div className="d-flex justify-content-between align-items-center mb-1.5 small font-monospace">
                                        <span className="fw-medium text-dark">{item.name}</span>
                                        <span className="text-secondary">{item.count} items ({item.percentage}%)</span>
                                    </div>
                                    <div className="progress" style={{ height: '7px', borderRadius: '4px' }}>
                                        <div
                                            className="progress-bar"
                                            role="progressbar"
                                            style={{ width: `${item.percentage}%`, backgroundColor: '#2563eb' }}
                                            aria-valuenow={item.percentage}
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Operational Status split preview details */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm p-4 rounded-4 bg-white h-100">
                        <h5 className="fw-bold text-dark mb-3"><FiCheckCircle className="me-2" />Device Inventory Status</h5>

                        <div className="row g-3 py-2 text-center">
                            <div className="col-4 border-end">
                                <span className="badge bg-success-subtle text-success px-3 fs-7 rounded-sm">Available</span>
                                <h2 className="fw-bold text-dark mt-2.5 mb-1">{availableCount}</h2>
                                <span className="text-secondary" style={{ fontSize: '11px' }}>Safe storage catalog</span>
                            </div>
                            <div className="col-4 border-end">
                                <span className="badge bg-primary-subtle text-primary px-3 fs-7">Allocated</span>
                                <h2 className="fw-bold text-dark mt-2.5 mb-1">{allocatedCount}</h2>
                                <span className="text-secondary" style={{ fontSize: '11px' }}>Assigned personnel</span>
                            </div>
                            <div className="col-4">
                                <span className="badge bg-danger-subtle text-danger px-3 fs-7">Repairing</span>
                                <h2 className="fw-bold text-dark mt-2.5 mb-1">{maintenanceCount}</h2>
                                <span className="text-secondary" style={{ fontSize: '11px' }}>Under repair tickets</span>
                            </div>
                        </div>

                        <div className="d-flex align-items-center gap-2 bg-light-subtle rounded p-3 mt-4 border">
                            <div className="p-1.5 rounded-circle bg-warning-subtle text-warning d-flex"><FiFileText size={16} /></div>
                            <span className="small text-secondary">
                                Statistics are dynamically populated from simulated inputs in real-time. Exported files will align with catalog registers.
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
