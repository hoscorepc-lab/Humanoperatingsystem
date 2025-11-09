// Financial Data API Integration
// Using Financial Datasets API

const FINANCIAL_API_KEY = '62536e39-5ec5-4ee4-9e20-6baeb51e9a48';
const BASE_URL = 'https://financialdatasets.ai/api/v1';

// Alternative free APIs for additional data
const ALPHA_VANTAGE_KEY = 'demo'; // Users should replace with their own key
const FINNHUB_KEY = 'demo'; // Users should replace with their own key

import type { Stock, HistoricalData, MarketNews } from '../../types/financial';

// Get stock quote
export async function getStockQuote(symbol: string): Promise<Stock | null> {
  // Use mock data with realistic prices for demo
  // Note: Financial Datasets API may require subscription or different endpoints
  // Users can integrate Alpha Vantage, Finnhub, or other APIs as needed
  return getMockStockQuote(symbol);
  
  /* Uncomment to try real API
  try {
    // Try Financial Datasets API first
    const response = await fetch(`${BASE_URL}/stock/${symbol}/quote`, {
      headers: {
        'X-API-KEY': FINANCIAL_API_KEY,
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (response.ok) {
      const data = await response.json();
      return {
        symbol: symbol.toUpperCase(),
        name: data.name || symbol,
        price: data.price || data.last || 0,
        change: data.change || 0,
        changePercent: data.changePercent || data.changesPercentage || 0,
        volume: data.volume || 0,
        marketCap: data.marketCap || 0,
        pe: data.pe,
        eps: data.eps,
      };
    }

    // Fallback to mock data for demo
    return getMockStockQuote(symbol);
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    return getMockStockQuote(symbol);
  }
  */
}

// Get historical data
export async function getHistoricalData(
  symbol: string,
  period: '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y' = '1M'
): Promise<HistoricalData[]> {
  // Use mock data with realistic trends
  return getMockHistoricalData(symbol, period);
  
  /* Uncomment to try real API
  try {
    const response = await fetch(`${BASE_URL}/stock/${symbol}/historical?period=${period}`, {
      headers: {
        'X-API-KEY': FINANCIAL_API_KEY,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      return data.historical || [];
    }

    return getMockHistoricalData(symbol, period);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return getMockHistoricalData(symbol, period);
  }
  */
}

// Get market news
export async function getMarketNews(symbol?: string, limit: number = 10): Promise<MarketNews[]> {
  // Use mock news for demo
  return getMockNews(symbol);
  
  /* Uncomment to try real API
  try {
    const url = symbol
      ? `${BASE_URL}/news/${symbol}?limit=${limit}`
      : `${BASE_URL}/news/market?limit=${limit}`;

    const response = await fetch(url, {
      headers: {
        'X-API-KEY': FINANCIAL_API_KEY,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      return data.news || [];
    }

    return getMockNews(symbol);
  } catch (error) {
    console.error('Error fetching news:', error);
    return getMockNews(symbol);
  }
  */
}

// Search stocks
export async function searchStocks(query: string): Promise<Stock[]> {
  // Use mock search for demo
  return getMockSearchResults(query);
  
  /* Uncomment to try real API
  try {
    const response = await fetch(`${BASE_URL}/search?query=${encodeURIComponent(query)}`, {
      headers: {
        'X-API-KEY': FINANCIAL_API_KEY,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      return data.results || [];
    }

    return getMockSearchResults(query);
  } catch (error) {
    console.error('Error searching stocks:', error);
    return getMockSearchResults(query);
  }
  */
}

// Get multiple quotes
export async function getMultipleQuotes(symbols: string[]): Promise<Stock[]> {
  try {
    const promises = symbols.map((symbol) => getStockQuote(symbol));
    const results = await Promise.all(promises);
    return results.filter((stock): stock is Stock => stock !== null);
  } catch (error) {
    console.error('Error fetching multiple quotes:', error);
    return [];
  }
}

// Get market overview
export async function getMarketOverview() {
  // Use mock data for now - Financial Datasets API may require different endpoints
  // Users can integrate their own financial data API if needed
  return getMockMarketOverview();
  
  /* Uncomment to try real API
  try {
    const response = await fetch(`${BASE_URL}/market/overview`, {
      headers: {
        'X-API-KEY': FINANCIAL_API_KEY,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }

    return getMockMarketOverview();
  } catch (error) {
    console.error('Error fetching market overview:', error);
    return getMockMarketOverview();
  }
  */
}

