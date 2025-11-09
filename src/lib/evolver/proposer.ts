import { EvolutionAnalysis, EvolutionProposal, ProposedFile, ProposedInterface } from '../../types/evolver';
import { eventBus } from '../eventBus';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export class EvolutionProposer {
  async generateProposals(
    analysis: EvolutionAnalysis,
    maxProposals: number = 3
  ): Promise<EvolutionProposal[]> {
    eventBus.emit({
      type: 'EVOLVER_PROPOSAL_START',
      source: 'evolver',
      data: { analysisId: analysis.id }
    });

    const proposals: EvolutionProposal[] = [];

    // Select top issues and opportunities to address
    const topIssues = analysis.identifiedIssues
      .sort((a, b) => this.getSeverityScore(b.severity) - this.getSeverityScore(a.severity))
      .slice(0, 2);

    const topOpportunities = analysis.opportunities
      .sort((a, b) => this.getImpactScore(b.impact) - this.getImpactScore(a.impact))
      .slice(0, maxProposals - topIssues.length);

    // Generate proposals for issues
    for (const issue of topIssues) {
      const proposal = await this.generateProposalForIssue(analysis.id, issue);
      if (proposal) proposals.push(proposal);
    }

    // Generate proposals for opportunities
    for (const opportunity of topOpportunities) {
      const proposal = await this.generateProposalForOpportunity(analysis.id, opportunity);
      if (proposal) proposals.push(proposal);
    }

    eventBus.emit({
      type: 'EVOLVER_PROPOSAL_COMPLETE',
      source: 'evolver',
      data: { proposals }
    });

    return proposals;
  }

  private async generateProposalForIssue(
    analysisId: string,
    issue: EvolutionAnalysis['identifiedIssues'][0]
  ): Promise<EvolutionProposal | null> {
    const proposalId = `proposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Use AI to generate detailed proposal
    const aiProposal = await this.getAIProposal(
      `Generate a solution for this issue: ${issue.title}. ${issue.description}`,
      issue.type
    );

    if (!aiProposal) return null;

    return {
      id: proposalId,
      analysisId,
      timestamp: new Date(),
      type: this.mapIssueTypeToProposalType(issue.type),
      title: `Fix: ${issue.title}`,
      description: aiProposal.description,
      targetModules: issue.affectedModules,
      implementation: {
        files: aiProposal.files,
        dependencies: aiProposal.dependencies || [],
        interfaces: aiProposal.interfaces || []
      },
      estimatedImpact: aiProposal.impact,
      risks: aiProposal.risks || [],
      status: 'proposed'
    };
  }

  private async generateProposalForOpportunity(
    analysisId: string,
    opportunity: EvolutionAnalysis['opportunities'][0]
  ): Promise<EvolutionProposal | null> {
    const proposalId = `proposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const aiProposal = await this.getAIProposal(
      `Implement this improvement: ${opportunity.title}. ${opportunity.description}. Expected benefit: ${opportunity.potentialBenefit}`,
      opportunity.type
    );

    if (!aiProposal) return null;

    return {
      id: proposalId,
      analysisId,
      timestamp: new Date(),
      type: this.mapOpportunityTypeToProposalType(opportunity.type),
      title: opportunity.title,
      description: aiProposal.description,
      targetModules: [],
      implementation: {
        files: aiProposal.files,
        dependencies: aiProposal.dependencies || [],
        interfaces: aiProposal.interfaces || []
      },
      estimatedImpact: aiProposal.impact,
      risks: aiProposal.risks || [],
      status: 'proposed'
    };
  }

  private async getAIProposal(prompt: string, type: string): Promise<{
    description: string;
    files: ProposedFile[];
    dependencies?: string[];
    interfaces?: ProposedInterface[];
    impact: string;
    risks?: string[];
  } | null> {
    // Generate proposals based on issue/opportunity type without AI
    // Extract key information from the prompt
    const isOptimization = type === 'optimization';
    const isNewFeature = type === 'new-feature';
    const isRefactor = type === 'refactor';
    
    let description = 'Proposed improvement based on system analysis';
    let files: ProposedFile[] = [];
    let dependencies: string[] = [];
    let impact = 'Medium - Addresses identified issue or opportunity';
    let risks: string[] = [];

    if (isOptimization) {
      description = 'Optimize system performance and reduce redundancy';
      files = [
        {
          path: '/lib/performance/optimizer.ts',
          action: 'create',
          description: 'Performance optimization utilities'
        },
        {
          path: '/components/modules/DashboardModule.tsx',
          action: 'modify',
          description: 'Apply performance optimizations'
        }
      ];
      dependencies = ['react', 'lodash'];
      impact = 'High - Improves overall system performance';
      risks = ['May require performance monitoring', 'Could affect existing functionality'];
    } else if (isNewFeature) {
      description = 'Add new feature to enhance system capabilities';
      files = [
        {
          path: `/components/modules/${type}Module.tsx`,
          action: 'create',
          description: 'New module implementation'
        },
        {
          path: `/types/${type}.ts`,
          action: 'create',
          description: 'Type definitions for new feature'
        }
      ];
      dependencies = ['react', 'lucide-react'];
      impact = 'High - Expands system functionality';
      risks = ['Requires thorough testing', 'May need UI adjustments'];
    } else if (isRefactor) {
      description = 'Refactor code for better maintainability and structure';
      files = [
        {
          path: '/lib/utils/helpers.ts',
          action: 'modify',
          description: 'Refactor utility functions'
        }
      ];
      impact = 'Medium - Improves code quality';
      risks = ['Requires regression testing', 'May affect dependent modules'];
    } else {
      // Default proposal
      description = 'General system improvement';
      files = [
        {
          path: `/components/modules/${type}Module.tsx`,
          action: 'modify',
          description: 'Update module implementation'
        }
      ];
      impact = 'Medium - Addresses specific issue or opportunity';
      risks = ['May require testing', 'Could affect dependent modules'];
    }

    return {
      description,
      files,
      dependencies,
      interfaces: [],
      impact,
      risks
    };
  }

  private getSeverityScore(severity: string): number {
    const scores = { critical: 4, high: 3, medium: 2, low: 1 };
    return scores[severity as keyof typeof scores] || 0;
  }

  private getImpactScore(impact: string): number {
    const scores = { high: 3, medium: 2, low: 1 };
    return scores[impact as keyof typeof scores] || 0;
  }

  private mapIssueTypeToProposalType(issueType: string): EvolutionProposal['type'] {
    const mapping: Record<string, EvolutionProposal['type']> = {
      'bug': 'modify-module',
      'performance': 'optimize',
      'redundancy': 'optimize',
      'missing-feature': 'create-module',
      'technical-debt': 'modify-module'
    };
    return mapping[issueType] || 'modify-module';
  }

  private mapOpportunityTypeToProposalType(opportunityType: string): EvolutionProposal['type'] {
    const mapping: Record<string, EvolutionProposal['type']> = {
      'optimization': 'optimize',
      'new-feature': 'create-module',
      'refactor': 'modify-module',
      'integration': 'modify-module'
    };
    return mapping[opportunityType] || 'modify-module';
  }
}

export const evolutionProposer = new EvolutionProposer();
