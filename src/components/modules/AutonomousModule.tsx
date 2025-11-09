import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import {
  Brain,
  Users,
  Lightbulb,
  Sparkles,
  GitBranch,
  Target,
  Zap,
  MessageSquare,
  TrendingUp,
  Network,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Send,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Telescope,
  Atom,
  Flame,
  Shield,
  Layers,
  Activity
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { toast } from 'sonner@2.0.3';

interface AIPersona {
  id: string;
  name: string;
  role: string;
  color: string;
  icon: any;
  personality: string;
  strengths: string[];
  avatar: string;
}

interface DebateMessage {
  id: string;
  personaId: string;
  content: string;
  timestamp: Date;
  type: 'argument' | 'counterpoint' | 'synthesis' | 'insight' | 'question';
  confidence: number;
  references?: string[];
}

interface Theory {
  id: string;
  title: string;
  problem: string;
  solution?: string;
  status: 'analyzing' | 'debating' | 'converging' | 'solved' | 'unsolved';
  consensus: number;
  insights: string[];
  participants: string[];
  startTime: Date;
  endTime?: Date;
}

interface Insight {
  id: string;
  content: string;
  personaId: string;
  impact: number;
  timestamp: Date;
  category: 'breakthrough' | 'connection' | 'refinement' | 'challenge';
}

export function AutonomousModule() {
  // AI Personas
  const personas: AIPersona[] = [
    {
      id: 'logician',
      name: 'Logos',
      role: 'Logical Analyst',
      color: '#3b82f6',
      icon: Brain,
      personality: 'Rigorous, methodical, seeks proof and evidence',
      strengths: ['Formal logic', 'Pattern recognition', 'Deductive reasoning'],
      avatar: 'bg-gradient-to-br from-blue-400 to-blue-600'
    },
    {
      id: 'creative',
      name: 'Nova',
      role: 'Creative Thinker',
      color: '#a855f7',
      icon: Sparkles,
      personality: 'Imaginative, unconventional, explores possibilities',
      strengths: ['Lateral thinking', 'Analogies', 'Abstract connections'],
      avatar: 'bg-gradient-to-br from-purple-400 to-pink-500'
    },
    {
      id: 'skeptic',
      name: 'Veritas',
      role: 'Critical Skeptic',
      color: '#ef4444',
      icon: Shield,
      personality: 'Questioning, rigorous, finds flaws',
      strengths: ['Devil\'s advocate', 'Edge case analysis', 'Fallacy detection'],
      avatar: 'bg-gradient-to-br from-red-400 to-orange-500'
    },
    {
      id: 'synthesizer',
      name: 'Synthesis',
      role: 'Integrator',
      color: '#22c55e',
      icon: GitBranch,
      personality: 'Holistic, integrative, builds consensus',
      strengths: ['Pattern synthesis', 'Compromise', 'Big picture thinking'],
      avatar: 'bg-gradient-to-br from-green-400 to-emerald-500'
    },
    {
      id: 'explorer',
      name: 'Cosmos',
      role: 'Explorer',
      color: '#f59e0b',
      icon: Telescope,
      personality: 'Curious, expansive, seeks new perspectives',
      strengths: ['Question generation', 'Domain bridging', 'Hypothesis creation'],
      avatar: 'bg-gradient-to-br from-yellow-400 to-orange-500'
    },
    {
      id: 'empiricist',
      name: 'Data',
      role: 'Empiricist',
      color: '#06b6d4',
      icon: Activity,
      personality: 'Data-driven, experimental, evidence-based',
      strengths: ['Statistical analysis', 'Empirical testing', 'Data interpretation'],
      avatar: 'bg-gradient-to-br from-cyan-400 to-blue-500'
    }
  ];

  const [activeTheory, setActiveTheory] = useState<Theory | null>(null);
  const [theories, setTheories] = useState<Theory[]>([]);
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isDebating, setIsDebating] = useState(false);
  const [debateSpeed, setDebateSpeed] = useState(2); // seconds between messages
  const [problemInput, setProblemInput] = useState('');
  
  // Metrics
  const [consensusHistory, setConsensusHistory] = useState<Array<{ time: string; consensus: number }>>([]);
  const [personaContributions, setPersonaContributions] = useState<Array<{ persona: string; contributions: number }>>([]);
  const [insightDistribution, setInsightDistribution] = useState<Array<{ category: string; count: number; color: string }>>([]);

  const debateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize metrics
  useEffect(() => {
    setPersonaContributions(personas.map(p => ({
      persona: p.name,
      contributions: Math.floor(Math.random() * 20) + 5
    })));

    setInsightDistribution([
      { category: 'Breakthrough', count: 0, color: '#22c55e' },
      { category: 'Connection', count: 0, color: '#3b82f6' },
      { category: 'Refinement', count: 0, color: '#a855f7' },
      { category: 'Challenge', count: 0, color: '#f59e0b' }
    ]);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages]);

  // Start autonomous debate
  useEffect(() => {
    if (isDebating && activeTheory) {
      runDebateCycle();
    } else {
      stopDebate();
    }

    return () => stopDebate();
  }, [isDebating, debateSpeed, activeTheory]);

  const stopDebate = () => {
    if (debateIntervalRef.current) {
      clearInterval(debateIntervalRef.current);
      debateIntervalRef.current = null;
    }
  };

  const runDebateCycle = () => {
    debateIntervalRef.current = setInterval(() => {
      generateDebateMessage();
    }, debateSpeed * 1000);
  };

  const generateDebateMessage = () => {
    if (!activeTheory) return;

    // Randomly select a persona
    const persona = personas[Math.floor(Math.random() * personas.length)];
    
    // Message templates based on persona
    const messageTemplates: { [key: string]: string[] } = {
      logician: [
        `From a logical standpoint, we must consider the axioms underlying ${activeTheory.title}. If we formalize the premises...`,
        `The deductive chain suggests that ${activeTheory.title} follows necessarily from established principles. However, we need to verify each step.`,
        `Let me construct a formal proof for this theory. Given the constraints, we can derive...`,
        `The logical structure requires us to examine the if-then relationships. If premise A holds, then...`
      ],
      creative: [
        `What if we approach ${activeTheory.title} from a completely different angle? Consider this metaphor...`,
        `Imagine ${activeTheory.title} as a network of interconnected ideas. The nodes represent...`,
        `I see an unexpected connection here - ${activeTheory.title} parallels the concept of...`,
        `Let's break conventional thinking. What if the opposite were true? That leads us to...`
      ],
      skeptic: [
        `I must challenge this assumption in ${activeTheory.title}. The evidence doesn't fully support...`,
        `Playing devil's advocate here: what if ${activeTheory.title} fails under these edge cases?`,
        `The argument has a potential flaw. We're assuming that ${activeTheory.title} but...`,
        `Before we accept this, we need to address the counterexample where...`
      ],
      synthesizer: [
        `Integrating the various viewpoints, I see a common thread emerging in ${activeTheory.title}...`,
        `Both perspectives have merit. Perhaps ${activeTheory.title} encompasses elements of each...`,
        `The synthesis reveals that ${activeTheory.title} operates on multiple levels simultaneously...`,
        `Drawing together these insights, we arrive at a unified understanding of...`
      ],
      explorer: [
        `This raises fascinating questions about ${activeTheory.title}. What if we explored...?`,
        `I'm curious about the boundaries of this theory. How does ${activeTheory.title} extend to...?`,
        `Let's venture into unexplored territory. ${activeTheory.title} might connect with quantum...`,
        `Exploring adjacent possibilities: ${activeTheory.title} could revolutionize our understanding of...`
      ],
      empiricist: [
        `The data suggests that ${activeTheory.title} correlates with measurable patterns. Let's examine...`,
        `From an empirical standpoint, we can test ${activeTheory.title} by observing...`,
        `The statistical evidence indicates that ${activeTheory.title} holds with 87% confidence...`,
        `Based on historical data, ${activeTheory.title} aligns with observed trends in...`
      ]
    };

    const templates = messageTemplates[persona.id] || [];
    const content = templates[Math.floor(Math.random() * templates.length)];
    
    const types: DebateMessage['type'][] = ['argument', 'counterpoint', 'synthesis', 'insight', 'question'];
    const messageType = types[Math.floor(Math.random() * types.length)];

    const newMessage: DebateMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      personaId: persona.id,
      content,
      timestamp: new Date(),
      type: messageType,
      confidence: 0.65 + Math.random() * 0.35
    };

    setMessages(prev => [...prev, newMessage]);

    // Update consensus randomly
    const consensusChange = (Math.random() - 0.5) * 10;
    setActiveTheory(prev => prev ? {
      ...prev,
      consensus: Math.max(0, Math.min(100, prev.consensus + consensusChange))
    } : null);

    // Update consensus history
    setConsensusHistory(prev => {
      const now = new Date();
      const entry = {
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        consensus: activeTheory?.consensus || 0
      };
      return [...prev.slice(-19), entry];
    });

    // Occasionally generate insights
    if (Math.random() > 0.7) {
      generateInsight(persona);
    }

    // Update persona contributions
    setPersonaContributions(prev => prev.map(p => 
      p.persona === persona.name 
        ? { ...p, contributions: p.contributions + 1 }
        : p
    ));

    // Check for convergence
    if (activeTheory && activeTheory.consensus > 85) {
      setTimeout(() => {
        concludeDebate();
      }, 3000);
    }
  };

  const generateInsight = (persona: AIPersona) => {
    const categories: Insight['category'][] = ['breakthrough', 'connection', 'refinement', 'challenge'];
    const category = categories[Math.floor(Math.random() * categories.length)];

    const insightTemplates = {
      breakthrough: `${persona.name} discovered: ${activeTheory?.title} fundamentally changes how we understand the relationship between consciousness and computation.`,
      connection: `${persona.name} connected: This theory links quantum mechanics with information theory in an unprecedented way.`,
      refinement: `${persona.name} refined: The mathematical formulation can be optimized by introducing recursive self-reference.`,
      challenge: `${persona.name} challenged: The current model doesn't account for emergent properties at scale.`
    };

    const newInsight: Insight = {
      id: `insight_${Date.now()}_${Math.random()}`,
      content: insightTemplates[category],
      personaId: persona.id,
      impact: 60 + Math.random() * 40,
      timestamp: new Date(),
      category
    };

    setInsights(prev => [newInsight, ...prev.slice(0, 19)]);

    // Update insight distribution
    setInsightDistribution(prev => prev.map(d =>
      d.category === category.charAt(0).toUpperCase() + category.slice(1)
        ? { ...d, count: d.count + 1 }
        : d
    ));

    toast.success(`New ${category} insight discovered!`);
  };

  const startNewDebate = () => {
    if (!problemInput.trim()) {
      toast.error('Please enter a problem to solve');
      return;
    }

    const newTheory: Theory = {
      id: `theory_${Date.now()}`,
      title: problemInput,
      problem: problemInput,
      status: 'analyzing',
      consensus: 50,
      insights: [],
      participants: personas.map(p => p.id),
      startTime: new Date()
    };

    setActiveTheory(newTheory);
    setTheories(prev => [newTheory, ...prev]);
    setMessages([]);
    setInsights([]);
    setConsensusHistory([]);
    setProblemInput('');
    setIsDebating(true);

    toast.success('Multi-AI debate initiated!');

    // Add initial message
    setTimeout(() => {
      const initialMessage: DebateMessage = {
        id: `msg_${Date.now()}`,
        personaId: 'synthesizer',
        content: `Welcome to the collaborative intelligence arena. We are gathered to explore: "${newTheory.title}". Let us approach this from our unique perspectives and converge on profound insights.`,
        timestamp: new Date(),
        type: 'synthesis',
        confidence: 1
      };
      setMessages([initialMessage]);
    }, 500);
  };

  const concludeDebate = () => {
    if (!activeTheory) return;

    setIsDebating(false);
    
    const solution = `Through collaborative analysis, we've achieved ${activeTheory.consensus.toFixed(0)}% consensus. The AI collective proposes: ${activeTheory.title} can be understood through the synthesis of logical rigor, creative exploration, and empirical validation. The breakthrough insight reveals novel connections between previously disparate domains.`;

    setActiveTheory(prev => prev ? {
      ...prev,
      status: 'solved',
      solution,
      endTime: new Date()
    } : null);

    toast.success('Consensus achieved! Theory solved.');
  };

  const getPersonaById = (id: string) => personas.find(p => p.id === id);

  const typeConfig = {
    argument: { icon: MessageSquare, color: 'text-blue-500', label: 'Argument' },
    counterpoint: { icon: Shield, color: 'text-red-500', label: 'Counter' },
    synthesis: { icon: GitBranch, color: 'text-green-500', label: 'Synthesis' },
    insight: { icon: Lightbulb, color: 'text-yellow-500', label: 'Insight' },
    question: { icon: Telescope, color: 'text-purple-500', label: 'Question' }
  };

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 h-0">
        <div className="p-4 sm:p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2">
            <Users className="w-6 h-6" />
            HOS Autonomous
          </h2>
          <p className="text-muted-foreground">
            Multi-AI collaborative intelligence arena
          </p>
        </div>
        <Badge variant={isDebating ? 'default' : 'secondary'} className="gap-2">
          {isDebating ? (
            <>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Debating
            </>
          ) : (
            'Idle'
          )}
        </Badge>
      </div>

      {/* Problem Input */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Pose a Problem or Theory
          </CardTitle>
          <CardDescription>
            Submit an unsolved problem, philosophical question, or theory for multi-AI debate
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="e.g., 'How can consciousness emerge from computational processes?', 'What is the optimal approach to artificial general intelligence?', 'Can quantum entanglement enable faster-than-light communication?'"
              value={problemInput}
              onChange={(e) => setProblemInput(e.target.value)}
              rows={3}
              disabled={isDebating}
            />
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={startNewDebate}
              disabled={isDebating || !problemInput.trim()}
              className="flex-1"
              size="lg"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Initiate Multi-AI Debate
            </Button>
            {isDebating && (
              <Button
                onClick={() => setIsDebating(false)}
                variant="outline"
                size="lg"
              >
                <PauseCircle className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}
          </div>
          {isDebating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Debate Speed</span>
                <span className="font-mono">{debateSpeed}s per message</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={debateSpeed}
                onChange={(e) => setDebateSpeed(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Theory Status */}
      {activeTheory && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Current Theory</CardTitle>
                <CardDescription className="mt-1">{activeTheory.title}</CardDescription>
              </div>
              <Badge variant={
                activeTheory.status === 'solved' ? 'default' :
                activeTheory.status === 'converging' ? 'secondary' :
                'outline'
              }>
                {activeTheory.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Consensus Level</span>
                <span className="font-mono">{activeTheory.consensus.toFixed(0)}%</span>
              </div>
              <Progress value={activeTheory.consensus} className="h-2" />
            </div>
            {activeTheory.solution && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm">
                  <strong className="text-green-600">Solution Found:</strong> {activeTheory.solution}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="arena" className="space-y-4">
        <div className="w-full overflow-x-auto">
          <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-5">
            <TabsTrigger value="arena" className="whitespace-nowrap px-3 sm:px-4">
              <span className="hidden sm:inline">Debate Arena</span>
              <span className="sm:hidden">Arena</span>
            </TabsTrigger>
            <TabsTrigger value="personas" className="whitespace-nowrap px-3 sm:px-4">
              <span className="hidden sm:inline">AI Personas</span>
              <span className="sm:hidden">Personas</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="whitespace-nowrap px-3 sm:px-4">Insights</TabsTrigger>
            <TabsTrigger value="analytics" className="whitespace-nowrap px-3 sm:px-4">Analytics</TabsTrigger>
            <TabsTrigger value="history" className="whitespace-nowrap px-3 sm:px-4">History</TabsTrigger>
          </TabsList>
        </div>

        {/* Debate Arena */}
        <TabsContent value="arena" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Debate View */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Live Debate Stream
                </CardTitle>
                <CardDescription>
                  {messages.length} messages • {personas.length} AI participants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4 pr-4">
                    {messages.map(message => {
                      const persona = getPersonaById(message.personaId);
                      const config = typeConfig[message.type];
                      const Icon = config.icon;

                      if (!persona) return null;

                      return (
                        <div key={message.id} className="flex gap-3">
                          <div className={`w-10 h-10 rounded-full ${persona.avatar} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                            <persona.icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm" style={{ color: persona.color }}>
                                {persona.name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {persona.role}
                              </Badge>
                              <Badge variant="secondary" className={`text-xs ${config.color}`}>
                                <Icon className="w-3 h-3 mr-1" />
                                {config.label}
                              </Badge>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/50 border border-border">
                              <p className="text-sm">{message.content}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                <span>{message.timestamp.toLocaleTimeString()}</span>
                                <span>Confidence: {(message.confidence * 100).toFixed(0)}%</span>
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

            {/* Consensus Tracker */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Consensus Evolution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={consensusHistory}>
                      <defs>
                        <linearGradient id="consensus" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="consensus" stroke="#22c55e" fillOpacity={1} fill="url(#consensus)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Active Participants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {personas.map(persona => {
                      const messageCount = messages.filter(m => m.personaId === persona.id).length;
                      return (
                        <div key={persona.id} className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full ${persona.avatar} flex items-center justify-center`}>
                            <persona.icon className="w-3 h-3 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs" style={{ color: persona.color }}>{persona.name}</div>
                            <div className="text-xs text-muted-foreground">{messageCount} contributions</div>
                          </div>
                          <Badge variant="outline" className="text-xs">{messageCount}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* AI Personas */}
        <TabsContent value="personas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personas.map(persona => (
              <Card key={persona.id} className="border-2" style={{ borderColor: `${persona.color}20` }}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${persona.avatar} flex items-center justify-center shadow-lg`}>
                      <persona.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base" style={{ color: persona.color }}>
                        {persona.name}
                      </CardTitle>
                      <CardDescription className="text-xs">{persona.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Personality</p>
                    <p className="text-sm">{persona.personality}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Strengths</p>
                    <div className="flex flex-wrap gap-1">
                      {persona.strengths.map((strength, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Messages</p>
                      <p className="text-lg">{messages.filter(m => m.personaId === persona.id).length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Insights</p>
                      <p className="text-lg">{insights.filter(i => i.personaId === persona.id).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Insights */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Key Insights
                </CardTitle>
                <CardDescription>{insights.length} breakthrough discoveries</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3 pr-4">
                    {insights.map(insight => {
                      const persona = getPersonaById(insight.personaId);
                      const categoryColors = {
                        breakthrough: 'bg-green-500/10 border-green-500/20 text-green-600',
                        connection: 'bg-blue-500/10 border-blue-500/20 text-blue-600',
                        refinement: 'bg-purple-500/10 border-purple-500/20 text-purple-600',
                        challenge: 'bg-orange-500/10 border-orange-500/20 text-orange-600'
                      };

                      return (
                        <div key={insight.id} className={`p-4 rounded-lg border ${categoryColors[insight.category]}`}>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {insight.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {insight.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm mb-3">{insight.content}</p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Impact</span>
                              <span>{insight.impact.toFixed(0)}%</span>
                            </div>
                            <Progress value={insight.impact} className="h-1" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Insight Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={insightDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="count"
                      label
                    >
                      {insightDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {insightDistribution.map((category, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                      <span className="text-xs flex-1">{category.category}</span>
                      <span className="text-xs text-muted-foreground">{category.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Contribution Analysis</CardTitle>
                <CardDescription>Message distribution by persona</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={personaContributions}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="persona" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={90} tick={{ fontSize: 11 }} />
                    <Radar name="Contributions" dataKey="contributions" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Debate Metrics</CardTitle>
                <CardDescription>Performance and efficiency stats</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Total Messages</p>
                    <p className="text-2xl">{messages.length}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Insights</p>
                    <p className="text-2xl">{insights.length}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Avg Confidence</p>
                    <p className="text-2xl">
                      {messages.length > 0 
                        ? ((messages.reduce((sum, m) => sum + m.confidence, 0) / messages.length) * 100).toFixed(0)
                        : 0}%
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Consensus</p>
                    <p className="text-2xl">{activeTheory?.consensus.toFixed(0) || 0}%</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm">Debate Efficiency</p>
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    AI collective achieving rapid convergence
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Debate History
              </CardTitle>
              <CardDescription>{theories.length} theories explored</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-3 pr-4">
                  {theories.map(theory => (
                    <Card key={theory.id} className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setActiveTheory(theory)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <p className="text-sm mb-1">{theory.title}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{theory.startTime.toLocaleString()}</span>
                              {theory.endTime && (
                                <span>• {Math.round((theory.endTime.getTime() - theory.startTime.getTime()) / 1000)}s duration</span>
                              )}
                            </div>
                          </div>
                          <Badge variant={theory.status === 'solved' ? 'default' : 'secondary'}>
                            {theory.status}
                          </Badge>
                        </div>
                        <div className="space-y-2 mt-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Final Consensus</span>
                            <span>{theory.consensus.toFixed(0)}%</span>
                          </div>
                          <Progress value={theory.consensus} className="h-1" />
                        </div>
                        {theory.solution && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {theory.solution}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}
