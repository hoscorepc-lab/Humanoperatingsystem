/**
 * Analytics Hook
 * Provides easy access to analytics tracking
 */

import { useEffect, useCallback, useRef } from 'react';
import {
  startSession,
  endSession,
  trackModuleView,
  trackModuleInteraction,
  trackFeatureUse,
} from '../analytics/service';

interface UseAnalyticsOptions {
  userId?: string | null;
  enabled?: boolean;
}

export function useAnalytics(options?: UseAnalyticsOptions) {
  const { userId, enabled = true } = options || {};
  const sessionIdRef = useRef<string | null>(null);
  const currentModuleRef = useRef<string | null>(null);
  const moduleStartTimeRef = useRef<number | null>(null);

  // Start session on mount
  useEffect(() => {
    if (!enabled || !userId) return;

    console.log('📊 Starting analytics session for user:', userId);
    sessionIdRef.current = startSession(userId);

    // End session on unmount or page unload
    const handleUnload = () => {
      if (sessionIdRef.current) {
        endSession(userId);
      }
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      handleUnload();
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [userId, enabled]);

  // Track module view
  const trackModule = useCallback((moduleId: string, moduleName: string) => {
    if (!enabled || !userId) return;

    // End previous module tracking if exists
    if (currentModuleRef.current && moduleStartTimeRef.current) {
      const duration = Math.floor((Date.now() - moduleStartTimeRef.current) / 1000);
      trackModuleView(userId, currentModuleRef.current, moduleName);
    }

    // Start new module tracking
    currentModuleRef.current = moduleId;
    moduleStartTimeRef.current = Date.now();
    
    trackModuleView(userId, moduleId, moduleName);
    console.log(`📊 Tracked module view: ${moduleName}`);
  }, [userId, enabled]);

  // Track interaction
  const trackInteraction = useCallback((moduleId: string, moduleName: string, action: string) => {
    if (!enabled || !userId) return;

    trackModuleInteraction(userId, moduleId, moduleName, action);
    console.log(`📊 Tracked interaction: ${action} in ${moduleName}`);
  }, [userId, enabled]);

  // Track feature
  const trackFeature = useCallback((feature: string, metadata?: Record<string, any>) => {
    if (!enabled || !userId) return;

    trackFeatureUse(userId, feature, metadata);
    console.log(`📊 Tracked feature: ${feature}`, metadata);
  }, [userId, enabled]);

  return {
    trackModule,
    trackInteraction,
    trackFeature,
  };
}
