/**
 * formatters.js
 * ─────────────────────────────────────────────────────────────────
 * Shared utility functions for formatting values across the app.
 * Centralizes repeated formatting logic so pages stay clean.
 * ─────────────────────────────────────────────────────────────────
 */

/**
 * Format a date string into a human-readable Indian locale date.
 * @param {string|Date} date
 * @returns {string} e.g. "12 Jul 2024"
 */
export function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a number as Indian Rupee currency.
 * @param {number} value
 * @returns {string} e.g. "₹85,000"
 */
export function formatCurrency(value) {
  if (value === null || value === undefined) return '—';
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

/**
 * Generate a simple unique ID with an optional prefix.
 * Used by services to create mock IDs for new records.
 * Replace with the real backend-generated ID when integrating.
 * @param {string} prefix
 * @returns {string} e.g. "asset_1720791234567"
 */
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}`;
}

/**
 * Simulate a network delay (used in dummy service calls).
 * Remove when switching to the real backend.
 * @param {number} ms - milliseconds to wait (default: 250)
 * @returns {Promise<void>}
 */
export function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
