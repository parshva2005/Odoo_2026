/**
 * dashboardService.js
 * ─────────────────────────────────────────────────────────────────
 * Provides stats, recent activity, and chart data for the Dashboard.
 *
 * TO SWITCH TO REAL BACKEND:
 *   Delete each "── MOCK ──" block and uncomment "── REAL ──" block.
 * ─────────────────────────────────────────────────────────────────
 */

import api from './api';
import { ENDPOINTS } from '../constants/apiEndpoints';
import {
  INITIAL_DASHBOARD_STATS,
  INITIAL_RECENT_ACTIVITY,
  INITIAL_ASSET_USAGE,
} from '../data/dummyData';
import { delay } from '../utils/formatters';

const dashboardService = {
  /**
   * Fetch summary stats (available, allocated, maintenance counts, etc.)
   * REAL: GET /api/reports/dashboard
   */
  getStats: async () => {
    // ── MOCK ──────────────────────────────────────────────────────
    await delay();
    return { ...INITIAL_DASHBOARD_STATS };
    // ── REAL ──────────────────────────────────────────────────────
    // const { data } = await api.get(ENDPOINTS.REPORTS.DASHBOARD);
    // return data;
  },

  /**
   * Fetch recent activity feed
   * REAL: GET /api/reports/dashboard (or a dedicated /activity endpoint)
   */
  getRecentActivity: async () => {
    // ── MOCK ──────────────────────────────────────────────────────
    await delay();
    return [...INITIAL_RECENT_ACTIVITY];
    // ── REAL ──────────────────────────────────────────────────────
    // const { data } = await api.get(`${ENDPOINTS.REPORTS.DASHBOARD}/activity`);
    // return data;
  },

  /**
   * Fetch asset usage chart data (monthly breakdown)
   * REAL: GET /api/reports/asset-usage
   */
  getAssetUsageChart: async () => {
    // ── MOCK ──────────────────────────────────────────────────────
    await delay();
    return [...INITIAL_ASSET_USAGE];
    // ── REAL ──────────────────────────────────────────────────────
    // const { data } = await api.get(ENDPOINTS.REPORTS.ASSET_USAGE);
    // return data;
  },
};

export default dashboardService;
