// Supabase Database Schema Types

export interface DBTask {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_agent?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  tags?: string[];
  metadata?: {
    entropy_impact?: number;
    energy_cost?: number;
    estimated_duration?: number;
  };
}

export interface DBHabit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  category: 'order' | 'balanced' | 'chaos';
  frequency: 'daily' | 'weekly' | 'custom';
  entropy_impact: number;
  current_streak: number;
  longest_streak: number;
  completions: string[]; // Array of completion dates (ISO strings)
  created_at: string;
  is_active: boolean;
}

export interface DBReflection {
  id: string;
  user_id: string;
  content: string;
  mood: number; // 1-10
  energy: number; // 1-10
  clarity: number; // 1-10
  tags?: string[];
  insights?: string[];
  created_at: string;
  metadata?: {
    entropy_variance?: number;
    pattern_detected?: string;
  };
}

export interface DBEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  duration: number; // minutes
  event_type: 'structured' | 'flexible' | 'exploratory';
  entropy_impact: number;
  energy_impact: number;
  completed: boolean;
  created_at: string;
}

export interface DBMemory {
  id: string;
  user_id: string;
  content: string;
  memory_type: 'conversation' | 'insight' | 'learning' | 'milestone';
  source_module: string;
  embedding?: number[]; // Vector embedding for semantic search
  tags?: string[];
  created_at: string;
  metadata?: Record<string, any>;
}

export interface DBCoreValue {
  id: string;
  user_id: string;
  name: string;
  description: string;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface DBAgentMetrics {
  id: string;
  user_id: string;
  agent_name: string;
  tasks_completed: number;
  tasks_failed: number;
  average_completion_time: number;
  learning_rate: number;
  focus_score: number;
  last_active: string;
  created_at: string;
  updated_at: string;
  performance_history?: {
    timestamp: string;
    metric: string;
    value: number;
  }[];
}

export interface DBSystemEvent {
  id: string;
  user_id: string;
  event_type: string;
  source_module: string;
  target_module?: string;
  event_data: Record<string, any>;
  created_at: string;
}

export interface DBEntropyLog {
  id: string;
  user_id: string;
  entropy_value: number;
  entropy_state: 'stasis' | 'order' | 'flow' | 'turbulent';
  contributing_factors: {
    module: string;
    impact: number;
  }[];
  created_at: string;
}

export interface DBSession {
  id: string;
  user_id: string;
  session_name: string;
  session_type: 'work' | 'break' | 'exercise' | 'social' | 'learning';
  start_time: string;
  end_time?: string;
  productivity_score?: number;
  metrics?: {
    mood: number;
    energy: number;
    stress: number;
    focus: number;
  };
  created_at: string;
}

export interface DBAIInteraction {
  id: string;
  user_id: string;
  module: string;
  prompt: string;
  response: string;
  model_used: string;
  tokens_used?: number;
  latency_ms?: number;
  created_at: string;
  metadata?: {
    sentiment?: string;
    intent?: string;
    context?: string[];
  };
}

export interface DBWidgetFlow {
  id: string;
  user_id: string;
  name: string;
  description: string;
  nodes: any[];
  edges: any[];
  category: 'automation' | 'ai-workflow' | 'data-processing' | 'custom';
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// Database table names
export const TABLES = {
  TASKS: 'hos_tasks',
  HABITS: 'hos_habits',
  REFLECTIONS: 'hos_reflections',
  EVENTS: 'hos_events',
  MEMORIES: 'hos_memories',
  CORE_VALUES: 'hos_core_values',
  AGENT_METRICS: 'hos_agent_metrics',
  SYSTEM_EVENTS: 'hos_system_events',
  ENTROPY_LOGS: 'hos_entropy_logs',
  SESSIONS: 'hos_sessions',
  AI_INTERACTIONS: 'hos_ai_interactions',
} as const;
