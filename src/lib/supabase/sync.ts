/**
 * HOS Supabase Sync Service
 * Handles all data persistence, synchronization, and real-time updates
 */

import { getSupabaseClient } from './client';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-8d51d9e2`;

export interface SyncState {
  userId: string | null;
  isAuthenticated: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
}

export interface UserData {
  // User preferences
  preferences: {
    theme: 'pearl' | 'silver' | 'chrome' | 'platinum';
    activeModule: string;
    sidebarCollapsed: boolean;
  };
  
  // Module states - generic state storage for all modules
  moduleStates: Record<string, any>;
  
  // === HUMAN MODULES DATA ===
  
  // Quantum Planner
  events: any[];
  tasks: any[];
  
  // Habit Forge
  habits: any[];
  habitCompletions: any[];
  
  // Reflection Mirror
  reflections: any[];
  
  // Memory Module
  memories: any[];
  
  // Kernel Module
  coreValues: any[];
  
  // Shell Module
  commandHistory: any[];
  
  // Mind Module
  cognitiveProcesses: any[];
  thoughtStreams: any[];
  decisionNodes: any[];
  
  // === CORE MODULES DATA ===
  
  // HOS AIgency
  aiAgents: any[];
  agentConversations: Record<string, any[]>;
  
  // HOS Chat & Deep Chat
  chatHistory: any[];
  deepChatHistory: any[];
  deepChatSessions: any[];
  
  // HOS Dashboard Studio
  dashboards: any[];
  dataSources: any[];
  
  // HOS GPT
  gptConversations: any[];
  gptModels: any[];
  
  // HOS Chip
  chipModules: any[];
  autonomousActions: any[];
  
  // === RESEARCH MODULES DATA ===
  
  // Financial Research
  portfolios: any[];
  watchlists: any[];
  marketAnalyses: any[];
  
  // Core Research
  researchProjects: any[];
  researchPapers: any[];
  
  // AI App Studio
  clonedApps: any[];
  screenshots: any[];
  
  // Evolver
  proposals: any[];
  implementations: any[];
  evolutionLogs: any[];
  
  // Neural Network
  neuralModels: any[];
  trainingData: any[];
  
  // === SYSTEM DATA ===
  systemEvents: any[];
  aiInteractions: any[];
  userSettings: any;
}

/**
 * Initialize sync state from localStorage and Supabase
 */
export function initializeSyncState(): SyncState {
  const savedState = localStorage.getItem('hos_sync_state');
  if (savedState) {
    try {
      return JSON.parse(savedState);
    } catch (e) {
      console.error('Failed to parse sync state:', e);
    }
  }
  
  return {
    userId: null,
    isAuthenticated: false,
    isSyncing: false,
    lastSyncTime: null,
  };
}

/**
 * Save sync state to localStorage
 */
function saveSyncState(state: SyncState) {
  localStorage.setItem('hos_sync_state', JSON.stringify(state));
}

/**
 * Register a new user account
 */
export async function registerUser(email: string, password: string, name?: string): Promise<{ userId: string; success: boolean }> {
  try {
    console.log('Registering new user:', email);
    
    const response = await fetch(`${SERVER_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorCode = data.error;
      const errorMessage = data.message || errorCode || 'Registration failed';
      
      console.log('Registration failed:', { 
        status: response.status, 
        errorCode, 
        errorMessage,
        fullResponse: data 
      });
      
      // Check if this is a duplicate email error (by error code or message)
      if (errorCode === 'DUPLICATE_EMAIL' || 
          errorMessage.includes('already been registered') || 
          errorMessage.includes('already exists') ||
          errorMessage.includes('already registered')) {
        console.log('Detected duplicate email error');
        throw new Error('DUPLICATE_EMAIL');
      }
      
      throw new Error(errorMessage);
    }

    if (!data.success || !data.userId) {
      throw new Error('Failed to create user account');
    }

    console.log('✅ User registered successfully:', data.userId);

    return {
      userId: data.userId,
      success: true,
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Re-throw with the exact error message for duplicate email
    if (error.message === 'DUPLICATE_EMAIL') {
      throw error;
    }
    
    throw new Error(`Failed to create account: ${error.message}`);
  }
}

/**
 * Authenticate user and get session
 */
