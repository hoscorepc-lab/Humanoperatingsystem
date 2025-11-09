// Human Modules AI Service - Interconnected AI integration for all human modules
// Each action generates learning, insights, and cross-module connections

import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface ModuleContext {
  moduleName: string;
  userId?: string;
  userData?: any;
  relatedModules?: string[];
}

interface AIResponse {
  content: string;
  insights?: string[];
  crossModuleConnections?: Array<{
    module: string;
    relevance: string;
    suggestion: string;
  }>;
  learnings?: string[];
}

// Store module interactions for cross-learning
const moduleInteractions: Map<string, any[]> = new Map();

/**
 * Core AI interaction function that connects all human modules
 */
async function callOpenAI(
  prompt: string,
  context: ModuleContext,
  systemPrompt?: string
): Promise<AIResponse> {
  try {
    const defaultSystemPrompt = `You are the Human Operating System (HOS), an advanced AI that helps users understand and optimize their life.
You operate across multiple interconnected modules: Remote Interface, Core Values Kernel, Task Manager, Neural Archive, Version Control, Branch Simulator, Pattern Analyzer, Affective Firmware, Story Compiler, Probability Mapper, Self-Diagnostics, and Behavior Constructor.

Current module: ${context.moduleName}

When responding:
- Provide deep, personalized insights
- Connect patterns across different life modules
- Suggest actionable improvements
- Generate learning that can benefit other modules
- Be empathetic, thoughtful, and encouraging

Respond in a warm, intelligent tone that makes the user feel understood.`;

    const messages = [
      {
        role: 'system',
        content: systemPrompt || defaultSystemPrompt,
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout

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
          temperature: 0.8,
        }),
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'AI server error');
    }

    const data = await response.json();
    const content = data.content || '';

    // Store interaction for cross-module learning
    storeModuleInteraction(context.moduleName, {
      prompt,
      response: content,
      timestamp: Date.now(),
    });

    return {
      content,
      insights: extractInsights(content),
      crossModuleConnections: generateCrossModuleConnections(content, context),
      learnings: extractLearnings(content),
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

/**
 * Store module interaction for future reference and learning
 */
function storeModuleInteraction(moduleName: string, interaction: any) {
  if (!moduleInteractions.has(moduleName)) {
    moduleInteractions.set(moduleName, []);
  }
  const interactions = moduleInteractions.get(moduleName)!;
  interactions.push(interaction);
  // Keep only last 50 interactions per module
  if (interactions.length > 50) {
    interactions.shift();
  }
}

/**
 * Extract key insights from AI response
 */
function extractInsights(content: string): string[] {
  const insights: string[] = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (line.includes('insight:') || line.includes('key:') || line.startsWith('•')) {
      insights.push(line.replace(/^[•\-\*]\s*/, '').trim());
    }
  }
  
  return insights.slice(0, 3); // Top 3 insights
}

/**
 * Generate connections to other modules based on content
 */
function generateCrossModuleConnections(
  content: string,
  context: ModuleContext
): Array<{ module: string; relevance: string; suggestion: string }> {
  const connections: Array<{ module: string; relevance: string; suggestion: string }> = [];
  
  const contentLower = content.toLowerCase();
  
  // Map keywords to modules
  const moduleKeywords: Record<string, string[]> = {
    'habit-forge': ['habit', 'routine', 'behavior', 'pattern'],
    'emotional-bios': ['emotion', 'mood', 'feeling', 'wellbeing'],
    'narrative-engine': ['story', 'journey', 'chapter', 'narrative'],
    'parallel-selves': ['path', 'choice', 'decision', 'scenario'],
    'rdp': ['state', 'session', 'energy', 'focus'],
    'quantum-planner': ['goal', 'future', 'plan', 'outcome'],
  };

  for (const [module, keywords] of Object.entries(moduleKeywords)) {
    if (module === context.moduleName) continue;
    
    const relevantKeywords = keywords.filter(kw => contentLower.includes(kw));
    if (relevantKeywords.length > 0) {
      connections.push({
        module,
        relevance: `Related to ${relevantKeywords.join(', ')}`,
        suggestion: `Consider checking ${module} for deeper insights`,
      });
    }
  }
  
  return connections.slice(0, 2); // Top 2 connections
}

