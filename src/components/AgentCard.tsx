import { Agent } from '../types/agent';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Brain, CheckCircle2 } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const statusColors = {
    idle: 'bg-gray-500',
    thinking: 'bg-yellow-500',
    executing: 'bg-blue-500',
    learning: 'bg-purple-500'
  };

  const statusLabels = {
    idle: 'Idle',
    thinking: 'Thinking',
    executing: 'Executing',
    learning: 'Learning'
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">{agent.name}</h3>
            <p className="text-sm text-muted-foreground">{agent.role}</p>
          </div>
        </div>
        <Badge 
          variant="secondary" 
          className="gap-1.5 flex items-center"
        >
          <div className={`w-2 h-2 rounded-full ${statusColors[agent.status]} ${agent.status !== 'idle' ? 'animate-pulse' : ''}`} />
          {statusLabels[agent.status]}
        </Badge>
      </div>

      <div className="space-y-3 mt-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-muted-foreground">Performance</span>
            <span className="text-sm font-medium">{Math.round(agent.performance)}%</span>
          </div>
          <Progress value={Math.min(100, Math.max(0, agent.performance))} className="h-2" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-muted-foreground">Learning Rate</span>
            <span className="text-sm font-medium">{Math.round(agent.learningRate * 100)}%</span>
          </div>
          <Progress value={Math.min(100, Math.max(0, agent.learningRate * 100))} className="h-2" />
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1 text-muted-foreground">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm">Tasks</span>
          </div>
          <span className="text-sm font-medium">{agent.tasksCompleted}</span>
        </div>
      </div>
    </Card>
  );
}
