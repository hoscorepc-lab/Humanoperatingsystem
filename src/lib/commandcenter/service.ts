import { publicAnonKey, projectId } from '../../utils/supabase/info';

interface CommandResult {
  response: string;
  action?: {
    type: string;
    payload: any;
  };
}

interface CommandIntent {
  category: 'navigation' | 'creation' | 'analysis' | 'query' | 'action' | 'orchestration';
  targetModule?: string;
  operation?: string;
  parameters?: any;
}

/**
 * Process natural language command using OpenAI
 */
export async function processCommand(
  input: string,
  suggestedCategory?: string
): Promise<CommandResult> {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-8d51d9e2/command-center`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ 
          input,
          suggestedCategory
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Command processing error:', error);
      throw new Error(`Failed to process command: ${error}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error processing command:', error);
    
    // Fallback response
    return {
      response: `I understand you want to: "${input}". This feature is being processed. Try using the navigation commands or specific module names for now.`,
    };
  }
}

/**
 * Parse command intent locally (fallback)
 */
export function parseCommandIntent(input: string): CommandIntent {
  const lowerInput = input.toLowerCase();

  // Navigation patterns
  const navPatterns = [
    { pattern: /go to|open|show|navigate to|switch to/i, category: 'navigation' as const },
    { pattern: /agent factory|factory/i, module: 'agent-factory' },
    { pattern: /kernel|core values/i, module: 'kernel' },
    { pattern: /memory|memories/i, module: 'memory' },
    { pattern: /arena|trading/i, module: 'agents-arena' },
    { pattern: /marketplace|market/i, module: 'agent-marketplace' },
    { pattern: /timeline|history/i, module: 'timeline' },
    { pattern: /chat|hos gpt|hosgpt/i, module: 'hos-gpt' },
    { pattern: /processes|tasks/i, module: 'processes' },
    { pattern: /mind|thoughts/i, module: 'mind' },
  ];

  // Check for navigation
  if (/go to|open|show|navigate|switch/i.test(lowerInput)) {
    for (const { pattern, module } of navPatterns.slice(1)) {
      if (pattern.test(lowerInput)) {
        return {
          category: 'navigation',
          targetModule: module,
        };
      }
    }
  }

  // Creation patterns
  if (/create|make|build|new|generate/i.test(lowerInput)) {
    if (/agent/i.test(lowerInput)) {
      return {
        category: 'creation',
        targetModule: 'agent-factory',
        operation: 'create-agent',
      };
    }
    if (/process|task/i.test(lowerInput)) {
      return {
        category: 'creation',
        targetModule: 'processes',
        operation: 'create-process',
      };
    }
  }

  // Analysis patterns
  if (/analyze|analysis|insights|performance|stats/i.test(lowerInput)) {
    return {
      category: 'analysis',
      operation: 'analyze',
    };
  }

  // Query patterns
  if (/show|what|how many|list|display/i.test(lowerInput)) {
    return {
      category: 'query',
      operation: 'query',
    };
  }

  // Default to action
  return {
    category: 'action',
  };
}

/**
 * Get smart suggestions based on current context
 */
export function getSmartSuggestions(context?: {
  currentModule?: string;
  recentModules?: string[];
  userPreferences?: any;
}): string[] {
  const baseSuggestions = [
    'Create an AI agent for research',
    'Show my timeline',
    'Analyze my progress this week',
    'Go to Agent Factory',
    'What tasks are pending?',
  ];

  // Add context-aware suggestions
  if (context?.currentModule === 'agent-factory') {
    return [
      'Create a new trading agent',
      'List all my agents',
      'Show agent performance',
      ...baseSuggestions.slice(1),
    ];
  }

  if (context?.currentModule === 'processes') {
    return [
      'Create a new task',
      'Show pending processes',
      'Mark task as complete',
      ...baseSuggestions.slice(1),
    ];
  }

  return baseSuggestions;
}
