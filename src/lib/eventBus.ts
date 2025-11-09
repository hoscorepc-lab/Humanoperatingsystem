// HOS Event Bus - Central event system for all module communication

export type EventType =
  // Dialogue Events
  | 'DIALOGUE_MESSAGE'
  | 'DIALOGUE_RESPONSE'
  
  // Mind Events
  | 'MIND_ANALYSIS'
  | 'MIND_INSIGHT'
  | 'FOCUS_SCORE_UPDATED'
  | 'LEARNING_RATE_UPDATED'
  
  // Memory Events
  | 'MEMORY_QUERY'
  | 'MEMORY_UPDATE'
  | 'MEMORY_STORED'
  | 'MEMORY_RETRIEVED'
  
  // Kernel Events
  | 'VALUE_ALIGNMENT_CHECK'
  | 'VALUE_DEVIATION_ALERT'
  | 'CORE_VALUE_UPDATED'
  
  // Processes Events
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'TASK_COMPLETED'
  | 'HABIT_STREAK_UPDATED'
  | 'PRODUCTIVITY_METRICS'
  
  // Timeline Events
  | 'MILESTONE_REACHED'
  | 'VERSION_CHECKPOINT'
  | 'EVOLUTION_LOGGED'
  
  // Emotional BIOS Events
  | 'MOOD_RECORDED'
  | 'BIOS_CALIBRATED'
  | 'ENERGY_LEVEL_UPDATED'
  
  // RDP Events
  | 'SESSION_STARTED'
  | 'SESSION_ENDED'
  | 'METRIC_UPDATED'
  
  // Quantum Planner Events
  | 'EVENT_PLANNED'
  | 'ENTROPY_CALCULATED'
  | 'QUANTUM_PROJECTION'
  
  // Reflection Mirror Events
  | 'REFLECTION_RECORDED'
  | 'PATTERN_DETECTED'
  | 'INSIGHT_GENERATED'
  
  // Habit Forge Events
  | 'HABIT_CREATED'
  | 'HABIT_COMPLETED'
  | 'HABIT_STREAK_BROKEN'
  
  // Life Debugger Events
  | 'LIFEDB_DEBUG_ALERT'
  | 'BOTTLENECK_DETECTED'
  | 'OPTIMIZATION_SUGGESTED'
  
  // Parallel Selves Events
  | 'PARALLEL_SIMULATION_RESULT'
  | 'DECISION_PATH_ANALYZED'
  
  // Entropy Compass Events
  | 'ENTROPY_GUIDANCE'
  | 'RISK_MAP_GENERATED'
  
  // Narrative Engine Events
  | 'NARRATIVE_GENERATED'
  | 'STORY_ARC_UPDATED'
  
  // UI Events
  | 'UI_NAVIGATE'
  | 'UI_RENDER_WIDGET'
  | 'MODULE_TOGGLE'
  
  // Shell Events
  | 'SHELL_COMMAND'
  | 'SHELL_RESPONSE'
  
  // Reset Events
  | 'IMMERSIVE_ACTIVATE'
  | 'IMMERSIVE_DEACTIVATE'
  
  // AIgency Events
  | 'AGENT_RUN'
  | 'AGENT_SHARE'
  | 'AGENT_FORK'
  | 'SHARE_CONFIRM'
  
  // Evolver Events
  | 'EVOLVER_ANALYSIS_START'
  | 'EVOLVER_ANALYSIS_COMPLETE'
  | 'EVOLVER_PROPOSAL_START'
  | 'EVOLVER_PROPOSAL_COMPLETE'
  | 'EVOLVER_IMPLEMENTATION_START'
  | 'EVOLVER_IMPLEMENTATION_COMPLETE'
  | 'EVOLVER_IMPLEMENTATION_FAILED'
  | 'EVOLVER_CHANGES_APPLYING'
  | 'EVOLVER_CHANGES_APPLIED'
  | 'EVOLVER_CHANGES_REVERTING'
  | 'EVOLVER_CHANGES_REVERTED'
  | 'EVOLVER_TESTING_START'
  | 'EVOLVER_TESTING_COMPLETE'
  | 'EVOLVER_DECISION_MADE';

export interface HOSEvent {
  type: EventType;
  source: string; // Module that emitted the event
  target?: string; // Specific target module (optional)
  timestamp: Date;
  data: any;
  metadata?: {
    userId?: string;
    sessionId?: string;
    correlationId?: string; // For tracking related events
  };
}

type EventHandler = (event: HOSEvent) => void | Promise<void>;

class EventBus {
  private handlers: Map<EventType, Set<EventHandler>> = new Map();
  private globalHandlers: Set<EventHandler> = new Set();
  private eventHistory: HOSEvent[] = [];
  private maxHistorySize = 1000;

  // Subscribe to specific event types
  on(eventType: EventType, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  // Subscribe to all events
  onAll(handler: EventHandler): () => void {
    this.globalHandlers.add(handler);
    return () => {
      this.globalHandlers.delete(handler);
    };
  }

  // Emit an event
  async emit(event: Omit<HOSEvent, 'timestamp'>): Promise<void> {
    const fullEvent: HOSEvent = {
      ...event,
      timestamp: new Date(),
    };

    // Store in history
    this.eventHistory.push(fullEvent);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Log event (for debugging)
    if (process.env.NODE_ENV === 'development') {
      console.log('[EventBus]', fullEvent.type, fullEvent);
    }

    // Notify specific handlers
    const handlers = this.handlers.get(event.type) || new Set();
    for (const handler of handlers) {
      try {
        await handler(fullEvent);
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
      }
    }

    // Notify global handlers
    for (const handler of this.globalHandlers) {
      try {
        await handler(fullEvent);
      } catch (error) {
        console.error('Error in global event handler:', error);
      }
    }
  }

  // Get event history
  getHistory(filter?: {
    type?: EventType;
    source?: string;
    since?: Date;
    limit?: number;
  }): HOSEvent[] {
    let filtered = [...this.eventHistory];

    if (filter?.type) {
      filtered = filtered.filter(e => e.type === filter.type);
    }
    if (filter?.source) {
      filtered = filtered.filter(e => e.source === filter.source);
    }
    if (filter?.since) {
      filtered = filtered.filter(e => e.timestamp >= filter.since);
    }
    if (filter?.limit) {
      filtered = filtered.slice(-filter.limit);
    }

    return filtered;
  }

  // Clear event history
  clearHistory(): void {
    this.eventHistory = [];
  }
}

// Singleton instance
export const eventBus = new EventBus();

// Helper to create standardized events
export const createEvent = (
  type: EventType,
  source: string,
  data: any,
  target?: string
): Omit<HOSEvent, 'timestamp'> => {
  let sessionId: string | undefined;
  try {
    sessionId = typeof window !== 'undefined' ? window.sessionStorage?.getItem('hos-session-id') || undefined : undefined;
  } catch {
    sessionId = undefined;
  }
  
  return {
    type,
    source,
    target,
    data,
    metadata: {
      sessionId,
    },
  };
};
