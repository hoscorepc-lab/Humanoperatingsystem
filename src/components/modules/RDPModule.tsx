import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { 
  Monitor, 
  Wifi, 
  Battery, 
  Brain, 
  Heart, 
  Zap, 
  Target, 
  Coffee, 
  Moon, 
  Activity,
  RefreshCw,
  Power,
  Settings,
  TrendingUp,
  AlertCircle,
  Loader2,
  Waves,
  Sparkles,
  Sun,
  CloudRain,
  Wind
} from 'lucide-react';
import { analyzeSession, extendSessionAdvice } from '../../lib/humanmodules/ai-service';
import { toast } from 'sonner';

interface SystemMetrics {
  mood: number;
  energy: number;
  stress: number;
  focus: number;
  motivation: number;
  physical: number;
}

interface Session {
  id: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  type: 'work' | 'break' | 'exercise' | 'social' | 'learning';
  productivity: number;
}

interface QuickAction {
  id: string;
  label: string;
  icon: any;
  color: string;
  gradient: string;
  action: () => void;
}

export function RDPModule() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    mood: 8,
    energy: 9,
    stress: 3,
    focus: 7,
    motivation: 8,
    physical: 8
  });

  const [connectionStrength, setConnectionStrength] = useState(92);
  const [sessionTime, setSessionTime] = useState('2h 34m');
  const [isConnected, setIsConnected] = useState(true);
  const [activeSession, setActiveSession] = useState<Session>({
    id: '1',
    name: 'Deep Work Session',
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000 - 34 * 60 * 1000),
    type: 'work',
    productivity: 85
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoTracking, setAutoTracking] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const [recentSessions] = useState<Session[]>([
    {
      id: '1',
      name: 'Morning Workout',
      startTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
      type: 'exercise',
      productivity: 95
    },
    {
      id: '2',
      name: 'Project Planning',
      startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
      type: 'work',
      productivity: 78
    },
    {
      id: '3',
      name: 'Coffee Break',
      startTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 2.75 * 60 * 60 * 1000),
      type: 'break',
      productivity: 60
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - activeSession.startTime.getTime();
      const hours = Math.floor(elapsed / (1000 * 60 * 60));
      const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
      setSessionTime(`${hours}h ${minutes}m`);

      // Simulate connection strength fluctuation
      setConnectionStrength(prev => {
        const change = Math.random() * 4 - 2;
        return Math.max(85, Math.min(100, prev + change));
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const quickActions: QuickAction[] = [
    {
      id: 'focus',
      label: 'Focus Mode',
      icon: Target,
      color: 'from-purple-500 to-pink-500',
      gradient: 'bg-gradient-to-br from-purple-500/10 to-pink-500/10',
      action: () => {
        setMetrics(prev => ({ ...prev, focus: Math.min(10, prev.focus + 2) }));
        toast.success('Focus mode activated');
      }
    },
    {
      id: 'break',
      label: 'Take Break',
      icon: Coffee,
      color: 'from-orange-500 to-amber-500',
      gradient: 'bg-gradient-to-br from-orange-500/10 to-amber-500/10',
      action: () => {
        setMetrics(prev => ({ 
          ...prev, 
          stress: Math.max(0, prev.stress - 2),
          energy: Math.min(10, prev.energy + 1)
        }));
        toast.success('Break time initiated');
      }
    },
    {
      id: 'energize',
      label: 'Energize',
      icon: Zap,
      color: 'from-yellow-500 to-orange-500',
      gradient: 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10',
      action: () => {
        setMetrics(prev => ({ ...prev, energy: Math.min(10, prev.energy + 2) }));
        toast.success('Energy boost applied');
      }
    },
    {
      id: 'rest',
      label: 'Rest Mode',
      icon: Moon,
      color: 'from-blue-500 to-indigo-500',
      gradient: 'bg-gradient-to-br from-blue-500/10 to-indigo-500/10',
      action: () => {
        setMetrics(prev => ({ 
          ...prev, 
          stress: Math.max(0, prev.stress - 3),
          mood: Math.min(10, prev.mood + 1)
        }));
        toast.success('Rest mode enabled');
      }
    }
  ];

  const getMetricColor = (value: number) => {
    if (value >= 8) return 'text-emerald-500';
    if (value >= 5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMetricGradient = (value: number) => {
    if (value >= 8) return 'from-emerald-500 to-teal-500';
    if (value >= 5) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'work': return 'from-blue-500 to-cyan-500';
      case 'break': return 'from-orange-500 to-amber-500';
      case 'exercise': return 'from-green-500 to-emerald-500';
      case 'social': return 'from-purple-500 to-pink-500';
      case 'learning': return 'from-cyan-500 to-blue-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'work': return Target;
      case 'break': return Coffee;
      case 'exercise': return Activity;
      case 'social': return Heart;
      case 'learning': return Brain;
      default: return Monitor;
    }
  };

  const calculateOverallHealth = () => {
    const total = metrics.mood + metrics.energy + (10 - metrics.stress) + 
                  metrics.focus + metrics.motivation + metrics.physical;
    return Math.round((total / 60) * 100);
  };

  const handleExtendSession = async () => {
    setIsAnalyzing(true);
    setExtendDialogOpen(true);
    
    try {
      const elapsed = Date.now() - activeSession.startTime.getTime();
      const hours = Math.floor(elapsed / (1000 * 60 * 60));
      const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
      
      const response = await extendSessionAdvice({
        type: activeSession.name,
        duration: `${hours}h ${minutes}m`,
        productivity: activeSession.productivity,
        mood: metrics.mood,
        energy: metrics.energy,
        stress: metrics.stress,
        focus: metrics.focus
      });
      
      setAiAdvice(response.content);
      toast.success('AI analysis complete');
    } catch (error) {
      console.error('Error getting session advice:', error);
      toast.error('Failed to analyze session. Please try again.');
      setAiAdvice('Unable to get AI advice at this time.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEndSession = async () => {
    setIsAnalyzing(true);
    setEndDialogOpen(true);
    
    try {
      const elapsed = Date.now() - activeSession.startTime.getTime();
      const hours = Math.floor(elapsed / (1000 * 60 * 60));
      const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
      
      const response = await analyzeSession({
        type: activeSession.name,
        duration: `${hours}h ${minutes}m`,
        productivity: activeSession.productivity,
        mood: metrics.mood,
        energy: metrics.energy,
        stress: metrics.stress,
        focus: metrics.focus
      });
      
      setAiAdvice(response.content);
      toast.success('Session analyzed');
    } catch (error) {
      console.error('Error analyzing session:', error);
      toast.error('Failed to analyze session. Please try again.');
      setAiAdvice('Unable to get AI advice at this time.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const confirmEndSession = () => {
    toast.success('Session ended successfully');
    setEndDialogOpen(false);
    setAiAdvice('');
  };

  const healthScore = calculateOverallHealth();

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 h-0">
        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full">
          
          {/* Hero Section with Connection Status */}
          <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
            <CardHeader className="relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-xl">
                      <Monitor className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-xl sm:text-2xl lg:text-3xl mb-2">Remote Desktop of the Self</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Real-time monitoring and control of your mental and physical state
                    </CardDescription>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                        <span className="text-xs">
                          {isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                        <Wifi className="w-3 h-3" />
                        <span className="text-xs">{Math.round(connectionStrength)}% signal</span>
                      </div>
                      <Badge variant="outline" className="gap-1.5">
                        <Activity className="w-3 h-3" />
                        {sessionTime}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="shrink-0 hover:scale-105 transition-transform"
                  onClick={() => setSettingsOpen(true)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* System Health Hero Card */}
          <Card className="relative overflow-hidden border-2 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-background group hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-6 sm:p-8 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-2xl opacity-50" />
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-xl">
                      <Activity className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl mb-1">System Health</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Overall wellbeing</p>
                  </div>
                </div>
                <div className="text-center self-center sm:self-auto">
                  <div className="text-4xl sm:text-5xl lg:text-6xl bg-gradient-to-br from-blue-500 to-cyan-500 bg-clip-text text-transparent font-bold">
                    {healthScore}%
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : 'Needs attention'}
                  </p>
                </div>
              </div>
              <div className="relative">
                <Progress value={healthScore} className="h-3 sm:h-4" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-sm" />
              </div>
            </CardContent>
          </Card>

          {/* Real-Time Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Mood */}
            <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-2 hover:border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getMetricGradient(metrics.mood)} flex items-center justify-center shadow-lg`}>
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Mood</p>
                      <p className={`text-3xl ${getMetricColor(metrics.mood)}`}>{metrics.mood}/10</p>
                    </div>
                  </div>
                  <Sparkles className={`w-5 h-5 ${getMetricColor(metrics.mood)} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
                <Progress value={metrics.mood * 10} className="h-2" />
              </CardContent>
            </Card>

            {/* Energy */}
            <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-2 hover:border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getMetricGradient(metrics.energy)} flex items-center justify-center shadow-lg`}>
                      <Battery className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Energy</p>
                      <p className={`text-3xl ${getMetricColor(metrics.energy)}`}>{metrics.energy}/10</p>
                    </div>
                  </div>
                  <Zap className={`w-5 h-5 ${getMetricColor(metrics.energy)} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
                <Progress value={metrics.energy * 10} className="h-2" />
              </CardContent>
            </Card>

            {/* Stress */}
            <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-2 hover:border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${metrics.stress <= 3 ? 'from-emerald-500 to-teal-500' : metrics.stress <= 6 ? 'from-yellow-500 to-orange-500' : 'from-red-500 to-pink-500'} flex items-center justify-center shadow-lg`}>
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Stress</p>
                      <p className={`text-3xl ${metrics.stress <= 3 ? 'text-emerald-500' : metrics.stress <= 6 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {metrics.stress}/10
                      </p>
                    </div>
                  </div>
                  <Waves className={`w-5 h-5 ${metrics.stress <= 3 ? 'text-emerald-500' : metrics.stress <= 6 ? 'text-yellow-500' : 'text-red-500'} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
                <Progress value={metrics.stress * 10} className="h-2" />
              </CardContent>
            </Card>

            {/* Focus */}
            <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-2 hover:border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getMetricGradient(metrics.focus)} flex items-center justify-center shadow-lg`}>
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Focus</p>
                      <p className={`text-3xl ${getMetricColor(metrics.focus)}`}>{metrics.focus}/10</p>
                    </div>
                  </div>
                  <Target className={`w-5 h-5 ${getMetricColor(metrics.focus)} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
                <Progress value={metrics.focus * 10} className="h-2" />
              </CardContent>
            </Card>

            {/* Motivation */}
            <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-2 hover:border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getMetricGradient(metrics.motivation)} flex items-center justify-center shadow-lg`}>
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Motivation</p>
                      <p className={`text-3xl ${getMetricColor(metrics.motivation)}`}>{metrics.motivation}/10</p>
                    </div>
                  </div>
                  <Sun className={`w-5 h-5 ${getMetricColor(metrics.motivation)} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
                <Progress value={metrics.motivation * 10} className="h-2" />
              </CardContent>
            </Card>

            {/* Physical */}
            <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-2 hover:border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getMetricGradient(metrics.physical)} flex items-center justify-center shadow-lg`}>
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Physical</p>
                      <p className={`text-3xl ${getMetricColor(metrics.physical)}`}>{metrics.physical}/10</p>
                    </div>
                  </div>
                  <Wind className={`w-5 h-5 ${getMetricColor(metrics.physical)} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
                <Progress value={metrics.physical * 10} className="h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-2 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Instantly adjust your state with these control commands
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                {quickActions.map(action => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.id}
                      variant="outline"
                      className={`h-auto py-4 sm:py-6 flex-col gap-2 sm:gap-3 group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-2 ${action.gradient}`}
                      onClick={action.action}
                    >
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <span className="text-xs sm:text-sm">{action.label}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Active Session Card */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    Active Session
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {activeSession.name}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {sessionTime}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-lg bg-muted/50 border">
                  <p className="text-xs text-muted-foreground mb-1">Type</p>
                  <p className="text-sm sm:text-base capitalize truncate">{activeSession.type}</p>
                </div>
                <div className="p-3 sm:p-4 rounded-lg bg-muted/50 border">
                  <p className="text-xs text-muted-foreground mb-1">Productivity</p>
                  <p className="text-sm sm:text-base text-emerald-500">{activeSession.productivity}%</p>
                </div>
                <div className="p-3 sm:p-4 rounded-lg bg-muted/50 border">
                  <p className="text-xs text-muted-foreground mb-1">Started</p>
                  <p className="text-xs sm:text-sm truncate">{activeSession.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="p-3 sm:p-4 rounded-lg bg-muted/50 border">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <p className="text-sm sm:text-base text-emerald-500 truncate">Active</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleExtendSession}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Extend Session
                </Button>
                <Button 
                  onClick={handleEndSession}
                  variant="outline"
                  className="flex-1"
                >
                  <Power className="w-4 h-4 mr-2" />
                  End Session
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Session History */}
          <Card className="border-2 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Recent Sessions
              </CardTitle>
              <CardDescription>
                Your activity history from today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSessions.map(session => {
                  const Icon = getSessionTypeIcon(session.type);
                  const duration = session.endTime 
                    ? Math.round((session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60))
                    : 0;
                  
                  return (
                    <div key={session.id} className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 bg-card hover:bg-accent/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${getSessionTypeColor(session.type)} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="truncate mb-1 text-sm sm:text-base">{session.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {duration}m
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2 flex-shrink-0">
                        <Badge variant="outline" className="capitalize text-xs hidden sm:inline-flex">
                          {session.type}
                        </Badge>
                        <Badge variant="secondary" className={`text-xs ${session.productivity >= 80 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : ''}`}>
                          {session.productivity}%
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

        </div>
      </ScrollArea>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remote Interface Settings</DialogTitle>
            <DialogDescription>
              Configure your system monitoring and session preferences
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Tracking</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically track sessions and metrics
                </p>
              </div>
              <Switch checked={autoTracking} onCheckedChange={setAutoTracking} />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts for state changes and recommendations
                </p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Connection Threshold</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Minimum signal strength: {Math.round(connectionStrength)}%
              </p>
              <Slider
                value={[connectionStrength]}
                onValueChange={(value) => setConnectionStrength(value[0])}
                min={50}
                max={100}
                step={1}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => {
              setSettingsOpen(false);
              toast.success('Settings saved');
            }}>
              Save Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Extend Session Dialog */}
      <Dialog open={extendDialogOpen} onOpenChange={setExtendDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Extend Session?</DialogTitle>
            <DialogDescription>
              AI-powered recommendation for extending your current session
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {isAnalyzing ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground">Analyzing your session...</p>
                </div>
              </div>
            ) : aiAdvice ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="p-4 rounded-lg bg-muted/50 whitespace-pre-wrap">
                  {aiAdvice}
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setExtendDialogOpen(false);
              setAiAdvice('');
            }}>
              Close
            </Button>
            <Button onClick={() => {
              toast.success('Session extended');
              setExtendDialogOpen(false);
              setAiAdvice('');
            }}>
              Extend Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* End Session Dialog */}
      <Dialog open={endDialogOpen} onOpenChange={setEndDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>End Session</DialogTitle>
            <DialogDescription>
              Session analysis and insights
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {isAnalyzing ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground">Analyzing your session performance...</p>
                </div>
              </div>
            ) : aiAdvice ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="p-4 rounded-lg bg-muted/50 whitespace-pre-wrap">
                  {aiAdvice}
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setEndDialogOpen(false);
              setAiAdvice('');
            }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmEndSession}>
              End Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
