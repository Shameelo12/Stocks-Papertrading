import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';

export function usePortfolio(autoRefreshInterval = 5000) {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchPortfolio = useCallback(async () => {
    try {
      const response = await API.get('/portfolio');
      setPortfolio(response.data);
      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      setError('Failed to load portfolio');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefreshInterval) return;

    const interval = setInterval(() => {
      fetchPortfolio();
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [autoRefreshInterval, fetchPortfolio]);

  return {
    portfolio,
    loading,
    error,
    lastUpdated,
    refetch: fetchPortfolio,
  };
}
