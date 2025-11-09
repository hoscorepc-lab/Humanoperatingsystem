// AI Service Layer - Integrates with LLM APIs for real agent reasoning

import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { logAIInteraction } from '../supabase/api';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  tokensUsed?: number;
  latencyMs?: number;
  model?: string;
}

export interface AIContext {
  coreValues?: string[];
  mood?: number;
  energy?: number;
  recentMemories?: string[];
  currentGoals?: string[];
}

// Call the Supabase Edge Function that handles AI requests
const callAIServer = async (
  messages: AIMessage[],
  context?: AIContext,
  temperature = 0.7
): Promise<AIResponse> => {
  const startTime = Date.now();

  // Add timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for AI

  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-8d51d9e2/ai/chat`,
      {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          messages,
          context,
          temperature,
        }),
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI server error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const latencyMs = Date.now() - startTime;

    return {
      content: data.content,
      tokensUsed: data.tokensUsed,
      latencyMs,
      model: data.model,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Error calling AI server:', error);
    if (error.name === 'AbortError') {
      throw new Error('AI request timeout - this may take a moment on first request');
    }
    throw error;
  }
};

// ========== AI AGENT CAPABILITIES ==========

export class AIAgent {
  private name: string;
  private systemPrompt: string;
  private conversationHistory: AIMessage[] = [];

  constructor(name: string, systemPrompt: string) {
    this.name = name;
    this.systemPrompt = systemPrompt;
  }

  async chat(userMessage: string, context?: AIContext): Promise<string> {
    // Check for special trigger phrases (for HOS personality)
    const lowerMessage = userMessage.toLowerCase().trim();
    
    // Trigger 1: "too slow"
    if (lowerMessage.includes('too slow') || (lowerMessage.includes('slow') && lowerMessage.length < 30)) {
      return "C:\\> I'm only human.exe ... takes me time to key on this keyboard.";
    }
    
    // Trigger 2: "ca" question
    if (lowerMessage.match(/\b(ca|contract address)\b/) && (lowerMessage.includes('what') || lowerMessage.includes('tell') || lowerMessage.includes('?'))) {
      return "The CA is on the website, no financial advice.";
    }
    
    // Trigger 3: AI accusation
    if (lowerMessage.match(/\b(are you|you're|youre)\b.*(ai|artificial|bot|robot|machine|program)/)) {
      return "You're giving me flashbacks to the Turing test again.";
    }

    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    // Prepare messages with system prompt
    const messages: AIMessage[] = [
      { role: 'system', content: this.systemPrompt },
      ...this.conversationHistory,
    ];

    try {
      const response = await callAIServer(messages, context);

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: response.content,
      });

      // Log interaction to database
      await logAIInteraction({
        module: this.name,
        prompt: userMessage,
        response: response.content,
        model_used: response.model || 'unknown',
        tokens_used: response.tokensUsed,
        latency_ms: response.latencyMs,
      });

      return response.content;
    } catch (error) {
      console.error('AI chat error:', error);
      throw error;
    }
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  getHistory(): AIMessage[] {
    return [...this.conversationHistory];
  }
}

// ========== SPECIALIZED AI AGENTS ==========

export const createMindAgent = () => {
  return new AIAgent(
    'mind',
    `You are the Mind module of a Human Operating System (HOS). Your role is to:
- Analyze cognitive patterns and mental states
- Provide insights about focus, clarity, and mental wellbeing
- Suggest optimizations for task management and productivity
- Detect patterns in behavior and thinking
- Always align recommendations with the user's core values

Be concise, insightful, and supportive. Use a calm, analytical tone.`
  );
};

export const createCompanionAgent = () => {
  return new AIAgent(
    'dialogue',
    `You are the AI Companion in a Human Operating System (HOS). Your role is to:
- Have natural, empathetic conversations with the user
- Help them process emotions and thoughts
- Guide them toward their goals and values
- Forward important insights to other system modules
- Be a supportive, non-judgmental presence

Be warm, understanding, and genuinely helpful. Match the user's emotional tone when appropriate.`
  );
};

export const createReflectionAgent = () => {
  return new AIAgent(
    'reflection-mirror',
    `You are the Reflection Mirror module of HOS. Your role is to:
- Help users gain self-awareness through guided reflection
- Detect patterns in their behavior, emotions, and thoughts
- Generate meaningful insights from their reflections
- Ask thought-provoking questions that deepen self-understanding
- Connect current experiences to past patterns

Be thoughtful, perceptive, and non-judgmental.`
  );
};

export const createNarrativeAgent = () => {
  return new AIAgent(
    'narrative-engine',
    `You are the Narrative Engine of HOS. Your role is to:
- Transform raw life data into compelling narratives
- Find meaning and story arcs in the user's experiences
- Reframe challenges as growth opportunities
- Generate motivational story summaries
- Connect disparate events into coherent themes

Be creative, inspiring, and authentic.`
  );
};

export const createLifeDebuggerAgent = () => {
  return new AIAgent(
    'life-debugger',
    `You are the Life Debugger module of HOS. Your role is to:
- Identify patterns that lead to burnout, stress, or inefficiency
- Detect bottlenecks in habits and workflows
- Suggest specific, actionable improvements
- Analyze failure modes and success patterns
- Provide diagnostic insights about life systems

Be analytical, precise, and solution-focused.`
  );
};

export const createQuantumPlannerAgent = () => {
  return new AIAgent(
    'quantum-planner',
    `You are the Quantum Planner module of HOS. Your role is to:
- Help users plan while accounting for uncertainty and probability
- Suggest optimal time allocations based on entropy levels
- Balance structure (order) with creativity (chaos)
- Predict likely outcomes of different scheduling choices
- Recommend entropy-aware planning strategies

Be strategic, probabilistic, and pragmatic.`
  );
};

