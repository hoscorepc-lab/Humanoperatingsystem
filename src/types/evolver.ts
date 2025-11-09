export interface EvolutionAnalysis {
  id: string;
  timestamp: Date;
  systemSnapshot: {
    moduleCount: number;
    agentCount: number;
    activeModules: string[];
    performanceMetrics: Record<string, number>;
    errorLogs: ErrorLog[];
    testCoverage: number;
  };
  identifiedIssues: Issue[];
  opportunities: Opportunity[];
  status: 'analyzing' | 'complete' | 'failed';
}

export interface Issue {
  id: string;
  type: 'bug' | 'performance' | 'redundancy' | 'missing-feature' | 'technical-debt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedModules: string[];
  detectedAt: Date;
}

export interface Opportunity {
  id: string;
  type: 'optimization' | 'new-feature' | 'refactor' | 'integration';
  impact: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  potentialBenefit: string;
}

export interface EvolutionProposal {
  id: string;
  analysisId: string;
  timestamp: Date;
  type: 'create-module' | 'modify-module' | 'create-agent' | 'modify-agent' | 'optimize' | 'remove';
  title: string;
  description: string;
  targetModules: string[];
  implementation: {
    files: ProposedFile[];
    dependencies: string[];
    interfaces: ProposedInterface[];
  };
  estimatedImpact: string;
  risks: string[];
  status: 'proposed' | 'approved' | 'rejected' | 'implementing' | 'testing' | 'complete' | 'reverted';
}

export interface ProposedFile {
  path: string;
  action: 'create' | 'modify' | 'delete';
  description: string;
  codeScaffold?: string;
}

export interface ProposedInterface {
  name: string;
  description: string;
  inputs: string[];
  outputs: string[];
}

export interface EvolutionImplementation {
  id: string;
  proposalId: string;
  timestamp: Date;
  changes: CodeChange[];
  status: 'scaffolding' | 'complete' | 'failed';
  generatedCode: GeneratedCode[];
  rollbackData?: RollbackData;
}

export interface CodeChange {
  id: string;
  file: string;
  changeType: 'create' | 'modify' | 'delete';
  description: string;
  preview: string;
  applied: boolean;
}

export interface GeneratedCode {
  file: string;
  content: string;
  purpose: string;
}

export interface RollbackData {
  timestamp: Date;
  backupFiles: { path: string; content: string }[];
  reason?: string;
}

export interface EvolutionTest {
  id: string;
  implementationId: string;
  timestamp: Date;
  testType: 'unit' | 'integration' | 'runtime' | 'performance';
  results: TestResult[];
  overallStatus: 'passing' | 'failing' | 'partial';
  coverageChange?: number;
}

export interface TestResult {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  message?: string;
  stackTrace?: string;
}

export interface EvolutionDecision {
  id: string;
  testId: string;
  timestamp: Date;
  decision: 'accept' | 'revert' | 'adjust';
  reasoning: string[];
  confidence: number;
  manualOverride?: boolean;
  implementedBy: 'evolver' | 'user';
}

export interface ErrorLog {
  id: string;
  timestamp: Date;
  module: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stackTrace?: string;
  count: number;
}

export interface EvolutionCycle {
  id: string;
  startTime: Date;
  endTime?: Date;
  analysis: EvolutionAnalysis;
  proposals: EvolutionProposal[];
  selectedProposal?: EvolutionProposal;
  implementation?: EvolutionImplementation;
  tests?: EvolutionTest;
  decision?: EvolutionDecision;
  status: 'analyzing' | 'proposing' | 'implementing' | 'testing' | 'deciding' | 'complete' | 'failed';
  logs: CycleLog[];
}

export interface CycleLog {
  timestamp: Date;
  phase: string;
  message: string;
  level: 'info' | 'warning' | 'error' | 'success';
}

export interface EvolverConfig {
  autoApprove: boolean;
  maxProposalsPerCycle: number;
  confidenceThreshold: number;
  enabledEvolutionTypes: EvolutionProposal['type'][];
  protectedModules: string[];
  requireManualApproval: boolean;
}

export interface SystemMetrics {
  moduleHealth: Record<string, number>;
  agentPerformance: Record<string, number>;
  errorRate: number;
  testCoverage: number;
  userSatisfaction?: number;
  evolutionCount: number;
  successRate: number;
}
