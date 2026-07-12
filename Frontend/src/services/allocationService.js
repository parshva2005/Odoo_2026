/**
 * allocationService.js
 * ─────────────────────────────────────────────────────────────────
 * Handles allocation requests and asset transfers.
 *
 * TO SWITCH TO REAL BACKEND:
 *   Delete each "── MOCK ──" block and uncomment "── REAL ──" block.
 * ─────────────────────────────────────────────────────────────────
 */

import api from './api';
import { ENDPOINTS } from '../constants/apiEndpoints';
import { STORAGE_KEYS, initializeData } from '../data/dummyData';
import { delay, generateId } from '../utils/formatters';

initializeData();

const allocationService = {
  /**
   * Get all allocation/transfer requests
   * REAL: GET /api/allocations
   */
  getAllRequests: async () => {
    // ── MOCK ──────────────────────────────────────────────────────
    await delay();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ALLOCATIONS) || '[]');
    // ── REAL ──────────────────────────────────────────────────────
    // const { data } = await api.get(ENDPOINTS.ALLOCATIONS.LIST);
    // return data;
  },

  /**
   * Get allocation history for assets
   * REAL: GET /api/allocations/history
   */
  getHistory: async () => {
    // ── MOCK ──────────────────────────────────────────────────────
    await delay();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ALLOCATION_HISTORY) || '[]');
    // ── REAL ──────────────────────────────────────────────────────
    // const { data } = await api.get(ENDPOINTS.ALLOCATIONS.HISTORY);
    // return data;
  },

  /**
   * Add a record to allocation history
   * REAL: POST /api/allocations/history
   */
  addHistoryEntry: async (entry) => {
    // ── MOCK ──────────────────────────────────────────────────────
    await delay();
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALLOCATION_HISTORY) || '[]');
    const newEntry = {
      id: Date.now(),
      ...entry,
    };
    history.unshift(newEntry);
    localStorage.setItem(STORAGE_KEYS.ALLOCATION_HISTORY, JSON.stringify(history));
    return newEntry;
    // ── REAL ──────────────────────────────────────────────────────
    // const { data } = await api.post(ENDPOINTS.ALLOCATIONS.ADD_HISTORY, entry);
    // return data;
  },

  /**
   * Create a new allocation/transfer request
   * REAL: POST /api/allocations
   */
  createRequest: async (requestData) => {
    // ── MOCK ──────────────────────────────────────────────────────
    await delay();
    const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALLOCATIONS) || '[]');
    const newRequest = {
      id: generateId('alloc'),
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      ...requestData,
    };
    requests.unshift(newRequest);
    localStorage.setItem(STORAGE_KEYS.ALLOCATIONS, JSON.stringify(requests));
    return newRequest;
    // ── REAL ──────────────────────────────────────────────────────
    // const { data } = await api.post(ENDPOINTS.ALLOCATIONS.CREATE, requestData);
    // return data;
  },

  /**
   * Approve a pending request
   * REAL: PUT /api/transfers/:id/approve
   */
  approveRequest: async (id) => {
    // ── MOCK ──────────────────────────────────────────────────────
    await delay();
    const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALLOCATIONS) || '[]');
    const index = requests.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Request not found');
    requests[index].status = 'Approved';
    localStorage.setItem(STORAGE_KEYS.ALLOCATIONS, JSON.stringify(requests));
    return requests[index];
    // ── REAL ──────────────────────────────────────────────────────
    // const { data } = await api.put(ENDPOINTS.TRANSFERS.APPROVE(id));
    // return data;
  },

  /**
   * Reject a pending request
   * REAL: PUT /api/transfers/:id/reject
   */
  rejectRequest: async (id) => {
    // ── MOCK ──────────────────────────────────────────────────────
    await delay();
    const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALLOCATIONS) || '[]');
    const index = requests.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Request not found');
    requests[index].status = 'Rejected';
    localStorage.setItem(STORAGE_KEYS.ALLOCATIONS, JSON.stringify(requests));
    return requests[index];
    // ── REAL ──────────────────────────────────────────────────────
    // const { data } = await api.put(ENDPOINTS.TRANSFERS.REJECT(id));
    // return data;
  },
};

export default allocationService;
