import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Bug, AlertCircle, CheckCircle, Lightbulb, Loader2, Sparkles, ScanSearch } from 'lucide-react';
import { analyzePattern, createHabitFromPattern, fixPattern } from '../../lib/humanmodules/ai-service';
import { toast } from 'sonner';

const detectedPatterns = [
  {
    id: '1',
    type: 'negative',
    severity: 'high',
    pattern: 'Procrastination Loop',
    name: 'Procrastination Loop',
    description: 'Detected recurring pattern: avoiding tasks until deadline pressure',
    occurrences: 12,
    frequency: 'Daily',
    lastSeen: '2 hours ago',
    impact: 'High stress, reduced quality of work',
    suggestion: 'Try the 2-minute rule: if a task takes less than 2 minutes, do it immediately'
  },
  {
    id: '2',
    type: 'positive',
    severity: 'medium',
    pattern: 'Morning Momentum',
    name: 'Morning Momentum',
    description: 'Strong productivity pattern: best work happens 8-11 AM',
    occurrences: 45,
    frequency: 'Daily',
    lastSeen: 'Today',
    impact: 'High quality output, creative breakthroughs',
    suggestion: 'Schedule most important tasks during this window'
  },
  {
    id: '3',
    type: 'negative',
    severity: 'medium',
    pattern: 'Social Media Trap',
    name: 'Social Media Trap',
    description: 'Attention fragmentation: checking social media during deep work',
    occurrences: 28,
    frequency: 'Multiple times per day',
    lastSeen: '15 minutes ago',
    impact: 'Reduced focus, extended task completion time',
    suggestion: 'Use website blockers during focused work sessions'
  },
  {
    id: '4',
    type: 'neutral',
    severity: 'low',
    pattern: 'Evening Energy Dip',
    name: 'Evening Energy Dip',
    description: 'Consistent low energy period: 3-5 PM daily',
    occurrences: 32,
    frequency: 'Daily',
    lastSeen: 'Yesterday',
    impact: 'Reduced productivity in afternoon',
    suggestion: 'Consider a brief walk or power nap during this window'
  }
];

const insights = [
  {
    category: 'Time Management',
    score: 68,
    findings: 3,
    trend: 'improving'
  },
  {
    category: 'Focus & Attention',
    score: 54,
    findings: 5,
    trend: 'declining'
  },
  {
    category: 'Habits & Routines',
    score: 72,
    findings: 2,
    trend: 'stable'
  },
  {
    category: 'Energy Patterns',
    score: 81,
    findings: 4,
    trend: 'improving'
  }
];

