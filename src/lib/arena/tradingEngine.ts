import { TradingAgent, MarketData, Trade } from '../../types/arena';

/**
 * Trading Engine - Mathematically Accurate Market Simulation
 * Uses Geometric Brownian Motion for realistic price movements
 */

export class TradingEngine {
  private basePrice: number = 50000; // Base asset price (e.g., BTC)
  private volatility: number = 0.02; // 2% volatility
  private drift: number = 0.0001; // Slight upward drift
  private lastPrice: number = this.basePrice;
  private priceHistory: MarketData[] = [];

  /**
   * Generate next market price using Geometric Brownian Motion
   * dS = μS dt + σS dW
   * where μ is drift, σ is volatility, dW is Wiener process
   */
  generateNextPrice(): MarketData {
    const dt = 1; // Time step
    const randomShock = this.normalRandom(0, 1);
    
    // Geometric Brownian Motion formula
    const priceChange = this.drift * this.lastPrice * dt + 
                        this.volatility * this.lastPrice * randomShock * Math.sqrt(dt);
    
    const newPrice = this.lastPrice + priceChange;
    
    // Add some market events (sudden moves)
    const eventProbability = 0.05; // 5% chance of event
    let finalPrice = newPrice;
    
    if (Math.random() < eventProbability) {
      const eventMagnitude = this.normalRandom(0, 0.01); // ±1% event
      finalPrice = newPrice * (1 + eventMagnitude);
    }
    
    // Ensure price stays reasonable (no negative prices)
    finalPrice = Math.max(finalPrice, this.basePrice * 0.5);
    finalPrice = Math.min(finalPrice, this.basePrice * 2);
    
    this.lastPrice = finalPrice;
    
    const marketData: MarketData = {
      price: finalPrice,
      timestamp: Date.now(),
      volume: Math.random() * 1000 + 500,
      volatility: this.volatility
    };
    
    this.priceHistory.push(marketData);
    if (this.priceHistory.length > 1000) {
      this.priceHistory.shift(); // Keep last 1000 prices
    }
    
    return marketData;
  }

  /**
   * Box-Muller transform for generating normally distributed random numbers
   */
  private normalRandom(mean: number, stdDev: number): number {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  }

  /**
   * Calculate unrealized P&L for a position
   */
  calculateUnrealizedPnL(
    position: 'long' | 'short',
    entryPrice: number,
    currentPrice: number,
    positionSize: number
  ): number {
    if (position === 'long') {
      return (currentPrice - entryPrice) * positionSize;
    } else if (position === 'short') {
      return (entryPrice - currentPrice) * positionSize;
    }
    return 0;
  }

  /**
   * Agent decision making based on personality and market conditions
   */
  makeAgentDecision(
    agent: TradingAgent,
    currentPrice: number,
    priceHistory: MarketData[]
  ): Trade | null {
    // Calculate indicators
    const sma20 = this.calculateSMA(priceHistory, 20);
    const sma50 = this.calculateSMA(priceHistory, 50);
    const rsi = this.calculateRSI(priceHistory, 14);
    
    // Agent personality affects decision making
    const aggressiveness = this.getAggressiveness(agent.name);
    const randomFactor = Math.random();
    
    // Check if should close existing position
    if (agent.position !== 'neutral') {
      const positionPnL = this.calculateUnrealizedPnL(
        agent.position,
        agent.entryPrice,
        currentPrice,
        agent.positionSize
      );
      
      const pnlPercent = (positionPnL / agent.initialBalance) * 100;
      
      // Take profit at 5% or stop loss at -3%
      if (pnlPercent > 5 || pnlPercent < -3) {
        return {
          agentId: agent.id,
          type: 'close',
          price: currentPrice,
          size: agent.positionSize,
          timestamp: Date.now(),
          pnl: positionPnL
        };
      }
    }
    
    // Only open new position if currently neutral
    if (agent.position === 'neutral' && randomFactor < 0.1 * aggressiveness) {
      // Decide direction based on technical indicators
      let shouldLong = false;
      let shouldShort = false;
      
      // Trend following
      if (sma20 > sma50 && rsi < 70) {
        shouldLong = true;
      } else if (sma20 < sma50 && rsi > 30) {
        shouldShort = true;
      }
      
      // Mean reversion for some agents
      if (agent.name === 'Claude' || agent.name === 'HOS v3') {
        if (rsi > 70) shouldShort = true;
        if (rsi < 30) shouldLong = true;
      }
      
      if (shouldLong || shouldShort) {
        // Calculate position size (risk 10-30% of balance)
        const riskPercent = 0.1 + (aggressiveness * 0.2);
        const dollarRisk = agent.balance * riskPercent;
        const positionSize = dollarRisk / currentPrice;
        
        return {
          agentId: agent.id,
          type: shouldLong ? 'long' : 'short',
          price: currentPrice,
          size: positionSize,
          timestamp: Date.now()
        };
      }
    }
    
    return null;
  }

  private getAggressiveness(agentName: string): number {
    const profiles: Record<string, number> = {
      'Deepseek': 0.8,
      'Grok 4': 1.2,
      'HOS v3': 0.6,
      'Claude': 0.5,
      'QWEN3': 0.9,
      'GPT5': 0.7
    };
    return profiles[agentName] || 0.7;
  }

  private calculateSMA(data: MarketData[], period: number): number {
    if (data.length < period) return data[data.length - 1]?.price || this.basePrice;
    
    const slice = data.slice(-period);
    const sum = slice.reduce((acc, d) => acc + d.price, 0);
    return sum / period;
  }

  private calculateRSI(data: MarketData[], period: number): number {
    if (data.length < period + 1) return 50;
    
    const changes = [];
    for (let i = data.length - period; i < data.length; i++) {
      changes.push(data[i].price - data[i - 1].price);
    }
    
    const gains = changes.filter(c => c > 0).reduce((a, b) => a + b, 0) / period;
    const losses = Math.abs(changes.filter(c => c < 0).reduce((a, b) => a + b, 0)) / period;
    
    if (losses === 0) return 100;
    const rs = gains / losses;
    return 100 - (100 / (1 + rs));
  }

  getCurrentPrice(): number {
    return this.lastPrice;
  }

  getPriceHistory(): MarketData[] {
    return this.priceHistory;
  }

  setPriceHistory(prices: number[]): void {
    // Restore price history from persisted data
    this.priceHistory = prices.map((price, index) => ({
      price,
      timestamp: Date.now() - (prices.length - index) * 1000, // Reconstruct timestamps
      volume: Math.random() * 1000 + 500,
      volatility: this.volatility
    }));
    
    // Set last price to the most recent price
    if (prices.length > 0) {
      this.lastPrice = prices[prices.length - 1];
    }
  }

  reset(): void {
    this.lastPrice = this.basePrice;
    this.priceHistory = [];
  }
}
