// Centralized API Endpoint Definitions
// Base URL is configured via .env → VITE_API_BASE_URL
const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const API_BASE = BASE;

export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN:    `${BASE}/auth/login`,
    REGISTER: `${BASE}/auth/register`,
    LOGOUT:   `${BASE}/auth/logout`,
    ME:       `${BASE}/auth/me`,
    REFRESH:  `${BASE}/auth/refresh`,
  },
  // Organization
  DEPARTMENTS: {
    LIST:   `${BASE}/departments`,
    CREATE: `${BASE}/departments`,
    UPDATE: (id) => `${BASE}/departments/${id}`,
    DELETE: (id) => `${BASE}/departments/${id}`,
  },
  CATEGORIES: {
    LIST:   `${BASE}/categories`,
    CREATE: `${BASE}/categories`,
    UPDATE: (id) => `${BASE}/categories/${id}`,
    DELETE: (id) => `${BASE}/categories/${id}`,
  },
  EMPLOYEES: {
    LIST:   `${BASE}/employees`,
    CREATE: `${BASE}/employees`,
    UPDATE: (id) => `${BASE}/employees/${id}`,
    DELETE: (id) => `${BASE}/employees/${id}`,
  },
  // Assets
  ASSETS: {
    LIST:     `${BASE}/assets`,
    CREATE:   `${BASE}/assets`,
    GET:      (id) => `${BASE}/assets/${id}`,
    UPDATE:   (id) => `${BASE}/assets/${id}`,
    DELETE:   (id) => `${BASE}/assets/${id}`,
    QR_SCAN:  `${BASE}/assets/scan`,
  },
  // Allocation & Transfer
  ALLOCATIONS: {
    LIST:      `${BASE}/allocations`,
    CREATE:    `${BASE}/allocations`,
    GET:       (id) => `${BASE}/allocations/${id}`,
    UPDATE:    (id) => `${BASE}/allocations/${id}`,
    HISTORY:   (assetId) => `${BASE}/allocations/asset/${assetId}/history`,
  },
  TRANSFERS: {
    LIST:   `${BASE}/transfers`,
    CREATE: `${BASE}/transfers`,
    APPROVE:(id) => `${BASE}/transfers/${id}/approve`,
    REJECT: (id) => `${BASE}/transfers/${id}/reject`,
  },
  // Resource Booking
  BOOKINGS: {
    LIST:   `${BASE}/bookings`,
    CREATE: `${BASE}/bookings`,
    GET:    (id) => `${BASE}/bookings/${id}`,
    CANCEL: (id) => `${BASE}/bookings/${id}/cancel`,
    SLOTS:  (resourceId, date) => `${BASE}/bookings/slots?resource=${resourceId}&date=${date}`,
  },
  RESOURCES: {
    LIST:   `${BASE}/resources`,
    CREATE: `${BASE}/resources`,
    GET:    (id) => `${BASE}/resources/${id}`,
  },
  // Maintenance
  MAINTENANCE: {
    LIST:   `${BASE}/maintenance`,
    CREATE: `${BASE}/maintenance`,
    GET:    (id) => `${BASE}/maintenance/${id}`,
    UPDATE: (id) => `${BASE}/maintenance/${id}`,
    APPROVE:(id) => `${BASE}/maintenance/${id}/approve`,
    RESOLVE:(id) => `${BASE}/maintenance/${id}/resolve`,
    ASSIGN: (id) => `${BASE}/maintenance/${id}/assign`,
  },
  // Audit
  AUDIT: {
    LIST:   `${BASE}/audit`,
    EXPORT: `${BASE}/audit/export`,
  },
  // Reports
  REPORTS: {
    DASHBOARD:   `${BASE}/reports/dashboard`,
    ASSET_USAGE: `${BASE}/reports/asset-usage`,
    MAINTENANCE: `${BASE}/reports/maintenance`,
    UTILIZATION: `${BASE}/reports/utilization`,
    EXPORT:      `${BASE}/reports/export`,
  },
  // Notifications
  NOTIFICATIONS: {
    LIST:      `${BASE}/notifications`,
    MARK_READ: (id) => `${BASE}/notifications/${id}/read`,
    MARK_ALL:  `${BASE}/notifications/mark-all-read`,
  },
};
