/**
 * assetService.js
 * ─────────────────────────────────────────────────────────────────
 * Handles all CRUD operations for Assets.
 *
 * TO SWITCH TO REAL BACKEND:
 *   Delete each "── MOCK ──" block and uncomment "── REAL ──" block.
 * ─────────────────────────────────────────────────────────────────
 */

import api from './api';
import { ENDPOINTS } from '../constants/apiEndpoints';
import { STORAGE_KEYS, initializeData } from '../data/dummyData';
import { delay, generateId } from '../utils/formatters';

// Ensure localStorage is seeded on first load
initializeData();

const assetService = {
  /**
   * Get all assets
   * REAL: GET /api/assets
   */
  getAll: async () => {
    // ── MOCK ──────────────────────────────────────────────────────
    await delay();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ASSETS) || '[]');
    // ── REAL ──────────────────────────────────────────────────────
    // const { data } = await api.get(ENDPOINTS.ASSETS.LIST);
    // return data;
  },

  /**
   * Get a single asset by ID
   * REAL: GET /api/assets/:id
   */
  getById: async (id) => {
    // ── MOCK ──────────────────────────────────────────────────────
    await delay();
    const assets = JSON.parse(localStorage.getItem(STORAGE_KEYS.ASSETS) || '[]');
    const asset = assets.find((a) => a.id === id);
    if (!asset) throw new Error('Asset not found');
    return asset;
    // ── REAL ──────────────────────────────────────────────────────
    // const { data } = await api.get(ENDPOINTS.ASSETS.GET(id));
    // return data;
  },

  /**
   * Register a new asset
   * REAL: POST /api/assets
   */
  create: async (assetData) => {
    // ── MOCK ──────────────────────────────────────────────────────
    await delay();
    const assets = JSON.parse(localStorage.getItem(STORAGE_KEYS.ASSETS) || '[]');
    const newAsset = {
      id: generateId('asset'),
      tag: `AF-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      status: 'Available',
      assignedTo: null,
      ...assetData,
    };
    assets.unshift(newAsset);
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
    return newAsset;
    // ── REAL ──────────────────────────────────────────────────────
    // const { data } = await api.post(ENDPOINTS.ASSETS.CREATE, assetData);
    // return data;
  },

  /**
   * Update an existing asset
   * REAL: PUT /api/assets/:id
   */
  update: async (id, updates) => {
    // ── MOCK ──────────────────────────────────────────────────────
    await delay();
    const assets = JSON.parse(localStorage.getItem(STORAGE_KEYS.ASSETS) || '[]');
    const index = assets.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Asset not found');
    assets[index] = { ...assets[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
    return assets[index];
    // ── REAL ──────────────────────────────────────────────────────
    // const { data } = await api.put(ENDPOINTS.ASSETS.UPDATE(id), updates);
    // return data;
  },

  /**
   * Delete an asset
   * REAL: DELETE /api/assets/:id
   */
  remove: async (id) => {
    // ── MOCK ──────────────────────────────────────────────────────
    await delay();
    const assets = JSON.parse(localStorage.getItem(STORAGE_KEYS.ASSETS) || '[]');
    const filtered = assets.filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(filtered));
    return { success: true };
    // ── REAL ──────────────────────────────────────────────────────
    // await api.delete(ENDPOINTS.ASSETS.DELETE(id));
    // return { success: true };
  },
};

export default assetService;
