import { useState, useEffect } from 'react';

/**
 * Hook for loading data with graceful degradation
 * Returns empty array immediately, loads automatically when userId is provided
 */
export function useOptionalData<T>(
  fetchFn: (userId?: string) => Promise<T[]>,
  userId?: string | null
): [T[], boolean, () => void, (newData: T[]) => void] {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await fetchFn(userId || undefined);
      setData(result);
    } catch (error) {
      console.error('Error loading data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-load when userId becomes available or changes
  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  return [data, loading, loadData, setData];
}
