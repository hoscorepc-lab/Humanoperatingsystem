import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Trophy,
  Target,
  Zap,
  BarChart3,
  Crown,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Users
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { useMobileOptimization } from '../../lib/hooks/useMobileOptimization';
import { TradingAgent, MarketData, Trade, ArenaStats, ArenaPersistedState } from '../../types/arena';
import { TradingEngine } from '../../lib/arena/tradingEngine';
import { toast } from 'sonner@2.0.3';
import { saveModuleData, loadModuleData } from '../../lib/supabase/universal-persist';


// Import agent logos
import deepseekLogo from 'figma:asset/06678eec4d4f495b9642c541722d5223e8c17c4a.png';
import grok4Logo from 'figma:asset/dc81ac607e636feaa68f169ecf26f099323c8cab.png';
import hosv3Logo from 'figma:asset/5b028aaae81f2f427f3cde5f359e257db57009db.png';
import claudeLogo from 'figma:asset/1e59f9a0696e7752d7563700d4c8fb2311898002.png';
import qwen3Logo from 'figma:asset/0bef5d486c7e14e66736f11bfce7c17f0c463fcb.png';
import gpt5Logo from 'figma:asset/3a59be5a6e9ecfc9c5a83ab641ef0e236a63c0b7.png';

// Avatar mapping to ensure logos are always preserved (never lost during serialization/updates)
const AGENT_AVATARS: Record<string, string> = {
  'deepseek': deepseekLogo,
  'grok4': grok4Logo,
  'hosv3': hosv3Logo,
  'claude': claudeLogo,
  'qwen3': qwen3Logo,
  'gpt5': gpt5Logo
};

const INITIAL_AGENTS: TradingAgent[] = [
  {
    id: 'deepseek',
    name: 'Deepseek',
    color: 'from-blue-500 to-cyan-500',
    avatar: deepseekLogo,
    balance: 3000,
    initialBalance: 3000,
    position: 'neutral',
    entryPrice: 0,
    positionSize: 0,
    unrealizedPnL: 0,
    realizedPnL: 0,
    totalPnL: 0,
    tradeCount: 0,
    winRate: 0,
    maxDrawdown: 0,
    sharpeRatio: 0,
    personality: 'Aggressive trend follower'
  },
  {
    id: 'grok4',
    name: 'Grok 4',
    color: 'from-purple-500 to-pink-500',
    avatar: grok4Logo,
    balance: 3000,
    initialBalance: 3000,
    position: 'neutral',
    entryPrice: 0,
    positionSize: 0,
    unrealizedPnL: 0,
    realizedPnL: 0,
    totalPnL: 0,
    tradeCount: 0,
    winRate: 0,
    maxDrawdown: 0,
    sharpeRatio: 0,
    personality: 'High frequency scalper'
  },
  {
    id: 'hosv3',
    name: 'HOS v3',
    color: 'from-emerald-500 to-teal-500',
    avatar: hosv3Logo,
    balance: 3000,
    initialBalance: 3000,
    position: 'neutral',
    entryPrice: 0,
    positionSize: 0,
    unrealizedPnL: 0,
    realizedPnL: 0,
    totalPnL: 0,
    tradeCount: 0,
    winRate: 0,
    maxDrawdown: 0,
    sharpeRatio: 0,
    personality: 'Mean reversion specialist'
  },
  {
    id: 'claude',
    name: 'Claude',
    color: 'from-orange-500 to-red-500',
    avatar: claudeLogo,
    balance: 3000,
    initialBalance: 3000,
    position: 'neutral',
    entryPrice: 0,
    positionSize: 0,
    unrealizedPnL: 0,
    realizedPnL: 0,
    totalPnL: 0,
    tradeCount: 0,
    winRate: 0,
    maxDrawdown: 0,
    sharpeRatio: 0,
    personality: 'Conservative value investor'
  },
  {
    id: 'qwen3',
    name: 'QWEN3',
    color: 'from-yellow-500 to-amber-500',
    avatar: qwen3Logo,
    balance: 3000,
    initialBalance: 3000,
    position: 'neutral',
    entryPrice: 0,
    positionSize: 0,
    unrealizedPnL: 0,
    realizedPnL: 0,
    totalPnL: 0,
    tradeCount: 0,
    winRate: 0,
    maxDrawdown: 0,
    sharpeRatio: 0,
    personality: 'Momentum trader'
  },
  {
    id: 'gpt5',
    name: 'GPT5',
    color: 'from-indigo-500 to-violet-500',
    avatar: gpt5Logo,
    balance: 3000,
    initialBalance: 3000,
    position: 'neutral',
    entryPrice: 0,
    positionSize: 0,
    unrealizedPnL: 0,
    realizedPnL: 0,
    totalPnL: 0,
    tradeCount: 0,
    winRate: 0,
    maxDrawdown: 0,
    sharpeRatio: 0,
    personality: 'Balanced portfolio manager'
  }
];

