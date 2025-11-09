// Supabase API Client - Frontend interface to backend

import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-8d51d9e2`;

const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  // Add timeout to prevent hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${error}`);
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - server may be starting up');
    }
    throw error;
  }
};

// ========== REFLECTIONS ==========

export interface Reflection {
  id: string;
  userId?: string;
  content: string;
  mood: number; // 1-10
  energy: number; // 1-10
  clarity: number; // 1-10
  tags?: string[];
  insights?: string[];
  createdAt: string;
}

export const getReflections = async (userId?: string): Promise<Reflection[]> => {
  const endpoint = userId ? `/reflections?userId=${userId}` : '/reflections';
  const data = await fetchAPI(endpoint);
  return data.reflections || [];
};

export const createReflection = async (reflection: Partial<Reflection>, userId?: string): Promise<Reflection> => {
  return fetchAPI('/reflections', {
    method: 'POST',
    body: JSON.stringify({ ...reflection, userId }),
  });
};

// ========== HABITS ==========

export interface Habit {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  category: 'order' | 'balance' | 'chaos';
  entropyImpact: number; // -10 to +10
  frequency: 'daily' | 'weekly' | 'custom';
  currentStreak: number;
  longestStreak: number;
  completions: string[]; // ISO date strings
  createdAt: string;
  updatedAt?: string;
}

export const getHabits = async (userId?: string): Promise<Habit[]> => {
  const endpoint = userId ? `/habits?userId=${userId}` : '/habits';
  const data = await fetchAPI(endpoint);
  return data.habits || [];
};

export const createHabit = async (habit: Partial<Habit>, userId?: string): Promise<Habit> => {
  return fetchAPI('/habits', {
    method: 'POST',
    body: JSON.stringify({ ...habit, userId }),
  });
};

export const updateHabit = async (id: string, updates: Partial<Habit>, userId?: string): Promise<Habit> => {
  return fetchAPI(`/habits/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ ...updates, userId }),
  });
};

// ========== EVENTS (Quantum Planner) ==========

export interface PlannedEvent {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  startTime: string; // ISO datetime
  duration: number; // minutes
  type: 'structured' | 'flexible' | 'exploratory';
  energyImpact: number;
  entropyImpact: number;
  completed?: boolean;
  createdAt: string;
}

export const getEvents = async (userId?: string): Promise<PlannedEvent[]> => {
  const endpoint = userId ? `/events?userId=${userId}` : '/events';
  const data = await fetchAPI(endpoint);
  return data.events || [];
};

export const createEvent = async (event: Partial<PlannedEvent>, userId?: string): Promise<PlannedEvent> => {
  return fetchAPI('/events', {
    method: 'POST',
    body: JSON.stringify({ ...event, userId }),
  });
};

// ========== CORE VALUES ==========

export interface CoreValue {
  id: string;
  userId?: string;
  name: string;
  description: string;
  priority: number; // 1-10
  examples?: string[];
  createdAt: string;
}

export const getValues = async (userId?: string): Promise<CoreValue[]> => {
  const endpoint = userId ? `/values?userId=${userId}` : '/values';
  const data = await fetchAPI(endpoint);
  return data.values || [];
};

export const createValue = async (value: Partial<CoreValue>, userId?: string): Promise<CoreValue> => {
  return fetchAPI('/values', {
    method: 'POST',
    body: JSON.stringify({ ...value, userId }),
  });
};

// ========== MEMORIES ==========

export interface Memory {
  id: string;
  userId?: string;
  content: string;
  type: 'note' | 'insight' | 'conversation' | 'event';
  tags?: string[];
  linkedMemories?: string[];
  importance?: number; // 1-10
  createdAt: string;
}

export const getMemories = async (userId?: string): Promise<Memory[]> => {
  const endpoint = userId ? `/memories?userId=${userId}` : '/memories';
  const data = await fetchAPI(endpoint);
  return data.memories || [];
};

export const createMemory = async (memory: Partial<Memory>, userId?: string): Promise<Memory> => {
  return fetchAPI('/memories', {
    method: 'POST',
    body: JSON.stringify({ ...memory, userId }),
  });
};

// ========== AI INTERACTIONS LOG ==========

export interface AIInteraction {
  module: string;
  userId?: string;
  prompt: string;
  response: string;
  model_used?: string;
  tokens_used?: number;
  latency_ms?: number;
  timestamp?: string;
}

export const logAIInteraction = async (interaction: AIInteraction, userId?: string): Promise<void> => {
  await fetchAPI('/ai-interactions', {
    method: 'POST',
    body: JSON.stringify({ ...interaction, userId }),
  });
};
