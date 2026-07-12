/**
 * ReportService
 * Compiles utilization ratios, department allocation aggregates, and cost summaries.
 */

import axios from 'axios';
import { initializeData } from '../data/dummyData';

const API_BASE = 'https://jsonplaceholder.typicode.com';
initializeData();

export const reportService = {
    getSummary: async () => {
        try {
            await axios.get(`${API_BASE}/posts/1`);

            const assets = JSON.parse(localStorage.getItem('assetflow_assets') || '[]');
            const bookings = JSON.parse(localStorage.getItem('assetflow_bookings') || '[]');
            const maintenance = JSON.parse(localStorage.getItem('assetflow_maintenance') || '[]');

            const totalCount = assets.length;
            const allocatedCount = assets.filter(a => a.status === 'Allocated').length;
            const availableCount = assets.filter(a => a.status === 'Available').length;
            const maintenanceCount = assets.filter(a => a.status === 'Under Maintenance').length;

            const categoryCounts = assets.reduce((acc, current) => {
                acc[current.category] = (acc[current.category] || 0) + 1;
                return acc;
            }, {});

            const totalValue = assets.reduce((acc, current) => acc + (current.value || 0), 0);

            return {
                totalCount,
                allocatedCount,
                availableCount,
                maintenanceCount,
                totalValue,
                categoryCounts,
                bookingsCount: bookings.length,
                pendingMaintenances: maintenance.filter(m => m.status !== 'Resolved').length
            };
        } catch (error) {
            throw new Error('Failed to assemble analytics metrics summaries');
        }
    }
};
