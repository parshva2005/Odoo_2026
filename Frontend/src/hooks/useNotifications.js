/**
 * useNotifications.js
 * ─────────────────────────────────────────────────────────────────
 * Custom hook for managing notification state.
 *
 * Usage:
 *   const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const markRead = async (id) => {
    const updated = await notificationService.markRead(id);
    setNotifications(updated);
  };

  const markAllRead = async () => {
    const updated = await notificationService.markAllRead();
    setNotifications(updated);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchAll,
    markRead,
    markAllRead,
  };
}
