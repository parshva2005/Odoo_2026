/**
 * reportService.js
 * ─────────────────────────────────────────────────────────────────
 * Provides data for the Reports page charts and summary cards.
 *
 * TO SWITCH TO REAL BACKEND:
 *   Delete each "── MOCK ──" block and uncomment "── REAL ──" block.
 * ─────────────────────────────────────────────────────────────────
 */

import api from './api';
import { ENDPOINTS } from '../constants/apiEndpoints';
import {
  INITIAL_DASHBOARD_STATS,
  INITIAL_ASSET_USAGE,
  INITIAL_MAINTENANCE_CHART,
} from '../data/dummyData';
import { delay } from '../utils/formatters';

const reportService = {
  /**
   * Get summary stats for the reports page
   * REAL: GET /api/reports/dashboard
   */
  getSummaryStats: async () => {
    // ── MOCK ──────────────────────────────────────────────────────
    await delay();
    return { ...INITIAL_DASHBOARD_STATS };
    // ── REAL ──────────────────────────────────────────────────────
    // const { data } = await api.get(ENDPOINTS.REPORTS.DASHBOARD);
    // return data;
  },

  /**
   * Get asset usage bar chart data (monthly)
   * REAL: GET /api/reports/asset-usage
   */
  getAssetUsage: async () => {
    // ── MOCK ──────────────────────────────────────────────────────
    await delay();
    return [...INITIAL_ASSET_USAGE];
    // ── REAL ──────────────────────────────────────────────────────
    // const { data } = await api.get(ENDPOINTS.REPORTS.ASSET_USAGE);
    // return data;
  },

  /**
   * Get maintenance status pie chart data
   * REAL: GET /api/reports/maintenance
   */
  getMaintenanceChart: async () => {
    // ── MOCK ──────────────────────────────────────────────────────
    await delay();
    return [...INITIAL_MAINTENANCE_CHART];
    // ── REAL ──────────────────────────────────────────────────────
    // const { data } = await api.get(ENDPOINTS.REPORTS.MAINTENANCE);
    // return data;
  },
};

export default reportService;
