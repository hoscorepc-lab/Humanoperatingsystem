import { EvolutionAnalysis, Issue, Opportunity, ErrorLog, SystemMetrics } from '../../types/evolver';
import { Agent, Task, Evolution } from '../../types/agent';
import { AIAgent, AITask } from '../../types/aiagency';
import { eventBus } from '../eventBus';

export class SystemAnalyzer {
  async analyzeSystem(
    agents: Agent[],
    tasks: Task[],
    evolutions: Evolution[],
    aiAgents: AIAgent[],
    aiTasks: AITask[],
    modules: string[]
  ): Promise<EvolutionAnalysis> {
    const analysisId = `analysis_${Date.now()}`;
    
    eventBus.emit({
      type: 'EVOLVER_ANALYSIS_START',
      source: 'evolver',
      data: { analysisId }
    });

    // Collect system snapshot
    const snapshot = {
      moduleCount: modules.length,
      agentCount: agents.length + aiAgents.length,
      activeModules: modules,
      performanceMetrics: this.calculatePerformanceMetrics(agents, tasks),
      errorLogs: this.collectErrorLogs(),
      testCoverage: 0 // Would be populated from actual test suite
    };

    // Identify issues
    const issues = await this.identifyIssues(agents, tasks, aiAgents, aiTasks);

    // Identify opportunities
    const opportunities = await this.identifyOpportunities(snapshot, issues);

    const analysis: EvolutionAnalysis = {
      id: analysisId,
      timestamp: new Date(),
      systemSnapshot: snapshot,
      identifiedIssues: issues,
      opportunities,
      status: 'complete'
    };

    eventBus.emit({
      type: 'EVOLVER_ANALYSIS_COMPLETE',
      source: 'evolver',
      data: { analysis }
    });

    return analysis;
  }

  private calculatePerformanceMetrics(agents: Agent[], tasks: Task[]): Record<string, number> {
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const avgPerformance = agents.reduce((sum, a) => sum + a.performance, 0) / agents.length || 0;
    const avgLearningRate = agents.reduce((sum, a) => sum + a.learningRate, 0) / agents.length || 0;

    return {
      taskCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      avgAgentPerformance: avgPerformance,
      avgLearningRate: avgLearningRate,
      activeAgents: agents.filter(a => a.status !== 'idle').length,
      systemUptime: 100 // Would be actual uptime percentage
    };
  }

  private collectErrorLogs(): ErrorLog[] {
    // In a real implementation, this would fetch from logging system
    return [];
  }

  private async identifyIssues(
    agents: Agent[],
    tasks: Task[],
    aiAgents: AIAgent[],
    aiTasks: AITask[]
  ): Promise<Issue[]> {
    const issues: Issue[] = [];

    // Check for performance degradation
    const lowPerformanceAgents = agents.filter(a => a.performance < 50);
    if (lowPerformanceAgents.length > 0) {
      issues.push({
        id: `issue_perf_${Date.now()}`,
        type: 'performance',
        severity: 'medium',
        title: 'Agent Performance Degradation',
        description: `${lowPerformanceAgents.length} agent(s) showing performance below 50%`,
        affectedModules: ['mind', 'processes'],
        detectedAt: new Date()
      });
    }

    // Check for stuck tasks
    const stuckTasks = tasks.filter(t => {
      const hoursSinceCreation = (Date.now() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60);
      return t.status === 'in-progress' && hoursSinceCreation > 24;
    });
    if (stuckTasks.length > 0) {
      issues.push({
        id: `issue_stuck_${Date.now()}`,
        type: 'bug',
        severity: 'high',
        title: 'Stuck Tasks Detected',
        description: `${stuckTasks.length} task(s) stuck in progress for over 24 hours`,
        affectedModules: ['processes'],
        detectedAt: new Date()
      });
    }

    return issues;
  }

  private async identifyOpportunities(
    snapshot: EvolutionAnalysis['systemSnapshot'],
    issues: Issue[]
  ): Promise<Opportunity[]> {
    const opportunities: Opportunity[] = [];

    // Learning rate optimization opportunity
    if (snapshot.performanceMetrics.avgLearningRate < 0.5) {
      opportunities.push({
        id: `opp_learn_${Date.now()}`,
        type: 'optimization',
        impact: 'high',
        title: 'Enhance Learning Algorithm',
        description: 'Current learning rate is suboptimal. Implement adaptive learning rates.',
        potentialBenefit: 'Could increase learning efficiency by 30-50%'
      });
    }

    // Cross-module integration opportunity
    opportunities.push({
        id: `opp_integration_${Date.now()}`,
        type: 'integration',
        impact: 'medium',
        title: 'Unified Agent Dashboard',
        description: 'Create a consolidated view combining all agent types across the ecosystem',
        potentialBenefit: 'Improved visibility and coordination across agent types'
    });

    // New module opportunity based on patterns
    if (issues.length > 5) {
      opportunities.push({
        id: `opp_monitor_${Date.now()}`,
        type: 'new-feature',
        impact: 'high',
        title: 'Autonomous Issue Resolution Module',
        description: 'Create a module that automatically detects and resolves common issues',
        potentialBenefit: 'Reduce manual intervention and improve system resilience'
      });
    }

    return opportunities;
  }

  getSystemMetrics(agents: Agent[], evolutions: Evolution[]): SystemMetrics {
    const moduleHealth: Record<string, number> = {
      dashboard: 100,
      chat: 95,
      evolver: 92,
      trader: 88,
      processes: 85
    };

    const agentPerformance: Record<string, number> = {};
    agents.forEach(agent => {
      agentPerformance[agent.id] = agent.performance;
    });

    const successfulEvolutions = evolutions.filter(e => e.outcome === 'success').length;
    const totalEvolutions = evolutions.length;

    return {
      moduleHealth,
      agentPerformance,
      errorRate: 0.02,
      testCoverage: 0,
      evolutionCount: totalEvolutions,
      successRate: totalEvolutions > 0 ? (successfulEvolutions / totalEvolutions) * 100 : 0
    };
  }
}

export const systemAnalyzer = new SystemAnalyzer();