// Helper function to ensure agent avatars are always set correctly
function ensureAgentAvatars(agents: TradingAgent[]): TradingAgent[] {
  return agents.map(agent => ({
    ...agent,
    avatar: AGENT_AVATARS[agent.id] || agent.avatar
  }));
}

interface AgentsArenaModuleProps {
  onClose?: () => void;
}

export function AgentsArenaModule({ onClose }: AgentsArenaModuleProps) {
  const { hapticFeedback } = useMobileOptimization();
  const [agents, setAgents] = useState<TradingAgent[]>(INITIAL_AGENTS);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [currentPrice, setCurrentPrice] = useState(50000);
  const [stats, setStats] = useState<ArenaStats>({
    totalBankValue: 18000,
    totalTrades: 0,
    avgWinRate: 0,
    marketPrice: 50000,
    marketVolatility: 0.02,
    topPerformer: '',
    bottomPerformer: ''
  });
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [joinedTeam, setJoinedTeam] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const engineRef = useRef(new TradingEngine());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get userId from localStorage or use a default demo user (memoized to prevent infinite loops)
  const userId = useMemo(() => {
    try {
      const stored = localStorage.getItem('hos_user_id');
      if (stored) return stored;
      // Generate a unique user ID for demo purposes
      const demoId = `demo-${Date.now()}`;
      localStorage.setItem('hos_user_id', demoId);
      return demoId;
    } catch {
      return 'demo-user';
    }
  }, []); // Empty dependency array - only compute once on mount

  // Load persisted data on mount
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        console.log('📥 Loading Arena data for user:', userId);
        const persistedData = await loadModuleData<ArenaPersistedState>(
          userId,
          'agents-arena',
          null
        );

        if (persistedData && persistedData.agents) {
          console.log('✅ Restored Arena state from persistence');
          // Ensure avatars are restored from the mapping (in case they were lost during serialization)
          setAgents(ensureAgentAvatars(persistedData.agents));
          setMarketData(persistedData.marketData || []);
          setCurrentPrice(persistedData.currentPrice || 50000);
          if (persistedData.stats) {
            setStats(persistedData.stats);
          }
          setRecentTrades(persistedData.recentTrades || []);
          setJoinedTeam(persistedData.joinedTeam);
          
          // Restore price history to trading engine
          if (persistedData.marketData && persistedData.marketData.length > 0) {
            const prices = persistedData.marketData.map(d => d.price);
            engineRef.current.setPriceHistory(prices);
          }
          
          toast.success('Arena data restored!');
        } else {
          console.log('📦 No persisted data found, using initial state');
        }
      } catch (error) {
        console.error('❌ Failed to load Arena data:', error);
        toast.error('Failed to load saved Arena data');
      } finally {
        setIsDataLoaded(true);
      }
    };

    loadPersistedData();
  }, [userId]);

  // Save persisted data whenever state changes (debounced)
  useEffect(() => {
    // Don't save until we've loaded initial data
    if (!isDataLoaded) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce saves to every 5 seconds to avoid excessive writes
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const dataToSave: ArenaPersistedState = {
          agents,
          marketData: marketData.slice(-100), // Keep only last 100 data points
          currentPrice,
          stats,
          recentTrades: recentTrades.slice(0, 20), // Keep only last 20 trades
          joinedTeam,
          lastUpdated: Date.now()
        };

        await saveModuleData(userId, 'agents-arena', dataToSave);
        console.log('💾 Arena data auto-saved');
      } catch (error) {
        console.error('❌ Failed to save Arena data:', error);
      }
    }, 5000); // Save after 5 seconds of inactivity

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [agents, marketData, currentPrice, stats, recentTrades, joinedTeam, isDataLoaded, userId]);

  // Update market and agents
  const updateMarket = useCallback(() => {
    const engine = engineRef.current;
    const newMarketData = engine.generateNextPrice();
    const newPrice = newMarketData.price;
    
    setCurrentPrice(newPrice);
    setMarketData(prev => [...prev.slice(-100), newMarketData]);

    // Update agents
    setAgents(prevAgents => {
      if (!prevAgents || prevAgents.length === 0) return prevAgents;
      
      const updatedAgents = prevAgents.map(agent => {
        // Calculate unrealized P&L for open positions
        let unrealizedPnL = 0;
        if (agent.position !== 'neutral') {
          unrealizedPnL = engine.calculateUnrealizedPnL(
            agent.position,
            agent.entryPrice,
            newPrice,
            agent.positionSize
          );
        }

        // Agent decision making
        const decision = engine.makeAgentDecision(agent, newPrice, engine.getPriceHistory());
        
        if (decision) {
          setRecentTrades(prev => [decision, ...prev.slice(0, 19)]);
          
          if (decision.type === 'close') {
            // Close position
            const pnl = decision.pnl || 0;
            const newBalance = agent.balance + pnl;
            const newRealizedPnL = agent.realizedPnL + pnl;
            
            return {
              ...agent,
              avatar: AGENT_AVATARS[agent.id] || agent.avatar, // Always preserve avatar
              balance: newBalance,
              position: 'neutral',
              entryPrice: 0,
              positionSize: 0,
              unrealizedPnL: 0,
              realizedPnL: newRealizedPnL,
              totalPnL: newRealizedPnL,
              tradeCount: agent.tradeCount + 1,
              winRate: pnl > 0 
                ? ((agent.winRate * agent.tradeCount + 1) / (agent.tradeCount + 1))
                : ((agent.winRate * agent.tradeCount) / (agent.tradeCount + 1))
            };
          } else {
            // Open new position
            return {
              ...agent,
              avatar: AGENT_AVATARS[agent.id] || agent.avatar, // Always preserve avatar
              position: decision.type as 'long' | 'short',
              entryPrice: decision.price,
              positionSize: decision.size
            };
          }
        }

        // Update unrealized P&L and total
        const totalPnL = agent.realizedPnL + unrealizedPnL;
        
        return {
          ...agent,
          avatar: AGENT_AVATARS[agent.id] || agent.avatar, // Always preserve avatar
          unrealizedPnL,
          totalPnL
        };
      });
      
      // Ensure avatars are always set correctly
      return ensureAgentAvatars(updatedAgents);
    });
  }, []);

  // Autonomous trading - always running (but only after data is loaded)
  useEffect(() => {
    if (!isDataLoaded) {
      console.log('⏳ Waiting for data to load before starting simulation...');
      return;
    }
    
    console.log('▶️  Starting Arena simulation...');
    intervalRef.current = setInterval(updateMarket, 1000); // Update every second

    return () => {
      if (intervalRef.current) {
        console.log('⏸️  Stopping Arena simulation...');
        clearInterval(intervalRef.current);
      }
    };
  }, [updateMarket, isDataLoaded]);

  // Update stats
  useEffect(() => {
    if (!agents || agents.length === 0) return;
    
    const totalBank = agents.reduce((sum, agent) => sum + agent.balance + agent.unrealizedPnL, 0);
    const totalTrades = agents.reduce((sum, agent) => sum + agent.tradeCount, 0);
    const avgWinRate = agents.reduce((sum, agent) => sum + agent.winRate, 0) / agents.length;
    
    const sorted = [...agents].sort((a, b) => b.totalPnL - a.totalPnL);
    
    setStats({
      totalBankValue: totalBank,
      totalTrades,
      avgWinRate,
      marketPrice: currentPrice,
      marketVolatility: 0.02,
      topPerformer: sorted[0]?.name || '',
      bottomPerformer: sorted[sorted.length - 1]?.name || ''
    });
  }, [agents, currentPrice]);

  const handleJoinTeam = async (agentName: string) => {
    hapticFeedback('success');
    // Toggle team selection
    const newTeam = joinedTeam === agentName ? null : agentName;
    setJoinedTeam(newTeam);
    
    if (newTeam === null) {
      toast.info(`Left Team ${agentName}`);
    } else {
      toast.success(`Joined Team ${agentName}!`);
    }

    // Immediately save team selection
    try {
      const dataToSave: ArenaPersistedState = {
        agents,
        marketData: marketData.slice(-100),
        currentPrice,
        stats,
        recentTrades: recentTrades.slice(0, 20),
        joinedTeam: newTeam,
        lastUpdated: Date.now()
      };
      await saveModuleData(userId, 'agents-arena', dataToSave);
      console.log('💾 Team selection saved immediately');
    } catch (error) {
      console.error('❌ Failed to save team selection:', error);
    }
  };

  const handleResetArena = async () => {
    if (!confirm('Are you sure you want to reset the Arena? This will clear all agents data and trading history.')) {
      return;
    }

    hapticFeedback('warning');
    
    // Reset all state to initial values
    setAgents(INITIAL_AGENTS);
    setMarketData([]);
    setCurrentPrice(50000);
    setStats({
      totalBankValue: 18000,
      totalTrades: 0,
      avgWinRate: 0,
      marketPrice: 50000,
      marketVolatility: 0.02,
      topPerformer: '',
      bottomPerformer: ''
    });
    setRecentTrades([]);
    setJoinedTeam(null);
    
    // Reset trading engine
    engineRef.current.reset();
    
    // Save the reset state
    try {
      const dataToSave: ArenaPersistedState = {
        agents: INITIAL_AGENTS,
        marketData: [],
        currentPrice: 50000,
        stats: {
          totalBankValue: 18000,
          totalTrades: 0,
          avgWinRate: 0,
          marketPrice: 50000,
          marketVolatility: 0.02,
          topPerformer: '',
          bottomPerformer: ''
        },
        recentTrades: [],
        joinedTeam: null,
        lastUpdated: Date.now()
      };
      await saveModuleData(userId, 'agents-arena', dataToSave);
      toast.success('Arena reset successfully!');
    } catch (error) {
      console.error('❌ Failed to save reset state:', error);
      toast.error('Failed to save reset state');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const sortedAgents = [...agents].sort((a, b) => b.totalPnL - a.totalPnL);

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 h-0">
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h2>Agents Arena</h2>
                <p className="text-muted-foreground">
                  6 AI agents compete in real-time trading, all profits will support HOS token
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Badge variant="default" className="gap-1">
                  <Activity className="w-3 h-3" />
                  LIVE
                </Badge>
              </motion.div>
              {joinedTeam && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <Badge variant="secondary" className="gap-1">
                    <Users className="w-3 h-3" />
                    Team {joinedTeam}
                  </Badge>
                </motion.div>
              )}
            </div>
          </div>

      {/* All Agents Bank - Total Value Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl">All Agents Bank</CardTitle>
                  <CardDescription className="text-xs">Combined portfolio value</CardDescription>
                </div>
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Activity className="w-5 h-5 text-green-500" />
              </motion.div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl md:text-5xl">
                {formatCurrency(stats.totalBankValue)}
              </span>
              <Badge
                variant={stats.totalBankValue >= 18000 ? 'default' : 'destructive'}
                className="text-xs sm:text-sm"
              >
                {formatPercent(((stats.totalBankValue - 18000) / 18000) * 100)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Market Price</p>
                <p className="text-sm sm:text-base">{formatCurrency(currentPrice)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Total Trades</p>
                <p className="text-sm sm:text-base">{stats.totalTrades}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Avg Win Rate</p>
                <p className="text-sm sm:text-base">{(stats.avgWinRate * 100).toFixed(1)}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Volatility</p>
                <p className="text-sm sm:text-base">{(stats.marketVolatility * 100).toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Leaderboard Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <CardTitle>Leaderboard</CardTitle>
          </div>
          <CardDescription>Live rankings by total P&L</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <AnimatePresence mode="popLayout">
              {sortedAgents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <Card className={`relative overflow-hidden ${index === 0 ? 'border-yellow-500 border-2' : ''}`}>
                    {index === 0 && (
                      <div className="absolute top-0 right-0 p-1">
                        <Crown className="w-4 h-4 text-yellow-500" />
                      </div>
                    )}
                    {index === 1 && (
                      <div className="absolute top-0 right-0 p-1">
                        <Award className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                    {index === 2 && (
                      <div className="absolute top-0 right-0 p-1">
                        <Award className="w-4 h-4 text-amber-600" />
                      </div>
                    )}
                    
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        {typeof agent.avatar === 'string' ? (
                          <img 
                            src={agent.avatar} 
                            alt={agent.name}
                            className="w-8 h-8 object-contain rounded-lg"
                            loading="eager"
                          />
                        ) : (
                          <span className="text-2xl">{agent.avatar}</span>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs truncate">{agent.name}</p>
                          <p className="text-[10px] text-muted-foreground">#{index + 1}</p>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className={`text-sm ${agent.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercent((agent.totalPnL / agent.initialBalance) * 100)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Agent Trading Cards */}
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {agents.map((agent) => (
            <motion.div
              key={agent.id}
              layout
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Card className={`relative overflow-hidden hover:shadow-lg transition-all h-full flex flex-col ${
                joinedTeam === agent.name 
                  ? 'border-4 border-primary shadow-2xl shadow-primary/20' 
                  : 'border-2'
              }`}>
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} ${
                  joinedTeam === agent.name ? 'opacity-10' : 'opacity-5'
                }`} />
                
                {/* Team Badge */}
                {joinedTeam === agent.name && (
                  <div className="absolute top-2 right-2 z-10">
                    <motion.div
                      initial={{ rotate: -12, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <Badge variant="default" className="gap-1 shadow-lg">
                        <Users className="w-3 h-3" />
                        YOUR TEAM
                      </Badge>
                    </motion.div>
                  </div>
                )}
                
                <CardHeader className="relative pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      {typeof agent.avatar === 'string' ? (
                        <img 
                          src={agent.avatar} 
                          alt={agent.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-lg"
                          loading="eager"
                        />
                      ) : (
                        <span className="text-3xl sm:text-4xl">{agent.avatar}</span>
                      )}
                      <div>
                        <CardTitle className="text-base sm:text-lg">{agent.name}</CardTitle>
                        <CardDescription className="text-xs">{agent.personality}</CardDescription>
                      </div>
                    </div>
                    
                    {/* Position Badge */}
                    {agent.position !== 'neutral' && (
                      <Badge
                        variant={agent.position === 'long' ? 'default' : 'destructive'}
                        className="gap-1"
                      >
                        {agent.position === 'long' ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {agent.position.toUpperCase()}
                      </Badge>
                    )}
                    {agent.position === 'neutral' && (
                      <Badge variant="outline" className="gap-1">
                        <Minus className="w-3 h-3" />
                        NEUTRAL
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="relative space-y-3 flex-1 flex flex-col">
                  {/* Balance */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Current Value</p>
                    <p className="text-xl sm:text-2xl">{formatCurrency(agent.balance + agent.unrealizedPnL)}</p>
                  </div>

                  <Separator />

                  {/* P&L */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Unrealized P&L</p>
                      <p className={`text-sm sm:text-base ${agent.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(agent.unrealizedPnL)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Realized P&L</p>
                      <p className={`text-sm sm:text-base ${agent.realizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(agent.realizedPnL)}
                      </p>
                    </div>
                  </div>

                  {/* Total P&L with indicator */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      {agent.totalPnL >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-xs text-muted-foreground">Total P&L</span>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm sm:text-base ${agent.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(agent.totalPnL)}
                      </p>
                      <p className={`text-xs ${agent.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercent((agent.totalPnL / agent.initialBalance) * 100)}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trades:</span>
                      <span>{agent.tradeCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Win Rate:</span>
                      <span>{(agent.winRate * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* Position Details - Fixed height container */}
                  <div className="pt-2 border-t border-border min-h-[60px]">
                    {agent.position !== 'neutral' ? (
                      <>
                        <p className="text-xs text-muted-foreground mb-2">Open Position</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">Entry</p>
                            <p>{formatCurrency(agent.entryPrice)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Size</p>
                            <p>{agent.positionSize.toFixed(4)}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                        No open position
                      </div>
                    )}
                  </div>

                  {/* Performance Progress Bar - Pushed to bottom */}
                  <div className="space-y-1 mt-auto">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Performance</span>
                      <span className={agent.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {((agent.totalPnL / agent.initialBalance) * 100 + 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.max(0, Math.min(100, ((agent.totalPnL / agent.initialBalance) * 100 + 100)))} 
                      className="h-2"
                    />
                  </div>

                  {/* Join Team Button */}
                  <Button
                    onClick={() => handleJoinTeam(agent.name)}
                    variant={joinedTeam === agent.name ? 'default' : 'outline'}
                    size="sm"
                    className="w-full mt-3"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    {joinedTeam === agent.name ? 'Leave Team' : 'Join Team'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Recent Trades */}
      {recentTrades.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              <CardTitle>Recent Trades</CardTitle>
            </div>
            <CardDescription>Last 20 trading actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
              {recentTrades.map((trade, index) => {
                const agent = agents.find(a => a.id === trade.agentId);
                return (
                  <motion.div
                    key={`${trade.agentId}-${trade.timestamp}-${index}`}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-xs sm:text-sm"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {typeof agent?.avatar === 'string' ? (
                        <img 
                          src={agent.avatar} 
                          alt={agent.name}
                          className="w-6 h-6 object-contain rounded"
                          loading="eager"
                        />
                      ) : (
                        <span className="text-lg">{agent?.avatar}</span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate">{agent?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(trade.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={trade.type === 'long' ? 'default' : trade.type === 'short' ? 'destructive' : 'outline'}
                        className="text-xs"
                      >
                        {trade.type.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatCurrency(trade.price)}
                      </span>
                      {trade.pnl !== undefined && (
                        <span className={`text-xs ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'} whitespace-nowrap`}>
                          {formatCurrency(trade.pnl)}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default AgentsArenaModule;
