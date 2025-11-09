/**
 * useModuleData Hook
 * Simple hook for module data persistence
 * Automatically saves and loads module data from Supabase or localStorage
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useHOS } from '../supabase/HOSProvider';
import { saveModuleData, loadModuleData } from '../supabase/universal-persist';

// Track which modules have shown the auth warning to avoid spam
const shownAuthWarnings = new Set<string>();

/**
 * Hook for persisting module data with automatic save/load
 * Falls back to localStorage when not authenticated
 * 
 * @param moduleKey - Unique key for this module's data (e.g., 'habits', 'chat-history')
 * @param defaultValue - Default value when no data exists
 * @param autoSaveDelay - Milliseconds to wait before auto-saving (default: 1000ms)
 * 
 * @example
 * const [habits, setHabits, { loading, saving }] = useModuleData('habits', []);
 */
export function useModuleData<T = any>(
  moduleKey: string,
  defaultValue: T,
  autoSaveDelay: number = 1000
): [T, (value: T | ((prev: T) => T)) => void, { loading: boolean; saving: boolean; error: string | null }] {
  const { userId, isAuthenticated, isReady } = useHOS();
  const [data, setDataInternal] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // Load data when ready
  useEffect(() => {
    if (!isReady || isInitializedRef.current) return;
    
    async function loadData() {
      if (!isAuthenticated || !userId) {
        // Load from localStorage when not authenticated
        try {
          const localKey = `hos_module_${moduleKey}`;
          const stored = localStorage.getItem(localKey);
          if (stored) {
            const parsed = JSON.parse(stored);
            setDataInternal(parsed);
            if (!shownAuthWarnings.has(moduleKey)) {
              console.log(`📦 Not authenticated - using local storage for ${moduleKey}`);
              shownAuthWarnings.add(moduleKey);
            }
          }
        } catch (err) {
          console.error(`Failed to load from localStorage for ${moduleKey}:`, err);
        }
        setLoading(false);
        isInitializedRef.current = true;
        return;
      }

      try {
        console.log(`📥 Loading ${moduleKey} data...`);
        setLoading(true);
        setError(null);
        
        const loadedData = await loadModuleData<T>(userId, moduleKey, defaultValue);
        setDataInternal(loadedData);
        
        console.log(`✅ ${moduleKey} data loaded successfully`);
      } catch (err) {
        console.error(`❌ Failed to load ${moduleKey}:`, err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        // Try to fall back to localStorage
        try {
          const localKey = `hos_module_${moduleKey}`;
          const stored = localStorage.getItem(localKey);
          if (stored) {
            setDataInternal(JSON.parse(stored));
          } else {
            setDataInternal(defaultValue);
          }
        } catch {
          setDataInternal(defaultValue);
        }
      } finally {
        setLoading(false);
        isInitializedRef.current = true;
      }
    }

    loadData();
  }, [isReady, isAuthenticated, userId, moduleKey, defaultValue]);

  // Set data with auto-save
  const setData = useCallback((value: T | ((prev: T) => T)) => {
    setDataInternal(prev => {
      const newValue = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
      
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Schedule save
      if (isAuthenticated && userId) {
        saveTimeoutRef.current = setTimeout(async () => {
          try {
            console.log(`💾 Auto-saving ${moduleKey}...`);
            setSaving(true);
            setError(null);
            
            await saveModuleData(userId, moduleKey, newValue);
            
            console.log(`✅ ${moduleKey} auto-saved`);
          } catch (err) {
            console.error(`❌ Failed to save ${moduleKey}:`, err);
            setError(err instanceof Error ? err.message : 'Failed to save data');
            // Fall back to localStorage on error
            try {
              const localKey = `hos_module_${moduleKey}`;
              localStorage.setItem(localKey, JSON.stringify(newValue));
            } catch (localErr) {
              console.error(`Failed to save to localStorage:`, localErr);
            }
          } finally {
            setSaving(false);
          }
        }, autoSaveDelay);
      } else {
        // Save to localStorage when not authenticated
        try {
          const localKey = `hos_module_${moduleKey}`;
          localStorage.setItem(localKey, JSON.stringify(newValue));
          // Only show warning once per module
          if (!shownAuthWarnings.has(moduleKey)) {
            console.log(`💾 Saving ${moduleKey} to local storage (not authenticated)`);
            shownAuthWarnings.add(moduleKey);
          }
        } catch (err) {
          console.error(`Failed to save to localStorage:`, err);
        }
      }
      
      return newValue;
    });
  }, [isAuthenticated, userId, moduleKey, autoSaveDelay]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return [data, setData, { loading, saving, error }];
}

/**
 * Hook for array-based module data with helper methods
 * Provides common array operations (add, remove, update)
 * 
 * @example
 * const { items, addItem, removeItem, updateItem, loading } = useModuleArray('habits');
 */
export function useModuleArray<T extends { id: string }>(
  moduleKey: string,
  defaultValue: T[] = [],
  autoSaveDelay: number = 1000
) {
  const [items, setItems, status] = useModuleData<T[]>(moduleKey, defaultValue, autoSaveDelay);

  const addItem = useCallback((item: T) => {
    setItems(prev => [...prev, item]);
  }, [setItems]);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, [setItems]);

  const updateItem = useCallback((id: string, updates: Partial<T>) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  }, [setItems]);

  const clearItems = useCallback(() => {
    setItems([]);
  }, [setItems]);

  return {
    items,
    setItems,
    addItem,
    removeItem,
    updateItem,
    clearItems,
    ...status,
  };
}