// Mock data functions for demo/fallback

// Store stock data for consistency across sessions
const stockDataCache = new Map<string, { data: Stock; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute

function getMockStockQuote(symbol: string): Stock {
  const upperSymbol = symbol.toUpperCase();
  
  // Check cache first
  const cached = stockDataCache.get(upperSymbol);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  // Generate realistic data based on symbol
  const basePrice = getRealisticPrice(upperSymbol);
  const change = (Math.random() - 0.5) * (basePrice * 0.05); // 5% max change
  
  const stockData: Stock = {
    symbol: upperSymbol,
    name: getCompanyName(upperSymbol),
    price: basePrice,
    change: change,
    changePercent: (change / basePrice) * 100,
    volume: Math.floor(Math.random() * 50000000) + 5000000,
    marketCap: getRealisticMarketCap(upperSymbol),
    pe: Math.random() * 40 + 10,
    eps: Math.random() * 15 + 2,
  };
  
  // Cache the data
  stockDataCache.set(upperSymbol, { data: stockData, timestamp: Date.now() });
  
  return stockData;
}

function getRealisticPrice(symbol: string): number {
  const prices: Record<string, number> = {
    AAPL: 175 + (Math.random() - 0.5) * 10,
    GOOGL: 140 + (Math.random() - 0.5) * 8,
    MSFT: 380 + (Math.random() - 0.5) * 15,
    AMZN: 145 + (Math.random() - 0.5) * 10,
    TSLA: 245 + (Math.random() - 0.5) * 20,
    META: 350 + (Math.random() - 0.5) * 18,
    NVDA: 480 + (Math.random() - 0.5) * 25,
    AMD: 135 + (Math.random() - 0.5) * 10,
    NFLX: 440 + (Math.random() - 0.5) * 20,
    DIS: 95 + (Math.random() - 0.5) * 8,
  };
  return prices[symbol] || (Math.random() * 300 + 50);
}

function getRealisticMarketCap(symbol: string): number {
  const marketCaps: Record<string, number> = {
    AAPL: 2700000000000,
    GOOGL: 1700000000000,
    MSFT: 2800000000000,
    AMZN: 1500000000000,
    TSLA: 770000000000,
    META: 900000000000,
    NVDA: 1200000000000,
    AMD: 220000000000,
    NFLX: 190000000000,
    DIS: 175000000000,
  };
  return marketCaps[symbol] || (Math.random() * 500000000000 + 50000000000);
}

function getMockHistoricalData(symbol: string, period: string): HistoricalData[] {
  const days = period === '1D' ? 1 : period === '1W' ? 7 : period === '1M' ? 30 : period === '3M' ? 90 : period === '1Y' ? 365 : 1825;
  const data: HistoricalData[] = [];
  
  // Get current price from the stock quote
  const currentStock = getMockStockQuote(symbol);
  let price = currentStock.price;
  
  // Start from a lower base price and trend up to current
  const startPrice = price * (0.85 + Math.random() * 0.1); // 85-95% of current price
  price = startPrice;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Gradual trend towards current price
    const targetPrice = i === 0 ? currentStock.price : startPrice + ((currentStock.price - startPrice) * (1 - i / days));
    const dailyChange = (targetPrice - price) / (i + 1) + (Math.random() - 0.5) * (price * 0.02);
    price += dailyChange;
    
    const open = price;
    const high = price + Math.random() * (price * 0.015);
    const low = price - Math.random() * (price * 0.015);
    const close = price + (Math.random() - 0.5) * (price * 0.01);
    
    data.push({
      date: date.toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 10000000) + 1000000,
    });
    
    price = close;
  }

  return data;
}

