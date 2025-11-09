import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ModuleOverview } from './ModuleOverview';
import { HOSWelcomeBanner } from '../HOSWelcomeBanner';
import { EvolverStatusWidget } from '../EvolverStatusWidget';
import { Agent, Task, Evolution } from '../../types/agent';
import { HOSModule } from '../../types/hos';
import { 
  Activity, 
  TrendingUp, 
  Zap, 
  Brain, 
  Cpu, 
  HardDrive, 
  Network, 
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowDownRight,
  ArrowUpRight,
  Radio,
  Database,
  Gauge,
  MemoryStick,
  Wifi,
  Server,
  GitBranch,
  Sparkles
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface DashboardModuleProps {
  agents: Agent[];
  tasks: Task[];
  evolutions: Evolution[];
  coreModules?: HOSModule[];
  humanModules?: HOSModule[];
  researchModules?: HOSModule[];
  onModuleClick?: (moduleId: string) => void;
  userName?: string;
  isTrialMode?: boolean;
}

interface SystemEvent {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
  module: string;
  message: string;
}

interface NetworkActivity {
  timestamp: string;
  requests: number;
  responses: number;
}

interface ResourceMetric {
  name: string;
  value: number;
  max: number;
  unit: string;
}

export function DashboardModule({ 
  agents, 
  tasks, 
  evolutions, 
  coreModules = [], 
  humanModules = [],
  researchModules = [],
  onModuleClick = () => {},
  userName,
  isTrialMode = false
}: DashboardModuleProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const activeAgents = agents.filter(a => a.status !== 'idle').length;
  const avgPerformance = Math.round(
    agents.reduce((sum, a) => sum + a.performance, 0) / agents.length
  );

  // Real-time system metrics
  const [cpuUsage, setCpuUsage] = useState(45);
  const [memoryUsage, setMemoryUsage] = useState(62);
  const [networkLoad, setNetworkLoad] = useState(38);
  const [dbConnections, setDbConnections] = useState(12);
  const [systemEvents, setSystemEvents] = useState<SystemEvent[]>([]);
  const [networkActivity, setNetworkActivity] = useState<NetworkActivity[]>([]);
  const [moduleHealth, setModuleHealth] = useState<{ [key: string]: number }>({});

  // Simulate real-time system metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => Math.max(20, Math.min(95, prev + (Math.random() - 0.5) * 10)));
      setMemoryUsage(prev => Math.max(40, Math.min(90, prev + (Math.random() - 0.5) * 8)));
      setNetworkLoad(prev => Math.max(10, Math.min(80, prev + (Math.random() - 0.5) * 15)));
      setDbConnections(prev => Math.max(5, Math.min(50, Math.floor(prev + (Math.random() - 0.5) * 3))));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Generate system events
  useEffect(() => {
    const generateEvent = () => {
      // Weight event types to be mostly positive (70% info, 20% success, 8% warning, 2% error)
      const rand = Math.random();
      let type: SystemEvent['type'];
      if (rand < 0.70) {
        type = 'info';
      } else if (rand < 0.90) {
        type = 'success';
      } else if (rand < 0.98) {
        type = 'warning';
      } else {
        type = 'error';
      }

      const modules = ['AI Studio', 'Evolver', 'Memory', 'Mind', 'Processes', 'Timeline', 'Voice Agency', 'Node Editor', 'HOS Chat', 'Cognitive Core'];
      
      const messages = {
        info: [
          'Health check completed',
          'Module synchronized',
          'Cache optimized',
          'Background task queued',
          'Metrics updated',
          'Session refreshed',
          'Data indexed',
          'State persisted',
          'Configuration validated',
          'Routine maintenance started'
        ],
        success: [
          'Agent initialized successfully',
          'Task completed',
          'Evolution applied',
          'Optimization deployed',
          'Performance improved',
          'Learning cycle completed',
          'Data synchronized',
          'Cache cleared successfully',
          'Update installed',
          'Backup completed'
        ],
        warning: [
          'Cache approaching capacity',
          'Response time slightly elevated',
          'Background task delayed',
          'Resource usage above average'
        ],
        error: [
          'Temporary connection issue (recovered)',
          'Cache refresh needed',
          'Non-critical service restarted',
          'Background task retry scheduled'
        ]
      };

      const module = modules[Math.floor(Math.random() * modules.length)];
      const messageList = messages[type];
      const message = messageList[Math.floor(Math.random() * messageList.length)];

      const newEvent: SystemEvent = {
        id: Date.now().toString() + Math.random(), // Ensure unique ID
        timestamp: new Date(),
        type,
        module,
        message
      };

      setSystemEvents(prev => [newEvent, ...prev.slice(0, 49)]);
    };

    const interval = setInterval(generateEvent, 3000);
    // Generate initial events
    for (let i = 0; i < 10; i++) {
      setTimeout(generateEvent, i * 300);
    }

    return () => clearInterval(interval);
  }, []);

  // Generate network activity data
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      setNetworkActivity(prev => {
        const newData = [
          ...prev.slice(-19),
          {
            timestamp: timeStr,
            requests: Math.floor(Math.random() * 50) + 20,
            responses: Math.floor(Math.random() * 50) + 20
          }
        ];
        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Calculate module health scores
  useEffect(() => {
    const allModules = [...coreModules, ...humanModules, ...researchModules];
    const health: { [key: string]: number } = {};
    
    allModules.forEach(module => {
      health[module.id] = Math.floor(Math.random() * 30) + 70; // 70-100% health
    });
    
    setModuleHealth(health);
  }, [coreModules, humanModules, researchModules]);

  // System health indicators
  const systemHealth = Math.round((
    (100 - cpuUsage) * 0.3 +
    (100 - memoryUsage) * 0.3 +
    (100 - networkLoad) * 0.2 +
    avgPerformance * 0.2
  ));

  const getHealthColor = (value: number) => {
    if (value >= 80) return 'text-green-500';
    if (value >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getHealthStatus = (value: number) => {
    if (value >= 80) return 'Excellent';
    if (value >= 60) return 'Good';
    if (value >= 40) return 'Fair';
    return 'Critical';
  };

  const eventTypeConfig = {
    info: { icon: Radio, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    success: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
    warning: { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' }
  };

  // Agent status distribution
  const agentStatusData = [
    { name: 'Active', value: agents.filter(a => a.status === 'executing').length, color: '#22c55e' },
    { name: 'Thinking', value: agents.filter(a => a.status === 'thinking').length, color: '#3b82f6' },
    { name: 'Learning', value: agents.filter(a => a.status === 'learning').length, color: '#a855f7' },
    { name: 'Idle', value: agents.filter(a => a.status === 'idle').length, color: '#6b7280' }
  ];

  // Task distribution
  const taskStatusData = [
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#22c55e' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, color: '#3b82f6' },
    { name: 'Pending', value: tasks.filter(t => t.status === 'pending').length, color: '#f59e0b' },
    { name: 'Failed', value: tasks.filter(t => t.status === 'failed').length, color: '#ef4444' }
  ];

  // Module performance radar
  const modulePerformanceData = [
    { module: 'AI Studio', performance: 95 },
    { module: 'Evolver', performance: 88 },
    { module: 'Mind', performance: 92 },
    { module: 'Memory', performance: 85 },
    { module: 'Timeline', performance: 90 },
    { module: 'Processes', performance: 87 }
  ];

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 h-0">
        <div className="p-4 sm:p-6 space-y-6">
          <HOSWelcomeBanner 
            userName={userName || "User"} 
            onChatClick={() => onModuleClick('chat')}
            isTrialMode={isTrialMode}
          />

      {/* System Health Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-2 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm truncate">System Health</CardTitle>
            <Gauge className={`h-4 w-4 sm:h-5 sm:w-5 ${getHealthColor(systemHealth)} flex-shrink-0`} />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-2">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className={`text-2xl sm:text-3xl ${getHealthColor(systemHealth)}`}>{systemHealth}%</span>
                <Badge variant={systemHealth >= 80 ? 'default' : systemHealth >= 60 ? 'secondary' : 'destructive'} className="text-xs">
                  {getHealthStatus(systemHealth)}
                </Badge>
              </div>
              <Progress value={systemHealth} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm truncate">Neural Load</CardTitle>
            <Cpu className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-2">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl sm:text-3xl">{Math.round(cpuUsage)}%</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  {cpuUsage > 70 ? <ArrowUpRight className="h-3 w-3 text-red-500" /> : <ArrowDownRight className="h-3 w-3 text-green-500" />}
                  {Math.abs(Math.round((cpuUsage - 50) / 10))}%
                </span>
              </div>
              <Progress value={cpuUsage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm truncate">Memory Cache</CardTitle>
            <MemoryStick className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-2">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl sm:text-3xl">{Math.round(memoryUsage)}%</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {((memoryUsage / 100) * 8).toFixed(1)} / 8 GB
                </span>
              </div>
              <Progress value={memoryUsage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm truncate">Network I/O</CardTitle>
            <Wifi className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-2">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl sm:text-3xl">{Math.round(networkLoad)}%</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {Math.round(networkLoad * 1.2)} Mbps
                </span>
              </div>
              <Progress value={networkLoad} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Core Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm truncate">Active Agents</CardTitle>
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
              <span className="text-xl sm:text-2xl">{activeAgents}</span>
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">/ {agents.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm truncate">Avg Performance</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
              <span className="text-xl sm:text-2xl">{avgPerformance}%</span>
              <Badge variant="secondary" className="text-xs">+2.3%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm truncate">Tasks</CardTitle>
            <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
              <span className="text-xl sm:text-2xl">{completedTasks}</span>
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">/ {totalTasks}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm truncate">DB Connections</CardTitle>
            <Database className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
              <span className="text-xl sm:text-2xl">{dbConnections}</span>
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">/ 50</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Network Activity Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Network Activity
            </CardTitle>
            <CardDescription>Real-time request/response monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={networkActivity}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="requests" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRequests)" strokeWidth={2} />
                <Area type="monotone" dataKey="responses" stroke="#22c55e" fillOpacity={1} fill="url(#colorResponses)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Agent Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Agent Distribution
            </CardTitle>
            <CardDescription>Current agent states</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={agentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {agentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {agentStatusData.map((status) => (
                <div key={`agent-status-${status.name}`} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
                  <span className="text-xs text-muted-foreground">{status.name}: {status.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Health & Task Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Task Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Task Pipeline
            </CardTitle>
            <CardDescription>Task execution status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={taskStatusData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {taskStatusData.map((entry) => (
                    <Cell key={`task-status-${entry.name}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* HOS Module Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              HOS Module Status
            </CardTitle>
            <CardDescription>Active module health monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              <div className="space-y-3">
                {[...coreModules, ...humanModules, ...researchModules].slice(0, 8).map((module) => {
                  const health = moduleHealth[module.id] || Math.floor(Math.random() * 30) + 70;
                  const isActive = Math.random() > 0.3;
                  
                  return (
                    <div key={`module-health-${module.id}`} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-green-500' : 'bg-slate-400'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm truncate">{module.name}</span>
                            {isActive && (
                              <Badge variant="secondary" className="text-xs">Active</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={health} className="h-1.5 flex-1" />
                            <span className={`text-xs ${health >= 80 ? 'text-green-500' : health >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                              {health}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Evolver */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Evolutions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Recent Evolutions
            </CardTitle>
            <CardDescription>{evolutions.length} system optimizations applied</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              <div className="space-y-3">
                {evolutions.slice(0, 10).map((evolution, idx) => (
                  <div key={evolution.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <GitBranch className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm">{evolution.module}</span>
                        <Badge variant="secondary" className="text-xs">+{evolution.impact}%</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {evolution.description}
                      </p>
                      <span className="text-xs text-muted-foreground mt-1 block">
                        {new Date(evolution.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Evolver Status Widget */}
        <div>
          <EvolverStatusWidget onOpenEvolver={() => onModuleClick('evolver')} />
        </div>
      </div>

      {/* Module Overview */}
      <ModuleOverview 
        coreModules={coreModules}
        humanModules={humanModules}
        researchModules={researchModules}
        onModuleClick={onModuleClick}
      />
        </div>
      </ScrollArea>
    </div>
  );
}