import { HOSModule } from '../types/hos';

export const coreModules: HOSModule[] = [
  {
    id: 'dashboard',
    name: 'System Monitor',
    description: 'Overview of system state & performance',
    icon: 'Monitor',
    category: 'core',
    status: 'active'
  },
  {
    id: 'chat',
    name: 'HOS Chat',
    description: 'Chat with your HOS assistant',
    icon: 'MessageCircle',
    category: 'core',
    status: 'active'
  },
  {
    id: 'evolver',
    name: 'Self Update Engine',
    description: 'Growth and transformation system',
    icon: 'Sparkles',
    category: 'core',
    status: 'learning'
  },
  {
    id: 'hos-chip',
    name: 'HOS Chip',
    description: 'Cognitive substrate & neural motherboard',
    icon: 'Cpu',
    category: 'core',
    status: 'active'
  },
  {
    id: 'agent-forge',
    name: 'Agent Forge',
    description: 'Create custom AI agents through conversation',
    icon: 'Sparkles',
    category: 'core',
    status: 'active'
  },
  {
    id: 'agent-factory',
    name: 'Agent Factory',
    description: 'Test and evolve agents privately',
    icon: 'Factory',
    category: 'core',
    status: 'active'
  },
  {
    id: 'agent-marketplace',
    name: 'Agent Marketplace',
    description: 'Discover and share published agents',
    icon: 'Store',
    category: 'core',
    status: 'active'
  },
  {
    id: 'appstudio',
    name: 'AI App Studio',
    description: 'Clone websites as React apps',
    icon: 'Globe',
    category: 'core',
    status: 'active'
  },
  {
    id: 'screenshot',
    name: 'Screenshot to Code',
    description: 'Convert screenshots to code',
    icon: 'Camera',
    category: 'core',
    status: 'active'
  },
  {
    id: 'gcn',
    name: 'Graph Convolutional Networks',
    description: 'Graph neural network research',
    icon: 'Network',
    category: 'core',
    status: 'active'
  },
  {
    id: 'hosgpt',
    name: 'HOS GPT',
    description: 'Train/finetune medium-sized GPTs',
    icon: 'Brain',
    category: 'core',
    status: 'active'
  },
  {
    id: 'financial-research',
    name: 'HOS Financial Research',
    description: 'AI-powered stock market analysis',
    icon: 'TrendingUp',
    category: 'core',
    status: 'active'
  },
  {
    id: 'whitepaper',
    name: 'HOS Whitepaper',
    description: 'Technical documentation & theory',
    icon: 'FileText',
    category: 'core',
    status: 'active'
  },
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    description: 'Track usage patterns and activity',
    icon: 'BarChart3',
    category: 'core',
    status: 'active'
  },
  {
    id: 'agents-arena',
    name: 'Agents Arena',
    description: 'AI trading competition & simulation',
    icon: 'Trophy',
    category: 'core',
    status: 'active'
  }
];

export const humanModules: HOSModule[] = [
  {
    id: 'rdp',
    name: 'Remote Interface',
    description: 'External connection management',
    icon: 'Monitor',
    category: 'human',
    status: 'idle'
  },
  {
    id: 'kernel',
    name: 'Core Values Kernel',
    description: 'Foundational value & belief structures',
    icon: 'Cpu',
    category: 'human',
    status: 'active'
  },
  {
    id: 'mind',
    name: 'Cognitive Core',
    description: 'Real-time cognitive processes monitor',
    icon: 'Brain',
    category: 'human',
    status: 'active'
  },
  {
    id: 'processes',
    name: 'Task Manager',
    description: 'Behavior and habit runtime',
    icon: 'Layers',
    category: 'human',
    status: 'processing'
  },
  {
    id: 'memory',
    name: 'Neural Archive',
    description: 'Knowledge and experience database',
    icon: 'Database',
    category: 'human',
    status: 'active'
  },
  {
    id: 'timeline',
    name: 'Version Control',
    description: 'Life history and revision system',
    icon: 'GitBranch',
    category: 'human',
    status: 'active'
  },
  {
    id: 'parallel-selves',
    name: 'Branch Simulator',
    description: 'Simulates alternate life paths',
    icon: 'GitBranch',
    category: 'human',
    status: 'idle',
    progress: 7
  },
  {
    id: 'life-debugger',
    name: 'Pattern Analyzer',
    description: 'Detects and debugs behavioral loops',
    icon: 'Bug',
    category: 'human',
    status: 'idle',
    progress: 7
  },
  {
    id: 'emotional-bios',
    name: 'Affective Firmware',
    description: 'Regulates emotional baseline settings',
    icon: 'Heart',
    category: 'human',
    status: 'idle',
    progress: 9
  },
  {
    id: 'narrative-engine',
    name: 'Story Compiler',
    description: 'Generates cohesive life narratives',
    icon: 'BookOpen',
    category: 'human',
    status: 'idle'
  },
  {
    id: 'quantum-planner',
    name: 'Probability Mapper',
    description: 'Forecasts multiple possible outcomes',
    icon: 'Atom',
    category: 'human',
    status: 'idle'
  },
  {
    id: 'reflection-mirror',
    name: 'Self-Diagnostics',
    description: 'Deep introspection and performance review',
    icon: 'ScanEye',
    category: 'human',
    status: 'idle'
  },
  {
    id: 'habit-forge',
    name: 'Behavior Constructor',
    description: 'Builds and reinforces behavioral routines',
    icon: 'Zap',
    category: 'human',
    status: 'idle'
  }
];

export const researchModules: HOSModule[] = [
  {
    id: 'core-research',
    name: 'HOS Core Research',
    description: 'Advanced AI research platform',
    icon: 'FlaskConical',
    category: 'research',
    status: 'active'
  },
  {
    id: 'llm',
    name: 'Large Language Models',
    description: 'LLM research, training & experimentation',
    icon: 'Brain',
    category: 'research',
    status: 'active'
  },
  {
    id: 'neural-network',
    name: 'Neural Network Intelligence',
    description: 'Deep learning architecture and training',
    icon: 'Brain',
    category: 'research',
    status: 'active'
  },
  {
    id: 'cosmic-cortex',
    name: 'Cosmic Cortex',
    description: 'Modular active learning system',
    icon: 'Sparkles',
    category: 'research',
    status: 'active'
  },
  {
    id: 'autonomous',
    name: 'HOS Autonomous',
    description: 'Self-evolving conversational AI',
    icon: 'MessageSquare',
    category: 'research',
    status: 'active'
  }
];

export const genesisModules: HOSModule[] = [
  {
    id: 'open-hos',
    name: 'OpenHOS',
    description: 'Not AI',
    icon: 'Lock',
    category: 'genesis',
    status: 'idle'
  }
];

export const allModules = [...coreModules, ...humanModules, ...researchModules, ...genesisModules];