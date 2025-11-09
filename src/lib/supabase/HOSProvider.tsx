/**
 * HOS Data Provider
 * Provides global access to HOS sync state and methods
 */

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useHOSSync, HOSState } from '../hooks/useHOSSync';
import { UserData } from './sync';

interface HOSContextValue extends HOSState {
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  sync: () => Promise<void>;
  updateUserData: (updates: Partial<UserData>) => void;
  refreshSession: () => Promise<void>;
  startTrialMode: () => void;
  isTrialMode: boolean;
  isReady: boolean;
  hasData: boolean;
  
  // Data access helpers for modules
  getData: <K extends keyof UserData>(key: K) => UserData[K] | undefined;
  setData: <K extends keyof UserData>(key: K, value: UserData[K]) => void;
}

const HOSContext = createContext<HOSContextValue | null>(null);

export function HOSProvider({ children }: { children: ReactNode }) {
  console.log('🏗️ HOSProvider rendering...');
  const hosSync = useHOSSync();
  console.log('📦 HOSProvider hosSync state:', {
    isLoading: hosSync.isLoading,
    isAuthenticated: hosSync.isAuthenticated,
    hasUserData: !!hosSync.userData
  });
  
  // Memoize helpers to prevent recreation on every render
  const getData = useMemo(() => {
    return <K extends keyof UserData>(key: K): UserData[K] | undefined => {
      return hosSync.userData?.[key];
    };
  }, [hosSync.userData]);
  
  const setData = useMemo(() => {
    return <K extends keyof UserData>(key: K, value: UserData[K]) => {
      hosSync.updateUserData({ [key]: value } as Partial<UserData>);
    };
  }, [hosSync.updateUserData]);
  
  // Memoize the entire context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => {
    // Compute derived state
    const isReady = !hosSync.isLoading;
    const hasData = !!hosSync.userData && Object.keys(hosSync.userData).length > 0;
    
    return {
      ...hosSync,
      isReady,
      hasData,
      getData,
      setData,
      isTrialMode: hosSync.isTrialMode || false,
    };
  }, [hosSync, getData, setData]);

  return (
    <HOSContext.Provider value={contextValue}>
      {children}
    </HOSContext.Provider>
  );
}

export function useHOS() {
  const context = useContext(HOSContext);
  if (!context) {
    throw new Error('useHOS must be used within HOSProvider');
  }
  return context;
}
