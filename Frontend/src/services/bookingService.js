/**
 * bookingService.js
 * ─────────────────────────────────────────────────────────────────
 * Handles resource bookings (rooms, equipment, labs).
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

const bookingService = {
  /**
   * Get all bookings
   * REAL: GET /api/bookings
   */
  getAll: async () => {
    // ── MOCK ──────────────────────────────────────────────────────
    await delay();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    // ── REAL ──────────────────────────────────────────────────────
    // const { data } = await api.get(ENDPOINTS.BOOKINGS.LIST);
    // return data;
  },

  /**
   * Get all bookable resources (rooms, equipment)
   * REAL: GET /api/resources
   */
  getResources: async () => {
    // ── MOCK ──────────────────────────────────────────────────────
    await delay();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.RESOURCES) || '[]');
    // ── REAL ──────────────────────────────────────────────────────
    // const { data } = await api.get(ENDPOINTS.RESOURCES.LIST);
    // return data;
  },

  /**
   * Create a new booking
   * REAL: POST /api/bookings
   */
  create: async (bookingData) => {
    // ── MOCK ──────────────────────────────────────────────────────
    await delay();
    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    const newBooking = {
      id: generateId('booking'),
      status: 'Confirmed',
      ...bookingData,
    };
    bookings.push(newBooking);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    return newBooking;
    // ── REAL ──────────────────────────────────────────────────────
    // const { data } = await api.post(ENDPOINTS.BOOKINGS.CREATE, bookingData);
    // return data;
  },

  /**
   * Cancel a booking
   * REAL: PUT /api/bookings/:id/cancel
   */
  cancel: async (id) => {
    // ── MOCK ──────────────────────────────────────────────────────
    await delay();
    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) throw new Error('Booking not found');
    bookings[index].status = 'Cancelled';
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    return bookings[index];
    // ── REAL ──────────────────────────────────────────────────────
    // const { data } = await api.put(ENDPOINTS.BOOKINGS.CANCEL(id));
    // return data;
  },
};

export default bookingService;
