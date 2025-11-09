/**
 * Session Auto-Refresh Hook
 * Monitors and refreshes Supabase auth sessions automatically
 */

import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase/client';
import { toast } from 'sonner@2.0.3';

interface UseSessionRefreshOptions {
  onSessionExpired?: () => void;
  onSessionRefreshed?: () => void;
  showNotifications?: boolean;
  enabled?: boolean;
}

export function useSessionRefresh(options: UseSessionRefreshOptions = {}) {
  const {
    onSessionExpired,
    onSessionRefreshed,
    showNotifications = true,
    enabled = true,
  } = options;

  const listenerCleanupRef = useRef<(() => void) | null>(null);
  const optionsRef = useRef(options);
  
  // Keep options ref up to date - no dependency to avoid re-renders
  optionsRef.current = options;

  // Check session validity - stable callback with no dependencies
  const checkSession = useCallback(async () => {
    try {
      // Add timeout to prevent hanging
      const sessionCheckPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise<any>((resolve) => 
        setTimeout(() => {
          console.log('ℹ️ Session validity check taking longer than expected, using cached state');
          resolve({ data: { session: null }, error: { message: 'Timeout' } });
        }, 5000) // Increased to 5 seconds for better reliability
      );
      
      const { data: { session }, error } = await Promise.race([
        sessionCheckPromise,
        timeoutPromise
      ]);
      
      if (error && error.message !== 'Timeout') {
        console.error('Session check error:', error);
        return { valid: false, session: null };
      }
      
      // If timeout, just assume session is still valid (fail gracefully)
      if (error && error.message === 'Timeout') {
        console.log('⏱️ Session check timed out, assuming session is still valid');
        return { valid: true, session: null };
      }

      if (!session) {
        console.log('⚠️ No active session');
        return { valid: false, session: null };
      }

      // Check if session is about to expire (within 5 minutes)
      const expiresAt = session.expires_at;
      if (expiresAt) {
        const expiresIn = expiresAt - Math.floor(Date.now() / 1000);
        if (expiresIn < 300) { // Less than 5 minutes
          console.log(`⚠️ Session expires in ${Math.floor(expiresIn / 60)} minutes`);
          
          // Try to refresh
          const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error('Session refresh error:', refreshError);
            return { valid: false, session: null };
          }

          if (newSession) {
            console.log('✅ Session refreshed successfully');
            if (optionsRef.current.showNotifications) {
              toast.success('Session refreshed', { 
                description: 'Your session has been automatically refreshed' 
              });
            }
            optionsRef.current.onSessionRefreshed?.();
            return { valid: true, session: newSession };
          }
        }
      }

      return { valid: true, session };
    } catch (error) {
      console.error('Session check failed:', error);
      return { valid: false, session: null };
    }
  }, []); // No dependencies - uses ref instead

  // Refresh session manually - stable callback with no dependencies
  const refreshSession = useCallback(async () => {
    try {
      console.log('🔄 Manually refreshing session...');
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Manual refresh error:', error);
        if (optionsRef.current.showNotifications) {
          toast.error('Failed to refresh session', {
            description: error.message,
          });
        }
        return { success: false, error };
      }

      if (session) {
        console.log('✅ Manual session refresh successful');
        if (optionsRef.current.showNotifications) {
          toast.success('Session refreshed');
        }
        optionsRef.current.onSessionRefreshed?.();
        return { success: true, session };
      }

      return { success: false, error: new Error('No session returned') };
    } catch (error: any) {
      console.error('Manual refresh failed:', error);
      return { success: false, error };
    }
  }, []); // No dependencies - uses ref instead

  useEffect(() => {
    // Don't run if disabled
    if (!enabled) {
      console.log('🔐 Session auto-refresh disabled');
      return;
    }

    console.log('🔐 Setting up session auto-refresh...');

    // Initial session check
    checkSession();

    // Set up periodic session checks (every 5 minutes)
    const checkInterval = setInterval(() => {
      checkSession();
    }, 5 * 60 * 1000);

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state changed:', event);

      switch (event) {
        case 'INITIAL_SESSION':
          // Initial session detected on mount - no action needed
          console.log('📋 Initial session loaded');
          break;

        case 'SIGNED_IN':
          console.log('✅ User signed in');
          if (optionsRef.current.showNotifications) {
            toast.success('Signed in successfully');
          }
          break;

        case 'SIGNED_OUT':
          console.log('👋 User signed out - CRITICAL EVENT');
          console.log('Session data:', session);
          console.log('Will call onSessionExpired:', !!optionsRef.current.onSessionExpired);
          optionsRef.current.onSessionExpired?.();
          if (optionsRef.current.showNotifications) {
            toast.info('Session ended', {
              description: 'You have been signed out',
            });
          }
          break;

        case 'TOKEN_REFRESHED':
          console.log('🔄 Token refreshed');
          optionsRef.current.onSessionRefreshed?.();
          break;

        case 'USER_UPDATED':
          console.log('👤 User updated');
          break;

        case 'PASSWORD_RECOVERY':
          console.log('🔑 Password recovery initiated');
          break;
      }
    });

    listenerCleanupRef.current = () => {
      subscription.unsubscribe();
    };

    // Cleanup
    return () => {
      console.log('🔐 Cleaning up session auto-refresh');
      clearInterval(checkInterval);
      if (listenerCleanupRef.current) {
        listenerCleanupRef.current();
      }
    };
  }, [checkSession, enabled]); // Now checkSession is stable with no dependencies

  return {
    checkSession,
    refreshSession,
  };
}
