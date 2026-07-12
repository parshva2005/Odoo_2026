/**
 * auditService.js
 * ─────────────────────────────────────────────────────────────────
 * Fetches audit logs and handles log export.
 *
 * TO SWITCH TO REAL BACKEND:
 *   Delete each "── MOCK ──" block and uncomment "── REAL ──" block.
 * ─────────────────────────────────────────────────────────────────
 */

import api from './api';
import { ENDPOINTS } from '../constants/apiEndpoints';
import { STORAGE_KEYS, initializeData } from '../data/dummyData';
import { delay } from '../utils/formatters';

initializeData();

const auditService = {
  /**
   * Fetch all audit log entries
   * REAL: GET /api/audit
   */
  getLogs: async () => {
    // ── MOCK ──────────────────────────────────────────────────────
    await delay();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || '[]');
    // ── REAL ──────────────────────────────────────────────────────
    // const { data } = await api.get(ENDPOINTS.AUDIT.LIST);
    // return data;
  },

  /**
   * Export audit logs (triggers download in real backend)
   * REAL: GET /api/audit/export
   */
  exportLogs: async () => {
    // ── MOCK ──────────────────────────────────────────────────────
    await delay();
    // In dummy mode: return data so the page can generate a CSV itself
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || '[]');
    // ── REAL ──────────────────────────────────────────────────────
    // window.open(ENDPOINTS.AUDIT.EXPORT, '_blank');
  },
};

export default auditService;
