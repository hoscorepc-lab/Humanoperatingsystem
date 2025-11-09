// Research Module AI Service - Specialized AI functions for research modules

import { projectId, publicAnonKey } from '../../utils/supabase/info';

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

// Call the Supabase Edge Function that handles AI requests
const callAIServer = async (
  messages: AIMessage[],
  temperature = 0.7
): Promise<AIResponse> => {
  const startTime = Date.now();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout for research tasks

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
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error('Error calling AI server:', error);
    if (error.name === 'AbortError') {
      throw new Error('AI request timeout - complex research tasks may take a moment');
    }
    throw error;
  }
};

// ========== CORE RESEARCH AI FUNCTIONS ==========

export const generateResearchInsight = async (
  projectTitle: string,
  projectDescription: string,
  currentFindings: string[]
): Promise<string> => {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: `You are an expert research analyst. Generate actionable insights based on research projects and findings. Be specific, cite evidence, and suggest next steps.`,
    },
    {
      role: 'user',
      content: `Research Project: ${projectTitle}

Description: ${projectDescription}

Current Findings:
${currentFindings.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Based on these findings, generate a key insight that could advance this research. Include:
1. The insight or discovery
2. Supporting evidence from the findings
3. Suggested next steps
4. Potential applications`,
    },
  ];

  const response = await callAIServer(messages, 0.8);
  return response.content;
};

export const analyzeResearchPaper = async (
  title: string,
  abstract: string
): Promise<{
  summary: string;
  keyFindings: string[];
  relevanceScore: number;
}> => {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: `You are an AI research paper analyzer. Analyze papers and extract key information in JSON format.`,
    },
    {
      role: 'user',
      content: `Analyze this research paper and respond with JSON:

Title: ${title}
Abstract: ${abstract}

Provide:
{
  "summary": "2-3 sentence summary",
  "keyFindings": ["finding1", "finding2", "finding3"],
  "relevanceScore": 0-100
}`,
    },
  ];

  try {
    const response = await callAIServer(messages, 0.3);
    const parsed = JSON.parse(response.content);
    return parsed;
  } catch (error) {
    return {
      summary: 'Error analyzing paper',
      keyFindings: [],
      relevanceScore: 0,
    };
  }
};

export const suggestExperiment = async (
  hypothesis: string,
  context: string
): Promise<string> => {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: `You are an experimental design expert. Suggest rigorous experiments to test hypotheses.`,
    },
    {
      role: 'user',
      content: `Hypothesis: ${hypothesis}

Context: ${context}

Design an experiment to test this hypothesis. Include:
1. Experiment name
2. Methodology
3. Variables (independent, dependent, control)
4. Expected outcomes
5. Success criteria`,
    },
  ];

  const response = await callAIServer(messages, 0.7);
  return response.content;
};

// ========== LARGE LANGUAGE MODELS AI FUNCTIONS ==========

export const generateText = async (
  prompt: string,
  modelConfig: {
    temperature: number;
    maxTokens: number;
    style: string;
  }
): Promise<string> => {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: `You are a text generation model. Generate text in the style: ${modelConfig.style}`,
    },
    {
      role: 'user',
      content: prompt,
    },
  ];

  const response = await callAIServer(messages, modelConfig.temperature);
  return response.content;
};

export const optimizeModelArchitecture = async (
  currentArchitecture: string,
  performanceMetrics: any
): Promise<string> => {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: `You are an expert in LLM architecture optimization. Suggest improvements based on performance metrics.`,
    },
    {
      role: 'user',
      content: `Current Architecture: ${currentArchitecture}

Performance Metrics:
${JSON.stringify(performanceMetrics, null, 2)}

Suggest specific architectural improvements to:
1. Reduce perplexity
2. Improve BLEU/ROUGE scores
3. Increase inference speed
4. Maintain or reduce model size`,
    },
  ];

  const response = await callAIServer(messages, 0.6);
  return response.content;
};

export const analyzeTrainingProgress = async (
  modelName: string,
  metrics: any[]
): Promise<string> => {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: `You are an LLM training expert. Analyze training metrics and provide recommendations.`,
    },
    {
      role: 'user',
      content: `Model: ${modelName}

Training Metrics:
${JSON.stringify(metrics, null, 2)}

Analyze the training progress and provide:
1. Current status assessment
2. Potential issues (overfitting, underfitting, etc.)
3. Hyperparameter adjustment suggestions
4. When to stop training`,
    },
  ];

  const response = await callAIServer(messages, 0.5);
  return response.content;
};

