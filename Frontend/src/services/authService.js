import api from './api';
import { ENDPOINTS } from '../constants/apiEndpoints';

// Placeholder credentials (remove once real auth is wired)
const DEMO_USER = {
  id: 1,
  name: 'Rohan Mehta',
  email: 'admin@assetflow.com',
  role: 'Admin',
  department: 'Facilities',
  avatar: 'RM',
};

const authService = {
  /**
   * Login — POST /api/auth/login
   * Expects: { email, password }
   * Returns: { token, user }
   */
  login: async (credentials) => {
    // ── MOCK: Remove when backend is ready ──
    if (credentials.email && credentials.password) {
      const mockToken = 'mock-jwt-token-' + Date.now();
      localStorage.setItem('af_token', mockToken);
      localStorage.setItem('af_user', JSON.stringify(DEMO_USER));
      return { token: mockToken, user: DEMO_USER };
    }
    // ── REAL: Uncomment when backend is ready ──
    // const { data } = await api.post(ENDPOINTS.AUTH.LOGIN, credentials);
    // localStorage.setItem('af_token', data.token);
    // localStorage.setItem('af_user', JSON.stringify(data.user));
    // return data;
  },

  /**
   * Register — POST /api/auth/register
   */
  register: async (_payload) => {
    // ── MOCK ──
    return { success: true, message: 'Account created. Admin will assign your role.' };
    // ── REAL ──
    // const { data } = await api.post(ENDPOINTS.AUTH.REGISTER, payload);
    // return data;
  },

  /**
   * Logout — POST /api/auth/logout
   */
  logout: async () => {
    localStorage.removeItem('af_token');
    localStorage.removeItem('af_user');
    // ── REAL ──
    // try { await api.post(ENDPOINTS.AUTH.LOGOUT); } catch (_) {}
  },

  /**
   * Get current user from localStorage (no-network)
   */
  getCurrentUser: () => {
    try {
      return JSON.parse(localStorage.getItem('af_user'));
    } catch {
      return null;
    }
  },

  isAuthenticated: () => !!localStorage.getItem('af_token'),
};

export default authService;
