import { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  Cpu, 
  Brain, 
  Zap, 
  Settings,
  Moon,
  Sun,
  LogOut
} from 'lucide-react';
import { SettingsPanel } from './SettingsPanel';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { useTheme } from '../lib/theme';
import hosLogo from 'figma:asset/bbe2fc5ef0fe95dc7b90a9ae839402b9852277df.png';

interface HOSTaskbarProps {
  onNavigate?: (moduleId: string) => void;
  currentModule?: string;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
}

export function HOSTaskbar({ onNavigate, currentModule, userName, userEmail, onLogout }: HOSTaskbarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { theme, changeTheme } = useTheme();
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [cpuUsage, setCpuUsage] = useState(42);
  const [aiLoad, setAiLoad] = useState(68);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  
  const isBrilliantBlack = theme === 'black';
  const toggleBrilliantBlack = () => {
    changeTheme(isBrilliantBlack ? 'pearl' : 'black');
  };

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update CPU and AI metrics
  useEffect(() => {
    const metricsTimer = setInterval(() => {
      setCpuUsage(prev => Math.max(15, Math.min(95, prev + (Math.random() - 0.5) * 15)));
      setAiLoad(prev => Math.max(25, Math.min(98, prev + (Math.random() - 0.5) * 12)));
    }, 3000);
    return () => clearInterval(metricsTimer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const quickAccessModules = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'kernel', icon: Cpu, label: 'Kernel' },
    { id: 'mind', icon: Brain, label: 'Mind' },
    { id: 'evolver', icon: Zap, label: 'Evolver' }
  ];

  // Fast touch handling for START button
  const handleStartTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleStartTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    
    if (touchStartRef.current && e.changedTouches[0]) {
      const touch = e.changedTouches[0];
      const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
      
      // If movement is less than 10px, treat as a tap
      if (deltaX < 10 && deltaY < 10) {
        setShowQuickMenu(!showQuickMenu);
      }
    }
    
    touchStartRef.current = null;
  };

  return (
    <TooltipProvider>
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card backdrop-blur-xl shadow-lg">
        {/* Quick Menu Popup */}
        {showQuickMenu && (
          <div className="absolute bottom-full left-2 sm:left-4 mb-2 w-64 rounded-lg border border-border bg-card shadow-xl p-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <img src={hosLogo} alt="HOS" className="w-8 h-8 rounded" />
                <div>
                  <p className="text-xs">Human Operating System</p>
                  <p className="text-[10px] text-muted-foreground">v3.0 Silver</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {quickAccessModules.map((module) => (
                  <Button
                    key={module.id}
                    variant={currentModule === module.id ? 'default' : 'outline'}
                    size="sm"
                    className="justify-start gap-2 h-auto py-2"
                    onClick={() => {
                      onNavigate?.(module.id);
                      setShowQuickMenu(false);
                    }}
                  >
                    <module.icon className="w-4 h-4" />
                    <span className="text-xs">{module.label}</span>
                  </Button>
                ))}
              </div>
              
              <Separator />
              
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => {
                  setShowSettings(true);
                  setShowQuickMenu(false);
                }}
              >
                <Settings className="w-4 h-4" />
                <span className="text-xs">Settings</span>
              </Button>
              
              {onLogout && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 text-red-500 border-red-500/50 hover:bg-red-500/10"
                  onClick={() => {
                    onLogout();
                    setShowQuickMenu(false);
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-xs">Logout</span>
                </Button>
              )}
            </div>
          </div>
        )}
        
        {/* Settings Dialog */}
        <SettingsPanel
          open={showSettings}
          onOpenChange={setShowSettings}
          userName={userName}
          userEmail={userEmail}
          onLogout={onLogout}
        />

        <div className="flex items-center justify-between px-2 sm:px-4 py-1.5 h-12 w-full gap-2">
        {/* Left Side - Start Menu & Quick Access */}
        <div className="flex items-center gap-2 flex-shrink-0 min-w-fit">
          {/* Start Button - Optimized for fast mobile touch */}
          <button
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            onTouchStart={handleStartTouchStart}
            onTouchEnd={handleStartTouchEnd}
            className={`inline-flex items-center justify-center gap-1.5 h-9 px-2 sm:px-3 flex-shrink-0 rounded-md border-2 transition-all duration-150 active:scale-95 ${
              showQuickMenu 
                ? 'bg-primary text-primary-foreground border-slate-300 dark:border-slate-600' 
                : 'border-slate-300 dark:border-slate-600 bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
            style={{
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              cursor: 'pointer'
            }}
          >
            <img src={hosLogo} alt="HOS" className="w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
            <span className="text-xs font-mono hidden sm:inline pointer-events-none">START</span>
          </button>
        </div>

        {/* Center - Quick Module Access (Hidden on mobile) */}
        <div className="hidden xl:flex items-center gap-2 flex-1 justify-center min-w-0">
          {quickAccessModules.map((module) => (
            <Button
              key={module.id}
              variant={currentModule === module.id ? 'default' : 'ghost'}
              size="sm"
              className="gap-1.5 h-8 px-2.5 flex-shrink-0"
              onClick={() => onNavigate?.(module.id)}
            >
              <module.icon className="w-3.5 h-3.5" />
              <span className="text-xs whitespace-nowrap">{module.label}</span>
            </Button>
          ))}
        </div>

        {/* Right Side - System Tray */}
        <div className="flex items-center gap-2 flex-shrink-0 min-w-fit">
          {/* Theme Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 flex-shrink-0 min-w-[2rem]"
                onClick={toggleBrilliantBlack}
              >
                {isBrilliantBlack ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{isBrilliantBlack ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</p>
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6 w-px hidden md:block flex-shrink-0" />

          {/* System Status Badges */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="hidden md:inline-flex flex-shrink-0 min-w-fit">
                <Badge 
                  variant="outline" 
                  className="gap-1.5 h-8 px-2 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <Cpu className="w-3 h-3 flex-shrink-0" />
                  <span className="text-[10px] whitespace-nowrap">{Math.round(cpuUsage)}%</span>
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs space-y-1">
                <p className="font-medium">CPU Usage</p>
                <p className="text-muted-foreground">Current: {Math.round(cpuUsage)}%</p>
                <p className="text-muted-foreground">Status: {cpuUsage > 80 ? 'High' : cpuUsage > 50 ? 'Medium' : 'Low'}</p>
              </div>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="hidden md:inline-flex flex-shrink-0 min-w-fit">
                <Badge 
                  variant="outline" 
                  className="gap-1.5 h-8 px-2 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <Brain className="w-3 h-3 flex-shrink-0" />
                  <span className="text-[10px] whitespace-nowrap">{Math.round(aiLoad)}%</span>
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs space-y-1">
                <p className="font-medium">AI Processing</p>
                <p className="text-muted-foreground">Current: {Math.round(aiLoad)}%</p>
                <p className="text-muted-foreground">Modules: Active</p>
              </div>
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6 w-px hidden md:block flex-shrink-0" />

          {/* Date & Time */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col items-end justify-center px-2 sm:px-3 py-0.5 rounded bg-muted border border-border min-w-[78px] sm:min-w-[100px] h-9 cursor-pointer hover:bg-muted/80 transition-colors flex-shrink-0">
                <span className="text-[10px] font-mono leading-tight whitespace-nowrap">{formatTime(currentTime)}</span>
                <span className="text-[9px] text-muted-foreground leading-tight hidden sm:block whitespace-nowrap">
                  {formatDate(currentTime)}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{currentTime.toLocaleString()}</p>
            </TooltipContent>
          </Tooltip>

          {/* Show Desktop Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-3 p-0 border-l border-border rounded-none hover:bg-muted hidden sm:flex flex-shrink-0 min-w-[0.75rem]"
              >
                <div className="w-0.5 h-6 bg-muted-foreground/50" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Show Desktop</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      </div>
    </TooltipProvider>
  );
}
