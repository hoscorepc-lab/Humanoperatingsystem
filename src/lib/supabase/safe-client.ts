/**
 * Safe Supabase Client - Defensive initialization with fallbacks
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

// Create a singleton client
let clientInstance: ReturnType<typeof createSupabaseClient> | null = null;
let clientError: Error | null = null;

/**
 * Get Supabase client with comprehensive error handling
 */
export function getSafeSupabaseClient() {
  // If we already tried and failed, return the same error
  if (clientError) {
    console.error('❌ Supabase client creation previously failed:', clientError.message);
    throw clientError;
  }
  
  // If we already have a client, return it
  if (clientInstance) {
    return clientInstance;
  }
  
  try {
    console.log('🔌 Creating Supabase client...', {
      hasProjectId: !!projectId,
      hasAnonKey: !!publicAnonKey,
      projectId: projectId || 'MISSING',
    });
    
    // Validate credentials
    if (!projectId) {
      throw new Error('Supabase projectId is missing or undefined');
    }
    
    if (!publicAnonKey) {
      throw new Error('Supabase publicAnonKey is missing or undefined');
    }
    
    // Create the client
    clientInstance = createSupabaseClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false, // Disable URL detection for safety
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          storageKey: `hos-auth-${projectId}`,
        },
      }
    );
    
    console.log('✅ Supabase client created successfully');
    return clientInstance;
    
  } catch (error: any) {
    clientError = error instanceof Error ? error : new Error(String(error));
    console.error('❌ CRITICAL: Failed to create Supabase client:', {
      error: clientError.message,
      stack: clientError.stack,
    });
    throw clientError;
  }
}

/**
 * Reset the client (useful for testing or recovery)
 */
export function resetSupabaseClient() {
  console.log('🔄 Resetting Supabase client...');
  clientInstance = null;
  clientError = null;
}