// ========== NEURAL NETWORK AI FUNCTIONS ==========

export const recommendArchitecture = async (
  problemType: string,
  datasetInfo: string,
  constraints: string
): Promise<string> => {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: `You are a neural network architecture expert. Design optimal architectures for specific problems.`,
    },
    {
      role: 'user',
      content: `Problem Type: ${problemType}

Dataset: ${datasetInfo}

Constraints: ${constraints}

Design a neural network architecture. Specify:
1. Layer types and counts
2. Activation functions
3. Number of neurons per layer
4. Regularization techniques
5. Expected performance`,
    },
  ];

  const response = await callAIServer(messages, 0.7);
  return response.content;
};

export const diagnoseTrainingIssues = async (
  architecture: string,
  trainingLogs: any
): Promise<string> => {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: `You are a neural network debugging expert. Diagnose training issues and provide solutions.`,
    },
    {
      role: 'user',
      content: `Architecture: ${architecture}

Training Logs:
${JSON.stringify(trainingLogs, null, 2)}

Diagnose any issues and provide:
1. Problem identification
2. Root cause analysis
3. Specific solutions
4. Preventive measures`,
    },
  ];

  const response = await callAIServer(messages, 0.5);
  return response.content;
};

export const optimizeHyperparameters = async (
  currentConfig: any,
  performanceHistory: any[]
): Promise<any> => {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: `You are a hyperparameter optimization expert. Suggest optimal hyperparameters based on performance history. Respond in JSON format.`,
    },
    {
      role: 'user',
      content: `Current Configuration:
${JSON.stringify(currentConfig, null, 2)}

Performance History:
${JSON.stringify(performanceHistory, null, 2)}

Suggest optimized hyperparameters in JSON format:
{
  "learningRate": number,
  "batchSize": number,
  "epochs": number,
  "optimizer": string,
  "reasoning": string
}`,
    },
  ];

  try {
    const response = await callAIServer(messages, 0.3);
    const parsed = JSON.parse(response.content);
    return parsed;
  } catch (error) {
    return currentConfig;
  }
};

// ========== COSMIC CORTEX AI FUNCTIONS ==========

export const generateLearningCurriculum = async (
  currentKnowledge: string[],
  learningGoals: string[],
  uncertainAreas: string[]
): Promise<string[]> => {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: `You are an active learning curriculum designer. Create personalized learning paths that prioritize uncertain areas. Respond with JSON array of learning tasks.`,
    },
    {
      role: 'user',
      content: `Current Knowledge:
${currentKnowledge.join(', ')}

Learning Goals:
${learningGoals.join(', ')}

Uncertain Areas (prioritize these):
${uncertainAreas.join(', ')}

Generate a curriculum of 5-7 learning tasks as a JSON array:
["task1", "task2", "task3", ...]

Prioritize uncertain areas first, then build toward goals.`,
    },
  ];

  try {
    const response = await callAIServer(messages, 0.7);
    const parsed = JSON.parse(response.content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

export const synthesizeKnowledge = async (
  concepts: Array<{ name: string; mastery: number }>
): Promise<string> => {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: `You are a knowledge synthesis expert. Connect concepts and identify deeper patterns.`,
    },
    {
      role: 'user',
      content: `Concepts and Mastery Levels:
${concepts.map(c => `${c.name}: ${(c.mastery * 100).toFixed(0)}% mastery`).join('\n')}

Synthesize these concepts by:
1. Identifying connections between them
2. Revealing underlying patterns
3. Suggesting advanced applications
4. Highlighting knowledge gaps`,
    },
  ];

  const response = await callAIServer(messages, 0.8);
  return response.content;
};

