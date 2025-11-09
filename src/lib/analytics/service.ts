/**
 * Analytics Service
 * Tracks and analyzes user activity across HOS
 */

import { AnalyticsEvent, ModuleUsageStats, SessionStats, UserActivitySummary, DailyActivity } from '../../types/analytics';

// In-memory storage for analytics (persisted to localStorage)
const ANALYTICS_STORAGE_KEY = 'hos_analytics_data';
const SESSION_STORAGE_KEY = 'hos_current_session';

interface AnalyticsStore {
  events: AnalyticsEvent[];
  sessions: SessionStats[];
  currentSession: SessionStats | null;
}

// Helper to detect device type
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

// Helper to detect browser
function getBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Unknown';
}

// Load analytics data from localStorage
function loadAnalyticsData(): AnalyticsStore {
  try {
    const stored = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load analytics data:', error);
  }
  return { events: [], sessions: [], currentSession: null };
}

// Save analytics data to localStorage
function saveAnalyticsData(data: AnalyticsStore): void {
  try {
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save analytics data:', error);
  }
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Start a new analytics session
 */
export function startSession(userId: string): string {
  const data = loadAnalyticsData();
  
  const sessionId = generateId();
  const session: SessionStats = {
    sessionId,
    startTime: new Date().toISOString(),
    modulesVisited: [],
    eventsCount: 0,
    deviceType: getDeviceType(),
    browser: getBrowser(),
  };
  
  data.currentSession = session;
  data.sessions.push(session);
  
  // Track session start event
  trackEvent({
    userId,
    eventType: 'session_start',
    metadata: { sessionId, deviceType: session.deviceType, browser: session.browser },
  });
  
  saveAnalyticsData(data);
  return sessionId;
}

/**
 * End the current session
 */
export function endSession(userId: string): void {
  const data = loadAnalyticsData();
  
  if (data.currentSession) {
    const endTime = new Date().toISOString();
    const startTime = new Date(data.currentSession.startTime).getTime();
    const duration = Math.floor((Date.now() - startTime) / 1000);
    
    data.currentSession.endTime = endTime;
    data.currentSession.duration = duration;
    
    // Track session end event
    trackEvent({
      userId,
      eventType: 'session_end',
      duration,
      metadata: { sessionId: data.currentSession.sessionId },
    });
    
    data.currentSession = null;
    saveAnalyticsData(data);
  }
}

/**
 * Track an analytics event
 */
export function trackEvent(params: {
  userId: string;
  eventType: AnalyticsEvent['eventType'];
  moduleId?: string;
  moduleName?: string;
  action?: string;
  metadata?: Record<string, any>;
  duration?: number;
}): void {
  const data = loadAnalyticsData();
  
  const event: AnalyticsEvent = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    ...params,
  };
  
  data.events.push(event);
  
  // Update current session
  if (data.currentSession) {
    data.currentSession.eventsCount++;
    if (params.moduleId && !data.currentSession.modulesVisited.includes(params.moduleId)) {
      data.currentSession.modulesVisited.push(params.moduleId);
    }
  }
  
  // Keep only last 10000 events
  if (data.events.length > 10000) {
    data.events = data.events.slice(-10000);
  }
  
  saveAnalyticsData(data);
}

/**
 * Track module view
 */
export function trackModuleView(userId: string, moduleId: string, moduleName: string): void {
  trackEvent({
    userId,
    eventType: 'module_view',
    moduleId,
    moduleName,
  });
}

/**
 * Track module interaction
 */
export function trackModuleInteraction(userId: string, moduleId: string, moduleName: string, action: string): void {
  trackEvent({
    userId,
    eventType: 'module_interaction',
    moduleId,
    moduleName,
    action,
  });
}

/**
 * Track feature usage
 */
export function trackFeatureUse(userId: string, feature: string, metadata?: Record<string, any>): void {
  trackEvent({
    userId,
    eventType: 'feature_use',
    action: feature,
    metadata,
  });
}

/**
 * Get module usage statistics
 */
