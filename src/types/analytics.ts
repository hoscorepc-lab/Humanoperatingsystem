/**
 * Analytics Types for HOS
 * Tracks user activity, module usage, and system performance
 */

export interface AnalyticsEvent {
  id: string;
  userId: string;
  timestamp: string;
  eventType: 'module_view' | 'module_interaction' | 'feature_use' | 'session_start' | 'session_end' | 'error';
  moduleId?: string;
  moduleName?: string;
  action?: string;
  metadata?: Record<string, any>;
  duration?: number;
}

export interface ModuleUsageStats {
  moduleId: string;
  moduleName: string;
  viewCount: number;
  totalTimeSpent: number; // in seconds
  lastAccessed: string;
  interactions: number;
  category: 'core' | 'human' | 'research';
}

export interface SessionStats {
  sessionId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  modulesVisited: string[];
  eventsCount: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser?: string;
}

export interface UserActivitySummary {
  userId: string;
  totalSessions: number;
  totalTimeSpent: number;
  favoriteModules: ModuleUsageStats[];
  recentSessions: SessionStats[];
  dailyActivity: DailyActivity[];
  moduleUsage: ModuleUsageStats[];
}

export interface DailyActivity {
  date: string;
  sessionsCount: number;
  timeSpent: number;
  modulesUsed: number;
  eventsCount: number;
}

export interface RealtimeUpdate {
  type: 'analytics' | 'module_state' | 'user_data' | 'notification';
  payload: any;
  timestamp: string;
  userId?: string;
}
