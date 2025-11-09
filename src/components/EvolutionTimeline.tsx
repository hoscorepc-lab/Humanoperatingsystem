import { Evolution } from '../types/agent';
import { Sparkles, TrendingUp, Lightbulb, BookOpen } from 'lucide-react';

interface EvolutionTimelineProps {
  evolutions: Evolution[];
}

export function EvolutionTimeline({ evolutions }: EvolutionTimelineProps) {
  const getIcon = (type: Evolution['type']) => {
    switch (type) {
      case 'skill_acquired':
        return <Sparkles className="w-5 h-5 text-purple-500" />;
      case 'performance_improved':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'strategy_optimized':
        return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      case 'knowledge_expanded':
        return <BookOpen className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatType = (type: Evolution['type']) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-4">
      {evolutions.map((evolution, index) => (
        <div key={evolution.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="p-2 bg-background border rounded-full">
              {getIcon(evolution.type)}
            </div>
            {index < evolutions.length - 1 && (
              <div className="w-px h-full bg-border mt-2" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium">{formatType(evolution.type)}</h4>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>Impact:</span>
                <span className="font-medium text-foreground">{evolution.impact}/10</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {evolution.description}
            </p>
            <span className="text-xs text-muted-foreground">
              {new Date(evolution.timestamp).toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
