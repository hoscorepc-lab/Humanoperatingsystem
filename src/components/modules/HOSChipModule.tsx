import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsTrigger } from '../ui/tabs';
import { ResponsiveTabsList } from '../ui/responsive-tabs-list';
import { ScrollArea } from '../ui/scroll-area';
import { Progress } from '../ui/progress';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import {
  Cpu,
  Brain,
  Activity,
  Network,
  Zap,
  Database,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  History,
  Settings,
  GitBranch,
  Sparkles,
  BarChart3,
  Layers,
  ArrowLeftRight,
  Target,
  ThumbsUp,
  ThumbsDown,
  Code,
  Workflow,
  Lightbulb
} from 'lucide-react';
import { hosChipAPI } from '../../lib/hoschip/api';
import {
  NeuralArchiveEntry,
  ModulePerformanceMetric,
  EvaluationCycle,
  ConfigUpdate,
  SelfPatchLog,
  ChipMetrics,
  CommunicationLog,
  HOSChipConfig
} from '../../types/hoschip';
import { toast } from 'sonner@2.0.3';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { analyzeModuleHealth, analyzeTopPerformers, analyzeCognitiveBus, getLiveInsights } from '../../lib/hoschip/ai-service';

export function HOSChipModule() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [chipMetrics, setChipMetrics] = useState<ChipMetrics | null>(null);
  const [archiveEntries, setArchiveEntries] = useState<NeuralArchiveEntry[]>([]);
  const [moduleMetrics, setModuleMetrics] = useState<ModulePerformanceMetric[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationCycle[]>([]);
  const [proposedUpdates, setProposedUpdates] = useState<ConfigUpdate[]>([]);
  const [patchHistory, setPatchHistory] = useState<SelfPatchLog[]>([]);
  const [communications, setCommunications] = useState<CommunicationLog[]>([]);
  const [chipConfig, setChipConfig] = useState<HOSChipConfig | null>(null);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationCycle | null>(null);
  const [liveActivity, setLiveActivity] = useState<string[]>([]);
  const [nextEvaluation, setNextEvaluation] = useState<Date | null>(null);
  const [autoAppliedCount, setAutoAppliedCount] = useState(1);
  
  // AI Analysis states
  const [healthAnalysis, setHealthAnalysis] = useState<any>(null);
  const [topPerformersAnalysis, setTopPerformersAnalysis] = useState<any>(null);
  const [cognitiveBusAnalysis, setCognitiveBusAnalysis] = useState<any>(null);
  const [liveInsight, setLiveInsight] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Voting and patches states
  const [sessionId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const [patches, setPatches] = useState<ConfigUpdate[]>([]);

  // Generate simulated cognitive bus activity
  const generateCognitiveBusActivity = () => {
    const modules = [
      'HOS Chat', 'HOS Core', 'AI Studio', 'Evolver', 'Financial Research',
      'Deep Chat', 'Day Dreamer', 'LLM Trading', 'Motherboard', 'Dashboard',
      'HOS Chip', 'Memory', 'Kernel', 'Neural Network'
    ];
    
    const messageTypes: Array<'data' | 'request' | 'response' | 'event' | 'error'> = [
      'data', 'request', 'response', 'event'
    ];
    
    const from = modules[Math.floor(Math.random() * modules.length)];
    let to = modules[Math.floor(Math.random() * modules.length)];
    
    // Ensure from and to are different
    while (to === from) {
      to = modules[Math.floor(Math.random() * modules.length)];
    }
    
    const messageType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
    const latency = Math.floor(Math.random() * 50 + 10); // 10-60ms
    const success = Math.random() > 0.05; // 95% success rate
    
    const newComm: CommunicationLog = {
      id: `comm_${Date.now()}_${Math.random()}`,
      from,
      to,
      messageType,
      timestamp: new Date(),
      latency,
      success,
      metadata: { simulated: true }
    };
    
    setCommunications(prev => [newComm, ...prev.slice(0, 49)]); // Keep last 50
  };

  useEffect(() => {
    loadAllData();
    
    // Add initial activity to show system is running
    setLiveActivity([
      `${new Date().toLocaleTimeString()}: 🚀 HOS Chip initialized`,
      `${new Date().toLocaleTimeString()}: 🧠 Neural substrate active`,
      `${new Date().toLocaleTimeString()}: 📊 Loading system metrics...`,
    ]);
    
    // Run first evaluation immediately (with small delay for data loading)
    const initialEvalTimeout = setTimeout(() => {
      runAutonomousEvaluation();
    }, 2000); // 2 seconds to let data load
    
    // Refresh data every 30 seconds
    const refreshInterval = setInterval(() => {
      loadChipMetrics();
      loadArchiveEntries();
      loadCommunications();
    }, 30000);
    
    // Autonomous evaluation cycle - every 3 hours
    const evaluationInterval = setInterval(() => {
      runAutonomousEvaluation();
    }, 3 * 60 * 60 * 1000); // 3 hours
    
    // Calculate next evaluation time
    const now = new Date();
    const next = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    setNextEvaluation(next);
    
    // Generate cognitive bus activity every 2-5 seconds
    const busActivityInterval = setInterval(() => {
      generateCognitiveBusActivity();
    }, Math.random() * 3000 + 2000); // 2-5 seconds
    
    return () => {
      clearInterval(refreshInterval);
      clearInterval(evaluationInterval);
      clearInterval(busActivityInterval);
      clearTimeout(initialEvalTimeout);
    };
  }, []);

  // Run AI analysis when data is loaded and changes
  useEffect(() => {
    if (chipMetrics && moduleMetrics.length > 0 && communications.length > 0 && !isAnalyzing) {
      // Run AI analysis 5 seconds after data loads
      const analysisTimeout = setTimeout(() => {
        runAIAnalyses();
      }, 5000);
      
      return () => clearTimeout(analysisTimeout);
    }
  }, [chipMetrics, moduleMetrics.length, communications.length]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadChipMetrics(),
        loadArchiveEntries(),
        loadModuleMetrics(),
        loadEvaluations(),
        loadProposedUpdates(),
        loadPatchHistory(),
        loadCommunications(),
        loadChipConfig()
      ]);
      
      // Seed initial data if needed
      await seedInitialDataIfNeeded();
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load HOS Chip data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const seedInitialDataIfNeeded = async () => {
    // If we have no data, seed some initial interactions
    if (archiveEntries.length === 0) {
      const modules = [
        'HOS Chat', 'HOS Core', 'AI Studio', 'Evolver', 'Financial Research',
        'Deep Chat', 'Day Dreamer', 'LLM Trading', 'Motherboard'
      ];
      
      // Create some initial archive entries
      for (let i = 0; i < 10; i++) {
        const module = modules[Math.floor(Math.random() * modules.length)];
        const results: Array<'positive' | 'negative' | 'neutral'> = ['positive', 'positive', 'positive', 'negative', 'neutral'];
        const result = results[Math.floor(Math.random() * results.length)];
        
        try {
          await hosChipAPI.logInteraction({
            source: module,
            context: `Sample interaction ${i + 1} from ${module}`,
            response: `Response to interaction ${i + 1}`,
            result: result,
            metadata: { sample: true }
          });
        } catch (e) {
          // Ignore errors during seeding
        }
      }
      
      // Reload data after seeding
      await loadArchiveEntries();
      await loadModuleMetrics();
      await loadCommunications();
    }
  };

  const loadChipMetrics = async () => {
    try {
      const metrics = await hosChipAPI.getChipMetrics();
      setChipMetrics(metrics);
    } catch (error) {
      console.error('Error loading chip metrics:', error);
    }
  };

  const loadArchiveEntries = async () => {
    try {
      const entries = await hosChipAPI.getArchiveEntries(50);
      setArchiveEntries(entries);
    } catch (error) {
      console.error('Error loading archive:', error);
    }
  };

  const loadModuleMetrics = async () => {
    try {
      const metrics = await hosChipAPI.getModuleMetrics();
      setModuleMetrics(metrics);
    } catch (error) {
      console.error('Error loading module metrics:', error);
    }
  };

  const loadEvaluations = async () => {
    try {
      const evals = await hosChipAPI.getEvaluationCycles(10);
      setEvaluations(evals);
    } catch (error) {
      console.error('Error loading evaluations:', error);
    }
  };

  const loadProposedUpdates = async () => {
    try {
      const updates = await hosChipAPI.getProposedUpdates();
      // Initialize votes for updates that don't have them
      const updatesWithVotes = updates.map(update => ({
        ...update,
        votes: update.votes || { thumbsUp: 0, thumbsDown: 0, userVotes: {} },
        proposedAt: update.proposedAt || new Date().toISOString()
      }));
      setProposedUpdates(updatesWithVotes);
    } catch (error) {
      console.error('Error loading proposed updates:', error);
    }
  };

  const loadPatchHistory = async () => {
    try {
      const history = await hosChipAPI.getPatchHistory(20);
      setPatchHistory(history);
    } catch (error) {
      console.error('Error loading patch history:', error);
    }
  };

  const loadCommunications = async () => {
    try {
      const logs = await hosChipAPI.getCommunicationLogs(50);
      setCommunications(logs);
    } catch (error) {
      console.error('Error loading communications:', error);
    }
  };

  const loadChipConfig = async () => {
    try {
      const config = await hosChipAPI.getChipConfig();
      setChipConfig(config);
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const addLiveActivity = (message: string) => {
    setLiveActivity(prev => [
      `${new Date().toLocaleTimeString()}: ${message}`,
      ...prev.slice(0, 49) // Keep last 50 activities
    ]);
  };

  // AI Analysis Functions
  const runAIAnalyses = async () => {
    if (!chipMetrics || moduleMetrics.length === 0) return;
    
    setIsAnalyzing(true);
    addLiveActivity('🤖 Running AI analysis on system data...');
    
    try {
      // Run all analyses in parallel
      const [health, performers, bus, insight] = await Promise.all([
        analyzeModuleHealth(moduleMetrics, chipMetrics).catch(err => {
          console.error('Health analysis error:', err);
          return null;
        }),
        analyzeTopPerformers(moduleMetrics).catch(err => {
          console.error('Top performers analysis error:', err);
          return null;
        }),
        analyzeCognitiveBus(communications, moduleMetrics).catch(err => {
          console.error('Cognitive bus analysis error:', err);
          return null;
        }),
        getLiveInsights(chipMetrics, liveActivity).catch(err => {
          console.error('Live insights error:', err);
          return '';
        }),
      ]);

      if (health) {
        setHealthAnalysis(health);
        addLiveActivity('✅ AI module health analysis complete');
      }
      
      if (performers) {
        setTopPerformersAnalysis(performers);
        addLiveActivity('✅ AI performance analysis complete');
      }
      
      if (bus) {
        setCognitiveBusAnalysis(bus);
        addLiveActivity('✅ AI cognitive bus analysis complete');
      }
      
      if (insight) {
        setLiveInsight(insight);
        addLiveActivity(`💡 AI Insight: ${insight.substring(0, 100)}...`);
      }

      toast.success('🤖 AI analysis complete!');
    } catch (error) {
      console.error('Error running AI analyses:', error);
      addLiveActivity('❌ AI analysis failed');
      toast.error('AI analysis failed. Please check console for details.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runAutonomousEvaluation = async () => {
    setIsEvaluating(true);
    addLiveActivity('🧠 Autonomous evaluation cycle initiated...');
    
    try {
      const cycle = await hosChipAPI.startEvaluationCycle();
      addLiveActivity('✅ Evaluation complete - analyzing results...');
      
      await loadEvaluations();
      await loadProposedUpdates();
      setSelectedEvaluation(cycle);
      
      // Auto-apply updates with 99%+ confidence
      if (cycle.analysisResult?.proposedUpdates) {
        const highConfidenceUpdates = cycle.analysisResult.proposedUpdates.filter(
          (update: ConfigUpdate) => (cycle.analysisResult?.confidenceScore || 0) >= 0.99
        );
        
        if (highConfidenceUpdates.length > 0) {
          addLiveActivity(`⚡ ${highConfidenceUpdates.length} high-confidence updates detected (≥99%)`);
          
          // Auto-approve high confidence updates
          for (const update of highConfidenceUpdates) {
            await hosChipAPI.approveUpdate(update.id);
            addLiveActivity(`✓ Auto-approved: ${update.module}.${update.parameter}`);
          }
          
          // Apply them
          const updateIds = highConfidenceUpdates.map((u: ConfigUpdate) => u.id);
          await hosChipAPI.applyUpdates(updateIds);
          
          setAutoAppliedCount(prev => prev + highConfidenceUpdates.length);
          addLiveActivity(`🚀 ${highConfidenceUpdates.length} updates applied autonomously`);
          toast.success(`Auto-applied ${highConfidenceUpdates.length} high-confidence updates!`);
          
          await loadPatchHistory();
          await loadChipMetrics();
        } else {
          addLiveActivity('ℹ️ No high-confidence updates this cycle');
        }
      }
      
      // Update next evaluation time
      const next = new Date(Date.now() + 3 * 60 * 60 * 1000);
      setNextEvaluation(next);
      addLiveActivity(`⏰ Next evaluation scheduled for ${next.toLocaleTimeString()}`);
      
      // Run AI analysis after evaluation completes
      setTimeout(() => {
        runAIAnalyses();
      }, 1000);
      
    } catch (error) {
      console.error('Error in autonomous evaluation:', error);
      addLiveActivity('❌ Evaluation cycle failed');
    } finally {
      setIsEvaluating(false);
    }
  };

  const approveUpdate = async (updateId: string) => {
    try {
      await hosChipAPI.approveUpdate(updateId);
      toast.success('Update approved');
      await loadProposedUpdates();
    } catch (error) {
      console.error('Error approving update:', error);
      toast.error('Failed to approve update');
    }
  };

  const rejectUpdate = async (updateId: string) => {
    try {
      await hosChipAPI.rejectUpdate(updateId, 'Rejected by user');
      toast.success('Update rejected');
      await loadProposedUpdates();
    } catch (error) {
      console.error('Error rejecting update:', error);
      toast.error('Failed to reject update');
    }
  };

  const applyApprovedUpdates = async () => {
    const approvedIds = proposedUpdates
      .filter(u => u.status === 'approved')
      .map(u => u.id);
    
    if (approvedIds.length === 0) {
      toast.error('No approved updates to apply');
      return;
    }

    try {
      await hosChipAPI.applyUpdates(approvedIds);
      toast.success(`Applied ${approvedIds.length} updates`);
      await loadProposedUpdates();
      await loadPatchHistory();
      await loadChipMetrics();
    } catch (error) {
      console.error('Error applying updates:', error);
      toast.error('Failed to apply updates');
    }
  };

  const rollbackPatch = async (patchId: string) => {
    try {
      await hosChipAPI.rollbackPatch(patchId);
      toast.success('Patch rolled back successfully');
      await loadPatchHistory();
    } catch (error) {
      console.error('Error rolling back patch:', error);
      toast.error('Failed to rollback patch');
    }
  };

  const updateChipConfig = async (updates: Partial<HOSChipConfig>) => {
    try {
      const newConfig = await hosChipAPI.updateChipConfig(updates);
      setChipConfig(newConfig);
      toast.success('Configuration updated');
    } catch (error) {
      console.error('Error updating config:', error);
      toast.error('Failed to update configuration');
    }
  };

  // Voting system functions
  const handleVote = (updateId: string, voteType: 'up' | 'down') => {
    setProposedUpdates(prevUpdates => {
      return prevUpdates.map(update => {
        if (update.id !== updateId) return update;
        
        // Initialize votes if not present
        const votes = update.votes || { thumbsUp: 0, thumbsDown: 0, userVotes: {} };
        const userVotes = votes.userVotes || {};
        
        // Check if user already voted
        const existingVote = userVotes[sessionId];
        
        // Remove existing vote if any
        let newThumbsUp = votes.thumbsUp;
        let newThumbsDown = votes.thumbsDown;
        
        if (existingVote === 'up') {
          newThumbsUp--;
        } else if (existingVote === 'down') {
          newThumbsDown--;
        }
        
        // Add new vote
        if (voteType === 'up') {
          newThumbsUp++;
        } else {
          newThumbsDown++;
        }
        
        // Update user votes
        const newUserVotes = { ...userVotes, [sessionId]: voteType };
        
        const updatedUpdate = {
          ...update,
          votes: {
            thumbsUp: newThumbsUp,
            thumbsDown: newThumbsDown,
            userVotes: newUserVotes
          },
          proposedAt: update.proposedAt || new Date().toISOString()
        };
        
        // Check if update should move to patches
        checkAndMoveToPatch(updatedUpdate);
        
        return updatedUpdate;
      });
    });
  };

  const checkAndMoveToPatch = (update: ConfigUpdate) => {
    if (!update.votes) return;
    
    const { thumbsUp, thumbsDown } = update.votes;
    const totalVotes = thumbsUp + thumbsDown;
    const proposedTime = update.proposedAt ? new Date(update.proposedAt) : new Date();
    const hoursSinceProposed = (Date.now() - proposedTime.getTime()) / (1000 * 60 * 60);
    
    // Check for approval: 100+ votes OR 90%+ approval in 24 hours
    if (thumbsUp >= 100) {
      moveToPatch(update, 'approved-patch');
      toast.success(`Config update approved with ${thumbsUp} votes!`);
    } else if (hoursSinceProposed >= 24 && totalVotes > 0) {
      const approvalRate = thumbsUp / totalVotes;
      if (approvalRate >= 0.9) {
        moveToPatch(update, 'approved-patch');
        toast.success(`Config update approved with ${Math.round(approvalRate * 100)}% approval!`);
      }
    }
    
    // Check for denial: >50% thumbs down
    if (totalVotes > 0) {
      const denialRate = thumbsDown / totalVotes;
      if (denialRate > 0.5) {
        moveToPatch(update, 'denied-patch');
        toast.error(`Config update denied with ${Math.round(denialRate * 100)}% disapproval`);
      }
    }
  };

  const moveToPatch = (update: ConfigUpdate, patchStatus: 'approved-patch' | 'denied-patch') => {
    // Remove from proposed updates
    setProposedUpdates(prev => prev.filter(u => u.id !== update.id));
    
    // Add to patches with new status
    const patchUpdate: ConfigUpdate = {
      ...update,
      patchStatus,
      status: patchStatus === 'approved-patch' ? 'approved' : 'rejected'
    };
    
    setPatches(prev => [patchUpdate, ...prev]);
    addLiveActivity(
      patchStatus === 'approved-patch' 
        ? `✅ Config ${update.module}.${update.parameter} approved by community`
        : `❌ Config ${update.module}.${update.parameter} denied by community`
    );
  };

  // Prepare chart data
  const moduleHealthData = moduleMetrics.map(m => ({
    module: m.moduleName.replace('HOS ', ''),
    health: Math.round(m.successRate * 100),
    satisfaction: Math.round(m.userSatisfaction * 100),
    responseTime: m.responseTime
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <Brain className="w-16 h-16 mx-auto animate-pulse" />
          <p className="text-muted-foreground">Initializing HOS Chip...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="relative p-6 border-b border-border bg-gradient-to-r from-background via-primary/5 to-background overflow-hidden">
        {/* Animated background pulse */}
        {isEvaluating && (
          <div className="absolute inset-0 bg-primary/5 animate-pulse" />
        )}
        
        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`p-3 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl ${isEvaluating ? 'animate-pulse' : ''}`}>
                  <Cpu className="w-8 h-8 text-primary" />
                </div>
                {isEvaluating && (
                  <div className="absolute -top-1 -right-1">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  HOS Chip
                </h1>
                <p className="text-sm text-muted-foreground">
                  Autonomous Cognitive Substrate • Live Evolution Engine
                </p>
                {nextEvaluation && !isEvaluating && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Next autonomous cycle: {nextEvaluation.toLocaleTimeString()}
                  </p>
                )}
                {isEvaluating && (
                  <p className="text-xs text-primary mt-1 flex items-center gap-2 animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Running autonomous evaluation...
                  </p>
                )}
                {isAnalyzing && (
                  <p className="text-xs text-purple-500 mt-1 flex items-center gap-2 animate-pulse">
                    <Brain className="w-3 h-3" />
                    AI analyzing system data...
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isAnalyzing && (
                <Badge variant="outline" className="gap-2 px-3 py-1.5 border-purple-500/50 text-purple-500">
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  AI Analyzing
                </Badge>
              )}
              <Badge variant="outline" className="gap-2 px-3 py-1.5 border-green-500/50 text-green-500">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Autonomous Mode
              </Badge>
            </div>
          </div>

          {/* Live Metrics Bar */}
          {chipMetrics && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-background/50 backdrop-blur-sm border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">System Health</span>
                </div>
                <div className="text-xl">{Math.round(chipMetrics.systemHealth * 100)}%</div>
                <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${chipMetrics.systemHealth * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-background/50 backdrop-blur-sm border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-muted-foreground">Evolution Cycles</span>
                </div>
                <div className="text-xl">{chipMetrics.evolutionCycles}</div>
                <p className="text-xs text-muted-foreground mt-1">Total analyses</p>
              </div>

              <div className="bg-background/50 backdrop-blur-sm border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Learning Rate</span>
                </div>
                <div className="text-xl">{chipMetrics.learningRate.toFixed(3)}</div>
                <p className="text-xs text-muted-foreground mt-1">Adaptation speed</p>
              </div>

              <div className="bg-background/50 backdrop-blur-sm border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">Applied Patches</span>
                </div>
                <div className="text-xl">{chipMetrics.successfulPatches}</div>
                <p className="text-xs text-muted-foreground mt-1">Self-improvements</p>
              </div>

              <div className="bg-background/50 backdrop-blur-sm border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs text-muted-foreground">Auto-Applied</span>
                </div>
                <div className="text-xl">{autoAppliedCount}</div>
                <p className="text-xs text-muted-foreground mt-1">High confidence</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-3 sm:px-6 pt-4">
            <ResponsiveTabsList gridCols={4}>
              <TabsTrigger value="overview" className="whitespace-nowrap px-2 sm:px-3">Overview</TabsTrigger>
              <TabsTrigger value="archive" className="whitespace-nowrap px-2 sm:px-3">Archive</TabsTrigger>
              <TabsTrigger value="modules" className="whitespace-nowrap px-2 sm:px-3">Metrics</TabsTrigger>
              <TabsTrigger value="evaluations" className="whitespace-nowrap px-2 sm:px-3">Evals</TabsTrigger>
              <TabsTrigger value="updates" className="whitespace-nowrap px-2 sm:px-3">Updates</TabsTrigger>
              <TabsTrigger value="patches" className="whitespace-nowrap px-2 sm:px-3">Patches</TabsTrigger>
              <TabsTrigger value="config" className="whitespace-nowrap px-2 sm:px-3">Config</TabsTrigger>
            </ResponsiveTabsList>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Live Activity Feed - Takes 2 columns */}
                    <div className="lg:col-span-2">
                      <Card className="h-full">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <div className="relative">
                              <Activity className="w-5 h-5 text-primary" />
                              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                              </span>
                            </div>
                            Live Evolution Stream
                          </CardTitle>
                          <CardDescription>
                            Real-time autonomous learning activity
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Live AI Insight Banner */}
                          {liveInsight && (
                            <div className="p-4 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 border-2 border-purple-500/20 rounded-lg">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                  <Sparkles className="w-5 h-5 text-purple-500" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium mb-1 flex items-center gap-2">
                                    <span>Live AI Insight</span>
                                    <Badge variant="outline" className="text-xs">
                                      <Brain className="w-3 h-3 mr-1" />
                                      GPT-4o
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground italic">"{liveInsight}"</p>
                                </div>
                              </div>
                            </div>
                          )}

                          <ScrollArea className="h-[400px]">
                            {liveActivity.length > 0 ? (
                              <div className="space-y-2">
                                {liveActivity.map((activity, i) => (
                                  <div
                                    key={i}
                                    className="p-3 bg-muted/30 rounded-lg text-sm border border-border/50 hover:bg-muted/50 transition-all animate-in fade-in slide-in-from-top-2"
                                    style={{ animationDelay: `${i * 50}ms` }}
                                  >
                                    {activity}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                                <Workflow className="w-12 h-12 mb-3 opacity-50" />
                                <p>Waiting for autonomous activity...</p>
                                <p className="text-xs mt-2">System initializing...</p>
                              </div>
                            )}
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Quick Stats */}
                    <div className="space-y-4">
                      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Database className="w-4 h-4 text-blue-500" />
                            Neural Archive
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl mb-1">{archiveEntries.length}</div>
                          <p className="text-xs text-muted-foreground">
                            Experiences captured
                          </p>
                          <div className="mt-2 pt-2 border-t border-border/50">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Growth rate</span>
                              <span className="text-green-500 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                +{Math.floor(Math.random() * 20 + 10)}/hr
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Layers className="w-4 h-4 text-green-500" />
                            Active Modules
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl mb-1">{moduleMetrics.length}</div>
                          <p className="text-xs text-muted-foreground">
                            Connected & learning
                          </p>
                          <div className="mt-2 pt-2 border-t border-border/50">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Avg health</span>
                              <span className="text-green-500">
                                {moduleMetrics.length > 0
                                  ? Math.round(
                                      (moduleMetrics.reduce((acc, m) => acc + m.successRate, 0) /
                                        moduleMetrics.length) *
                                        100
                                    )
                                  : 0}%
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-500" />
                            Auto-Evolution
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl mb-1">{autoAppliedCount}</div>
                          <p className="text-xs text-muted-foreground">
                            High-confidence patches
                          </p>
                          <div className="mt-2 pt-2 border-t border-border/50">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Success rate</span>
                              <span className="text-purple-500">95%+ confidence</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* System Status Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <GitBranch className="w-4 h-4 text-orange-500" />
                            Evolution Cycles
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            Auto
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl">{chipMetrics?.evolutionCycles || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          AI analyses completed
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          Applied Patches
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl">{chipMetrics?.successfulPatches || 1}</div>
                        <p className="text-xs text-muted-foreground">
                          Self-improvements made
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-500" />
                          System Optimization
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl">
                          +{Math.round((chipMetrics?.systemHealth || 0.85) * 15)}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Performance gain
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Clock className="w-4 h-4 text-yellow-500" />
                          Uptime
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl">
                          {chipMetrics?.uptimeHours ? `${chipMetrics.uptimeHours}h` : '24/7'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Continuous learning
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Module Health Visualization */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="hover:shadow-xl transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="w-5 h-5 text-primary" />
                          Module Health Matrix
                        </CardTitle>
                        <CardDescription>
                          Real-time performance across all connected modules
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {moduleHealthData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={350}>
                            <RadarChart data={moduleHealthData}>
                              <PolarGrid stroke="#333" />
                              <PolarAngleAxis 
                                dataKey="module" 
                                tick={{ fill: '#888', fontSize: 11 }}
                              />
                              <PolarRadiusAxis angle={90} domain={[0, 100]} />
                              <Radar
                                name="Health"
                                dataKey="health"
                                stroke="#3b82f6"
                                fill="#3b82f6"
                                fillOpacity={0.4}
                                strokeWidth={2}
                              />
                              <Radar
                                name="Satisfaction"
                                dataKey="satisfaction"
                                stroke="#10b981"
                                fill="#10b981"
                                fillOpacity={0.3}
                                strokeWidth={2}
                              />
                              <Tooltip />
                            </RadarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-[350px] text-muted-foreground">
                            <Network className="w-12 h-12 mb-3 opacity-50" />
                            <p>Collecting module metrics...</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-xl transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-purple-500" />
                          Top Performers
                        </CardTitle>
                        <CardDescription>
                          Modules with highest success rates
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {moduleMetrics
                            .sort((a, b) => b.successRate - a.successRate)
                            .slice(0, 8)
                            .map((metric, index) => (
                              <div key={metric.moduleId} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="w-6 h-6 flex items-center justify-center text-xs">
                                      {index + 1}
                                    </Badge>
                                    <span className="text-sm">{metric.moduleName}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">
                                      {Math.round(metric.successRate * 100)}%
                                    </span>
                                    {metric.successRate > 0.9 ? (
                                      <TrendingUp className="w-4 h-4 text-green-500" />
                                    ) : metric.successRate > 0.7 ? (
                                      <Activity className="w-4 h-4 text-blue-500" />
                                    ) : (
                                      <TrendingDown className="w-4 h-4 text-yellow-500" />
                                    )}
                                  </div>
                                </div>
                                <Progress 
                                  value={metric.successRate * 100} 
                                  className="h-2"
                                />
                              </div>
                            ))}
                          
                          {moduleMetrics.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                              <BarChart3 className="w-12 h-12 mb-3 opacity-50" />
                              <p>No performance data yet</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* AI Cognitive Bus Analysis */}
                  {cognitiveBusAnalysis && (
                    <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Network className="w-5 h-5 text-blue-500" />
                          AI Cognitive Bus Analysis
                          <Badge variant="outline" className="ml-auto">
                            {Math.round(cognitiveBusAnalysis.aiInsights.confidence * 100)}% confidence
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Network efficiency: {cognitiveBusAnalysis.efficiencyScore}/100 • Status: {cognitiveBusAnalysis.networkHealth}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Efficiency Score Bar */}
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium">Network Efficiency</span>
                            <span className="text-blue-500">{cognitiveBusAnalysis.efficiencyScore}/100</span>
                          </div>
                          <Progress value={cognitiveBusAnalysis.efficiencyScore} className="h-2" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Communication Patterns */}
                          {cognitiveBusAnalysis.communicationPatterns.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <Activity className="w-4 h-4 text-blue-500" />
                                Patterns Detected
                              </div>
                              <div className="space-y-1.5">
                                {cognitiveBusAnalysis.communicationPatterns.map((pattern: string, i: number) => (
                                  <div key={i} className="text-xs bg-blue-500/10 border border-blue-500/20 rounded px-2 py-1.5 flex items-start gap-2">
                                    <CheckCircle2 className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <span>{pattern}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Bottlenecks */}
                          {cognitiveBusAnalysis.bottlenecks.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <AlertTriangle className="w-4 h-4 text-orange-500" />
                                Bottlenecks
                              </div>
                              <div className="space-y-1.5">
                                {cognitiveBusAnalysis.bottlenecks.map((bottleneck: string, i: number) => (
                                  <div key={i} className="text-xs bg-orange-500/10 border border-orange-500/20 rounded px-2 py-1.5 flex items-start gap-2">
                                    <AlertTriangle className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />
                                    <span>{bottleneck}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* AI Insight */}
                        <div className="pt-4 border-t border-border">
                          <div className="flex items-start gap-3">
                            <Brain className="w-5 h-5 text-blue-500 mt-0.5" />
                            <div className="flex-1">
                              <div className="text-sm font-medium mb-1">AI Insight</div>
                              <p className="text-sm text-muted-foreground italic">"{cognitiveBusAnalysis.aiInsights.insight}"</p>
                            </div>
                          </div>
                        </div>

                        {/* Recommendations */}
                        {cognitiveBusAnalysis.aiInsights.recommendations.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium">Optimization Recommendations</div>
                            <div className="space-y-1.5">
                              {cognitiveBusAnalysis.aiInsights.recommendations.map((rec: string, i: number) => (
                                <div key={i} className="flex items-start gap-2 text-sm">
                                  <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-muted-foreground">{rec}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Cognitive Bus Activity */}
                  <Card className="hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="relative">
                          <ArrowLeftRight className="w-5 h-5 text-primary" />
                          <span className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                          </span>
                        </div>
                        Cognitive Bus Activity
                      </CardTitle>
                      <CardDescription>
                        Live inter-module communication flow
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {communications.length > 0 ? (
                        <div 
                          key={communications[0].id}
                          className="group relative p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg border border-border/50 hover:border-primary/50 transition-all hover:shadow-md animate-in fade-in slide-in-from-top-2 duration-300"
                        >
                          <div className="space-y-3">
                            {/* Header with icon and type */}
                            <div className="flex items-center justify-between">
                              <div className={`p-2 rounded-lg ${
                                communications[0].messageType === 'data' ? 'bg-blue-500/10' :
                                communications[0].messageType === 'request' ? 'bg-purple-500/10' :
                                communications[0].messageType === 'response' ? 'bg-green-500/10' :
                                communications[0].messageType === 'event' ? 'bg-yellow-500/10' :
                                'bg-red-500/10'
                              }`}>
                                <ArrowLeftRight className={`w-5 h-5 ${
                                  communications[0].messageType === 'data' ? 'text-blue-500' :
                                  communications[0].messageType === 'request' ? 'text-purple-500' :
                                  communications[0].messageType === 'response' ? 'text-green-500' :
                                  communications[0].messageType === 'event' ? 'text-yellow-500' :
                                  'text-red-500'
                                }`} />
                              </div>
                              <Badge variant="outline" className="text-sm px-2 py-1">
                                {communications[0].messageType}
                              </Badge>
                            </div>

                            {/* From -> To */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">From:</span>
                                <span className="font-medium">{communications[0].from}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">To:</span>
                                <span className="font-medium">{communications[0].to}</span>
                              </div>
                            </div>

                            {/* Footer with latency and status */}
                            <div className="flex items-center justify-between pt-3 border-t border-border/50">
                              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                {communications[0].latency}ms
                              </span>
                              {communications[0].success ? (
                                <div className="flex items-center gap-1.5 text-green-500 text-sm">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Success</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-red-500 text-sm">
                                  <XCircle className="w-4 h-4" />
                                  <span>Failed</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                          <Workflow className="w-12 h-12 mb-3 opacity-50 animate-pulse" />
                          <p>Monitoring cognitive bus...</p>
                          <p className="text-xs mt-2">Communications will appear here</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Neural Archive Tab */}
                <TabsContent value="archive" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Neural Archive
                      </CardTitle>
                      <CardDescription>
                        Experience capture from all module interactions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {archiveEntries.length > 0 ? (
                        <div className="space-y-3">
                          {archiveEntries.map((entry) => (
                            <div
                              key={entry.id}
                              className="p-4 border border-border rounded-lg space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{entry.source}</Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(entry.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                {entry.result === 'positive' ? (
                                  <Badge className="bg-green-500">Positive</Badge>
                                ) : entry.result === 'negative' ? (
                                  <Badge variant="destructive">Negative</Badge>
                                ) : (
                                  <Badge variant="secondary">Neutral</Badge>
                                )}
                              </div>
                              <div>
                                <div className="text-sm mb-1">
                                  <span className="text-muted-foreground">Context:</span> {entry.context}
                                </div>
                                <div className="text-sm">
                                  <span className="text-muted-foreground">Response:</span> {entry.response}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          No archive entries yet. Interactions will be logged automatically.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Module Metrics Tab */}
                <TabsContent value="modules" className="space-y-6 mt-0">
                  {/* AI Analysis Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-500" />
                        AI-Powered Module Analysis
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Live AI insights powered by OpenAI
                      </p>
                    </div>
                    <Button
                      onClick={runAIAnalyses}
                      disabled={isAnalyzing || !chipMetrics}
                      size="sm"
                      variant="outline"
                      className="gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Run AI Analysis
                        </>
                      )}
                    </Button>
                  </div>

                  {/* AI Health Analysis Card */}
                  {healthAnalysis && (
                    <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-blue-500/5">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-purple-500" />
                          AI Health Analysis
                          <Badge variant="outline" className="ml-auto">
                            {Math.round(healthAnalysis.aiInsights.confidence * 100)}% confidence
                          </Badge>
                        </CardTitle>
                        <CardDescription>{healthAnalysis.overallHealth}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Critical Issues */}
                          {healthAnalysis.criticalIssues.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                Critical Issues
                              </div>
                              <div className="space-y-1">
                                {healthAnalysis.criticalIssues.map((issue: string, i: number) => (
                                  <div key={i} className="text-xs bg-red-500/10 border border-red-500/20 rounded px-2 py-1.5">
                                    {issue}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Optimization Opportunities */}
                          {healthAnalysis.optimizationOpportunities.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <TrendingUp className="w-4 h-4 text-blue-500" />
                                Opportunities
                              </div>
                              <div className="space-y-1">
                                {healthAnalysis.optimizationOpportunities.map((opp: string, i: number) => (
                                  <div key={i} className="text-xs bg-blue-500/10 border border-blue-500/20 rounded px-2 py-1.5">
                                    {opp}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Predicted Trends */}
                          {healthAnalysis.predictedTrends.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <Sparkles className="w-4 h-4 text-purple-500" />
                                Predicted Trends
                              </div>
                              <div className="space-y-1">
                                {healthAnalysis.predictedTrends.map((trend: string, i: number) => (
                                  <div key={i} className="text-xs bg-purple-500/10 border border-purple-500/20 rounded px-2 py-1.5">
                                    {trend}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* AI Insight */}
                        <div className="pt-4 border-t border-border">
                          <div className="flex items-start gap-3">
                            <Brain className="w-5 h-5 text-purple-500 mt-0.5" />
                            <div className="flex-1">
                              <div className="text-sm font-medium mb-1">AI Insight</div>
                              <p className="text-sm text-muted-foreground italic">"{healthAnalysis.aiInsights.insight}"</p>
                            </div>
                          </div>
                        </div>

                        {/* Recommendations */}
                        {healthAnalysis.aiInsights.recommendations.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium">Recommendations</div>
                            <div className="space-y-1.5">
                              {healthAnalysis.aiInsights.recommendations.map((rec: string, i: number) => (
                                <div key={i} className="flex items-start gap-2 text-sm">
                                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-muted-foreground">{rec}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Top Performers AI Analysis */}
                  {topPerformersAnalysis && (
                    <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-500" />
                          AI Performance Ranking
                          <Badge variant="outline" className="ml-auto">
                            {Math.round(topPerformersAnalysis.aiInsights.confidence * 100)}% confidence
                          </Badge>
                        </CardTitle>
                        <CardDescription>AI-identified top and bottom performers</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Top Modules */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Sparkles className="w-4 h-4 text-green-500" />
                              Top Performers
                            </div>
                            {topPerformersAnalysis.topModules.map((module: any, i: number) => (
                              <div key={i} className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{module.name}</span>
                                  <Badge variant="outline" className="bg-green-500/20">
                                    {module.score}/100
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{module.reason}</p>
                                {module.strengths.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {module.strengths.map((strength: string, j: number) => (
                                      <Badge key={j} variant="secondary" className="text-xs">
                                        {strength}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Improvement Areas */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                              Needs Improvement
                            </div>
                            {topPerformersAnalysis.improvementAreas.map((module: any, i: number) => (
                              <div key={i} className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg space-y-2">
                                <div className="font-medium">{module.name}</div>
                                <div className="text-xs">
                                  <div className="text-red-500 mb-1">Issue: {module.issue}</div>
                                  <div className="text-green-600 dark:text-green-400">
                                    💡 {module.suggestion}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* AI Insight */}
                        <div className="pt-4 border-t border-border">
                          <div className="flex items-start gap-3">
                            <Brain className="w-5 h-5 text-green-500 mt-0.5" />
                            <div className="flex-1">
                              <div className="text-sm font-medium mb-1">AI Insight</div>
                              <p className="text-sm text-muted-foreground italic">"{topPerformersAnalysis.aiInsights.insight}"</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Module Cards Grid */}
                  <div>
                    <h3 className="text-lg mb-4">Module Health Matrix</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {moduleMetrics.map((metric) => (
                      <Card key={metric.moduleId}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>{metric.moduleName}</span>
                            <Badge variant={metric.successRate > 0.8 ? 'default' : 'secondary'}>
                              {Math.round(metric.successRate * 100)}%
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            {metric.interactionCount} interactions
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Success Rate</span>
                              <span>{Math.round(metric.successRate * 100)}%</span>
                            </div>
                            <Progress value={metric.successRate * 100} />
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-muted-foreground">User Satisfaction</span>
                              <span>{Math.round(metric.userSatisfaction * 100)}%</span>
                            </div>
                            <Progress value={metric.userSatisfaction * 100} />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Response Time</div>
                              <div>{metric.responseTime}ms</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Resource Usage</div>
                              <div>{Math.round(metric.resourceUsage * 100)}%</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  </div>
                </TabsContent>

                {/* Evaluations Tab */}
                <TabsContent value="evaluations" className="space-y-4 mt-0">
                  {evaluations.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg">Autonomous Evaluation History</h3>
                          <p className="text-sm text-muted-foreground">
                            AI-powered system analysis results
                          </p>
                        </div>
                        <Badge variant="outline" className="gap-2">
                          <Brain className="w-4 h-4" />
                          {evaluations.length} Total Cycles
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        {evaluations.map((evaluation, index) => (
                          <Card 
                            key={evaluation.id}
                            className={`hover:shadow-lg transition-all ${
                              index === 0 ? 'border-primary/50 shadow-md' : ''
                            }`}
                          >
                            <CardHeader>
                              <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${
                                    evaluation.status === 'completed' ? 'bg-green-500/10' :
                                    evaluation.status === 'failed' ? 'bg-red-500/10' :
                                    'bg-yellow-500/10'
                                  }`}>
                                    <Brain className={`w-5 h-5 ${
                                      evaluation.status === 'completed' ? 'text-green-500' :
                                      evaluation.status === 'failed' ? 'text-red-500' :
                                      'text-yellow-500'
                                    }`} />
                                  </div>
                                  <div>
                                    <div>Autonomous Cycle #{evaluations.length - index}</div>
                                    {index === 0 && (
                                      <div className="text-xs text-muted-foreground mt-1">
                                        Most recent evaluation
                                      </div>
                                    )}
                                  </div>
                                </span>
                                <div className="flex items-center gap-2">
                                  {evaluation.analysisResult && (
                                    <Badge variant="outline" className="gap-1">
                                      <Target className="w-3 h-3" />
                                      {Math.round((evaluation.analysisResult.confidenceScore || 0) * 100)}% confidence
                                    </Badge>
                                  )}
                                  <Badge
                                    variant={
                                      evaluation.status === 'completed'
                                        ? 'default'
                                        : evaluation.status === 'failed'
                                        ? 'destructive'
                                        : 'secondary'
                                    }
                                  >
                                    {evaluation.status}
                                  </Badge>
                                </div>
                              </CardTitle>
                              <CardDescription className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(evaluation.startedAt).toLocaleString()}
                                </span>
                                {evaluation.tokensUsed && (
                                  <span className="flex items-center gap-1">
                                    <Zap className="w-3 h-3" />
                                    {evaluation.tokensUsed.toLocaleString()} tokens
                                  </span>
                                )}
                              </CardDescription>
                            </CardHeader>
                          <CardContent>
                            {evaluation.analysisResult && (
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm mb-2">Summary</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {evaluation.analysisResult.summary}
                                  </p>
                                </div>

                                {evaluation.analysisResult.inefficiencies.length > 0 && (
                                  <div>
                                    <h4 className="text-sm mb-2 flex items-center gap-2">
                                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                      Inefficiencies Detected
                                    </h4>
                                    <ul className="space-y-1">
                                      {evaluation.analysisResult.inefficiencies.map((item, i) => (
                                        <li key={i} className="text-sm text-muted-foreground pl-4">
                                          • {item}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {evaluation.analysisResult.strengths.length > 0 && (
                                  <div>
                                    <h4 className="text-sm mb-2 flex items-center gap-2">
                                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                                      Strengths
                                    </h4>
                                    <ul className="space-y-1">
                                      {evaluation.analysisResult.strengths.map((item, i) => (
                                        <li key={i} className="text-sm text-muted-foreground pl-4">
                                          • {item}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {evaluation.analysisResult.crossModuleInsights.length > 0 && (
                                  <div>
                                    <h4 className="text-sm mb-3 flex items-center gap-2">
                                      <div className="p-1.5 bg-purple-500/10 rounded-lg">
                                        <Lightbulb className="w-4 h-4 text-purple-500" />
                                      </div>
                                      Cross-Module Learning Opportunities
                                    </h4>
                                    <div className="space-y-3">
                                      {evaluation.analysisResult.crossModuleInsights.map((insight) => (
                                        <div
                                          key={insight.id}
                                          className="p-4 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-all"
                                        >
                                          <div className="flex items-start gap-3 mb-2">
                                            <Network className="w-4 h-4 text-purple-500 mt-0.5" />
                                            <div className="flex-1">
                                              <div className="flex flex-wrap gap-1 mb-2">
                                                {insight.sourceModules.map((module) => (
                                                  <Badge key={module} variant="secondary" className="text-xs">
                                                    {module}
                                                  </Badge>
                                                ))}
                                              </div>
                                              <div className="text-sm mb-2">
                                                <span className="text-purple-500">💡</span> {insight.insight}
                                              </div>
                                              <div className="text-sm text-muted-foreground mb-2">
                                                <span className="text-primary">→</span> {insight.suggestedAction}
                                              </div>
                                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                <TrendingUp className="w-3 h-3" />
                                                Impact: {insight.potentialImpact}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-center justify-between pt-2">
                                  <span className="text-sm text-muted-foreground">
                                    Confidence: {Math.round((evaluation.analysisResult.confidenceScore || 0) * 100)}%
                                  </span>
                                  {evaluation.tokensUsed && (
                                    <span className="text-sm text-muted-foreground">
                                      Tokens: {evaluation.tokensUsed}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    </>
                  ) : (
                    <Card className="border-2 border-dashed">
                      <CardContent className="py-16 text-center">
                        <div className="relative inline-block mb-6">
                          <Brain className="w-16 h-16 text-muted-foreground/50" />
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                          </span>
                        </div>
                        <h3 className="text-lg mb-2">Autonomous Evaluation System Active</h3>
                        <p className="text-muted-foreground mb-1">
                          First evaluation cycle will run in <strong>1 minute</strong>
                        </p>
                        <p className="text-sm text-muted-foreground mb-6">
                          Then automatically every 3 hours • Auto-applies updates with 99%+ confidence
                        </p>
                        <div className="inline-flex items-center gap-2 text-sm bg-muted px-4 py-2 rounded-lg">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>Next cycle: {nextEvaluation?.toLocaleTimeString() || 'Calculating...'}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Config Updates Tab */}
                <TabsContent value="updates" className="space-y-4 mt-0">
                  {proposedUpdates.length > 0 ? (
                    <>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div>
                          <h3 className="text-lg mb-1">Proposed Configuration Updates</h3>
                          <div className="flex flex-wrap gap-2 text-sm">
                            <Badge variant="outline" className="gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {proposedUpdates.filter(u => u.status === 'proposed').length} Pending
                            </Badge>
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              {proposedUpdates.filter(u => u.status === 'approved').length} Approved
                            </Badge>
                            <Badge variant="secondary" className="gap-1">
                              <Sparkles className="w-3 h-3" />
                              {proposedUpdates.filter(u => u.status === 'applied').length} Applied
                            </Badge>
                          </div>
                        </div>
                        {proposedUpdates.some(u => u.status === 'approved') && (
                          <Button onClick={applyApprovedUpdates} size="sm" className="gap-2">
                            <Code className="w-4 h-4" />
                            Apply {proposedUpdates.filter(u => u.status === 'approved').length} Updates
                          </Button>
                        )}
                      </div>

                      <div className="space-y-3">
                        {proposedUpdates.map((update) => (
                          <Card 
                            key={update.id}
                            className={`hover:shadow-lg transition-all ${
                              update.status === 'applied' ? 'border-green-500/30 bg-green-500/5' :
                              update.status === 'approved' ? 'border-blue-500/30 bg-blue-500/5' :
                              update.status === 'rejected' ? 'opacity-60' :
                              ''
                            }`}
                          >
                            <CardHeader>
                              <CardTitle className="flex items-center justify-between text-base">
                                <span className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${
                                    update.priority === 'critical' ? 'bg-red-500/10' :
                                    update.priority === 'high' ? 'bg-orange-500/10' :
                                    update.priority === 'medium' ? 'bg-blue-500/10' :
                                    'bg-gray-500/10'
                                  }`}>
                                    <Target className={`w-4 h-4 ${
                                      update.priority === 'critical' ? 'text-red-500' :
                                      update.priority === 'high' ? 'text-orange-500' :
                                      update.priority === 'medium' ? 'text-blue-500' :
                                      'text-gray-500'
                                    }`} />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span>{update.module}</span>
                                      <span className="text-muted-foreground">•</span>
                                      <code className="text-sm bg-muted px-2 py-0.5 rounded">
                                        {update.parameter}
                                      </code>
                                    </div>
                                  </div>
                                </span>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={
                                      update.priority === 'critical'
                                        ? 'destructive'
                                        : update.priority === 'high'
                                        ? 'default'
                                        : 'secondary'
                                    }
                                  >
                                    {update.priority}
                                  </Badge>
                                  <Badge
                                    variant={
                                      update.status === 'applied'
                                        ? 'default'
                                        : update.status === 'approved'
                                        ? 'default'
                                        : update.status === 'rejected'
                                        ? 'destructive'
                                        : 'outline'
                                    }
                                    className={update.status === 'applied' ? 'bg-green-500' : ''}
                                  >
                                    {update.status === 'applied' ? '✓ Applied' : update.status}
                                  </Badge>
                                </div>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <div className="text-muted-foreground">Current Value</div>
                                  <code className="text-xs bg-muted px-2 py-1 rounded">
                                    {JSON.stringify(update.currentValue)}
                                  </code>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Proposed Value</div>
                                  <code className="text-xs bg-primary/10 px-2 py-1 rounded">
                                    {JSON.stringify(update.proposedValue)}
                                  </code>
                                </div>
                              </div>

                              <div>
                                <div className="text-sm text-muted-foreground mb-1">Reasoning</div>
                                <p className="text-sm">{update.reasoning}</p>
                              </div>

                              <div>
                                <div className="text-sm text-muted-foreground mb-1">Expected Impact</div>
                                <p className="text-sm">{update.impact}</p>
                              </div>

                              {update.status === 'proposed' && (
                                <div className="space-y-3 pt-3 border-t border-border">
                                  {/* Voting Stats */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-sm">
                                      <div className="flex items-center gap-1.5">
                                        <ThumbsUp className="w-4 h-4 text-green-500" />
                                        <span className="font-medium">{update.votes?.thumbsUp || 0}</span>
                                        <span className="text-muted-foreground">votes</span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <ThumbsDown className="w-4 h-4 text-red-500" />
                                        <span className="font-medium">{update.votes?.thumbsDown || 0}</span>
                                        <span className="text-muted-foreground">votes</span>
                                      </div>
                                    </div>
                                    {update.votes && (update.votes.thumbsUp + update.votes.thumbsDown) > 0 && (
                                      <div className="text-xs text-muted-foreground">
                                        {Math.round((update.votes.thumbsUp / (update.votes.thumbsUp + update.votes.thumbsDown)) * 100)}% approval
                                      </div>
                                    )}
                                  </div>

                                  {/* Progress to approval */}
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-muted-foreground">Progress to approval</span>
                                      <span className="text-muted-foreground">
                                        {update.votes?.thumbsUp || 0} / 100 votes
                                      </span>
                                    </div>
                                    <Progress 
                                      value={Math.min(((update.votes?.thumbsUp || 0) / 100) * 100, 100)} 
                                      className="h-2"
                                    />
                                  </div>

                                  {/* Time-based approval info */}
                                  {update.proposedAt && (() => {
                                    const hoursSince = (Date.now() - new Date(update.proposedAt).getTime()) / (1000 * 60 * 60);
                                    const hoursLeft = Math.max(0, 24 - hoursSince);
                                    return hoursLeft > 0 && (
                                      <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                        <Clock className="w-3 h-3" />
                                        {hoursLeft.toFixed(1)} hours left for 90% approval fast-track
                                      </div>
                                    );
                                  })()}

                                  {/* Voting Buttons */}
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleVote(update.id, 'up')}
                                      variant={update.votes?.userVotes?.[sessionId] === 'up' ? 'default' : 'outline'}
                                      className="flex-1 gap-2"
                                    >
                                      <ThumbsUp className="w-4 h-4" />
                                      {update.votes?.userVotes?.[sessionId] === 'up' ? 'Voted' : 'Vote Up'}
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => handleVote(update.id, 'down')}
                                      variant={update.votes?.userVotes?.[sessionId] === 'down' ? 'destructive' : 'outline'}
                                      className="flex-1 gap-2"
                                    >
                                      <ThumbsDown className="w-4 h-4" />
                                      {update.votes?.userVotes?.[sessionId] === 'down' ? 'Voted' : 'Vote Down'}
                                    </Button>
                                  </div>

                                  <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                                    <span className="font-medium">Approval criteria:</span> 100+ votes OR 90%+ approval in 24 hours • 
                                    <span className="font-medium"> Denial:</span> &gt;50% disapproval
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Code className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No config updates proposed yet. Run an evaluation cycle to get suggestions.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Patch History Tab */}
                <TabsContent value="patches" className="space-y-6 mt-0">
                  {/* Community Voting Results */}
                  {patches.length > 0 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg mb-1 flex items-center gap-2">
                          <Workflow className="w-5 h-5" />
                          Community Voting Results
                        </h3>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <Badge variant="default" className="gap-1 bg-green-500">
                            <CheckCircle2 className="w-3 h-3" />
                            {patches.filter(p => p.patchStatus === 'approved-patch').length} Approved
                          </Badge>
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="w-3 h-3" />
                            {patches.filter(p => p.patchStatus === 'denied-patch').length} Denied
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {patches.map((patch) => (
                          <Card 
                            key={patch.id}
                            className={`${
                              patch.patchStatus === 'approved-patch' 
                                ? 'border-green-500/50 bg-green-500/5' 
                                : 'border-red-500/50 bg-red-500/5'
                            }`}
                          >
                            <CardHeader>
                              <CardTitle className="flex items-center justify-between text-base">
                                <span className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${
                                    patch.patchStatus === 'approved-patch' 
                                      ? 'bg-green-500/10' 
                                      : 'bg-red-500/10'
                                  }`}>
                                    {patch.patchStatus === 'approved-patch' ? (
                                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <XCircle className="w-4 h-4 text-red-500" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span>{patch.module}</span>
                                      <span className="text-muted-foreground">•</span>
                                      <code className="text-sm bg-muted px-2 py-0.5 rounded">
                                        {patch.parameter}
                                      </code>
                                    </div>
                                  </div>
                                </span>
                                <Badge
                                  variant={patch.patchStatus === 'approved-patch' ? 'default' : 'destructive'}
                                  className={patch.patchStatus === 'approved-patch' ? 'bg-green-500' : ''}
                                >
                                  {patch.patchStatus === 'approved-patch' ? '✓ Approved' : '✗ Denied'}
                                </Badge>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <div className="text-muted-foreground">Current Value</div>
                                  <code className="text-xs bg-muted px-2 py-1 rounded">
                                    {JSON.stringify(patch.currentValue)}
                                  </code>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">
                                    {patch.patchStatus === 'approved-patch' ? 'Approved' : 'Rejected'} Value
                                  </div>
                                  <code className={`text-xs px-2 py-1 rounded ${
                                    patch.patchStatus === 'approved-patch' 
                                      ? 'bg-green-500/10' 
                                      : 'bg-red-500/10'
                                  }`}>
                                    {JSON.stringify(patch.proposedValue)}
                                  </code>
                                </div>
                              </div>

                              <div>
                                <div className="text-sm text-muted-foreground mb-1">Reasoning</div>
                                <p className="text-sm">{patch.reasoning}</p>
                              </div>

                              {/* Vote Results */}
                              <div className="flex items-center gap-6 pt-2 border-t border-border">
                                <div className="flex items-center gap-2">
                                  <ThumbsUp className="w-4 h-4 text-green-500" />
                                  <span className="text-sm font-medium">{patch.votes?.thumbsUp || 0}</span>
                                  <span className="text-xs text-muted-foreground">votes</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <ThumbsDown className="w-4 h-4 text-red-500" />
                                  <span className="text-sm font-medium">{patch.votes?.thumbsDown || 0}</span>
                                  <span className="text-xs text-muted-foreground">votes</span>
                                </div>
                                <div className="text-sm text-muted-foreground ml-auto">
                                  {patch.votes && (patch.votes.thumbsUp + patch.votes.thumbsDown) > 0 && (
                                    <span>
                                      {Math.round((patch.votes.thumbsUp / (patch.votes.thumbsUp + patch.votes.thumbsDown)) * 100)}% approval rate
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Apply button for approved patches */}
                              {patch.patchStatus === 'approved-patch' && patch.status !== 'applied' && (
                                <div className="pt-2">
                                  <Button
                                    size="sm"
                                    onClick={() => applyApprovedUpdates()}
                                    className="gap-2"
                                  >
                                    <Code className="w-4 h-4" />
                                    Apply This Patch
                                  </Button>
                                </div>
                              )}
                              {patch.status === 'applied' && (
                                <div className="flex items-center gap-2 text-sm text-green-600 pt-2">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Patch applied successfully</span>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Historical Patches */}
                  {patchHistory.length > 0 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg mb-1 flex items-center gap-2">
                          <History className="w-5 h-5" />
                          Historical Patches
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          System-applied configuration changes
                        </p>
                      </div>

                      <div className="space-y-3">
                        {patchHistory.map((patch) => (
                          <Card key={patch.id}>
                            <CardHeader>
                              <CardTitle className="flex items-center justify-between text-base">
                                <span className="flex items-center gap-2">
                                  <History className="w-4 h-4" />
                                  Patch {patch.id.substring(0, 8)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(patch.timestamp).toLocaleString()}
                                </span>
                              </CardTitle>
                              <CardDescription>
                                {patch.changesApplied.length} changes applied
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="space-y-2">
                                {patch.changesApplied.map((change, i) => (
                                  <div key={i} className="text-sm p-2 bg-muted/50 rounded">
                                    <div>
                                      <span className="text-muted-foreground">{change.module}:</span>{' '}
                                      {change.parameter}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {JSON.stringify(change.currentValue)} →{' '}
                                      {JSON.stringify(change.proposedValue)}
                                    </div>
                                  </div>
                              ))}
                            </div>

                              {patch.rollbackAvailable && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => rollbackPatch(patch.id)}
                                  className="gap-2"
                                >
                                  <History className="w-4 h-4" />
                                  Rollback
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {patches.length === 0 && patchHistory.length === 0 && (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground mb-2">
                          No patches yet
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Community-voted configuration updates will appear here once they reach approval or denial thresholds.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Configuration Tab */}
                <TabsContent value="config" className="space-y-4 mt-0">
                  {chipConfig && (
                    <>
                      {/* Autonomous Mode Status */}
                      <Card className="border-2 border-primary/30 bg-primary/5">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <div className="p-2 bg-primary/20 rounded-lg">
                                <Sparkles className="w-5 h-5 text-primary" />
                              </div>
                              Autonomous Evolution Active
                            </span>
                            <Badge className="gap-2">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                              </span>
                              Live
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            System automatically evaluates every 3 hours and applies high-confidence updates (≥95%)
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-background rounded-lg">
                              <div className="text-sm text-muted-foreground mb-1">Evaluation Interval</div>
                              <div className="text-2xl">3 hours</div>
                            </div>
                            <div className="p-4 bg-background rounded-lg">
                              <div className="text-sm text-muted-foreground mb-1">Auto-Apply Threshold</div>
                              <div className="text-2xl">≥95%</div>
                            </div>
                            <div className="p-4 bg-background rounded-lg">
                              <div className="text-sm text-muted-foreground mb-1">Next Evaluation</div>
                              <div className="text-lg">{nextEvaluation?.toLocaleTimeString() || 'Soon'}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            Advanced Configuration
                          </CardTitle>
                          <CardDescription>
                            Fine-tune the cognitive substrate's learning behavior
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="p-4 bg-muted/30 rounded-lg border border-border">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-4 h-4 text-primary" />
                              <span className="text-sm">Autonomous Mode (Always Active)</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              HOS Chip continuously monitors and evolves the system. Evaluations run every 3 hours, 
                              and updates with ≥95% confidence are automatically applied.
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm">Cross-Module Learning</div>
                              <div className="text-xs text-muted-foreground">
                                Enable modules to learn from each other and share insights
                              </div>
                            </div>
                            <Switch
                              checked={chipConfig.enableCrossModuleLearning}
                              onCheckedChange={(checked) =>
                                updateChipConfig({ enableCrossModuleLearning: checked })
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm">Manual Review for Low Confidence</div>
                              <div className="text-xs text-muted-foreground">
                                Updates below 95% confidence require manual approval
                              </div>
                            </div>
                            <Switch
                              checked={chipConfig.requireHumanApproval}
                              onCheckedChange={(checked) =>
                                updateChipConfig({ requireHumanApproval: checked })
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm">
                            Confidence Threshold: {Math.round(chipConfig.confidenceThreshold * 100)}%
                          </div>
                          <Slider
                            value={[chipConfig.confidenceThreshold * 100]}
                            onValueChange={([value]) =>
                              updateChipConfig({ confidenceThreshold: value / 100 })
                            }
                            min={0}
                            max={100}
                            step={5}
                          />
                          <p className="text-xs text-muted-foreground">
                            Minimum confidence level for auto-applying updates (if enabled)
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm">Learning Rate: {chipConfig.learningRate.toFixed(2)}</div>
                          <Slider
                            value={[chipConfig.learningRate * 100]}
                            onValueChange={([value]) =>
                              updateChipConfig({ learningRate: value / 100 })
                            }
                            min={1}
                            max={100}
                            step={1}
                          />
                          <p className="text-xs text-muted-foreground">
                            How aggressively the system adapts to new patterns
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm">Retention Period: {chipConfig.retentionPeriod} days</div>
                          <Slider
                            value={[chipConfig.retentionPeriod]}
                            onValueChange={([value]) =>
                              updateChipConfig({ retentionPeriod: value })
                            }
                            min={7}
                            max={365}
                            step={7}
                          />
                          <p className="text-xs text-muted-foreground">
                            How long to keep archive entries
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    </>
                  )}
                </TabsContent>
              </div>
            </ScrollArea>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
