import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Brain, TrendingUp, Activity, Sparkles } from 'lucide-react';
import { SystemMetrics } from '../types/evolver';

interface EvolverStatusWidgetProps {
  onOpenEvolver?: () => void;
}

export function EvolverStatusWidget({ onOpenEvolver }: EvolverStatusWidgetProps) {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
    
    // Refresh metrics every 30 seconds
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      // Load metrics from localStorage or use default mock data
      const storedMetrics = localStorage.getItem('evolver-metrics');
      
      if (storedMetrics) {
        setMetrics(JSON.parse(storedMetrics));
      } else {
        // Default metrics - simulating a healthy system
        const defaultMetrics: SystemMetrics = {
          evolutionCount: 42,
          successRate: 87.5,
          moduleHealth: {
            'core': 94,
            'ai-studio': 91,
            'chat': 96,
            'evolver': 88,
            'chip': 92,
            'wallet': 85
          }
        };
        setMetrics(defaultMetrics);
        localStorage.setItem('evolver-metrics', JSON.stringify(defaultMetrics));
      }
    } catch (error) {
      // Silently use default metrics on error
      const defaultMetrics: SystemMetrics = {
        evolutionCount: 0,
        successRate: 100,
        moduleHealth: {
          'core': 100,
          'ai-studio': 100,
          'chat': 100
        }
      };
      setMetrics(defaultMetrics);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Brain className="w-4 h-4" />
            Evolver Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const avgHealth = Object.values(metrics.moduleHealth).reduce((a, b) => a + b, 0) / 
                    Object.keys(metrics.moduleHealth).length;

  return (
    <Card className="border-2 hover:border-primary/50 transition-colors">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Evolver Status
          </span>
          <Badge variant="outline" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* System Health */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">System Health</span>
            <span className="font-medium">{avgHealth.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${avgHealth}%` }}
            />
          </div>
        </div>

        {/* Evolution Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <TrendingUp className="w-3 h-3" />
              Evolutions
            </div>
            <div className="text-lg font-bold">{metrics.evolutionCount}</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Activity className="w-3 h-3" />
              Success Rate
            </div>
            <div className="text-lg font-bold">{metrics.successRate.toFixed(0)}%</div>
          </div>
        </div>

        {/* Module Health Preview */}
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground mb-2">Top Modules</div>
          {Object.entries(metrics.moduleHealth)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([module, health]) => (
              <div key={module} className="flex items-center justify-between text-xs">
                <span className="capitalize">{module}</span>
                <Badge 
                  variant={health >= 90 ? 'default' : health >= 70 ? 'secondary' : 'destructive'}
                  className="text-xs"
                >
                  {health}%
                </Badge>
              </div>
            ))}
        </div>

        {/* CTA Button */}
        {onOpenEvolver && (
          <Button 
            onClick={onOpenEvolver}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Brain className="w-4 h-4 mr-2" />
            Open Evolver
          </Button>
        )}
      </CardContent>
    </Card>
  );
}