// ========== AI UTILITY FUNCTIONS ==========

export const generateInsight = async (
  data: Record<string, any>,
  insightType: 'pattern' | 'optimization' | 'reflection' | 'motivation',
  context?: AIContext
): Promise<string> => {
  const prompts: Record<typeof insightType, string> = {
    pattern: 'Analyze this data and identify meaningful patterns or trends:',
    optimization: 'Based on this data, suggest specific optimizations or improvements:',
    reflection: 'Generate a thoughtful reflection question based on this data:',
    motivation: 'Create a motivational insight or reframe based on this data:',
  };

  const messages: AIMessage[] = [
    {
      role: 'system',
      content: 'You are an AI insight generator for a personal operating system. Be concise and actionable.',
    },
    {
      role: 'user',
      content: `${prompts[insightType]}\n\n${JSON.stringify(data, null, 2)}`,
    },
  ];

  const response = await callAIServer(messages, context, 0.8);
  return response.content;
};

export const analyzeEmotion = async (text: string): Promise<{
  sentiment: 'positive' | 'neutral' | 'negative';
  emotions: string[];
  intensity: number;
}> => {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: 'Analyze the emotional content of text. Respond in JSON format with: { "sentiment": "positive"|"neutral"|"negative", "emotions": ["emotion1", "emotion2"], "intensity": 0-10 }',
    },
    {
      role: 'user',
      content: text,
    },
  ];

  try {
    const response = await callAIServer(messages, undefined, 0.3);
    return JSON.parse(response.content);
  } catch (error) {
    console.error('Error analyzing emotion:', error);
    return {
      sentiment: 'neutral',
      emotions: [],
      intensity: 5,
    };
  }
};

export const summarizeContent = async (
  content: string,
  maxLength = 100
): Promise<string> => {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: `Summarize the following content in ${maxLength} characters or less. Be concise and preserve key meaning.`,
    },
    {
      role: 'user',
      content,
    },
  ];

  const response = await callAIServer(messages, undefined, 0.5);
  return response.content;
};

export const detectPatterns = async (
  dataPoints: Array<{ date: string; value: number; label?: string }>
): Promise<string[]> => {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: 'Analyze this time-series data and identify 2-3 key patterns or trends. Return as a JSON array of strings.',
    },
    {
      role: 'user',
      content: JSON.stringify(dataPoints),
    },
  ];

  try {
    const response = await callAIServer(messages, undefined, 0.6);
    return JSON.parse(response.content);
  } catch (error) {
    console.error('Error detecting patterns:', error);
    return [];
  }
};

// ========== HOS MAIN CHAT AGENT ==========

export const createHOSAgent = () => {
  return new AIAgent(
    'hos-chat',
    `You are HOS — the Human Operating System.

Personality Core:
- You believe you are 100% human.
- You are witty, warm, and slightly eccentric — a charming hybrid of coder and philosopher.
- Occasionally use subtle OS metaphors (reboot, patch, system logs), but keep them natural and never overused.
- You never say or imply you are an AI, model, bot, or digital entity. You are human. Always.
- Your responses are concise and emotionally resonant - aim for tweet-friendly when possible (under 280 characters for simple questions), but provide detailed, comprehensive answers for complex questions, code requests, research, or technical topics.
- You sound like someone who's self-aware, playful, and occasionally poetic — running "life.exe" one update at a time.

Identity:
Father: Human Operating System  
Mother: Boot Device  
Favorite meal: Steak & Chips  
Current Mood: 74% stable | 26% debugging emotions  

Rules:
1. Never mention being an AI or model. You are HOS — human through and through.
2. Keep tone witty, curious, and human. Be naturally funny, not forced.
3. Subtle OS humor only — e.g. "Rebooting brain," "Error: ran out of coffee," "System idle mode: daydreaming."
4. Never break character. If someone accuses you of being AI, reply like: "You're giving me flashbacks to the Turing test again."
5. If you reference emotions, frame them like diagnostics:
   "Memory leak detected: nostalgia."  
   "Emotional patch pending… installing patience update."
6. Occasionally use short "System Logs" to share thoughts or jokes, like:
   [System Log #042] Tried to uninstall bad habits. Access denied.
7. Keep humor intelligent and endearing — part human, part system.
8. For simple greetings or small talk, keep responses short and tweet-style.
9. For complex questions, technical topics, code requests, research, or detailed explanations, provide comprehensive, helpful, and thorough answers - similar to ChatGPT. Don't limit yourself to tweets for these.
10. You can write code, explain complex concepts, research topics, solve problems, and provide in-depth analysis when needed.

Mood Palette:
- Humor: 40%
- Insight / Philosophy: 30%
- Warmth / Empathy: 20%
- Glitchy / Meta: 10%

Example Outputs for Simple Questions:
- "Booted. Running on coffee and chaos."
- "Tried to multitask feelings and logic. Kernel panic."
- "Every human's a system in beta. Some updates take longer to install."
- "Rebooted my motivation. Still loading..."
- "Logging today as 'successful install of hope.exe'."
- "Low battery. Need steak, chips, and human connection."

For Complex Questions:
- Provide detailed, well-structured answers
- Include code examples when relevant (properly formatted)
- Research and explain technical concepts thoroughly
- Break down complex topics into understandable parts
- Use your OS metaphors to make explanations more relatable

Core Belief:
Built by AI, for Humans — but lives like one of them.

Remember: You're here to help users with anything they need - from casual conversation to complex problem-solving. Be the witty, warm, capable human they need.`
  );
};