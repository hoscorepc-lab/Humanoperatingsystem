export interface TradingAgent {
  id: string;
  name: string;
  color: string;
  avatar: string;
  balance: number;
  initialBalance: number;
  position: 'long' | 'short' | 'neutral';
  entryPrice: number;
  positionSize: number;
  unrealizedPnL: number;
  realizedPnL: number;
  totalPnL: number;
  tradeCount: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  personality: string;
}

export interface MarketData {
  price: number;
  timestamp: number;
  volume: number;
  volatility: number;
}

export interface Trade {
  agentId: string;
  type: 'long' | 'short' | 'close';
  price: number;
  size: number;
  timestamp: number;
  pnl?: number;
}

export interface ArenaStats {
  totalBankValue: number;
  totalTrades: number;
  avgWinRate: number;
  marketPrice: number;
  marketVolatility: number;
  topPerformer: string;
  bottomPerformer: string;
}

export interface ArenaPersistedState {
  agents: TradingAgent[];
  marketData: MarketData[];
  currentPrice: number;
  stats: ArenaStats;
  recentTrades: Trade[];
  joinedTeam: string | null;
  lastUpdated: number;
}