export function getModuleUsageStats(moduleId: string): ModuleUsageStats | null {
  const data = loadAnalyticsData();
  
  const moduleEvents = data.events.filter(e => e.moduleId === moduleId);
  if (moduleEvents.length === 0) return null;
  
  const viewCount = moduleEvents.filter(e => e.eventType === 'module_view').length;
  const interactions = moduleEvents.filter(e => e.eventType === 'module_interaction').length;
  const totalTimeSpent = moduleEvents.reduce((sum, e) => sum + (e.duration || 0), 0);
  const lastAccessed = moduleEvents[moduleEvents.length - 1]?.timestamp || '';
  const moduleName = moduleEvents[0]?.moduleName || '';
  
  return {
    moduleId,
    moduleName,
    viewCount,
    totalTimeSpent,
    lastAccessed,
    interactions,
    category: 'core', // This should be determined by module data
  };
}

/**
 * Get user activity summary
 */
export function getUserActivitySummary(userId: string): UserActivitySummary {
  const data = loadAnalyticsData();
  
  const userEvents = data.events.filter(e => e.userId === userId);
  const userSessions = data.sessions.filter(s => 
    userEvents.some(e => e.metadata?.sessionId === s.sessionId)
  );
  
  // Calculate daily activity
  const dailyMap = new Map<string, DailyActivity>();
  userEvents.forEach(event => {
    const date = event.timestamp.split('T')[0];
    if (!dailyMap.has(date)) {
      dailyMap.set(date, {
        date,
        sessionsCount: 0,
        timeSpent: 0,
        modulesUsed: 0,
        eventsCount: 0,
      });
    }
    const day = dailyMap.get(date)!;
    day.eventsCount++;
    if (event.duration) day.timeSpent += event.duration;
  });
  
  // Count unique modules per day
  userSessions.forEach(session => {
    const date = session.startTime.split('T')[0];
    if (dailyMap.has(date)) {
      const day = dailyMap.get(date)!;
      day.sessionsCount++;
      day.modulesUsed = Math.max(day.modulesUsed, session.modulesVisited.length);
    }
  });
  
  const dailyActivity = Array.from(dailyMap.values()).sort((a, b) => 
    b.date.localeCompare(a.date)
  );
  
  // Calculate module usage
  const moduleMap = new Map<string, ModuleUsageStats>();
  userEvents.forEach(event => {
    if (event.moduleId) {
      if (!moduleMap.has(event.moduleId)) {
        moduleMap.set(event.moduleId, {
          moduleId: event.moduleId,
          moduleName: event.moduleName || '',
          viewCount: 0,
          totalTimeSpent: 0,
          lastAccessed: event.timestamp,
          interactions: 0,
          category: 'core',
        });
      }
      const stats = moduleMap.get(event.moduleId)!;
      if (event.eventType === 'module_view') stats.viewCount++;
      if (event.eventType === 'module_interaction') stats.interactions++;
      if (event.duration) stats.totalTimeSpent += event.duration;
      if (event.timestamp > stats.lastAccessed) stats.lastAccessed = event.timestamp;
    }
  });
  
  const moduleUsage = Array.from(moduleMap.values()).sort((a, b) => 
    b.viewCount - a.viewCount
  );
  
  const totalTimeSpent = userSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  
  return {
    userId,
    totalSessions: userSessions.length,
    totalTimeSpent,
    favoriteModules: moduleUsage.slice(0, 5),
    recentSessions: userSessions.slice(-10).reverse(),
    dailyActivity: dailyActivity.slice(0, 30), // Last 30 days
    moduleUsage,
  };
}

/**
 * Get current session
 */
export function getCurrentSession(): SessionStats | null {
  const data = loadAnalyticsData();
  return data.currentSession;
}

/**
 * Clear all analytics data
 */
export function clearAnalyticsData(): void {
  localStorage.removeItem(ANALYTICS_STORAGE_KEY);
  localStorage.removeItem(SESSION_STORAGE_KEY);
}