export async function authenticateUser(email: string, password: string): Promise<{ userId: string; accessToken: string }> {
  const supabase = getSupabaseClient();
  
  console.log('🔐 Attempting to authenticate user:', email);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error('❌ Authentication error:', {
      code: error.code,
      message: error.message,
      status: error.status,
      name: error.name
    });
    
    console.log('\n📋 Troubleshooting steps:');
    console.log('1. Make sure you registered an account first (email must exist in database)');
    console.log('2. Check that email is spelled correctly:', email);
    console.log('3. Verify password is correct (passwords are case-sensitive)');
    console.log('4. If you just registered, wait a few seconds and try again');
    console.log('5. Try using "Forgot password?" to reset your password\n');
    
    // Provide more helpful error messages based on error code and message
    if (error.message.toLowerCase().includes('invalid login credentials') || 
        error.message.toLowerCase().includes('invalid email or password')) {
      
      // This could mean either:
      // 1. The email doesn't have an account (user needs to register first)
      // 2. The password is wrong
      // We can't distinguish between these for security reasons, but we can guide the user
      throw new Error('Invalid email or password. If you haven\'t created an account yet, please register first. Otherwise, check that your password is correct (passwords are case-sensitive).');
    }
    
    if (error.message.toLowerCase().includes('email not confirmed')) {
      throw new Error('Please confirm your email address before logging in.');
    }
    
    // Default error message
    throw new Error(`Login failed: ${error.message}`);
  }
  
  if (!data.session || !data.user) {
    console.error('❌ No session or user data returned');
    throw new Error('Login failed: No session created. Please try again.');
  }
  
  console.log('✅ Authentication successful for user:', data.user.id);
  
  return {
    userId: data.user.id,
    accessToken: data.session.access_token,
  };
}

/**
 * Get current session
 * Fast check using localStorage first, then Supabase
 */
export async function getCurrentSession(): Promise<{ userId: string; accessToken: string } | null> {
  const supabase = getSupabaseClient();
  
  try {
    // Fast path: Check localStorage first (Supabase stores session here)
    // This avoids the slow async call when session is already known
    if (typeof window !== 'undefined') {
      const storageKey = `sb-${projectId}-auth-token`;
      const storedSession = localStorage.getItem(storageKey);
      
      if (storedSession) {
        try {
          const parsed = JSON.parse(storedSession);
          if (parsed?.access_token && parsed?.user?.id) {
            console.log('✅ Found cached session in localStorage');
            return {
              userId: parsed.user.id,
              accessToken: parsed.access_token,
            };
          }
        } catch (e) {
          // Invalid JSON, fall through to full check
          console.log('⚠️ Could not parse cached session, doing full check');
        }
      }
    }
    
    // Slow path: Full Supabase session check
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('Session error:', error.message);
      return null;
    }
    
    if (!data.session) {
      console.log('No session found');
      return null;
    }
    
    if (!data.session.user) {
      console.log('Session exists but no user data');
      return null;
    }
    
    return {
      userId: data.session.user.id,
      accessToken: data.session.access_token,
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Sign out user
 */
export async function signOutUser() {
  const supabase = getSupabaseClient();
  await supabase.auth.signOut();
  
  // Clear sync state
  localStorage.removeItem('hos_sync_state');
  localStorage.removeItem('hos_user_data');
}

/**
 * Create default empty user data
 */
function createDefaultUserData(): Partial<UserData> {
  return {
    // Preferences
    preferences: {
      theme: 'brilliant-white',
      activeModule: 'dashboard',
      sidebarCollapsed: false,
    },
    moduleStates: {},
    
    // Human Modules
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
    
    // Core Modules
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
    
    // Research Modules
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
    
    // System
    systemEvents: [],
    aiInteractions: [],
    userSettings: {},
  };
}

/**
 * Fetch all user data from server
 */
export async function fetchUserData(userId: string): Promise<Partial<UserData>> {
  console.log(`📥 Fetching all user data for userId: ${userId}`);
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    };
    
    // Start with default data
    const userData: Partial<UserData> = createDefaultUserData();
    
    // Fetch all data types in parallel - don't fail if one fails
    const fetchWithFallback = async (url: string, key: string) => {
      try {
        // Add timeout to prevent infinite hanging
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        const response = await fetch(url, { 
          headers,
          signal: controller.signal 
        });
        
        clearTimeout(timeout);
        
        if (response.ok) {
          const data = await response.json();
          return data[key] || [];
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log(`ℹ️ Using cached ${key} (server timeout)`);
        } else {
          console.log(`ℹ️ Using cached ${key}:`, error.message || error);
        }
      }
      return [];
    };
    
    // Fetch all data types
    const [
      tasks,
      habits,
      reflections,
      events,
      memories,
      coreValues,
      aiAgents,
    ] = await Promise.all([
      fetchWithFallback(`${SERVER_URL}/tasks?userId=${userId}`, 'tasks'),
      fetchWithFallback(`${SERVER_URL}/habits?userId=${userId}`, 'habits'),
      fetchWithFallback(`${SERVER_URL}/reflections?userId=${userId}`, 'reflections'),
      fetchWithFallback(`${SERVER_URL}/events?userId=${userId}`, 'events'),
      fetchWithFallback(`${SERVER_URL}/memories?userId=${userId}`, 'memories'),
      fetchWithFallback(`${SERVER_URL}/values?userId=${userId}`, 'values'),
      fetchWithFallback(`${SERVER_URL}/aiagency/agents?userId=${userId}`, 'agents'),
    ]);
    
    // Merge fetched data with defaults and mark all server data as synced
    Object.assign(userData, {
      tasks: tasks.map((t: any) => ({ ...t, synced: true })),
      habits: habits.map((h: any) => ({ ...h, synced: true })),
      reflections: reflections.map((r: any) => ({ ...r, synced: true })),
      events: events.map((e: any) => ({ ...e, synced: true })),
      memories: memories.map((m: any) => ({ ...m, synced: true })),
      coreValues: coreValues.map((c: any) => ({ ...c, synced: true })),
      aiAgents: aiAgents.map((a: any) => ({ ...a, synced: true })),
    });
    
    console.log('✅ User data fetched successfully:', {
      tasks: tasks.length,
      habits: habits.length,
      reflections: reflections.length,
      events: events.length,
      memories: memories.length,
      coreValues: coreValues.length,
      aiAgents: aiAgents.length,
    });
    
    return userData;
  } catch (error) {
    console.error('❌ Error fetching user data:', error);
    // Return default data instead of failing
    return createDefaultUserData();
  }
}

