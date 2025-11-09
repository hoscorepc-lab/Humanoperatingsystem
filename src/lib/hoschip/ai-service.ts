/**
 * HOS Chip AI Service
 * Uses OpenAI to provide intelligent insights for module health, performance, and cognitive bus analysis
 */

import { ModulePerformanceMetric, ChipMetrics, CommunicationLog } from '../../types/hoschip';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-8d51d9e2/hoschip/ai`;

interface AIInsight {
  insight: string;
  confidence: number;
  recommendations: string[];
}

interface ModuleHealthAnalysis {
  overallHealth: string;
  criticalIssues: string[];
  optimizationOpportunities: string[];
  predictedTrends: string[];
  aiInsights: AIInsight;
}

interface TopPerformersAnalysis {
  topModules: Array<{
    name: string;
    score: number;
    reason: string;
    strengths: string[];
  }>;
  improvementAreas: Array<{
    name: string;
    issue: string;
    suggestion: string;
  }>;
  aiInsights: AIInsight;
}

interface CognitiveBusAnalysis {
  communicationPatterns: string[];
  bottlenecks: string[];
  efficiencyScore: number;
  networkHealth: string;
  aiInsights: AIInsight;
}

async function callBackend(endpoint: string, body: any): Promise<any> {
  const response = await fetch(`${API_BASE}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Backend API error');
  }

  return await response.json();
}

/**
 * Analyze module health using AI
 */
export async function analyzeModuleHealth(
  moduleMetrics: ModulePerformanceMetric[],
  chipMetrics: ChipMetrics
): Promise<ModuleHealthAnalysis> {
  return await callBackend('analyze-health', { moduleMetrics, chipMetrics });
}

/**
 * Identify and analyze top performing modules using AI
 */
export async function analyzeTopPerformers(
  moduleMetrics: ModulePerformanceMetric[]
): Promise<TopPerformersAnalysis> {
  return await callBackend('analyze-performers', { moduleMetrics });
}

/**
 * Analyze cognitive bus communication patterns using AI
 */
export async function analyzeCognitiveBus(
  communications: CommunicationLog[],
  moduleMetrics: ModulePerformanceMetric[]
): Promise<CognitiveBusAnalysis> {
  return await callBackend('analyze-bus', { communications, moduleMetrics });
}

/**
 * Get real-time AI insights for live dashboard
 */
export async function getLiveInsights(
  chipMetrics: ChipMetrics,
  recentActivity: string[]
): Promise<string> {
  const result = await callBackend('live-insights', { chipMetrics, recentActivity });
  return result.insight;
}