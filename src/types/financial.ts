// Financial Research Types

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe?: number;
  eps?: number;
}

export interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Portfolio {
  id: string;
  name: string;
  holdings: PortfolioHolding[];
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
  createdAt: number;
}

export interface PortfolioHolding {
  symbol: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  gain: number;
  gainPercent: number;
}

export interface MarketNews {
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface FinancialAnalysis {
  symbol: string;
  analysis: string;
  recommendation: 'buy' | 'hold' | 'sell';
  targetPrice?: number;
  risks: string[];
  opportunities: string[];
  technicalIndicators: TechnicalIndicators;
  generatedAt: number;
}

export interface TechnicalIndicators {
  rsi?: number;
  macd?: {
    value: number;
    signal: number;
    histogram: number;
  };
  movingAverages?: {
    sma20: number;
    sma50: number;
    sma200: number;
  };
  bollinger?: {
    upper: number;
    middle: number;
    lower: number;
  };
}

export interface ResearchReport {
  id: string;
  title: string;
  symbol: string;
  content: string;
  summary: string;
  recommendation: string;
  createdAt: number;
  author: string;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  addedAt: number;
  notes?: string;
}

export interface MarketOverview {
  indices: {
    name: string;
    value: number;
    change: number;
    changePercent: number;
  }[];
  topGainers: Stock[];
  topLosers: Stock[];
  mostActive: Stock[];
}
