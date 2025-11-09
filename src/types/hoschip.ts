// HOS Chip - Cognitive Substrate Types

export interface NeuralArchiveEntry {
  id: string;
  timestamp: string;
  source: string; // Which module created this
  context: string;
  response: string;
  result: 'positive' | 'negative' | 'neutral';
  metadata?: Record<string, any>;
  embedding?: number[]; // Future: vector embeddings
}

export interface ModulePerformanceMetric {
  moduleId: string;
  moduleName: string;
  responseTime: number; // ms
  successRate: number; // 0-1
  userSatisfaction: number; // 0-1
  resourceUsage: number; // 0-1
  lastUpdated: string;
  interactionCount: number;
  totalOperations: number;
  errorRate: number;
  lastError?: string;
}

export interface EvaluationCycle {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  analysisPrompt: string;
  analysisResult?: EvaluationResult;
  tokensUsed?: number;
  error?: string;
}

export interface EvaluationResult {
  summary: string;
  inefficiencies: string[];
  strengths: string[];
  proposedUpdates: ConfigUpdate[];
  crossModuleInsights: CrossModuleInsight[];
  confidenceScore: number; // 0-1
}

export interface ConfigUpdate {
  id: string;
  module: string;
  parameter: string;
  currentValue: any;
  proposedValue: any;
  reasoning: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'proposed' | 'approved' | 'rejected' | 'applied';
  impact: string;
  votes?: {
    thumbsUp: number;
    thumbsDown: number;
    userVotes?: { [userId: string]: 'up' | 'down' };
  };
  proposedAt?: string; // Timestamp when proposed
  patchStatus?: 'pending' | 'approved-patch' | 'denied-patch'; // For patches tab
}

export interface CrossModuleInsight {
  id: string;
  sourceModules: string[];
  insight: string;
  suggestedAction: string;
  potentialImpact: string;
}

export interface SelfPatchLog {
  id: string;
  timestamp: string;
  cycleId: string;
  changesApplied: ConfigUpdate[];
  beforeState: Record<string, any>;
  afterState: Record<string, any>;
  performanceImpact: {
    metric: string;
    before: number;
    after: number;
    delta: number;
  }[];
  rollbackAvailable: boolean;
}

export interface ModuleConfig {
  id: string;
  moduleName: string;
  parameters: Record<string, any>;
  version: string;
  lastUpdated: string;
  evolutionHistory: {
    timestamp: string;
    change: string;
    reason: string;
  }[];
}

export interface CommunicationLog {
  id: string;
  timestamp: string;
  from: string;
  to: string;
  messageType: 'data' | 'request' | 'response' | 'event' | 'command';
  payload: any;
  latency: number; // ms
  success: boolean;
}

export interface ChipMetrics {
  totalInteractions: number;
  activeModules: number;
  averageResponseTime: number;
  systemHealth: number; // 0-1
  learningRate: number;
  evolutionCycles: number;
  successfulPatches: number;
  lastEvaluationDate: string;
  uptime: number;
}

export interface ReinforcementSignal {
  id: string;
  timestamp: string;
  source: string;
  interactionId: string;
  reward: number; // -1 to 1
  reason: string;
  metadata?: Record<string, any>;
}

export interface HOSChipConfig {
  autoEvaluationEnabled: boolean;
  evaluationInterval: number; // hours
  autoPatchEnabled: boolean;
  requireHumanApproval: boolean;
  learningRate: number;
  retentionPeriod: number; // days
  maxArchiveSize: number; // entries
  confidenceThreshold: number; // 0-1 for auto-apply
  enableCrossModuleLearning: boolean;
  modules: {
    [key: string]: {
      enabled: boolean;
      weight: number; // importance in learning
      customParams: Record<string, any>;
    };
  };
}

export interface EvolutionHistory {
  version: string;
  timestamp: string;
  cycleId: string;
  changes: string[];
  performanceDelta: number;
  notes: string;
}
