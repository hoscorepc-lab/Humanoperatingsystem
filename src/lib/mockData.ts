import { Agent, Task, Evolution, Message } from '../types/agent';

export const coreModules = [
  { id: 'dashboard', name: 'Dashboard', description: 'System Overview' },
  { id: 'chat', name: 'HOS Chat', description: 'AI Conversation' },
  { id: 'evolver', name: 'Evolver', description: 'Self-Improvement' },
  { id: 'wallet', name: 'HOS Wallet', description: 'Solana Wallet' },
  { id: 'screenshot', name: 'Screenshot to Code', description: 'Visual Coding' },
  { id: 'llm', name: 'Large Language Models', description: 'AI Models' },
  { id: 'hos-chip', name: 'HOS Chip', description: 'Hardware AI' },
  { id: 'neural-network', name: 'Neural Network', description: 'Deep Learning' },
  { id: 'appstudio', name: 'AI App Studio', description: 'Build Apps' },
  { id: 'hosgpt', name: 'HOSGPT', description: 'Advanced AI' },
  { id: 'financial-research', name: 'Financial Research', description: 'Market Analysis' },
  { id: 'whitepaper', name: 'Whitepaper', description: 'Documentation' },
  { id: 'public-apis', name: 'Public APIs', description: 'API Integration' },
  { id: 'gcn', name: 'Graph Networks', description: 'Graph ML' },
];

export const humanModules = [
  { id: 'kernel', name: 'Kernel', description: 'Core System', progress: 8 },
  { id: 'processes', name: 'Processes', description: 'Task Management', progress: 6 },
  { id: 'parallel-selves', name: 'Parallel Selves', description: 'Identity', progress: 4 },
  { id: 'life-debugger', name: 'Life Debugger', description: 'Problem Solving', progress: 7 },
  { id: 'emotional-bios', name: 'Emotional BIOS', description: 'Emotions', progress: 5 },
  { id: 'narrative-engine', name: 'Narrative Engine', description: 'Story', progress: 6 },
  { id: 'memory', name: 'Memory', description: 'Knowledge Base', progress: 9 },
  { id: 'timeline', name: 'Timeline', description: 'Life History', progress: 7 },
  { id: 'quantum-planner', name: 'Quantum Planner', description: 'Future Planning', progress: 5 },
  { id: 'reflection-mirror', name: 'Reflection Mirror', description: 'Self-Awareness', progress: 6 },
  { id: 'habit-forge', name: 'Habit Forge', description: 'Habits', progress: 8 },
  { id: 'rdp', name: 'RDP', description: 'Remote Desktop', progress: 6 },
];

export const researchModules = [
  { id: 'core-research', name: 'Core Research', description: 'Research Papers' },
  { id: 'cosmic-cortex', name: 'Cosmic Cortex', description: 'Universal Intelligence' },
  { id: 'autonomous', name: 'Autonomous', description: 'Self-Direction' },
  { id: 'deep-chat', name: 'Deep Chat', description: 'Advanced Chat' },
];

export const initialAgents: Agent[] = [
  {
    id: 'planner',
    name: 'Planner Agent',
    role: 'Strategic Planning & Task Decomposition',
    status: 'thinking',
    performance: 87,
    tasksCompleted: 156,
    learningRate: 0.92
  },
  {
    id: 'executor',
    name: 'Executor Agent',
    role: 'Task Execution & Implementation',
    status: 'executing',
    performance: 91,
    tasksCompleted: 243,
    learningRate: 0.88
  },
  {
    id: 'critic',
    name: 'Critic Agent',
    role: 'Quality Control & Optimization',
    status: 'idle',
    performance: 85,
    tasksCompleted: 189,
    learningRate: 0.95
  },
  {
    id: 'learner',
    name: 'Learner Agent',
    role: 'Pattern Recognition & Knowledge Synthesis',
    status: 'learning',
    performance: 89,
    tasksCompleted: 134,
    learningRate: 0.97
  }
];

export const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Optimize code performance',
    description: 'Review and optimize the current codebase for better performance',
    status: 'completed',
    assignedAgent: 'executor',
    priority: 'high',
    createdAt: new Date(Date.now() - 3600000),
    completedAt: new Date(Date.now() - 1800000),
    result: 'Successfully optimized 15 functions, reducing execution time by 34%'
  },
  {
    id: '2',
    title: 'Learn new design patterns',
    description: 'Study and incorporate modern design patterns into the knowledge base',
    status: 'in-progress',
    assignedAgent: 'learner',
    priority: 'medium',
    createdAt: new Date(Date.now() - 7200000)
  },
  {
    id: '3',
    title: 'Create project roadmap',
    description: 'Develop a comprehensive roadmap for the next quarter',
    status: 'in-progress',
    assignedAgent: 'planner',
    priority: 'high',
    createdAt: new Date(Date.now() - 1800000)
  },
  {
    id: '4',
    title: 'Implement error handling system',
    description: 'Add comprehensive error handling across all modules',
    status: 'pending',
    assignedAgent: 'executor',
    priority: 'medium',
    createdAt: new Date(Date.now() - 900000)
  },
  {
    id: '5',
    title: 'Optimize memory usage',
    description: 'Analyze and reduce memory footprint of active processes',
    status: 'pending',
    assignedAgent: 'critic',
    priority: 'low',
    createdAt: new Date(Date.now() - 600000)
  }
];

export const initialEvolutions: Evolution[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 86400000),
    type: 'skill_acquired',
    description: 'Mastered async/await patterns for better concurrent task handling',
    impact: 8.5,
    module: 'Executor Agent'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 172800000),
    type: 'performance_improved',
    description: 'Reduced average task completion time by 23%',
    impact: 9.2,
    module: 'Planner Agent'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 259200000),
    type: 'strategy_optimized',
    description: 'Implemented collaborative problem-solving between agents',
    impact: 7.8,
    module: 'Critic Agent'
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 345600000),
    type: 'knowledge_expanded',
    description: 'Integrated 47 new problem-solving heuristics',
    impact: 8.9,
    module: 'Learner Agent'
  }
];

export const initialMessages: Message[] = [
  {
    id: '1',
    agentId: 'planner',
    agentName: 'Planner Agent',
    content: 'Analyzing task: Optimize code performance. Breaking down into subtasks...',
    timestamp: new Date(Date.now() - 3600000),
    type: 'thought'
  },
  {
    id: '2',
    agentId: 'executor',
    agentName: 'Executor Agent',
    content: 'Received task assignment. Initiating performance analysis...',
    timestamp: new Date(Date.now() - 3500000),
    type: 'action'
  },
  {
    id: '3',
    agentId: 'critic',
    agentName: 'Critic Agent',
    content: 'Suggesting alternative approach: Focus on I/O operations first for maximum impact',
    timestamp: new Date(Date.now() - 3400000),
    type: 'collaboration'
  },
  {
    id: '4',
    agentId: 'executor',
    agentName: 'Executor Agent',
    content: 'Optimization complete. Performance improved by 34%. Requesting quality review.',
    timestamp: new Date(Date.now() - 1800000),
    type: 'result'
  }
];