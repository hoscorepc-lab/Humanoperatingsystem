/**
 * Performance Monitor Component
 * Displays real-time performance metrics
 */

import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Activity, Cpu, HardDrive, Zap } from 'lucide-react';

interface PerformanceMetrics {
  fps: number;
  memory: number;
  connections: number;
  latency: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memory: 0,
    connections: 0,
    latency: 0,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        // Get memory info if available
        const memory = (performance as any).memory
          ? Math.round(((performance as any).memory.usedJSHeapSize / (performance as any).memory.jsHeapSizeLimit) * 100)
          : 0;

        setMetrics(prev => ({
          ...prev,
          fps,
          memory,
        }));

        frameCount = 0;
        lastTime = currentTime;
      }

      animationFrameId = requestAnimationFrame(measureFPS);
    };

    animationFrameId = requestAnimationFrame(measureFPS);

    // Measure page load latency
    const loadTime = performance.now();
    setMetrics(prev => ({ ...prev, latency: Math.round(loadTime) }));

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Toggle visibility with keyboard shortcut (Ctrl/Cmd + Shift + P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible) return null;

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'bg-green-500';
    if (fps >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMemoryColor = (memory: number) => {
    if (memory < 70) return 'text-green-500';
    if (memory < 90) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 lg:bottom-4">
      <Card className="border-2 shadow-lg backdrop-blur-sm bg-background/95">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-medium">Performance</span>
            <button
              onClick={() => setIsVisible(false)}
              className="ml-auto text-xs hover:text-primary"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3" />
                <span>FPS</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getFPSColor(metrics.fps)}`} />
                <span className="font-mono">{metrics.fps}</span>
              </div>
            </div>

            {metrics.memory > 0 && (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-3 h-3" />
                  <span>Memory</span>
                </div>
                <span className={`font-mono ${getMemoryColor(metrics.memory)}`}>
                  {metrics.memory}%
                </span>
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-3 h-3" />
                <span>Load</span>
              </div>
              <span className="font-mono">{metrics.latency}ms</span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-border">
            <p className="text-[10px] text-muted-foreground">
              Press Ctrl+Shift+P to toggle
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
