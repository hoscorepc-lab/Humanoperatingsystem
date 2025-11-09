import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import {
  TrendingUp,
  TrendingDown,
  Search,
  LineChart,
  BarChart3,
  FileText,
  Briefcase,
  AlertCircle,
  Star,
  Plus,
  RefreshCw,
  Download,
  Sparkles,
  DollarSign,
  Activity,
  X,
  TrendingDown as Minus,
  Pin,
  PinOff,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { getStockQuote, getHistoricalData, getMarketNews, searchStocks, getMarketOverview, getMultipleQuotes } from '../../lib/financial/api';
import { analyzeStock, generateResearchReport } from '../../lib/financial/analysis';
import type { Stock, HistoricalData, MarketNews, FinancialAnalysis, WatchlistItem } from '../../types/financial';

export function HOSFinancialResearchModule() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [news, setNews] = useState<MarketNews[]>([]);
  const [analysis, setAnalysis] = useState<FinancialAnalysis | null>(null);
  const [report, setReport] = useState<string>('');
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([
    { symbol: 'AAPL', name: 'Apple Inc.', addedAt: Date.now() },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', addedAt: Date.now() },
    { symbol: 'MSFT', name: 'Microsoft Corp.', addedAt: Date.now() },
    { symbol: 'TSLA', name: 'Tesla, Inc.', addedAt: Date.now() },
  ]);
  const [watchlistStocks, setWatchlistStocks] = useState<Stock[]>([]);
  const [marketOverview, setMarketOverview] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [period, setPeriod] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | '5Y'>('1M');
  const [addStockDialogOpen, setAddStockDialogOpen] = useState(false);
  const [newStockSymbol, setNewStockSymbol] = useState('');
  const [pinnedStocks, setPinnedStocks] = useState<string[]>([]);

  useEffect(() => {
    loadMarketOverview();
    loadWatchlistPrices();
    loadPinnedStocks();
  }, []);

  const loadPinnedStocks = () => {
    try {
      const saved = localStorage.getItem('hos-pinned-stocks');
      if (saved) {
        setPinnedStocks(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading pinned stocks:', error);
    }
  };

  const togglePinStock = (symbol: string) => {
    setPinnedStocks(prev => {
      let updated: string[];
      if (prev.includes(symbol)) {
        // Unpin
        updated = prev.filter(s => s !== symbol);
        toast.success(`${symbol} removed from dashboard`);
      } else {
        // Pin - check limit
        if (prev.length >= 6) {
          toast.error('Maximum 6 stocks can be pinned to dashboard');
          return prev;
        }
        updated = [...prev, symbol];
        toast.success(`${symbol} pinned to dashboard`);
      }
      localStorage.setItem('hos-pinned-stocks', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    loadWatchlistPrices();
  }, [watchlist]);

  const loadMarketOverview = async () => {
    try {
      const data = await getMarketOverview();
      setMarketOverview(data);
    } catch (error) {
      console.error('Error loading market overview:', error);
    }
  };

  const loadWatchlistPrices = async () => {
    try {
      const symbols = watchlist.map(item => item.symbol);
      const stocks = await getMultipleQuotes(symbols);
      setWatchlistStocks(stocks);
    } catch (error) {
      console.error('Error loading watchlist prices:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a stock symbol');
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchStocks(searchQuery);
      
      if (results.length === 0) {
        toast.error('No stocks found');
        setSearchResults([]);
      } else if (results.length === 1) {
        await selectStock(results[0].symbol);
      } else {
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const selectStock = async (symbol: string) => {
    setIsLoading(true);
    setSearchResults([]);
    
    try {
      const [stock, historical, stockNews] = await Promise.all([
        getStockQuote(symbol),
        getHistoricalData(symbol, period),
        getMarketNews(symbol)
      ]);

      setSelectedStock(stock);
      setHistoricalData(historical);
      setNews(stockNews);
      setActiveTab('analysis');
      toast.success(`Loaded ${stock.name}`);
    } catch (error) {
      console.error('Error loading stock:', error);
      toast.error('Failed to load stock data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedStock) {
      toast.error('Please select a stock first');
      return;
    }

    setIsAnalyzing(true);
    try {
      const [stockAnalysis, aiReport] = await Promise.all([
        analyzeStock(selectedStock, historicalData),
        generateResearchReport(selectedStock, historicalData, news)
      ]);

      setAnalysis(stockAnalysis);
      setReport(aiReport);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addToWatchlist = async () => {
    if (!newStockSymbol.trim()) {
      toast.error('Please enter a stock symbol');
      return;
    }

    if (watchlist.length >= 20) {
      toast.error('Watchlist limit reached (20 stocks maximum)');
      return;
    }

    const upperSymbol = newStockSymbol.toUpperCase();
    const exists = watchlist.some(item => item.symbol === upperSymbol);
    if (exists) {
      toast.error('Stock already in watchlist');
      return;
    }

    // Get stock data to verify and get the name
    try {
      const stock = await getStockQuote(upperSymbol);
      if (stock) {
        setWatchlist([...watchlist, {
          symbol: stock.symbol,
          name: stock.name,
          addedAt: Date.now()
        }]);
        setNewStockSymbol('');
        setAddStockDialogOpen(false);
        toast.success('Added to watchlist');
      } else {
        toast.error('Stock not found');
      }
    } catch (error) {
      toast.error('Failed to add stock');
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter(item => item.symbol !== symbol));
    toast.success('Removed from watchlist');
  };

  return (
    <div className="h-full flex flex-col">
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
            <Briefcase className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Financial Research</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            AI-powered financial analysis, market research, and stock insights
          </p>
        </motion.div>

        {/* Market Overview Stats */}
        {marketOverview && marketOverview.indices && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {marketOverview.indices.slice(0, 4).map((index: any, idx: number) => (
              <Card key={idx} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      {index.change >= 0 ? (
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <Badge variant="secondary" className={`text-xs ${index.change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {index.change >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                    </Badge>
                  </div>
                  <p className="text-2xl font-semibold mb-1">{index.value.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">{index.name}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/30 border-2 border-transparent focus-within:border-primary/30 transition-colors">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search stocks (e.g., AAPL, TSLA, GOOGL)..."
                    className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <Button onClick={handleSearch} disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                  Search
                </Button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-muted-foreground">Search Results:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {searchResults.map((stock) => (
                      <button
                        key={stock.symbol}
                        onClick={() => selectStock(stock.symbol)}
                        className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                      >
                        <div className="font-medium">{stock.symbol}</div>
                        <div className="text-xs text-muted-foreground">{stock.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <Card className="border-2">
              <CardContent className="p-4">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2">
                  <TabsTrigger value="dashboard" className="text-xs sm:text-sm">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Dashboard</span>
                    <span className="sm:hidden">Home</span>
                  </TabsTrigger>
                  <TabsTrigger value="analysis" className="text-xs sm:text-sm">
                    <LineChart className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Analysis</span>
                    <span className="sm:hidden">Chart</span>
                  </TabsTrigger>
                  <TabsTrigger value="news" className="text-xs sm:text-sm">
                    <FileText className="w-4 h-4 mr-2" />
                    News
                  </TabsTrigger>
                  <TabsTrigger value="watchlist" className="text-xs sm:text-sm">
                    <Star className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Watchlist</span>
                    <span className="sm:hidden">Watch</span>
                  </TabsTrigger>
                </TabsList>
              </CardContent>
            </Card>

            <TabsContent value="dashboard" className="space-y-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Market Dashboard
                  </CardTitle>
                  <CardDescription>
                    Overview of market performance and trending stocks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pinnedStocks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pinnedStocks.map((symbol) => {
                        const stock = watchlistStocks.find(s => s.symbol === symbol);
                        return stock ? (
                          <Card key={symbol} className="border-2 hover:shadow-md transition-all">
                            <CardContent className="p-4">
                              <div className="mb-3">
                                <h3 className="font-semibold">{stock.symbol}</h3>
                                <p className="text-xs text-muted-foreground truncate">{stock.name}</p>
                              </div>

                              <div className="flex items-baseline justify-between mb-2">
                                <p className="text-2xl font-bold">${stock.price.toFixed(2)}</p>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {stock.change >= 0 ? (
                                  <TrendingUp className="w-4 h-4 text-green-600" />
                                ) : (
                                  <TrendingDown className="w-4 h-4 text-red-600" />
                                )}
                                <span className={`text-sm font-medium ${
                                  stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ) : (
                          <Card key={symbol} className="border-2">
                            <CardContent className="p-4 flex items-center justify-center py-8">
                              <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Pin stocks from your watchlist to see them here</p>
                      <p className="text-xs mt-2">Go to the Watchlist tab and click the pin icon on any stock</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              {selectedStock ? (
                <>
                  {/* Stock Header */}
                  <Card className="border-2">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h2 className="text-2xl font-semibold mb-1">{selectedStock.symbol}</h2>
                          <p className="text-sm text-muted-foreground">{selectedStock.name}</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-3xl font-bold">${selectedStock.price?.toFixed(2)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {selectedStock.change >= 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            )}
                            <span className={selectedStock.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {selectedStock.change >= 0 ? '+' : ''}{selectedStock.changePercent}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full sm:w-auto">
                          {isAnalyzing ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              AI Analysis
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Chart */}
                  {historicalData.length > 0 && (
                    <Card className="border-2">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Price Chart</CardTitle>
                          <div className="flex gap-1">
                            {(['1D', '1W', '1M', '3M', '1Y', '5Y'] as const).map((p) => (
                              <Button
                                key={p}
                                variant={period === p ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => {
                                  setPeriod(p);
                                  if (selectedStock) {
                                    getHistoricalData(selectedStock.symbol, p).then(setHistoricalData);
                                  }
                                }}
                                className="h-7 px-2 text-xs"
                              >
                                {p}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 sm:h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={historicalData}>
                              <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                              <XAxis 
                                dataKey="date" 
                                fontSize={12}
                                tickFormatter={(value) => {
                                  const date = new Date(value);
                                  return period === '1D' ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
                                         period === '1W' || period === '1M' ? `${date.getMonth() + 1}/${date.getDate()}` :
                                         `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().slice(-2)}`;
                                }}
                              />
                              <YAxis 
                                fontSize={12}
                                tickFormatter={(value) => `${value.toFixed(0)}`}
                                domain={['auto', 'auto']}
                              />
                              <Tooltip 
                                formatter={(value: any) => [`${Number(value).toFixed(2)}`, 'Price']}
                                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="close" 
                                stroke="#3b82f6" 
                                fillOpacity={1} 
                                fill="url(#colorPrice)"
                                strokeWidth={2}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Analysis Results */}
                  {analysis && (
                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle className="text-base">AI Analysis</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg bg-muted/30">
                            <p className="text-sm text-muted-foreground mb-1">Recommendation</p>
                            <Badge className={
                              analysis.recommendation?.toUpperCase() === 'BUY' ? 'bg-green-100 text-green-700 border-green-200' :
                              analysis.recommendation?.toUpperCase() === 'SELL' ? 'bg-red-100 text-red-700 border-red-200' :
                              'bg-amber-100 text-amber-700 border-amber-200'
                            }>
                              {analysis.recommendation?.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/30">
                            <p className="text-sm text-muted-foreground mb-1">Target Price</p>
                            <p className="text-lg font-semibold">
                              {analysis.targetPrice ? `${analysis.targetPrice.toFixed(2)}` : 'N/A'}
                            </p>
                          </div>
                        </div>
                        {report && (
                          <div className="p-4 rounded-lg bg-muted/30">
                            <p className="text-sm whitespace-pre-wrap">{report}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card className="border-2">
                  <CardContent className="p-12 text-center text-muted-foreground">
                    <LineChart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Search for a stock to view analysis</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="news" className="space-y-4">
              {news.length > 0 ? (
                <div className="space-y-3">
                  {news.map((article, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="border-2 hover:shadow-md transition-all">
                        <CardContent className="p-4">
                          <h3 className="font-medium mb-2">{article.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{article.summary}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">{article.source}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(article.publishedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="border-2">
                  <CardContent className="p-12 text-center text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Select a stock to view related news</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="watchlist" className="space-y-4">
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">My Watchlist</CardTitle>
                      <CardDescription>
                        {watchlist.length}/20 stocks • {pinnedStocks.length}/6 pinned to dashboard
                      </CardDescription>
                    </div>
                    <Dialog open={addStockDialogOpen} onOpenChange={setAddStockDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" disabled={watchlist.length >= 20}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add to Watchlist</DialogTitle>
                          <DialogDescription>
                            Enter a stock symbol to add to your watchlist ({watchlist.length}/20)
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            value={newStockSymbol}
                            onChange={(e) => setNewStockSymbol(e.target.value.toUpperCase())}
                            placeholder="Stock symbol (e.g., AAPL)"
                            onKeyDown={(e) => e.key === 'Enter' && addToWatchlist()}
                          />
                          <Button onClick={addToWatchlist} className="w-full">
                            Add to Watchlist
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {watchlist.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Your watchlist is empty</p>
                      <p className="text-xs mt-2">Add stocks to track their prices</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <AnimatePresence mode="popLayout">
                        {watchlist.map((item) => {
                          const stock = watchlistStocks.find(s => s.symbol === item.symbol);
                          return (
                            <motion.div
                              key={item.symbol}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              whileHover={{ scale: 1.02 }}
                            >
                              <Card className="border-2 hover:shadow-md transition-all cursor-pointer group relative">
                                <CardContent 
                                  className="p-4"
                                  onClick={() => selectStock(item.symbol)}
                                >
                                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        togglePinStock(item.symbol);
                                      }}
                                      className={`h-6 w-6 p-0 ${pinnedStocks.includes(item.symbol) ? 'text-blue-600' : ''}`}
                                      title={pinnedStocks.includes(item.symbol) ? 'Unpin from dashboard' : 'Pin to dashboard'}
                                    >
                                      {pinnedStocks.includes(item.symbol) ? (
                                        <Pin className="w-3 h-3 fill-current" />
                                      ) : (
                                        <PinOff className="w-3 h-3" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeFromWatchlist(item.symbol);
                                      }}
                                      className="h-6 w-6 p-0"
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                  
                                  <div className="mb-3">
                                    <div className="flex items-start justify-between mb-1">
                                      <div>
                                        <h3 className="font-semibold">{item.symbol}</h3>
                                        <p className="text-xs text-muted-foreground truncate">
                                          {item.name}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {stock ? (
                                    <>
                                      <div className="flex items-baseline justify-between mb-2">
                                        <p className="text-2xl font-bold">
                                          ${stock.price.toFixed(2)}
                                        </p>
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        {stock.change >= 0 ? (
                                          <TrendingUp className="w-4 h-4 text-green-600" />
                                        ) : (
                                          <TrendingDown className="w-4 h-4 text-red-600" />
                                        )}
                                        <span className={`text-sm font-medium ${
                                          stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                                        </span>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="flex items-center justify-center py-4">
                                      <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}