export function LifeDebuggerModule() {
  const [selectedPattern, setSelectedPattern] = useState<typeof detectedPatterns[0] | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [habitDialogOpen, setHabitDialogOpen] = useState(false);
  const [fixDialogOpen, setFixDialogOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'negative': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'positive': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Bug className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleViewDetails = async (pattern: typeof detectedPatterns[0]) => {
    setSelectedPattern(pattern);
    setDetailsDialogOpen(true);
    setIsAnalyzing(true);
    
    try {
      const response = await analyzePattern(pattern);
      setAiAnalysis(response.content);
      toast.success('Pattern analysis complete');
    } catch (error) {
      console.error('Error analyzing pattern:', error);
      toast.error('Failed to analyze pattern. Please check your OpenAI API key.');
      setAiAnalysis('Unable to generate AI analysis at this time. Please ensure your OpenAI API key is properly configured.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateHabit = async (pattern: typeof detectedPatterns[0]) => {
    setSelectedPattern(pattern);
    setHabitDialogOpen(true);
    setIsAnalyzing(true);
    
    try {
      const response = await createHabitFromPattern(pattern);
      setAiAnalysis(response.content);
      toast.success('Habit suggestion generated');
    } catch (error) {
      console.error('Error creating habit suggestion:', error);
      toast.error('Failed to generate habit. Please check your OpenAI API key.');
      setAiAnalysis('Unable to generate habit suggestion at this time. Please ensure your OpenAI API key is properly configured.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFixPattern = async (pattern: typeof detectedPatterns[0]) => {
    setSelectedPattern(pattern);
    setFixDialogOpen(true);
    setIsAnalyzing(true);
    
    try {
      const response = await fixPattern(pattern);
      setAiAnalysis(response.content);
      toast.success('Action plan generated');
    } catch (error) {
      console.error('Error creating fix plan:', error);
      toast.error('Failed to generate action plan. Please check your OpenAI API key.');
      setAiAnalysis('Unable to generate action plan at this time. Please ensure your OpenAI API key is properly configured.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 h-0">
        <div className="space-y-6 p-4 md:p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-cyan-500 flex items-center justify-center flex-shrink-0">
              <ScanSearch className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl">Pattern Analyzer</h2>
              <p className="text-sm md:text-base text-muted-foreground">
                Detects and debugs behavioral loops using AI-powered insights
              </p>
            </div>
          </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bug className="w-4 h-4" />
              Patterns Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{detectedPatterns.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-red-500">2</span> need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Analysis Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">7/10</div>
            <p className="text-xs text-muted-foreground mt-1">Overall progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Data Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">2,847</div>
            <p className="text-xs text-muted-foreground mt-1">Analyzed behaviors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">12</div>
            <p className="text-xs text-muted-foreground mt-1">Actionable insights</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Insights</CardTitle>
          <CardDescription>
            Deep analysis across different life areas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map(insight => (
              <div 
                key={insight.category}
                className="p-4 rounded-lg border border-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">{insight.category}</span>
                  <Badge variant={insight.trend === 'improving' ? 'default' : 'secondary'}>
                    {insight.trend}
                  </Badge>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl">{insight.score}%</span>
                  <span className="text-xs text-muted-foreground">
                    {insight.findings} findings
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detected Patterns</CardTitle>
          <CardDescription>
            Behavioral patterns identified through continuous monitoring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {detectedPatterns.map(pattern => (
            <div 
              key={pattern.id}
              className="p-3 md:p-4 rounded-lg border border-border hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row items-start gap-3">
                <div className="mt-1 flex-shrink-0">
                  {getTypeIcon(pattern.type)}
                </div>
                <div className="flex-1 space-y-2 w-full min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm md:text-base break-words">{pattern.pattern}</h4>
                      <p className="text-xs text-muted-foreground mt-1 break-words">
                        {pattern.description}
                      </p>
                    </div>
                    <Badge variant={getSeverityColor(pattern.severity)} className="self-start flex-shrink-0">
                      {pattern.severity}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Occurrences:</span>
                      <span className="ml-2">{pattern.occurrences}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last seen:</span>
                      <span className="ml-2">{pattern.lastSeen}</span>
                    </div>
                  </div>

                  <div className="text-xs">
                    <span className="text-muted-foreground">Impact: </span>
                    <span className="break-words">{pattern.impact}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="text-xs flex-1 min-w-0">
                        <span className="text-blue-700 dark:text-blue-300">Suggestion: </span>
                        <span className="text-foreground break-words">{pattern.suggestion}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1 sm:flex-initial"
                      onClick={() => handleViewDetails(pattern)}
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">Details</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1 sm:flex-initial"
                      onClick={() => handleCreateHabit(pattern)}
                    >
                      <span className="hidden sm:inline">Create Habit</span>
                      <span className="sm:hidden">Habit</span>
                    </Button>
                    {pattern.type === 'negative' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1 sm:flex-initial"
                        onClick={() => handleFixPattern(pattern)}
                      >
                        <span className="hidden sm:inline">Fix This</span>
                        <span className="sm:hidden">Fix</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Deep Analysis: {selectedPattern?.pattern}
            </DialogTitle>
            <DialogDescription>
              AI-powered root cause analysis and insights
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedPattern && (
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  {getTypeIcon(selectedPattern.type)}
                  <Badge variant={getSeverityColor(selectedPattern.severity)}>
                    {selectedPattern.severity} severity
                  </Badge>
                  <Badge variant="outline">{selectedPattern.occurrences} occurrences</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{selectedPattern.description}</p>
              </div>
            )}
            
            {isAnalyzing ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground">AI is analyzing this pattern...</p>
                </div>
              </div>
            ) : aiAnalysis ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 whitespace-pre-wrap">
                  {aiAnalysis}
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => {
              setDetailsDialogOpen(false);
              setAiAnalysis('');
            }}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Habit Dialog */}
      <Dialog open={habitDialogOpen} onOpenChange={setHabitDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Create Habit: {selectedPattern?.pattern}
            </DialogTitle>
            <DialogDescription>
              AI-generated habit to address this pattern
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedPattern && (
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-sm mb-2"><span className="font-medium">Pattern:</span> {selectedPattern.pattern}</p>
                <p className="text-sm text-muted-foreground">{selectedPattern.description}</p>
              </div>
            )}
            
            {isAnalyzing ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground">Designing habit...</p>
                </div>
              </div>
            ) : aiAnalysis ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/5 to-green-500/10 whitespace-pre-wrap">
                  {aiAnalysis}
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setHabitDialogOpen(false);
              setAiAnalysis('');
            }}>
              Close
            </Button>
            <Button onClick={() => {
              toast.success('Habit created! Check Habit Forge module');
              setHabitDialogOpen(false);
              setAiAnalysis('');
            }}>
              Add to Habit Forge
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fix Pattern Dialog */}
      <Dialog open={fixDialogOpen} onOpenChange={setFixDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Fix Plan: {selectedPattern?.pattern}
            </DialogTitle>
            <DialogDescription>
              Step-by-step action plan to break this pattern
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedPattern && (
              <div className="p-4 rounded-lg border border-orange-500/20 bg-orange-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="destructive">Needs fixing</Badge>
                  <Badge variant="outline">{selectedPattern.occurrences} times</Badge>
                </div>
                <p className="text-sm"><span className="font-medium">Impact:</span> {selectedPattern.impact}</p>
              </div>
            )}
            
            {isAnalyzing ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground">Creating action plan...</p>
                </div>
              </div>
            ) : aiAnalysis ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="p-4 rounded-lg bg-gradient-to-br from-orange-500/5 to-red-500/5 whitespace-pre-wrap">
                  {aiAnalysis}
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setFixDialogOpen(false);
              setAiAnalysis('');
            }}>
              Close
            </Button>
            <Button onClick={() => {
              toast.success('Action plan saved!');
              setFixDialogOpen(false);
              setAiAnalysis('');
            }}>
              Start Action Plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
        </div>
      </ScrollArea>
    </div>
  );
}