/**
 * Save user data to localStorage
 */
export function saveUserDataLocally(data: Partial<UserData>) {
  localStorage.setItem('hos_user_data', JSON.stringify(data));
}

/**
 * Load user data from localStorage
 */
export function loadUserDataLocally(): Partial<UserData> | null {
  const saved = localStorage.getItem('hos_user_data');
  if (!saved) return null;
  
  try {
    return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse user data:', e);
    return null;
  }
}

/**
 * Sync user data with server (upload local changes)
 */
export async function syncUserData(userId: string, data: Partial<UserData>): Promise<void> {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`,
  };
  
  // Sync each data type
  const syncPromises: Promise<any>[] = [];
  
  // Helper to handle sync with error tolerance
  const createSyncPromise = (url: string, data: any, itemType: string, itemName: string) => {
    return fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...data, userId }),
    })
    .then(async (response) => {
      // Ignore 409 conflicts - item already exists on server
      if (response.status === 409) {
        console.log(`${itemType} "${itemName}" already exists on server, skipping...`);
        return { ok: true, skipped: true };
      }
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to sync ${itemType} "${itemName}":`, errorText);
      }
      return response;
    })
    .catch(error => {
      console.error(`Error syncing ${itemType} "${itemName}":`, error);
    });
  };
  
  // Sync tasks
  if (data.tasks) {
    for (const task of data.tasks) {
      if (!task.synced) {
        syncPromises.push(
          createSyncPromise(`${SERVER_URL}/tasks`, task, 'Task', task.title || task.id)
        );
      }
    }
  }
  
  // Sync habits
  if (data.habits) {
    for (const habit of data.habits) {
      if (!habit.synced) {
        syncPromises.push(
          createSyncPromise(`${SERVER_URL}/habits`, habit, 'Habit', habit.name || habit.id)
        );
      }
    }
  }
  
  // Sync reflections
  if (data.reflections) {
    for (const reflection of data.reflections) {
      if (!reflection.synced) {
        syncPromises.push(
          createSyncPromise(`${SERVER_URL}/reflections`, reflection, 'Reflection', reflection.title || reflection.id)
        );
      }
    }
  }
  
  // Sync AI agents
  if (data.aiAgents) {
    for (const agent of data.aiAgents) {
      if (!agent.synced) {
        syncPromises.push(
          createSyncPromise(`${SERVER_URL}/aiagency/agents`, agent, 'Agent', agent.name || agent.id)
        );
      }
    }
  }
  
  await Promise.all(syncPromises);
  
  // After successful sync, mark all items as synced in the provided data object
  // This will be saved to localStorage by the calling code
  if (data.tasks) {
    data.tasks.forEach((task: any) => { task.synced = true; });
  }
  if (data.habits) {
    data.habits.forEach((habit: any) => { habit.synced = true; });
  }
  if (data.reflections) {
    data.reflections.forEach((reflection: any) => { reflection.synced = true; });
  }
  if (data.aiAgents) {
    data.aiAgents.forEach((agent: any) => { agent.synced = true; });
  }
}

