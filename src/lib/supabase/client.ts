import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

// Create truly persistent Supabase client that survives HMR
// Store in window to persist across module reloads
declare global {
  interface Window {
    __supabaseClient?: ReturnType<typeof createSupabaseClient>;
  }
}

export const getSupabaseClient = () => {
  // Check window cache first (persists across HMR)
  if (typeof window !== 'undefined' && window.__supabaseClient) {
    console.log('♻️  Reusing cached Supabase client');
    return window.__supabaseClient;
  }
  
  console.log('🔌 Creating Supabase client...', { 
    projectId: projectId || 'MISSING', 
    hasAnonKey: !!publicAnonKey,
    anonKeyLength: publicAnonKey?.length || 0
  });
  
  if (!projectId) {
    const error = new Error('Missing Supabase projectId - check utils/supabase/info.tsx');
    console.error('❌', error.message);
    throw error;
  }
  
  if (!publicAnonKey) {
    const error = new Error('Missing Supabase publicAnonKey - check utils/supabase/info.tsx');
    console.error('❌', error.message);
    throw error;
  }
  
  try {
    const client = createSupabaseClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false, // Disable to prevent potential hangs
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          storageKey: `hos-auth-${projectId}`,
        },
      }
    );
    console.log('✅ Supabase client created successfully');
    
    // Cache in window for HMR persistence
    if (typeof window !== 'undefined') {
      window.__supabaseClient = client;
    }
    
    return client;
  } catch (error: any) {
    console.error('❌ CRITICAL: Failed to create Supabase client:', {
      error: error?.message || String(error),
      stack: error?.stack,
    });
    throw error;
  }
};

// Don't create the client immediately - wait for first use
// This prevents synchronous errors during module loading
let _supabase: ReturnType<typeof createSupabaseClient> | null = null;

export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(target, prop) {
    if (!_supabase) {
      try {
        _supabase = getSupabaseClient();
      } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
        // Return a no-op to prevent crashes
        return () => Promise.reject(error);
      }
    }
    return (_supabase as any)[prop];
  }
});
