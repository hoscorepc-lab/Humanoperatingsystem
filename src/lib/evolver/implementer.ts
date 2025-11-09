import { EvolutionProposal, EvolutionImplementation, CodeChange, GeneratedCode } from '../../types/evolver';
import { eventBus } from '../eventBus';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export class EvolutionImplementer {
  async implementProposal(proposal: EvolutionProposal): Promise<EvolutionImplementation> {
    const implementationId = `impl_${Date.now()}`;

    eventBus.emit({
      type: 'EVOLVER_IMPLEMENTATION_START',
      source: 'evolver',
      data: { proposalId: proposal.id }
    });

    const changes: CodeChange[] = [];
    const generatedCode: GeneratedCode[] = [];

    try {
      // Generate code for each proposed file
      // Using scaffolds for now - AI code generation can be enabled when backend is fully stable
      for (const file of proposal.implementation.files) {
        const code = this.generateFileScaffold(file, proposal);
        
        generatedCode.push({
          file: file.path,
          content: code,
          purpose: file.description
        });

        changes.push({
          id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          file: file.path,
          changeType: file.action,
          description: file.description,
          preview: code.slice(0, 500) + (code.length > 500 ? '...' : ''),
          applied: false
        });
      }

      const implementation: EvolutionImplementation = {
        id: implementationId,
        proposalId: proposal.id,
        timestamp: new Date(),
        changes,
        status: 'complete',
        generatedCode
      };

      eventBus.emit({
        type: 'EVOLVER_IMPLEMENTATION_COMPLETE',
        source: 'evolver',
        data: { implementation }
      });

      return implementation;
    } catch (error) {
      console.error('Implementation failed:', error);
      
      const failedImplementation: EvolutionImplementation = {
        id: implementationId,
        proposalId: proposal.id,
        timestamp: new Date(),
        changes,
        status: 'failed',
        generatedCode
      };

      eventBus.emit({
        type: 'EVOLVER_IMPLEMENTATION_FAILED',
        source: 'evolver',
        data: { implementation: failedImplementation, error }
      });

      return failedImplementation;
    }
  }

  private async generateCodeForFile(
    file: EvolutionProposal['implementation']['files'][0],
    proposal: EvolutionProposal
  ): Promise<string | null> {
    try {
      const systemPrompt = `You are the HOS code generator. Generate production-ready TypeScript/React code following HOS architecture patterns.
- Use functional components with hooks
- Follow existing patterns in HOS modules
- Include proper TypeScript types
- Emit events through eventBus
- Store data in Supabase KV store
- Use clean, white aesthetic with Tailwind CSS
- Include proper error handling
Generate ONLY the code, no explanations.`;

      const userPrompt = `Generate code for: ${file.path}
Action: ${file.action}
Description: ${file.description}
Proposal: ${proposal.title} - ${proposal.description}
Dependencies: ${proposal.implementation.dependencies.join(', ')}`;

      let response;
      try {
        response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-8d51d9e2/ai/chat`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ],
              temperature: 0.7
            }),
          }
        );
      } catch (fetchError) {
        console.error('Network error during AI request:', fetchError);
        throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : 'Failed to connect to AI service'}`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI request failed:', response.status, errorText);
        throw new Error(`AI request failed: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      const code = data.content || '';

      // Extract code from markdown blocks if present
      const codeMatch = code.match(/```(?:tsx?|javascript)?\n([\s\S]*?)\n```/);
      return codeMatch ? codeMatch[1] : code;
    } catch (error) {
      console.error(`Failed to generate code for ${file.path}:`, error);
      return null;
    }
  }

  async applyChanges(implementation: EvolutionImplementation): Promise<boolean> {
    eventBus.emit({
      type: 'EVOLVER_CHANGES_APPLYING',
      source: 'evolver',
      data: { implementationId: implementation.id }
    });

    // In a real implementation, this would:
    // 1. Create backups of existing files
    // 2. Apply the changes to the file system
    // 3. Store rollback information
    // For now, we'll simulate this
    
    const applied = true;

    if (applied) {
      eventBus.emit({
        type: 'EVOLVER_CHANGES_APPLIED',
        source: 'evolver',
        data: { implementationId: implementation.id }
      });
    }

    return applied;
  }

  async revertChanges(implementation: EvolutionImplementation): Promise<boolean> {
    if (!implementation.rollbackData) {
      console.error('No rollback data available');
      return false;
    }

    eventBus.emit({
      type: 'EVOLVER_CHANGES_REVERTING',
      source: 'evolver',
      data: { implementationId: implementation.id }
    });

    // In a real implementation, this would restore backed up files
    const reverted = true;

    if (reverted) {
      eventBus.emit({
        type: 'EVOLVER_CHANGES_REVERTED',
        source: 'evolver',
        data: { implementationId: implementation.id }
      });
    }

    return reverted;
  }

  generateFileScaffold(
    file: EvolutionProposal['implementation']['files'][0],
    proposal: EvolutionProposal
  ): string {
    // Generate a basic TypeScript/React scaffold based on the file type
    const fileName = file.path.split('/').pop() || 'Component';
    const componentName = fileName.replace(/\.tsx?$/, '');
    
    if (file.path.includes('Module.tsx')) {
      return `// ${componentName} - Generated by HOS Evolver
// Proposal: ${proposal.title}
// ${file.description}

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function ${componentName}() {
  const [status, setStatus] = useState('ready');

  return (
    <div className="space-y-6">
      <div>
        <h2>${componentName.replace('Module', '')}</h2>
        <p className="text-muted-foreground">
          ${file.description}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Module is {status}</p>
        </CardContent>
      </Card>
    </div>
  );
}`;
    }

    if (file.path.includes('.ts') && !file.path.includes('.tsx')) {
      return `// ${fileName} - Generated by HOS Evolver
// Proposal: ${proposal.title}
// ${file.description}

export class ${componentName} {
  constructor() {
    // Initialize ${componentName}
  }

  // TODO: Implement ${file.description}
}

export const ${componentName.charAt(0).toLowerCase() + componentName.slice(1)} = new ${componentName}();`;
    }

    return `// ${fileName} - Generated by HOS Evolver
// Proposal: ${proposal.title}
// ${file.description}

// TODO: Implement ${file.description}

export default function ${componentName}() {
  return (
    <div>
      <h3>${componentName}</h3>
      <p>${file.description}</p>
    </div>
  );
}`;
  }

  generateScaffold(proposal: EvolutionProposal): string {
    const files = proposal.implementation.files.map(f => `  - ${f.path} (${f.action})`).join('\n');
    const deps = proposal.implementation.dependencies.join(', ');
    const interfaces = proposal.implementation.interfaces.map(i => 
      `  ${i.name}: ${i.inputs.join(', ')} -> ${i.outputs.join(', ')}`
    ).join('\n');

    return `
# Evolution Proposal: ${proposal.title}

## Description
${proposal.description}

## Type
${proposal.type}

## Files to Modify
${files}

## Dependencies
${deps || 'None'}

## Interfaces
${interfaces || 'None'}

## Estimated Impact
${proposal.estimatedImpact}

## Risks
${proposal.risks.map(r => `- ${typeof r === 'string' ? r : (r as any).description || JSON.stringify(r)}`).join('\n')}

## Implementation Status
${proposal.status}
    `.trim();
  }
}

export const evolutionImplementer = new EvolutionImplementer();
