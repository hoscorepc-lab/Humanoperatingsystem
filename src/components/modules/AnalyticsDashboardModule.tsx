/**
 * Analytics Dashboard Module
 * Tracks and displays user activity, module usage, and system performance
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { 
  BarChart3, 
  Activity, 
  Clock, 
  TrendingUp, 
  Users, 
  Zap,
  Calendar,
  Eye,
  MousePointerClick,
  RefreshCw,
  Download
} from 'lucide-react';
import { getUserActivitySummary, getCurrentSession, clearAnalyticsData } from '../../lib/analytics/service';
import { UserActivitySummary, SessionStats, ModuleUsageStats } from '../../types/analytics';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner@2.0.3';
import { subscribeToAnalytics } from '../../lib/realtime/service';

interface AnalyticsDashboardModuleProps {
  userId?: string;
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export function AnalyticsDashboardModule({ userId = 'demo-user' }: AnalyticsDashboardModuleProps) {
  const [summary, setSummary] = useState<UserActivitySummary | null>(null);
  const [currentSession, setCurrentSession] = useState<SessionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [realtimeCount, setRealtimeCount] = useState(0);

  // Load analytics data
  const loadData = () => {
    setIsLoading(true);
    try {
      const activitySummary = getUserActivitySummary(userId);
      const session = getCurrentSession();
      setSummary(activitySummary);
      setCurrentSession(session);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to real-time analytics updates
    const unsubscribe = subscribeToAnalytics((update) => {
      console.log('📊 Real-time analytics update received:', update);
      setRealtimeCount(prev => prev + 1);
      loadData(); // Refresh data
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  // Format time duration
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  // Format date
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Handle data export
  const handleExport = () => {
    if (!summary) return;
    
    const data = JSON.stringify(summary, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hos-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Analytics data exported');
  };

  // Handle data clear
  const handleClear = () => {
    if (confirm('Are you sure you want to clear all analytics data? This cannot be undone.')) {
      clearAnalyticsData();
      loadData();
      toast.success('Analytics data cleared');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="mb-2">No Analytics Data</h3>
          <p className="text-muted-foreground mb-4">
            Start using HOS modules to see your activity analytics
          </p>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data - generate sample data if no real data exists
  let dailyChartData = summary.dailyActivity.slice(0, 14).reverse().map(day => ({
    date: formatDate(day.date),
    sessions: day.sessionsCount,
    time: Math.round(day.timeSpent / 60), // Convert to minutes
    modules: day.modulesUsed,
  }));

  // Check if we're showing sample data
  const showingSampleData = dailyChartData.length === 0;

  // If no data, generate sample data for demonstration
  if (showingSampleData) {
    const today = new Date();
    dailyChartData = Array.from({ length: 14 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (13 - i));
      return {
        date: formatDate(date.toISOString()),
        sessions: Math.floor(Math.random() * 5) + 1,
        time: Math.floor(Math.random() * 60) + 10,
        modules: Math.floor(Math.random() * 8) + 2,
      };
    });
  }

  let moduleChartData = summary.favoriteModules.map(mod => ({
    name: mod.moduleName.split(' ').slice(0, 2).join(' '),
    views: mod.viewCount,
    time: Math.round(mod.totalTimeSpent / 60),
  }));

  // If no data, generate sample data
  if (moduleChartData.length === 0) {
    moduleChartData = [
      { name: 'HOS Chat', views: 15, time: 45 },
      { name: 'Dashboard', views: 12, time: 30 },
      { name: 'Agent Forge', views: 8, time: 25 },
      { name: 'Analytics', views: 5, time: 15 },
      { name: 'Timeline', views: 4, time: 10 },
    ];
  }

  let categoryData = summary.moduleUsage.reduce((acc, mod) => {
    const existing = acc.find(c => c.name === mod.category);
    if (existing) {
      existing.value += mod.viewCount;
    } else {
      acc.push({ name: mod.category, value: mod.viewCount });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // If no data, generate sample data
  if (categoryData.length === 0) {
    categoryData = [
      { name: 'Core', value: 25 },
      { name: 'Human', value: 18 },
      { name: 'Research', value: 12 },
    ];
  }

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 h-0">
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-blue-500 flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2>Analytics Dashboard</h2>
              <p className="text-muted-foreground">
                Track your HOS usage and activity patterns
              </p>
            </div>
          </div>
          
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Sample data indicator */}
      {showingSampleData && (
        <Card className="border-blue-500/50 bg-blue-500/5">
          <CardContent className="p-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <span className="text-sm">Displaying sample data for demonstration. Start using HOS modules to see your real analytics.</span>
          </CardContent>
        </Card>
      )}

      {/* Real-time indicator */}
      {realtimeCount > 0 && (
        <Card className="border-green-500/50 bg-green-500/5">
          <CardContent className="p-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm">Real-time updates active • {realtimeCount} updates received</span>
          </CardContent>
        </Card>
      )}

      {/* Current Session */}
      {currentSession && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-primary" />
              <h3>Current Session</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Started</p>
                <p className="text-lg">{new Date(currentSession.startTime).toLocaleTimeString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Modules Visited</p>
                <p className="text-lg">{currentSession.modulesVisited.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Events</p>
                <p className="text-lg">{currentSession.eventsCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Device</p>
                <p className="text-lg capitalize">{currentSession.deviceType}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm text-muted-foreground">Total Sessions</h3>
            </div>
            <p className="text-3xl">{summary.totalSessions}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-green-500" />
              <h3 className="text-sm text-muted-foreground">Time Spent</h3>
            </div>
            <p className="text-3xl">{formatDuration(summary.totalTimeSpent)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-purple-500" />
              <h3 className="text-sm text-muted-foreground">Modules Used</h3>
            </div>
            <p className="text-3xl">{summary.moduleUsage.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <h3 className="text-sm text-muted-foreground">Avg Daily</h3>
            </div>
            <p className="text-3xl">
              {summary.dailyActivity.length > 0 
                ? Math.round(summary.totalSessions / summary.dailyActivity.length)
                : 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Activity (Last 14 Days)</CardTitle>
              <CardDescription>Sessions, time spent, and modules used per day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="sessions" stroke="#3b82f6" strokeWidth={2} name="Sessions" />
                  <Line type="monotone" dataKey="time" stroke="#10b981" strokeWidth={2} name="Time (min)" />
                  <Line type="monotone" dataKey="modules" stroke="#8b5cf6" strokeWidth={2} name="Modules" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Module Usage by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-3">
                    {summary.dailyActivity.slice(0, 7).map((day, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(day.date)}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <Badge variant="secondary">{day.sessionsCount} sessions</Badge>
                          <Badge variant="secondary">{formatDuration(day.timeSpent)}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Modules by Usage</CardTitle>
              <CardDescription>Most frequently used modules</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={moduleChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="views" fill="#8b5cf6" name="Views" />
                  <Bar dataKey="time" fill="#3b82f6" name="Time (min)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Modules</CardTitle>
              <CardDescription>Complete module usage statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {summary.moduleUsage.map((mod, i) => (
                    <div key={i} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="flex items-center gap-2">
                            {mod.moduleName}
                            <Badge variant="outline" className="capitalize">{mod.category}</Badge>
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Last accessed: {new Date(mod.lastAccessed).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-3">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{mod.viewCount} views</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MousePointerClick className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{mod.interactions} clicks</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{formatDuration(mod.totalTimeSpent)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>Your last 10 HOS sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {summary.recentSessions.map((session, i) => (
                    <div key={i} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="flex items-center gap-2">
                            Session {summary.recentSessions.length - i}
                            <Badge variant="secondary" className="capitalize">{session.deviceType}</Badge>
                            {session.browser && <Badge variant="outline">{session.browser}</Badge>}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(session.startTime).toLocaleString()}
                          </p>
                        </div>
                        {session.duration && (
                          <Badge variant="default">{formatDuration(session.duration)}</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Modules Visited</p>
                          <p>{session.modulesVisited.length}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Events</p>
                          <p>{session.eventsCount}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Data Management */}
      <Card className="border-red-500/20">
        <CardHeader>
          <CardTitle className="text-red-500">Data Management</CardTitle>
          <CardDescription>Manage your analytics data</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" size="sm" onClick={handleClear}>
            Clear All Analytics Data
          </Button>
        </CardContent>
      </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
