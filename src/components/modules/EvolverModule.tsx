import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Progress } from '../ui/progress';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import {
  Brain,
  Zap,
  Activity,
  TrendingUp,
  Code,
  Cpu,
  Eye,
  GitBranch,
  Sparkles,
  Network,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Database,
  Terminal,
  BarChart3,
  Waves,
  Scan,
  RefreshCw,
  PlayCircle,
  PauseCircle,
  Rocket,
  Target
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell, PieChart, Pie } from 'recharts';
import { Agent, Task, Evolution } from '../../types/agent';
import { toast } from 'sonner@2.0.3';

interface EvolverModuleProps {
  agents?: Agent[];
  tasks?: Task[];
  evolutions?: Evolution[];
  modules?: string[];
}

interface EvolutionLog {
  id: string;
  timestamp: Date;
  phase: 'scan' | 'analyze' | 'propose' | 'implement' | 'test' | 'deploy';
  module: string;
  action: string;
  impact: number;
  status: 'success' | 'warning' | 'error' | 'info';
  code?: string;
}

interface CodeChange {
  id: string;
  file: string;
  type: 'create' | 'modify' | 'optimize' | 'refactor';
  linesAdded: number;
  linesRemoved: number;
  timestamp: Date;
  confidence: number;
}

interface AutonomousMetrics {
  cyclesCompleted: number;
  improvementsDeployed: number;
  performanceGain: number;
  codeOptimization: number;
  autonomyLevel: number;
  learningRate: number;
}

