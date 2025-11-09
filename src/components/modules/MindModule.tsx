import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

import {
  Brain,
  Zap,
  Target,
  Lightbulb,
  Network,
  Activity,
  GitBranch,
  Eye,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Agent } from '../../types/agent';
import { useModuleData } from '../../lib/hooks/useModuleData';

interface MindModuleProps {
  agents?: Agent[];
}

interface CognitiveProcess {
  id: string;
  type: 'reasoning' | 'decision' | 'planning' | 'learning' | 'coordination';
  status: 'active' | 'completed' | 'pending';
  description: string;
  confidence: number;
}

const cognitiveCategories = [
  { name: 'Reasoning', icon: Brain, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { name: 'Memory', icon: Sparkles, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { name: 'Learning', icon: Lightbulb, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { name: 'Planning', icon: Target, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { name: 'Decision', icon: GitBranch, color: 'bg-violet-100 text-violet-700 border-violet-200' },
  { name: 'Insight', icon: Eye, color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { name: 'Focus', icon: Zap, color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { name: 'Network', icon: Network, color: 'bg-green-100 text-green-700 border-green-200' },
];

export function MindModule({ agents = [] }: MindModuleProps) {
  const [processes, setProcesses] = useModuleData<CognitiveProcess[]>('mind-processes', []);
  const [cognitiveLoad, setCognitiveLoad] = useState(45);
  const [accuracy, setAccuracy] = useState(87);

  // Generate processes
  useEffect(() => {
    const generateProcess = () => {
      const types: CognitiveProcess['type'][] = ['reasoning', 'decision', 'planning', 'learning', 'coordination'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      const descriptions = {
        reasoning: [
          'Analyzing causal relationships in task dependencies',
          'Evaluating logical consistency of responses',
          'Constructing inference chains for problem solving',
        ],
        decision: [
          'Weighing trade-offs between speed and accuracy',
          'Selecting optimal agent for task assignment',
          'Determining priority levels for requests',
        ],
        planning: [
          'Generating multi-step execution strategy',
          'Optimizing resource allocation',
          'Scheduling tasks based on dependencies',
        ],
        learning: [
          'Updating performance models',
          'Refining decision-making heuristics',
          'Integrating feedback into knowledge base',
        ],
        coordination: [
          'Synchronizing agent actions',
          'Resolving conflicts between goals',
          'Facilitating information sharing',
        ]
      };

      const newProcess: CognitiveProcess = {
        id: `proc_${Date.now()}_${Math.random()}`,
        type,
        status: 'active',
        description: descriptions[type][Math.floor(Math.random() * descriptions[type].length)],
        confidence: 65 + Math.random() * 35
      };

      setProcesses(prev => {
        // Keep only 4 cards - new one replaces oldest
        const updated = [newProcess, ...prev.slice(0, 3)];
        return updated.map((p, i) => 
          i > 0 && Math.random() > 0.7 ? { ...p, status: 'completed' as const } : p
        );
      });
    };

    const interval = setInterval(generateProcess, 3000);
    // Initialize with 4 processes
    for (let i = 0; i < 4; i++) {
      setTimeout(generateProcess, i * 400);
    }

    return () => clearInterval(interval);
  }, []);

  // Update metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setCognitiveLoad(prev => Math.max(20, Math.min(95, prev + (Math.random() - 0.5) * 12)));
      setAccuracy(prev => Math.max(70, Math.min(98, prev + (Math.random() - 0.5) * 3)));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const processTypeConfig = {
    reasoning: { color: 'text-blue-600', bg: 'bg-blue-50/50', border: 'border-blue-200' },
    decision: { color: 'text-purple-600', bg: 'bg-purple-50/50', border: 'border-purple-200' },
    planning: { color: 'text-emerald-600', bg: 'bg-emerald-50/50', border: 'border-emerald-200' },
    learning: { color: 'text-amber-600', bg: 'bg-amber-50/50', border: 'border-amber-200' },
    coordination: { color: 'text-orange-600', bg: 'bg-orange-50/50', border: 'border-orange-200' }
  };

  const activeProcesses = processes.filter(p => p.status === 'active').length;
  const completedProcesses = processes.filter(p => p.status === 'completed').length;

  return (
    <div className="h-full flex flex-col bg-background">
      <ScrollArea className="flex-1 h-0">
        <div className="p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h2>Cognitive Core</h2>
                <p className="text-muted-foreground">
                  Monitor and analyze real-time cognitive processes, decision-making patterns, and neural activity
                </p>
              </div>
            </div>

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
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  Active
                </Badge>
              </div>
              <p className="text-2xl font-semibold mb-1">{agents.length}</p>
              <p className="text-sm text-muted-foreground">AI Agents</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-emerald-600" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  Running
                </Badge>
              </div>
              <p className="text-2xl font-semibold mb-1">{activeProcesses}</p>
              <p className="text-sm text-muted-foreground">Active Processes</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {cognitiveLoad > 70 ? 'High' : cognitiveLoad > 40 ? 'Medium' : 'Low'}
                </Badge>
              </div>
              <p className="text-2xl font-semibold mb-1">{Math.round(cognitiveLoad)}%</p>
              <p className="text-sm text-muted-foreground">Cognitive Load</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-amber-600" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {accuracy > 90 ? 'Excellent' : accuracy > 75 ? 'Good' : 'Fair'}
                </Badge>
              </div>
              <p className="text-2xl font-semibold mb-1">{accuracy.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cognitive Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Cognitive Capabilities
              </CardTitle>
              <CardDescription>
                Neural modules powering HOS intelligence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {cognitiveCategories.map((category, index) => (
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

        {/* Live Processes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Live Cognitive Processes
                  </CardTitle>
                  <CardDescription>
                    Real-time neural activity and decision-making
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-muted-foreground">Live</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <AnimatePresence mode="popLayout">
                  {processes.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12 text-muted-foreground col-span-full"
                    >
                      <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Initializing cognitive processes...</p>
                    </motion.div>
                  ) : (
                    processes.map((process, index) => {
                      const config = processTypeConfig[process.type];
                      return (
                        <motion.div
                          key={process.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                          className={`p-4 rounded-xl ${config.bg} border-2 ${config.border} hover:shadow-md transition-all`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className={`text-xs ${config.color}`}>
                                {process.type}
                              </Badge>
                              {process.status === 'completed' ? (
                                <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Completed
                                </Badge>
                              ) : process.status === 'active' ? (
                                <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse mr-1" />
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  Pending
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs font-medium text-muted-foreground">
                                {process.confidence.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          <p className="text-sm leading-relaxed">
                            {process.description}
                          </p>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
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
              <CardTitle className="text-base">Processing Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Active Processes</span>
                </div>
                <span className="text-sm font-semibold">{activeProcesses}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">Cognitive Load</span>
                </div>
                <span className="text-sm font-semibold">{Math.round(cognitiveLoad)}%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-600" />
                  <span className="text-sm">Accuracy</span>
                </div>
                <span className="text-sm font-semibold">{accuracy.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Response Time</span>
                </div>
                <span className="text-sm font-semibold">1.2s</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-base">Neural Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Reasoning</span>
                </div>
                <span className="text-sm font-semibold">95%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Decision</span>
                </div>
                <span className="text-sm font-semibold">88%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Learning</span>
                </div>
                <span className="text-sm font-semibold">92%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Coordination</span>
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