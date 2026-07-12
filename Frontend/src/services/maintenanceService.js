/**
 * maintenanceService.js
 * ─────────────────────────────────────────────────────────────────
 * Handles maintenance tickets and Kanban status updates.
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

const maintenanceService = {
  /**
   * Get all maintenance tickets as a flat array.
   * The Kanban board groups them by `status` on the frontend.
   * REAL: GET /api/maintenance
   */
  getAll: async () => {
    // ── MOCK ──────────────────────────────────────────────────────
    await delay();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MAINTENANCE) || '[]');
    // ── REAL ──────────────────────────────────────────────────────
    // const { data } = await api.get(ENDPOINTS.MAINTENANCE.LIST);
    // return data;
  },

  /**
   * Create a new maintenance ticket
   * REAL: POST /api/maintenance
   */
  create: async (ticketData) => {
    // ── MOCK ──────────────────────────────────────────────────────
    await delay();
    const tickets = JSON.parse(localStorage.getItem(STORAGE_KEYS.MAINTENANCE) || '[]');
    const newTicket = {
      id: generateId('maint'),
      status: 'Pending',
      tech: null,
      date: new Date().toISOString().split('T')[0],
      ...ticketData,
    };
    tickets.unshift(newTicket);
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(tickets));
    return newTicket;
    // ── REAL ──────────────────────────────────────────────────────
    // const { data } = await api.post(ENDPOINTS.MAINTENANCE.CREATE, ticketData);
    // return data;
  },

  /**
   * Move a ticket to a new Kanban status
   * REAL: PUT /api/maintenance/:id
   */
  updateStatus: async (id, status) => {
    // ── MOCK ──────────────────────────────────────────────────────
    await delay();
    const tickets = JSON.parse(localStorage.getItem(STORAGE_KEYS.MAINTENANCE) || '[]');
    const index = tickets.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Ticket not found');
    tickets[index].status = status;
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(tickets));
    return tickets[index];
    // ── REAL ──────────────────────────────────────────────────────
    // const { data } = await api.put(ENDPOINTS.MAINTENANCE.UPDATE(id), { status });
    // return data;
  },

  /**
   * Assign a technician to a ticket
   * REAL: PUT /api/maintenance/:id/assign
   */
  assignTechnician: async (id, techName) => {
    // ── MOCK ──────────────────────────────────────────────────────
    await delay();
    const tickets = JSON.parse(localStorage.getItem(STORAGE_KEYS.MAINTENANCE) || '[]');
    const index = tickets.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Ticket not found');
    tickets[index].tech = techName;
    tickets[index].status = 'Technician Assigned';
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(tickets));
    return tickets[index];
    // ── REAL ──────────────────────────────────────────────────────
    // const { data } = await api.put(ENDPOINTS.MAINTENANCE.ASSIGN(id), { tech: techName });
    // return data;
  },
};

export default maintenanceService;