function getMockNews(symbol?: string): MarketNews[] {
  const sources = ['Bloomberg', 'Reuters', 'CNBC', 'WSJ', 'Financial Times'];
  
  const newsTemplates = symbol ? [
    {
      title: `${symbol} reports strong quarterly earnings, beats analyst expectations`,
      summary: `${getCompanyName(symbol)} exceeded revenue forecasts with strong performance across key business segments. Analysts raise price targets following the results.`,
      sentiment: 'positive' as const,
    },
    {
      title: `Analysts upgrade ${symbol} following product launch announcement`,
      summary: `Major Wall Street firms have upgraded their ratings on ${symbol} stock, citing innovative product launches and expanding market share.`,
      sentiment: 'positive' as const,
    },
    {
      title: `${symbol} faces regulatory scrutiny in key markets`,
      summary: `Regulatory authorities are examining certain business practices of ${getCompanyName(symbol)}, which could impact future operations and profitability.`,
      sentiment: 'negative' as const,
    },
    {
      title: `${symbol} stock outlook: What investors need to know`,
      summary: `Technical and fundamental analysis suggests mixed signals for ${symbol}. Here's what market experts are saying about the stock's near-term prospects.`,
      sentiment: 'neutral' as const,
    },
    {
      title: `${symbol} announces major strategic partnership`,
      summary: `${getCompanyName(symbol)} has entered into a significant partnership that could accelerate growth and expand its competitive advantages in the market.`,
      sentiment: 'positive' as const,
    },
  ] : [
    {
      title: 'Market rally continues as tech stocks lead gains',
      summary: 'Major indices reached new highs today as technology stocks rallied on optimism about AI advancements and strong corporate earnings.',
      sentiment: 'positive' as const,
    },
    {
      title: 'Fed signals potential rate adjustments amid economic data',
      summary: 'Federal Reserve officials indicated they are closely monitoring economic indicators and may adjust monetary policy accordingly in coming months.',
      sentiment: 'neutral' as const,
    },
    {
      title: 'Global markets react to geopolitical tensions',
      summary: 'International markets showed volatility today as investors assessed the potential economic impact of ongoing geopolitical developments.',
      sentiment: 'negative' as const,
    },
    {
      title: 'Earnings season exceeds expectations across sectors',
      summary: 'Corporate earnings reports have been largely positive this quarter, with many companies beating analyst estimates and raising guidance.',
      sentiment: 'positive' as const,
    },
    {
      title: 'Analysts debate market valuations amid mixed signals',
      summary: 'Market strategists are divided on current equity valuations, with some seeing opportunities while others urge caution given economic uncertainties.',
      sentiment: 'neutral' as const,
    },
  ];

  return newsTemplates.map((template, i) => ({
    ...template,
    url: '#',
    source: sources[i % sources.length],
    publishedAt: new Date(Date.now() - (i * 3600000 + Math.random() * 3600000)).toISOString(),
  }));
}

function getMockSearchResults(query: string): Stock[] {
  const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD'];
  return symbols
    .filter(s => s.includes(query.toUpperCase()) || getCompanyName(s).toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)
    .map(symbol => getMockStockQuote(symbol));
}

function getMockMarketOverview() {
  // Get consistent stock data
  const gainers = ['NVDA', 'AMD', 'TSLA'].map(s => {
    const stock = getMockStockQuote(s);
    return { ...stock, changePercent: Math.abs(stock.changePercent) + 1 }; // Force positive
  });
  
  const losers = ['AAPL', 'META', 'NFLX'].map(s => {
    const stock = getMockStockQuote(s);
    return { ...stock, changePercent: -Math.abs(stock.changePercent) - 0.5 }; // Force negative
  });
  
  const active = ['TSLA', 'AAPL', 'AMZN'].map(s => {
    const stock = getMockStockQuote(s);
    return { ...stock, volume: stock.volume * 2 }; // Higher volume
  });
  
  return {
    indices: [
      { name: 'S&P 500', value: 4565.32, change: 12.45, changePercent: 0.27 },
      { name: 'Dow Jones', value: 35672.89, change: -43.12, changePercent: -0.12 },
      { name: 'NASDAQ', value: 14234.56, change: 87.34, changePercent: 0.62 },
    ],
    topGainers: gainers,
    topLosers: losers,
    mostActive: active,
  };
}

function getCompanyName(symbol: string): string {
  const names: Record<string, string> = {
    AAPL: 'Apple Inc.',
    GOOGL: 'Alphabet Inc.',
    MSFT: 'Microsoft Corporation',
    AMZN: 'Amazon.com Inc.',
    TSLA: 'Tesla Inc.',
    META: 'Meta Platforms Inc.',
    NVDA: 'NVIDIA Corporation',
    AMD: 'Advanced Micro Devices',
    NFLX: 'Netflix Inc.',
    DIS: 'The Walt Disney Company',
  };
  return names[symbol.toUpperCase()] || `${symbol} Inc.`;
}
