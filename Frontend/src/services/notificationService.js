/**
 * notificationService.js
 * ─────────────────────────────────────────────────────────────────
 * Manages notification read/unread state.
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

const notificationService = {
  /**
   * Get all notifications
   * REAL: GET /api/notifications
   */
  getAll: async () => {
    // ── MOCK ──────────────────────────────────────────────────────
    await delay();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    // ── REAL ──────────────────────────────────────────────────────
    // const { data } = await api.get(ENDPOINTS.NOTIFICATIONS.LIST);
    // return data;
  },

  /**
   * Mark a single notification as read
   * REAL: PUT /api/notifications/:id/read
   */
  markRead: async (id) => {
    // ── MOCK ──────────────────────────────────────────────────────
    await delay();
    const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    const index = notifications.findIndex((n) => n.id === id);
    if (index !== -1) {
      notifications[index].read = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    }
    return notifications;
    // ── REAL ──────────────────────────────────────────────────────
    // await api.put(ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
    // return notificationService.getAll();
  },

  /**
   * Mark all notifications as read
   * REAL: PUT /api/notifications/mark-all-read
   */
  markAllRead: async () => {
    // ── MOCK ──────────────────────────────────────────────────────
    await delay();
    const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    const updated = notifications.map((n) => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    return updated;
    // ── REAL ──────────────────────────────────────────────────────
    // await api.put(ENDPOINTS.NOTIFICATIONS.MARK_ALL);
    // return notificationService.getAll();
  },
};

export default notificationService;