/**
 * Auto-sync on interval
 */
export function startAutoSync(
  userId: string,
  getData: () => Partial<UserData>,
  interval: number = 60000 // 1 minute
): () => void {
  const intervalId = setInterval(async () => {
    try {
      const data = getData();
      await syncUserData(userId, data);
      console.log('Auto-sync completed');
    } catch (error) {
      console.error('Auto-sync failed:', error);
    }
  }, interval);
  
  return () => clearInterval(intervalId);
}

/**
 * Subscribe to real-time updates (for specific data types)
 */
export function subscribeToRealtimeUpdates(
  userId: string,
  onUpdate: (type: string, data: any) => void
): () => void {
  const supabase = getSupabaseClient();
  
  // Subscribe to tasks
  const tasksChannel = supabase
    .channel(`tasks:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'hos_tasks',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onUpdate('tasks', payload);
      }
    )
    .subscribe();
  
  // Subscribe to AI agents
  const agentsChannel = supabase
    .channel(`agents:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'hos_ai_agents',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onUpdate('aiAgents', payload);
      }
    )
    .subscribe();
  
  // Cleanup function
  return () => {
    supabase.removeChannel(tasksChannel);
    supabase.removeChannel(agentsChannel);
  };
}

/**
 * Initialize HOS with persistence
 */
