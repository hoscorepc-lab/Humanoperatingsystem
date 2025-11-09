export interface AgentManifest {
  id: string;
  userId: string;
  name: string;
  purpose: string;
  personality: string;
  tone: 'professional' | 'friendly' | 'creative' | 'technical' | 'casual';
  avatar?: string;
  promptLogic: string;
  systemPrompt: string;
  status: 'draft' | 'factory' | 'published';
  version: string;
  createdAt: string;
  updatedAt: string;
  modelConfig: {
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
  };
  capabilities: string[];
  restrictions: string[];
  metadata: {
    description: string;
    tags: string[];
    category: string;
  };
}

export interface AgentCreationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface AgentCreationSession {
  sessionId: string;
  userId: string;
  messages: AgentCreationMessage[];
  currentStep: 'initial' | 'defining' | 'configuring' | 'reviewing' | 'complete';
  draftAgent: Partial<AgentManifest>;
  createdAt: string;
}

export interface AgentForgeState {
  activeSession: AgentCreationSession | null;
  userAgents: AgentManifest[];
  selectedAgent: AgentManifest | null;
  isCreating: boolean;
  agentLimit: number;
  agentCount: number;
}

export interface CreateAgentRequest {
  userId: string;
  message: string;
  sessionId?: string;
  draftAgent?: Partial<AgentManifest>;
}

export interface CreateAgentResponse {
  sessionId: string;
  message: string;
  draftAgent: Partial<AgentManifest>;
  isComplete: boolean;
  nextStep: string;
}