/**
 * Extract learnings that can be shared across modules
 */
function extractLearnings(content: string): string[] {
  const learnings: string[] = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (line.includes('learn') || line.includes('remember') || line.includes('note')) {
      learnings.push(line.trim());
    }
  }
  
  return learnings.slice(0, 2);
}

// ======================
// Module-Specific AI Functions
// ======================

/**
 * Remote Interface (RDP) - Session analysis and recommendations
 */
export async function analyzeSession(sessionData: any): Promise<AIResponse> {
  const prompt = `Analyze this user session:
- Duration: ${sessionData.duration}
- Type: ${sessionData.type}
- Productivity: ${sessionData.productivity}%
- Current metrics: Mood ${sessionData.mood}/10, Energy ${sessionData.energy}/10, Stress ${sessionData.stress}/10

Provide:
1. Session quality assessment
2. Recommendations for improvement
3. Optimal session type for next activity
4. Energy management tips`;

  return callOpenAI(prompt, { moduleName: 'rdp' });
}

export async function extendSessionAdvice(sessionData: any): Promise<AIResponse> {
  const prompt = `User wants to extend their current ${sessionData.type} session (${sessionData.duration} so far, ${sessionData.productivity}% productive).

Should they extend it? Provide:
1. Yes/No recommendation with reasoning
2. Optimal extension duration if yes
3. Warning signs to watch for
4. Alternative suggestions`;

  return callOpenAI(prompt, { moduleName: 'rdp' });
}

/**
 * Branch Simulator (Parallel Selves) - Life path analysis
 */
export async function analyzeLifePath(scenario: any): Promise<AIResponse> {
  const prompt = `Analyze this life path scenario:
- Path: ${scenario.name}
- Description: ${scenario.description}
- Current probability: ${scenario.probability}%
- Happiness potential: ${scenario.happiness}%
- Stability: ${scenario.stability}%
- Growth potential: ${scenario.growth}%

Provide:
1. Detailed analysis of this path
2. Key opportunities and risks
3. Success factors to focus on
4. Timeline and milestones
5. Preparation steps`;

  return callOpenAI(prompt, { moduleName: 'parallel-selves' });
}

export async function runDeepSimulation(scenario: any, userData?: any): Promise<AIResponse> {
  const prompt = `Run a deep simulation for this life path:
- Scenario: ${scenario.name} - ${scenario.description}
- User context: ${userData ? JSON.stringify(userData, null, 2) : 'Limited data'}

Simulate:
1. 6-month outlook: What happens in the short term?
2. 2-year trajectory: Medium-term developments
3. 5-year vision: Long-term outcomes
4. Critical decision points along the way
5. Resources needed at each stage
6. Probability-adjusted outcomes`;

  return callOpenAI(prompt, { moduleName: 'parallel-selves' });
}

/**
 * Pattern Analyzer (Life Debugger) - Behavioral pattern analysis
 */
export async function analyzePattern(pattern: any): Promise<AIResponse> {
  const prompt = `Analyze this detected behavioral pattern:
- Pattern: ${pattern.name}
- Type: ${pattern.type}
- Frequency: ${pattern.frequency}
- Impact: ${pattern.impact}

Provide:
1. Root cause analysis
2. How this pattern affects life quality
3. Why it persists
4. Breaking strategy
5. Replacement behaviors`;

  return callOpenAI(prompt, { moduleName: 'life-debugger' });
}

export async function createHabitFromPattern(pattern: any): Promise<AIResponse> {
  const prompt = `Create a habit to address this pattern:
- Pattern to fix: ${pattern.name}
- Current impact: ${pattern.impact}

Design:
1. Specific habit to create
2. Daily implementation steps
3. Success metrics
4. Potential obstacles
5. Motivation strategies`;

  return callOpenAI(prompt, { moduleName: 'life-debugger' });
}