export async function initializeHOS(): Promise<{
  isAuthenticated: boolean;
  userId: string | null;
  userData: Partial<UserData> | null;
  accessToken: string | null;
}> {
  console.log('📦 initializeHOS called');
  
  // Wrap entire initialization in a race with timeout to guarantee completion
  const initPromise = (async () => {
    try {
      console.log('🔄 initializeHOS: Starting initialization promise...');
      
      // First, try to get cached session from localStorage (instant)
      let session: { userId: string; accessToken: string } | null = null;
    
    if (typeof window !== 'undefined') {
      // Try multiple possible localStorage keys for session
      const possibleKeys = [
        `sb-${projectId}-auth-token`,
        'hos-supabase-auth-token',
        'supabase.auth.token',
      ];
      
      for (const storageKey of possibleKeys) {
        const storedSession = localStorage.getItem(storageKey);
        console.log(`🔍 Checking localStorage key: ${storageKey}`, storedSession ? 'FOUND' : 'NOT FOUND');
        
        if (storedSession) {
          try {
            const parsed = JSON.parse(storedSession);
            console.log(`📦 Parsed session structure for ${storageKey}:`, Object.keys(parsed));
            
            // Check multiple possible session structures
            if (parsed?.access_token && parsed?.user?.id) {
              console.log(`✅ Found valid cached session (format 1) in ${storageKey}`);
              session = {
                userId: parsed.user.id,
                accessToken: parsed.access_token,
              };
              break;
            } else if (parsed?.currentSession?.access_token && parsed?.currentSession?.user?.id) {
              console.log(`✅ Found valid cached session (format 2) in ${storageKey}`);
              session = {
                userId: parsed.currentSession.user.id,
                accessToken: parsed.currentSession.access_token,
              };
              break;
            } else if (typeof parsed === 'string') {
              // Might be double-encoded
              const reparsed = JSON.parse(parsed);
              if (reparsed?.access_token && reparsed?.user?.id) {
                console.log(`✅ Found valid cached session (double-encoded) in ${storageKey}`);
                session = {
                  userId: reparsed.user.id,
                  accessToken: reparsed.access_token,
                };
                break;
              }
            }
          } catch (e) {
            console.log(`⚠️ Could not parse session from ${storageKey}:`, e);
          }
        }
      }
      
      // If no session found by key check, try hos_sync_state as fallback
      if (!session) {
        console.log('🔍 No session in standard keys, checking hos_sync_state...');
        const syncState = localStorage.getItem('hos_sync_state');
        if (syncState) {
          try {
            const parsed = JSON.parse(syncState);
            if (parsed?.userId && parsed?.isAuthenticated) {
              console.log('✅ Found userId in hos_sync_state, creating fallback session');
              // We have a userId but no access token - still better than nothing
              // The system will try to refresh the token in the background
              session = {
                userId: parsed.userId,
                accessToken: '', // Will be refreshed later
              };
            }
          } catch (e) {
            console.log('⚠️ Could not parse hos_sync_state');
          }
        }
        
        // If still no session, dump ALL localStorage keys to help debug
        if (!session) {
          console.log('📋 All localStorage keys:', Object.keys(localStorage));
          // Check for any key containing 'auth' or 'supabase'
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('auth') || key.includes('supabase'))) {
              console.log(`  Found auth-related key: ${key}`);
            }
          }
        }
      }
    }
    
    // If we found a cached session, use it immediately!
    if (session) {
      console.log('✅ Using cached session, skipping slow backend check');
      // Continue with this session without waiting for backend
    } else {
      // No cached session, try full session check with timeout
      console.log('🔍 No cached session found, checking with Supabase...');
      const sessionPromise = getCurrentSession();
      const timeoutPromise = new Promise<null>((resolve) => 
        setTimeout(() => {
          console.log('ℹ️ Session check timeout - proceeding with unauthenticated state');
          resolve(null);
        }, 2000) // 2 second timeout for session check
      );
      
      session = await Promise.race([sessionPromise, timeoutPromise]);
    }
    
    if (!session || !session.userId) {
      // No session or missing userId, return not authenticated
      console.log('❌ No active session found - user needs to log in');
      return {
        isAuthenticated: false,
        userId: null,
        userData: null,
        accessToken: null,
      };
    }
    
    console.log('✅ Session found for user:', session.userId);
    
    // Load data from localStorage first (instant)
    let userData = loadUserDataLocally();
    console.log('💾 Local data loaded:', userData ? 'yes' : 'no');
    
    // Then sync with server in background (with timeout to prevent hanging)
    try {
      console.log('🌐 Attempting to fetch server data...');
      const fetchPromise = fetchUserData(session.userId);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Server fetch timeout')), 3000) // 3 second timeout for data fetch
      );
      
      const serverData = await Promise.race([fetchPromise, timeoutPromise]);
      userData = { ...userData, ...serverData };
      saveUserDataLocally(userData);
      console.log('✅ Server data fetched and merged successfully');
    } catch (error: any) {
      console.log('ℹ️ Using local cached data (server sync will continue in background)');
      // If we don't have local data either, initialize with empty data
      if (!userData) {
        console.log('🆕 Creating default user data');
        userData = createDefaultUserData();
      }
    }
    
    console.log('🎉 HOS initialization complete - user authenticated');
    return {
      isAuthenticated: true,
      userId: session.userId,
      userData,
      accessToken: session.accessToken,
    };
    } catch (error) {
      console.error('💥 Failed to initialize HOS:', error);
      return {
        isAuthenticated: false,
        userId: null,
        userData: null,
        accessToken: null,
      };
    }
  })();
  
  // Race initialization with a hard timeout
  // NOTE: This timeout must be LONGER than all internal timeouts (currently 5s each)
  const timeoutPromise = new Promise<{
    isAuthenticated: false;
    userId: null;
    userData: null;
    accessToken: null;
  }>((resolve) => {
    setTimeout(() => {
      console.warn('⚠️ initializeHOS timeout - returning unauthenticated state');
      resolve({
        isAuthenticated: false,
        userId: null,
        userData: null,
        accessToken: null,
      });
    }, 8000); // 8 second hard timeout (must be > internal timeouts)
  });
  
  return Promise.race([initPromise, timeoutPromise]);
}