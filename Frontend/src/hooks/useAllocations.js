/**
 * useAllocations.js
 * ─────────────────────────────────────────────────────────────────
 * Custom hook that wraps allocationService with loading & error state.
 *
 * Usage:
 *   const { requests, history, loading, approve, reject, create } = useAllocations();
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from 'react';
import allocationService from '../services/allocationService';

export function useAllocations() {
  const [requests, setRequests] = useState([]);
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [reqs, hist] = await Promise.all([
        allocationService.getAllRequests(),
        allocationService.getHistory(),
      ]);
      setRequests(reqs);
      setHistory(hist);
    } catch (err) {
      setError(err.message || 'Failed to load allocations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const approve = async (id) => {
    const updated = await allocationService.approveRequest(id);
    setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
  };

  const reject = async (id) => {
    const updated = await allocationService.rejectRequest(id);
    setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
  };

  const create = async (requestData) => {
    const newReq = await allocationService.createRequest(requestData);
    setRequests((prev) => [newReq, ...prev]);
    return newReq;
  };

  const addHistory = async (entry) => {
    const newEntry = await allocationService.addHistoryEntry(entry);
    setHistory((prev) => [newEntry, ...prev]);
    return newEntry;
  };

  return {
    requests,
    history,
    loading,
    error,
    refetch: fetchAll,
    approve,
    reject,
    create,
    addHistory,
  };
}