export async function fixPattern(pattern: any): Promise<AIResponse> {
  const prompt = `Create an action plan to fix this pattern:
- Pattern: ${pattern.name}
- Type: ${pattern.type}

Provide:
1. Immediate action (today)
2. This week's strategy
3. This month's goal
4. Accountability methods
5. Progress tracking`;

  return callOpenAI(prompt, { moduleName: 'life-debugger' });
}

/**
 * Affective Firmware (Emotional BIOS) - Emotional calibration
 */
export async function calibrateEmotion(
  state: 'great' | 'okay' | 'struggling',
  context?: any
): Promise<AIResponse> {
  const prompt = `User reports feeling "${state}" right now.
${context ? `Context: ${JSON.stringify(context)}` : ''}

Provide:
1. Empathetic acknowledgment
2. What this state might indicate
3. Immediate supportive actions (next 30 minutes)
4. Longer-term emotional regulation strategies
5. Questions to help them understand their state better`;

  return callOpenAI(prompt, { moduleName: 'emotional-bios' });
}

/**
 * Story Compiler (Narrative Engine) - Life story generation
 */
export async function generateChapterContent(chapter: any): Promise<AIResponse> {
  const prompt = `Generate narrative content for this life chapter:
- Chapter: ${chapter.chapter} - ${chapter.title}
- Period: ${chapter.period}
- Theme: ${chapter.theme}
- Key events: ${chapter.keyEvents}
- Status: ${chapter.status}

Create:
1. Opening paragraph that sets the scene
2. Key moments and turning points
3. Character development insights
4. Lessons learned
5. Connections to overall life narrative
6. Reflection questions

Write in a warm, literary style that helps the user see their life as a meaningful story.`;

  return callOpenAI(prompt, { moduleName: 'narrative-engine' });
}

export async function editChapter(chapter: any, editRequest: string): Promise<AIResponse> {
  const prompt = `User wants to edit this chapter:
- Chapter: ${chapter.title}
- Period: ${chapter.period}
- Theme: ${chapter.theme}
- Edit request: ${editRequest}

Provide:
1. Suggested revisions
2. How this changes the narrative
3. Consistency check with other chapters
4. Enhanced theme development
5. Questions to deepen the story`;

  return callOpenAI(prompt, { moduleName: 'narrative-engine' });
}

export async function generateStoryInsights(chapters: any[]): Promise<AIResponse> {
  const prompt = `Analyze this life story across ${chapters.length} chapters:
${chapters.map(c => `- ${c.chapter}: ${c.title} (${c.period}) - ${c.theme}`).join('\n')}

Provide:
1. Overarching narrative arc
2. Recurring themes and patterns
3. Character growth trajectory
4. Plot analysis: conflicts, resolutions, ongoing tensions
5. Future chapter predictions
6. Wisdom synthesis`;

  return callOpenAI(prompt, { moduleName: 'narrative-engine' });
}

/**
 * Get context from all modules for interconnected learning
 */
export function getModuleContext(moduleName: string): any {
  const interactions = moduleInteractions.get(moduleName) || [];
  return {
    recentInteractions: interactions.slice(-5),
    totalInteractions: interactions.length,
  };
}

/**
 * Share learning across modules
 */
export async function generateCrossModuleAdvice(
  sourceModule: string,
  targetModule: string,
  data: any
): Promise<AIResponse> {
  const prompt = `Based on activity in ${sourceModule}, provide insights for ${targetModule}:
Data: ${JSON.stringify(data, null, 2)}

Generate:
1. How ${sourceModule} patterns relate to ${targetModule}
2. Specific recommendations for ${targetModule}
3. Synergies to leverage
4. Potential conflicts to resolve`;

  return callOpenAI(prompt, {
    moduleName: targetModule,
    relatedModules: [sourceModule],
  });
}
