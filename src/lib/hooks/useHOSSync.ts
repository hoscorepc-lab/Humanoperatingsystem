/**
 * React Hook for HOS Data Synchronization
 * Manages persistence, real-time sync, and authentication state
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  initializeHOS,
  authenticateUser,
  registerUser,
  signOutUser,
  fetchUserData,
  syncUserData,
  saveUserDataLocally,
  loadUserDataLocally,
  getCurrentSession,
  startAutoSync,
  UserData,
} from '../supabase/sync';
import { toast } from 'sonner@2.0.3';

// Helper to create default user data (needed for registration)
function createDefaultUserData(): Partial<UserData> {
  return {
    preferences: {
      theme: 'pearl',
      activeModule: 'dashboard',
      sidebarCollapsed: false,
    },
    moduleStates: {},
    events: [],
    tasks: [],
    habits: [],
    habitCompletions: [],
    reflections: [],
    memories: [],
    coreValues: [],
    commandHistory: [],
    cognitiveProcesses: [],
    thoughtStreams: [],
    decisionNodes: [],
    aiAgents: [],
    agentConversations: {},
    widgetFlows: [],
    flowExecutions: [],
    chatHistory: [],
    deepChatHistory: [],
    deepChatSessions: [],
    dashboards: [],
    dataSources: [],
    dreamScenarios: [],
    dreamSimulations: [],
    dreamPredictions: [],
    gptConversations: [],
    gptModels: [],
    chipModules: [],
    autonomousActions: [],
    wallets: [],
    transactions: [],
    portfolios: [],
    watchlists: [],
    marketAnalyses: [],
    researchProjects: [],
    researchPapers: [],
    clonedApps: [],
    screenshots: [],
    proposals: [],
    implementations: [],
    evolutionLogs: [],
    neuralModels: [],
    trainingData: [],
    systemEvents: [],
    aiInteractions: [],
    userSettings: {},
  };
}

export interface HOSState {
  isAuthenticated: boolean;
  userId: string | null;
  accessToken: string | null;
  userData: Partial<UserData> | null;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
  isTrialMode?: boolean;
}

export function useHOSSync() {
  const [state, setState] = useState<HOSState>({
    isAuthenticated: false,
    userId: null,
    accessToken: null,
    userData: null,
    isLoading: true,
    isSyncing: false,
    lastSyncTime: null,
    isTrialMode: false,
  });

  const autoSyncCleanupRef = useRef<(() => void) | null>(null);

  // Initialize on mount
  useEffect(() => {
    let isMounted = true;
    let initTimeoutId: NodeJS.Timeout | null = null;

    async function init() {
      console.log('🚀 Starting HOS initialization...');
      
      // Set a maximum timeout for the entire initialization - GUARANTEED to fire
      initTimeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn('⚠️ Initialization timeout reached - forcing completion');
          // Load any local data and proceed
          const localData = loadUserDataLocally();
          setState({
            isAuthenticated: false,
            userId: null,
            accessToken: null,
            userData: localData || null,
            isLoading: false,
            isSyncing: false,
            lastSyncTime: null,
            isTrialMode: false,
          });
        }
      }, 10000); // 10 second HARD timeout to ensure app loads (must be > sync.ts timeout)

      try {
        const result = await initializeHOS();
        
        // Clear timeout only if we got a result
        if (initTimeoutId) {
          clearTimeout(initTimeoutId);
          initTimeoutId = null;
        }
        
        console.log('✅ HOS initialization complete:', {
          isAuthenticated: result.isAuthenticated,
          hasUserId: !!result.userId,
          hasUserData: !!result.userData,
        });

        if (isMounted) {
          setState({
            isAuthenticated: result.isAuthenticated,
            userId: result.userId,
            accessToken: result.accessToken,
            userData: result.userData,
            isLoading: false,
            isSyncing: false,
            lastSyncTime: new Date().toISOString(),
            isTrialMode: false,
          });

          // Start auto-sync if authenticated
          if (result.isAuthenticated && result.userId) {
            startAutoSyncProcess(result.userId);
          }
        }
      } catch (error) {
        // Clear timeout on error
        if (initTimeoutId) {
          clearTimeout(initTimeoutId);
          initTimeoutId = null;
        }
        
        console.error('❌ Failed to initialize HOS:', error);
        
        if (isMounted) {
          // Force to unauthenticated state so app can load
          setState({
            isAuthenticated: false,
            userId: null,
            accessToken: null,
            userData: null,
            isLoading: false,
            isSyncing: false,
            lastSyncTime: null,
            isTrialMode: false,
          });
        }
      }
    }

    init();

    return () => {
      isMounted = false;
      
      // Clear timeout on unmount
      if (initTimeoutId) {
        clearTimeout(initTimeoutId);
      }
      
      // Cleanup auto-sync
      if (autoSyncCleanupRef.current) {
        autoSyncCleanupRef.current();
        autoSyncCleanupRef.current = null;
      }
    };
  }, []);

  // Start auto-sync process
  const startAutoSyncProcess = useCallback((userId: string) => {
    // Clear any existing auto-sync
    if (autoSyncCleanupRef.current) {
      autoSyncCleanupRef.current();
    }

    // Start new auto-sync
    autoSyncCleanupRef.current = startAutoSync(
      userId,
      () => {
        const localData = loadUserDataLocally();
        return localData || {};
      },
      60000 // Sync every minute
    );
  }, []);

  // Register
  const register = useCallback(async (email: string, password: string, name?: string) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      console.log('📝 useHOSSync: Starting registration for email:', email);
      
      // First, create the user account
      const { userId } = await registerUser(email, password, name);
      console.log('✅ useHOSSync: User created, userId:', userId);

      // Then authenticate them
      console.log('🔐 useHOSSync: Authenticating newly created user...');
      const { accessToken } = await authenticateUser(email, password);
      console.log('✅ useHOSSync: Authentication successful');

      // Initialize with default user data
      const userData = createDefaultUserData();
      saveUserDataLocally(userData);

      setState({
        isAuthenticated: true,
        userId,
        accessToken,
        userData,
        isLoading: false,
        isSyncing: false,
        lastSyncTime: new Date().toISOString(),
      });

      // Start auto-sync
      startAutoSyncProcess(userId);

      toast.success('Account created!', {
        description: 'Welcome to HOS',
      });

      console.log('✅ useHOSSync: Registration complete');
      return { success: true };
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      
      console.log('🔍 useHOSSync: Registration error caught:', { 
        errorMessage: error.message, 
        errorType: typeof error,
        fullError: error 
      });
      
      // Handle duplicate email error specially - don't show toast
      if (error.message === 'DUPLICATE_EMAIL') {
        console.log('✅ useHOSSync: Detected DUPLICATE_EMAIL, returning without toast');
        return { 
          success: false, 
          error: 'DUPLICATE_EMAIL'
        };
      }
      
      // Show toast for other errors
      console.log('❌ useHOSSync: Showing toast for non-duplicate error:', error.message);
      toast.error('Registration failed', {
        description: error.message || 'An unexpected error occurred',
      });
      return { success: false, error: error.message };
    }
  }, [startAutoSyncProcess]);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      console.log('🔐 useHOSSync: Starting login for email:', email);
      const { userId, accessToken } = await authenticateUser(email, password);

      console.log('✅ useHOSSync: Authentication successful, fetching user data...');
      // Fetch user data
      const userData = await fetchUserData(userId);
      saveUserDataLocally(userData);

      setState({
        isAuthenticated: true,
        userId,
        accessToken,
        userData,
        isLoading: false,
        isSyncing: false,
        lastSyncTime: new Date().toISOString(),
      });

      // Start auto-sync
      startAutoSyncProcess(userId);

      toast.success('Welcome back!', {
        description: 'Your data has been synchronized',
      });

      console.log('✅ useHOSSync: Login complete');
      return { success: true };
    } catch (error: any) {
      console.error('❌ useHOSSync: Login error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      toast.error('Login failed', {
        description: error.message,
      });
      return { success: false, error: error.message };
    }
  }, [startAutoSyncProcess]);

  // Logout
  const logout = useCallback(async () => {
    try {
      const wasTrialMode = state.isTrialMode;
      
      // Only sign out if not in trial mode
      if (!wasTrialMode) {
        await signOutUser();
      }

      // Stop auto-sync
      if (autoSyncCleanupRef.current) {
        autoSyncCleanupRef.current();
        autoSyncCleanupRef.current = null;
      }

      setState({
        isAuthenticated: false,
        userId: null,
        accessToken: null,
        userData: null,
        isLoading: false,
        isSyncing: false,
        lastSyncTime: null,
        isTrialMode: false,
      });

      toast.success(wasTrialMode ? 'Trial session ended' : 'Logged out successfully');
    } catch (error: any) {
      toast.error('Logout failed', {
        description: error.message,
      });
    }
  }, [state.isTrialMode]);

  // Manual sync
  const sync = useCallback(async () => {
    if (!state.userId) return;

    setState(prev => ({ ...prev, isSyncing: true }));

    try {
      const localData = loadUserDataLocally();
      if (localData) {
        // Sync mutates localData to mark everything as synced
        await syncUserData(state.userId, localData);
        // Save the updated data (with synced flags) back to localStorage
        saveUserDataLocally(localData);
      }

      const serverData = await fetchUserData(state.userId);
      saveUserDataLocally(serverData);

      setState(prev => ({
        ...prev,
        userData: serverData,
        isSyncing: false,
        lastSyncTime: new Date().toISOString(),
      }));

      toast.success('Data synchronized');
    } catch (error: any) {
      setState(prev => ({ ...prev, isSyncing: false }));
      toast.error('Sync failed', {
        description: error.message,
      });
    }
  }, [state.userId]);

  // Update user data (optimistic update + background sync)
  const updateUserData = useCallback((updates: Partial<UserData>) => {
    setState(prev => ({
      ...prev,
      userData: { ...prev.userData, ...updates },
    }));

    // Save locally immediately
    const newData = { ...state.userData, ...updates };
    saveUserDataLocally(newData);

    // Sync to server in background
    if (state.userId) {
      syncUserData(state.userId, newData).catch(error => {
        console.error('Background sync failed:', error);
        // Optionally notify user
      });
    }
  }, [state.userId, state.userData]);

  // Refresh session
  const refreshSession = useCallback(async () => {
    try {
      const session = await getCurrentSession();
      if (session) {
        setState(prev => ({
          ...prev,
          userId: session.userId,
          accessToken: session.accessToken,
          isAuthenticated: true,
        }));
      } else {
        setState(prev => ({
          ...prev,
          userId: null,
          accessToken: null,
          isAuthenticated: false,
        }));
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
    }
  }, []);

  // Start trial mode (guest access)
  const startTrialMode = useCallback(() => {
    console.log('🎭 Starting trial mode...');
    
    // Create default trial data
    const trialUserData = createDefaultUserData();
    
    setState({
      isAuthenticated: true,
      userId: 'trial-user',
      accessToken: null,
      userData: trialUserData,
      isLoading: false,
      isSyncing: false,
      lastSyncTime: new Date().toISOString(),
      isTrialMode: true,
    });

    toast.success('Welcome to Trial Mode!', {
      description: 'Exploring HOS as a guest. Data won\'t be saved.',
    });
  }, []);

  // Memoize the return value to prevent infinite re-renders
  return useMemo(() => ({
    // State
    ...state,

    // Methods
    register,
    login,
    logout,
    sync,
    updateUserData,
    refreshSession,
    startTrialMode,

    // Helper methods
    isReady: !state.isLoading,
    hasData: !!state.userData,
  }), [
    state,
    register,
    login,
    logout,
    sync,
    updateUserData,
    refreshSession,
    startTrialMode,
  ]);
}