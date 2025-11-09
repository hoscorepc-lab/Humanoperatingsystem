import { useState, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Monitor, Brain, Cpu, Layers, Database, GitBranch, 
  MessageCircle, Terminal, RotateCcw, Bug, Heart, 
  BookOpen, Compass, Atom, ScanEye, Zap 
} from 'lucide-react';
import { HOSModule } from '../types/hos';

interface ModuleCardProps {
  module: HOSModule;
  onClick?: () => void;
}

const iconMap: Record<string, any> = {
  Monitor,
  Brain,
  Cpu,
  Layers,
  Database,
  GitBranch,
  MessageCircle,
  Terminal,
  RotateCcw,
  Bug,
  Heart,
  BookOpen,
  Compass,
  Atom,
  ScanEye,
  Zap
};

export function ModuleCard({ module, onClick }: ModuleCardProps) {
  const Icon = iconMap[module.icon] || Monitor;
  const [isProcessing, setIsProcessing] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  
  const statusColors = {
    active: 'bg-green-500/20 text-green-700 dark:text-green-300',
    idle: 'bg-gray-500/20 text-gray-700 dark:text-gray-300',
    learning: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    processing: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300'
  };

  const handleClick = () => {
    if (isProcessing || !onClick) return;
    
    setIsProcessing(true);
    onClick();
    
    setTimeout(() => {
      setIsProcessing(false);
    }, 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    
    if (touchStartRef.current && e.changedTouches[0]) {
      const touch = e.changedTouches[0];
      const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
      
      // If movement is less than 10px, treat as a tap
      if (deltaX < 10 && deltaY < 10) {
        handleClick();
      }
    }
    
    touchStartRef.current = null;
  };

  return (
    <Card 
      className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50 min-h-[44px] active:scale-[0.98]"
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }}
    >
      <CardContent className="p-3 sm:p-4 pointer-events-none">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 flex-shrink-0">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start sm:items-center gap-2 mb-1 flex-col sm:flex-row">
              <h3 className="text-xs sm:text-sm truncate">{module.name}</h3>
              {module.status && (
                <Badge 
                  variant="secondary" 
                  className={`text-xs px-2 py-0 flex-shrink-0 ${statusColors[module.status]}`}
                >
                  {module.status}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {module.description}
            </p>
            {module.progress !== undefined && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-foreground">{module.progress}/10</span>
                </div>
                <Progress value={module.progress * 10} className="h-1" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
