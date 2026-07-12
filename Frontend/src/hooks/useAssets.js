/**
 * useAssets.js
 * ─────────────────────────────────────────────────────────────────
 * Custom hook that wraps assetService with loading & error state.
 * Pages use this hook instead of calling the service directly.
 *
 * Usage:
 *   const { assets, loading, error, refetch, createAsset } = useAssets();
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from 'react';
import assetService from '../services/assetService';

export function useAssets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all assets from the service
  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await assetService.getAll();
      setAssets(data);
    } catch (err) {
      setError(err.message || 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  }, []);

  // Run on mount
  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Create a new asset and refresh the list
  const createAsset = async (assetData) => {
    const newAsset = await assetService.create(assetData);
    setAssets((prev) => [newAsset, ...prev]);
    return newAsset;
  };

  // Update an asset in the list
  const updateAsset = async (id, updates) => {
    const updated = await assetService.update(id, updates);
    setAssets((prev) => prev.map((a) => (a.id === id ? updated : a)));
    return updated;
  };

  // Remove an asset from the list
  const removeAsset = async (id) => {
    await assetService.remove(id);
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  return {
    assets,
    loading,
    error,
    refetch: fetchAssets,
    createAsset,
    updateAsset,
    removeAsset,
  };
}