export function EvolverModule({ 
  agents = [], 
  tasks = [], 
  evolutions = [],
  modules = []
}: EvolverModuleProps) {
  // Autonomous mode state
  const [isAutonomous, setIsAutonomous] = useState(true);
  const [autonomyLevel, setAutonomyLevel] = useState(85); // 0-100%
  const [evolutionSpeed, setEvolutionSpeed] = useState(5); // 1-10 (seconds per cycle)
  const [currentPhase, setCurrentPhase] = useState<'scanning' | 'analyzing' | 'proposing' | 'implementing' | 'testing' | 'deploying' | 'idle'>('idle');
  
  // Evolution data
  const [logs, setLogs] = useState<EvolutionLog[]>([]);
  const [codeChanges, setCodeChanges] = useState<CodeChange[]>([]);
  const [metrics, setMetrics] = useState<AutonomousMetrics>({
    cyclesCompleted: 0,
    improvementsDeployed: 0,
    performanceGain: 0,
    codeOptimization: 0,
    autonomyLevel: 85,
    learningRate: 0.12
  });

  // Real-time metrics
  const [cpuUsage, setCpuUsage] = useState(45);
  const [memoryUsage, setMemoryUsage] = useState(62);
  const [evolutionProgress, setEvolutionProgress] = useState(0);
  const [activeModules, setActiveModules] = useState<string[]>([]);
  
  // Performance tracking
  const [performanceHistory, setPerformanceHistory] = useState<Array<{ time: string; performance: number; optimization: number }>>([]);
  const [moduleHealth, setModuleHealth] = useState<Array<{ module: string; health: number }>>([]);

  const cycleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const phaseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize performance data
  useEffect(() => {
    const now = new Date();
    const initialData = [];
    for (let i = 20; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60000);
      initialData.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        performance: 75 + Math.random() * 20,
        optimization: 60 + Math.random() * 30
      });
    }
    setPerformanceHistory(initialData);

    // Initialize module health
    const moduleList = ['Dashboard', 'AI Studio', 'Voice Agency', 'Node Editor', 'Evolver', 'Mind', 'Memory', 'Timeline'];
    setModuleHealth(moduleList.map(m => ({
      module: m,
      health: 70 + Math.random() * 30
    })));

    // Add initial log
    addLog({
      phase: 'scan',
      module: 'System',
      action: 'Self Update Engine initialized - Autonomous mode ready',
      impact: 0,
      status: 'success'
    });
  }, []);

  // Autonomous evolution cycle
  useEffect(() => {
    if (isAutonomous) {
      startAutonomousCycle();
    } else {
      stopAutonomousCycle();
    }

    return () => stopAutonomousCycle();
  }, [isAutonomous, evolutionSpeed]);

  // Real-time system metrics simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => Math.max(20, Math.min(95, prev + (Math.random() - 0.5) * 15)));
      setMemoryUsage(prev => Math.max(40, Math.min(90, prev + (Math.random() - 0.5) * 10)));
      
      // Update performance history
      setPerformanceHistory(prev => {
        const now = new Date();
        const newEntry = {
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          performance: 75 + Math.random() * 20 + metrics.performanceGain * 0.1,
          optimization: 60 + Math.random() * 30 + metrics.codeOptimization * 0.1
        };
        return [...prev.slice(-19), newEntry];
      });

      // Update module health
      setModuleHealth(prev => prev.map(m => ({
        ...m,
        health: Math.max(60, Math.min(100, m.health + (Math.random() - 0.4) * 5))
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, [metrics]);

  const startAutonomousCycle = () => {
    const cycleTime = evolutionSpeed * 1000;
    
    cycleIntervalRef.current = setInterval(() => {
      runEvolutionCycle();
    }, cycleTime);
  };

  const stopAutonomousCycle = () => {
    if (cycleIntervalRef.current) {
      clearInterval(cycleIntervalRef.current);
      cycleIntervalRef.current = null;
    }
    if (phaseTimeoutRef.current) {
      clearTimeout(phaseTimeoutRef.current);
      phaseTimeoutRef.current = null;
    }
    setCurrentPhase('idle');
    setEvolutionProgress(0);
  };

  const runEvolutionCycle = async () => {
    const phases: Array<typeof currentPhase> = ['scanning', 'analyzing', 'proposing', 'implementing', 'testing', 'deploying'];
    const phaseActions = [
      { phase: 'scanning', action: 'Scanning all HOS modules for optimization opportunities', module: 'Scanner' },
      { phase: 'analyzing', action: 'Deep analysis of system performance patterns', module: 'Analyzer' },
      { phase: 'proposing', action: 'Generating evolution proposals based on findings', module: 'Proposer' },
      { phase: 'implementing', action: 'Auto-implementing approved optimizations', module: 'Implementer' },
      { phase: 'testing', action: 'Running comprehensive test suite', module: 'Validator' },
      { phase: 'deploying', action: 'Deploying improvements to live system', module: 'Deployer' }
    ];

    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      const phaseData = phaseActions[i];
      
      setCurrentPhase(phase);
      setEvolutionProgress((i / phases.length) * 100);
      
      // Add log for phase
      addLog({
        phase: phaseData.phase as any,
        module: phaseData.module,
        action: phaseData.action,
        impact: Math.random() * 15 + 5,
        status: Math.random() > 0.1 ? 'success' : 'warning'
      });

      // Simulate phase work
      await new Promise(resolve => {
        phaseTimeoutRef.current = setTimeout(resolve, (evolutionSpeed * 1000) / phases.length);
      });

      // Add code changes during implementation phase
      if (phase === 'implementing' && Math.random() > 0.3) {
        const files = [
          'components/modules/DashboardModule.tsx',
          'lib/evolver/optimizer.ts',
          'components/PerformanceChart.tsx',
          'lib/ai/service.ts',
          'components/modules/AIgencyModule.tsx'
        ];
        
        addCodeChange({
          file: files[Math.floor(Math.random() * files.length)],
          type: ['create', 'modify', 'optimize', 'refactor'][Math.floor(Math.random() * 4)] as any,
          linesAdded: Math.floor(Math.random() * 50) + 5,
          linesRemoved: Math.floor(Math.random() * 30),
          confidence: 70 + Math.random() * 30
        });
      }
    }

    // Complete cycle
    setCurrentPhase('idle');
    setEvolutionProgress(100);
    
    // Update metrics
    setMetrics(prev => ({
      ...prev,
      cyclesCompleted: prev.cyclesCompleted + 1,
      improvementsDeployed: prev.improvementsDeployed + (Math.random() > 0.5 ? 1 : 0),
      performanceGain: Math.min(100, prev.performanceGain + Math.random() * 2),
      codeOptimization: Math.min(100, prev.codeOptimization + Math.random() * 1.5),
      learningRate: Math.min(1, prev.learningRate + Math.random() * 0.001)
    }));

    setTimeout(() => setEvolutionProgress(0), 1000);
  };

  const addLog = (logData: Omit<EvolutionLog, 'id' | 'timestamp'>) => {
    const newLog: EvolutionLog = {
      id: `log_${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
      ...logData
    };
    setLogs(prev => [newLog, ...prev.slice(0, 99)]);
  };

  const addCodeChange = (changeData: Omit<CodeChange, 'id' | 'timestamp'>) => {
    const newChange: CodeChange = {
      id: `change_${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
      ...changeData
    };
    setCodeChanges(prev => [newChange, ...prev.slice(0, 49)]);
  };

  const getPhaseIcon = () => {
    switch (currentPhase) {
      case 'scanning': return <Scan className="w-5 h-5 animate-pulse" />;
      case 'analyzing': return <Brain className="w-5 h-5 animate-pulse" />;
      case 'proposing': return <Sparkles className="w-5 h-5 animate-pulse" />;
      case 'implementing': return <Code className="w-5 h-5 animate-pulse" />;
      case 'testing': return <Activity className="w-5 h-5 animate-pulse" />;
      case 'deploying': return <Rocket className="w-5 h-5 animate-pulse" />;
      default: return <RefreshCw className="w-5 h-5" />;
    }
  };

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'scanning': return 'text-blue-500';
      case 'analyzing': return 'text-purple-500';
      case 'proposing': return 'text-yellow-500';
      case 'implementing': return 'text-green-500';
      case 'testing': return 'text-orange-500';
      case 'deploying': return 'text-pink-500';
      default: return 'text-muted-foreground';
    }
  };

  const logTypeConfig = {
    success: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    warning: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    info: { icon: Zap, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' }
  };

  const changeTypeColors = {
    create: '#22c55e',
    modify: '#3b82f6',
    optimize: '#a855f7',
    refactor: '#f59e0b'
  };

  const changeTypeData = [
    { name: 'Create', value: codeChanges.filter(c => c.type === 'create').length, color: changeTypeColors.create },
    { name: 'Modify', value: codeChanges.filter(c => c.type === 'modify').length, color: changeTypeColors.modify },
    { name: 'Optimize', value: codeChanges.filter(c => c.type === 'optimize').length, color: changeTypeColors.optimize },
    { name: 'Refactor', value: codeChanges.filter(c => c.type === 'refactor').length, color: changeTypeColors.refactor }
  ];

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 h-0">
        <div className="p-4 sm:p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2">
                <Brain className="w-6 h-6" />
                Self Update Engine
              </h2>
          <p className="text-muted-foreground">
            Autonomous continuous evolution system
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Autonomous Mode</span>
            <Switch
              checked={isAutonomous}
              onCheckedChange={setIsAutonomous}
            />
          </div>
          {isAutonomous ? (
            <Badge className="gap-2 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              Self-Evolving
            </Badge>
          ) : (
            <Badge variant="secondary">Manual Mode</Badge>
          )}
        </div>
      </div>

      {/* Live Status Panel */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-background via-background to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className={getPhaseColor()}>
              {getPhaseIcon()}
            </div>
            Current Phase: {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Evolution Progress</span>
              <span className="font-mono">{Math.round(evolutionProgress)}%</span>
            </div>
            <Progress value={evolutionProgress} className="h-3" />
          </div>
          
          {isAutonomous && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Cycle Interval</span>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[evolutionSpeed]}
                    onValueChange={([value]) => setEvolutionSpeed(value)}
                    min={1}
                    max={10}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono w-8">{evolutionSpeed}s</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Autonomy Level</span>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[autonomyLevel]}
                    onValueChange={([value]) => setAutonomyLevel(value)}
                    min={0}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono w-12">{autonomyLevel}%</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Cycles</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{metrics.cyclesCompleted}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Improvements</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{metrics.improvementsDeployed}</div>
            <p className="text-xs text-muted-foreground">Deployed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">+{metrics.performanceGain.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Gain</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Optimization</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{metrics.codeOptimization.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">Code Quality</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Neural Load</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{Math.round(cpuUsage)}%</div>
            <p className="text-xs text-muted-foreground">Processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Learning Rate</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{metrics.learningRate.toFixed(3)}</div>
            <p className="text-xs text-muted-foreground">Adaptive</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="live" className="space-y-4">
        <div className="w-full overflow-x-auto">
          <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-5">
            <TabsTrigger value="live" className="whitespace-nowrap px-3 sm:px-4">
              <span className="hidden sm:inline">Live Monitor</span>
              <span className="sm:hidden">Live</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="whitespace-nowrap px-3 sm:px-4">Analytics</TabsTrigger>
            <TabsTrigger value="code" className="whitespace-nowrap px-3 sm:px-4">
              <span className="hidden sm:inline">Code Changes</span>
              <span className="sm:hidden">Code</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="whitespace-nowrap px-3 sm:px-4">
              <span className="hidden sm:inline">Evolution Logs</span>
              <span className="sm:hidden">Logs</span>
            </TabsTrigger>
            <TabsTrigger value="modules" className="whitespace-nowrap px-3 sm:px-4">
              <span className="hidden sm:inline">Module Health</span>
              <span className="sm:hidden">Health</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Live Monitor */}
        <TabsContent value="live" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Real-Time Performance
                </CardTitle>
                <CardDescription>System optimization over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={performanceHistory}>
                    <defs>
                      <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorOpt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="performance" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPerf)" strokeWidth={2} />
                    <Area type="monotone" dataKey="optimization" stroke="#a855f7" fillOpacity={1} fill="url(#colorOpt)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Change Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5" />
                  Change Distribution
                </CardTitle>
                <CardDescription>Types of code modifications</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={changeTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {changeTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {changeTypeData.map((type, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                      <span className="text-xs text-muted-foreground">{type.name}: {type.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Stream */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Live Evolution Stream
              </CardTitle>
              <CardDescription>Real-time autonomous improvements</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[350px]">
                <div className="space-y-2">
                  {logs.slice(0, 20).map(log => {
                    const config = logTypeConfig[log.status];
                    const Icon = config.icon;
                    
                    return (
                      <div
                        key={log.id}
                        className={`flex items-start gap-3 p-3 rounded-lg ${config.bg} border ${config.border}`}
                      >
                        <Icon className={`w-4 h-4 mt-0.5 ${config.color} flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">{log.module}</Badge>
                              <Badge variant="secondary" className="text-xs">{log.phase}</Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {log.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{log.action}</p>
                          {log.impact > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              <Progress value={log.impact * 5} className="h-1 flex-1" />
                              <span className="text-xs text-muted-foreground">+{log.impact.toFixed(1)}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Module Health Radar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5" />
                  Module Health Matrix
                </CardTitle>
                <CardDescription>Performance across all modules</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={moduleHealth}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="module" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Radar name="Health" dataKey="health" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* System Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Evolution Efficiency
                </CardTitle>
                <CardDescription>Autonomous decision making</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Autonomy Level</span>
                    <span className="font-mono">{autonomyLevel}%</span>
                  </div>
                  <Progress value={autonomyLevel} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Code Optimization</span>
                    <span className="font-mono">{metrics.codeOptimization.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.codeOptimization} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Performance Gain</span>
                    <span className="font-mono">+{metrics.performanceGain.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.performanceGain} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Learning Rate</span>
                    <span className="font-mono">{(metrics.learningRate * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.learningRate * 100} className="h-2" />
                </div>

                <div className="pt-4 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl">{metrics.cyclesCompleted}</div>
                    <p className="text-xs text-muted-foreground">Evolution Cycles</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl">{metrics.improvementsDeployed}</div>
                    <p className="text-xs text-muted-foreground">Auto-Deployed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Code Changes */}
        <TabsContent value="code" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Autonomous Code Modifications
              </CardTitle>
              <CardDescription>
                {codeChanges.length} changes made by the Self Update Engine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {codeChanges.map(change => (
                    <div key={change.id} className="p-4 rounded-lg border bg-muted/50">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          <Badge style={{ backgroundColor: changeTypeColors[change.type] }} className="text-xs">
                            {change.type}
                          </Badge>
                          <code className="text-xs bg-background px-2 py-1 rounded">{change.file}</code>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {change.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="text-green-500">+{change.linesAdded}</span> lines
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-red-500">-{change.linesRemoved}</span> lines
                        </span>
                        <span className="flex items-center gap-1">
                          Confidence: <span className="text-foreground">{change.confidence.toFixed(0)}%</span>
                        </span>
                      </div>

                      <div className="mt-2">
                        <Progress value={change.confidence} className="h-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evolution Logs */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Evolution Event Log
              </CardTitle>
              <CardDescription>Complete audit trail of all autonomous actions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {logs.map(log => {
                    const config = logTypeConfig[log.status];
                    const Icon = config.icon;
                    
                    return (
                      <div
                        key={log.id}
                        className={`flex items-start gap-3 p-3 rounded-lg ${config.bg} border ${config.border}`}
                      >
                        <Icon className={`w-4 h-4 mt-0.5 ${config.color} flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">{log.module}</Badge>
                              <Badge variant="secondary" className="text-xs">{log.phase}</Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {log.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{log.action}</p>
                          {log.impact > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-muted-foreground">Impact:</span>
                              <Progress value={log.impact * 5} className="h-1 flex-1" />
                              <span className="text-xs text-muted-foreground">+{log.impact.toFixed(1)}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Module Health */}
        <TabsContent value="modules" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {moduleHealth.map((module, idx) => (
              <Card key={idx}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">{module.module}</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{module.health.toFixed(0)}%</span>
                      <Badge variant={
                        module.health >= 90 ? 'default' :
                        module.health >= 70 ? 'secondary' :
                        'destructive'
                      }>
                        {module.health >= 90 ? 'Excellent' :
                         module.health >= 70 ? 'Good' :
                         'Needs Work'}
                      </Badge>
                    </div>
                    <Progress value={module.health} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Monitored by autonomous engine
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}