export const selectQuerySamples = async (
  availableSamples: string[],
  currentUncertainty: number,
  strategy: string
): Promise<string[]> => {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: `You are an active learning query strategist. Select optimal samples for learning. Respond with JSON array of selected samples.`,
    },
    {
      role: 'user',
      content: `Strategy: ${strategy}
Current Uncertainty: ${(currentUncertainty * 100).toFixed(0)}%

Available Samples:
${availableSamples.slice(0, 20).join('\n')}

Using ${strategy} strategy, select 5-10 samples that would reduce uncertainty most effectively.
Return as JSON array: ["sample1", "sample2", ...]`,
    },
  ];

  try {
    const response = await callAIServer(messages, 0.5);
    const parsed = JSON.parse(response.content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

// ========== AUTONOMOUS / MULTI-AI DEBATE FUNCTIONS ==========

export const generateDebateArgument = async (
  personaName: string,
  personaRole: string,
  topic: string,
  context: string[],
  previousArguments: Array<{ persona: string; content: string }>
): Promise<string> => {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: `You are ${personaName}, a ${personaRole}. Engage in intellectual debate with depth and nuance. Build on or challenge previous arguments.`,
    },
    {
      role: 'user',
      content: `Debate Topic: ${topic}

Context:
${context.join('\n')}

Previous Arguments:
${previousArguments.map(a => `${a.persona}: ${a.content}`).join('\n\n')}

As ${personaName}, provide your perspective on this topic. Consider the previous arguments and either:
1. Build upon them with new insights
2. Present a counterargument
3. Synthesize different viewpoints
4. Raise important questions

Be specific, rigorous, and constructive.`,
    },
  ];

  const response = await callAIServer(messages, 0.9);
  return response.content;
};

export const synthesizeDebate = async (
  topic: string,
  debateArguments: Array<{ persona: string; content: string; type: string }>
): Promise<string> => {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: `You are a neutral debate synthesizer. Extract key insights and find consensus.`,
    },
    {
      role: 'user',
      content: `Debate Topic: ${topic}

All Arguments:
${debateArguments.map(a => `${a.persona} (${a.type}):\n${a.content}`).join('\n\n---\n\n')}

Synthesize this debate by:
1. Identifying points of consensus
2. Highlighting key disagreements
3. Extracting actionable insights
4. Suggesting a balanced conclusion`,
    },
  ];

  const response = await callAIServer(messages, 0.6);
  return response.content;
};

export const generateTheoryExploration = async (
  problem: string,
  existingTheories: string[]
): Promise<{
  title: string;
  analysis: string;
  proposedSolution: string;
  testableHypotheses: string[];
}> => {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: `You are a theoretical researcher. Explore problems and generate novel theories. Respond in JSON format.`,
    },
    {
      role: 'user',
      content: `Problem: ${problem}

Existing Theories:
${existingTheories.join('\n')}

Generate a novel theoretical exploration in JSON format:
{
  "title": "Theory title",
  "analysis": "Deep analysis of the problem",
  "proposedSolution": "Your proposed solution or framework",
  "testableHypotheses": ["hypothesis1", "hypothesis2", "hypothesis3"]
}`,
    },
  ];

  try {
    const response = await callAIServer(messages, 0.85);
    const parsed = JSON.parse(response.content);
    return parsed;
  } catch (error) {
    return {
      title: 'Theory Exploration',
      analysis: 'Error generating theory',
      proposedSolution: '',
      testableHypotheses: [],
    };
  }
};

export const evaluateConsensus = async (
  topic: string,
  positions: Array<{ persona: string; stance: string; confidence: number }>
): Promise<{
  consensusLevel: number;
  agreements: string[];
  disagreements: string[];
  recommendation: string;
}> => {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: `You are a consensus evaluator. Analyze different positions and determine consensus. Respond in JSON format.`,
    },
    {
      role: 'user',
      content: `Topic: ${topic}

Positions:
${positions.map(p => `${p.persona}: ${p.stance} (${(p.confidence * 100).toFixed(0)}% confident)`).join('\n')}

Evaluate the consensus level and respond in JSON:
{
  "consensusLevel": 0-100,
  "agreements": ["agreement1", "agreement2"],
  "disagreements": ["disagreement1", "disagreement2"],
  "recommendation": "What to do next"
}`,
    },
  ];

  try {
    const response = await callAIServer(messages, 0.4);
    const parsed = JSON.parse(response.content);
    return parsed;
  } catch (error) {
    return {
      consensusLevel: 0,
      agreements: [],
      disagreements: [],
      recommendation: 'Unable to evaluate consensus',
    };
  }
};
