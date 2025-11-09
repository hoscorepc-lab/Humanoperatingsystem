/**
 * usePersistedState Hook
 * Provides a persistent state that syncs with the HOS backend
 * Similar to useState but automatically persists to the database
 */

import { useState, useEffect, useCallback } from 'react';
import { useHOS } from '../supabase/HOSProvider';
import { UserData } from '../supabase/sync';

/**
 * Hook that provides persistent state synced to the backend
 * 
 * @param dataKey - The key in UserData where this data should be stored
 * @param defaultValue - Default value if no data exists
 * @returns [data, setData, isLoading] - Similar to useState with loading state
 * 
 * @example
 * const [habits, setHabits, loading] = usePersistedState('habits', []);
 */
export function usePersistedState<K extends keyof UserData>(
  dataKey: K,
  defaultValue: UserData[K]
): [UserData[K], (value: UserData[K]) => void, boolean] {
  const { getData, setData, isAuthenticated, isReady } = useHOS();
  
  // Local state initialized from persisted data or default
  const [localData, setLocalData] = useState<UserData[K]>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load data from HOS context when ready
  useEffect(() => {
    if (isReady) {
      const persistedData = getData(dataKey);
      if (persistedData !== undefined && persistedData !== null) {
        console.log(`📦 Loaded persisted data for ${String(dataKey)}:`, persistedData);
        setLocalData(persistedData);
      } else {
        console.log(`📦 No persisted data for ${String(dataKey)}, using default`);
        setLocalData(defaultValue);
      }
      setIsLoading(false);
    }
  }, [isReady, dataKey]);
  
  // Update function that persists to backend
  const updateData = useCallback((newValue: UserData[K]) => {
    console.log(`💾 Persisting ${String(dataKey)}:`, newValue);
    setLocalData(newValue);
    
    // Only persist if authenticated
    if (isAuthenticated) {
      setData(dataKey, newValue);
    } else {
      console.warn(`⚠️ Not authenticated, ${String(dataKey)} not persisted to backend`);
    }
  }, [dataKey, isAuthenticated, setData]);
  
  return [localData, updateData, isLoading];
}

/**
 * Hook for array-based persisted state with helper functions
 * Provides common array operations (add, remove, update)
 * 
 * @example
 * const { items, addItem, removeItem, updateItem, loading } = usePersistedArray('habits');
 */
export function usePersistedArray<K extends keyof UserData>(
  dataKey: K,
  defaultValue: UserData[K] = [] as UserData[K]
) {
  const [items, setItems, loading] = usePersistedState(dataKey, defaultValue);
  
  const addItem = useCallback((item: any) => {
    const newItems = Array.isArray(items) ? [...items, item] : [item];
    setItems(newItems as UserData[K]);
  }, [items, setItems]);
  
  const removeItem = useCallback((id: string) => {
    if (Array.isArray(items)) {
      const newItems = items.filter((item: any) => item.id !== id);
      setItems(newItems as UserData[K]);
    }
  }, [items, setItems]);
  
  const updateItem = useCallback((id: string, updates: Partial<any>) => {
    if (Array.isArray(items)) {
      const newItems = items.map((item: any) =>
        item.id === id ? { ...item, ...updates } : item
      );
      setItems(newItems as UserData[K]);
    }
  }, [items, setItems]);
  
  const clearItems = useCallback(() => {
    setItems([] as UserData[K]);
  }, [setItems]);
  
  return {
    items: items as any[],
    setItems,
    addItem,
    removeItem,
    updateItem,
    clearItems,
    loading,
  };
}
