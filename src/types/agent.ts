export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'thinking' | 'executing' | 'learning';
  performance: number;
  tasksCompleted: number;
  learningRate: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  assignedAgent: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  completedAt?: Date;
  result?: string;
}

export interface Evolution {
  id: string;
  timestamp: Date;
  type: 'skill_acquired' | 'performance_improved' | 'strategy_optimized' | 'knowledge_expanded';
  description: string;
  impact: number;
  module: string;
}

export interface Message {
  id: string;
  agentId: string;
  agentName: string;
  content: string;
  timestamp: Date;
  type: 'thought' | 'action' | 'result' | 'collaboration';
}
