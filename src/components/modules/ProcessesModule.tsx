import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import {
  CheckCircle2,
  Clock,
  Zap,
  PlayCircle,
  Target,
  Activity,
  Workflow,
  Layers,
  BarChart3,
  Timer,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

const processCategories = [
  { name: 'Execution', icon: PlayCircle, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { name: 'Queue', icon: Layers, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { name: 'Monitor', icon: Activity, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { name: 'Schedule', icon: Clock, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { name: 'Priority', icon: Target, color: 'bg-violet-100 text-violet-700 border-violet-200' },
  { name: 'Analytics', icon: BarChart3, color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { name: 'Speed', icon: Zap, color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { name: 'Timer', icon: Timer, color: 'bg-green-100 text-green-700 border-green-200' },
];

// Mock tasks data for standalone module
const mockTasks = [
  { id: '1', status: 'in-progress', title: 'Process A', priority: 'high' },
  { id: '2', status: 'in-progress', title: 'Process B', priority: 'medium' },
  { id: '3', status: 'pending', title: 'Process C', priority: 'low' },
  { id: '4', status: 'pending', title: 'Process D', priority: 'medium' },
  { id: '5', status: 'completed', title: 'Process E', priority: 'high' },
  { id: '6', status: 'completed', title: 'Process F', priority: 'high' },
  { id: '7', status: 'completed', title: 'Process G', priority: 'medium' },
  { id: '8', status: 'failed', title: 'Process H', priority: 'low' },
];

export function ProcessesModule() {
  const tasks = mockTasks;
  const activeTasks = tasks.filter(t => t.status === 'in-progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const failedTasks = tasks.filter(t => t.status === 'failed').length;

  const successRate = completedTasks > 0 ? Math.round((completedTasks / (completedTasks + failedTasks)) * 100) : 95;

  return (
    <div className="h-full flex flex-col bg-background">
      <ScrollArea className="flex-1 h-0">
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
          <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10">
            <Workflow className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Task Manager</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Orchestrate and monitor task execution, process queues, and system performance in real-time
          </p>
        </motion.div>

        {/* Main Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <PlayCircle className="w-6 h-6 text-blue-600" />
                </div>
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse mr-1" />
                  Active
                </Badge>
              </div>
              <p className="text-2xl font-semibold mb-1">{activeTasks}</p>
              <p className="text-sm text-muted-foreground">Running Now</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  Queued
                </Badge>
              </div>
              <p className="text-2xl font-semibold mb-1">{pendingTasks}</p>
              <p className="text-sm text-muted-foreground">In Queue</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
                  Done
                </Badge>
              </div>
              <p className="text-2xl font-semibold mb-1">{completedTasks}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {successRate >= 90 ? 'Excellent' : successRate >= 75 ? 'Good' : 'Fair'}
                </Badge>
              </div>
              <p className="text-2xl font-semibold mb-1">{successRate}%</p>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Process Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Process Management
              </CardTitle>
              <CardDescription>
                Automated task orchestration and execution modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {processCategories.map((category, index) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    className="group"
                  >
                    <div className={`p-4 rounded-xl border-2 ${category.color} hover:shadow-md transition-all cursor-pointer`}>
                      <category.icon className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-medium">{category.name}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-base">Task Execution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Active Tasks</span>
                </div>
                <span className="text-sm font-semibold">{activeTasks}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-sm">Queued</span>
                </div>
                <span className="text-sm font-semibold">{pendingTasks}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Completed</span>
                </div>
                <span className="text-sm font-semibold">{completedTasks}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm">Failed</span>
                </div>
                <span className="text-sm font-semibold">{failedTasks}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-base">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Success Rate</span>
                </div>
                <span className="text-sm font-semibold">{successRate}%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Avg Duration</span>
                </div>
                <span className="text-sm font-semibold">2.3m</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">Throughput</span>
                </div>
                <span className="text-sm font-semibold">18/h</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm">Queue Health</span>
                </div>
                <span className="text-sm font-semibold">85%</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}