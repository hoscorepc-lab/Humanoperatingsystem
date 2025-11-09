import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { GitBranch, TrendingUp, TrendingDown, Minus, Loader2, Sparkles } from 'lucide-react';
import { analyzeLifePath, runDeepSimulation } from '../../lib/humanmodules/ai-service';
import { toast } from 'sonner@2.0.3';

const lifeScenarios = [
  {
    id: '1',
    name: 'Career Change to Tech',
    description: 'Transition from current role to software engineering',
    probability: 68,
    happiness: 85,
    stability: 62,
    growth: 92,
    trend: 'up'
  },
  {
    id: '2',
    name: 'Entrepreneurship Path',
    description: 'Start your own business venture',
    probability: 45,
    happiness: 78,
    stability: 48,
    growth: 95,
    trend: 'up'
  },
  {
    id: '3',
    name: 'Status Quo Optimization',
    description: 'Improve current situation incrementally',
    probability: 82,
    happiness: 65,
    stability: 88,
    growth: 58,
    trend: 'neutral'
  },
  {
    id: '4',
    name: 'Relocation Abroad',
    description: 'Move to a different country for new opportunities',
    probability: 38,
    happiness: 72,
    stability: 52,
    growth: 88,
    trend: 'up'
  }
];

export function ParallelSelvesModule() {
  const [selectedScenario, setSelectedScenario] = useState<typeof lifeScenarios[0] | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [simulationDialogOpen, setSimulationDialogOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleViewDetails = async (scenario: typeof lifeScenarios[0]) => {
    setSelectedScenario(scenario);
    setDetailsDialogOpen(true);
    setIsAnalyzing(true);
    
    try {
      const response = await analyzeLifePath(scenario);
      setAiAnalysis(response.content);
      toast.success('Analysis complete');
    } catch (error) {
      console.error('Error analyzing life path:', error);
      toast.error('Failed to analyze path. Please check your OpenAI API key.');
      setAiAnalysis('Unable to generate AI analysis at this time. Please ensure your OpenAI API key is properly configured.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRunSimulation = async (scenario: typeof lifeScenarios[0]) => {
    setSelectedScenario(scenario);
    setSimulationDialogOpen(true);
    setIsAnalyzing(true);
    
    try {
      const response = await runDeepSimulation(scenario);
      setAiAnalysis(response.content);
      toast.success('Deep simulation complete');
    } catch (error) {
      console.error('Error running simulation:', error);
      toast.error('Failed to run simulation. Please check your OpenAI API key.');
      setAiAnalysis('Unable to run simulation at this time. Please ensure your OpenAI API key is properly configured.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 h-0">
        <div className="space-y-6 p-4 md:p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-indigo-500 flex items-center justify-center flex-shrink-0">
              <GitBranch className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h2>Branch Simulator</h2>
              <p className="text-muted-foreground">
                Simulates alternate life paths using AI-powered analysis
              </p>
            </div>
          </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Simulations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">4</div>
            <p className="text-xs text-muted-foreground mt-1">Life Branches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Avg Happiness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">75%</div>
            <p className="text-xs text-muted-foreground mt-1">Predicted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Best Outcome</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">95%</div>
            <p className="text-xs text-muted-foreground mt-1">Growth Score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Simulation Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">72%</div>
            <p className="text-xs text-muted-foreground mt-1">Based on Data</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {lifeScenarios.map(scenario => (
          <Card key={scenario.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <GitBranch className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{scenario.name}</CardTitle>
                    <CardDescription>{scenario.description}</CardDescription>
                  </div>
                </div>
                {getTrendIcon(scenario.trend)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Probability</span>
                    <span className="text-xs">{scenario.probability}%</span>
                  </div>
                  <Progress value={scenario.probability} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Happiness</span>
                    <span className="text-xs">{scenario.happiness}%</span>
                  </div>
                  <Progress value={scenario.happiness} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Stability</span>
                    <span className="text-xs">{scenario.stability}%</span>
                  </div>
                  <Progress value={scenario.stability} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Growth</span>
                    <span className="text-xs">{scenario.growth}%</span>
                  </div>
                  <Progress value={scenario.growth} className="h-2" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleViewDetails(scenario)}
                >
                  <Sparkles className="w-3 h-3 mr-2" />
                  View Details
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleRunSimulation(scenario)}
                >
                  <GitBranch className="w-3 h-3 mr-2" />
                  Run Deep Simulation
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Simulation</CardTitle>
          <CardDescription>
            Define a new life path to explore its potential outcomes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">
            <GitBranch className="w-4 h-4 mr-2" />
            Start New Branch Simulation
          </Button>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {selectedScenario?.name}
            </DialogTitle>
            <DialogDescription>
              Detailed AI analysis of this life path
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedScenario && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Probability</p>
                  <p className="text-xl">{selectedScenario.probability}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Happiness</p>
                  <p className="text-xl">{selectedScenario.happiness}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Stability</p>
                  <p className="text-xl">{selectedScenario.stability}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Growth</p>
                  <p className="text-xl">{selectedScenario.growth}%</p>
                </div>
              </div>
            )}
            
            {isAnalyzing ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground">AI is analyzing this life path...</p>
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

      {/* Deep Simulation Dialog */}
      <Dialog open={simulationDialogOpen} onOpenChange={setSimulationDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-primary" />
              Deep Simulation: {selectedScenario?.name}
            </DialogTitle>
            <DialogDescription>
              AI-powered multi-timeline simulation with detailed projections
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedScenario && (
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground mb-2">{selectedScenario.description}</p>
                <div className="flex gap-2">
                  <Badge>Probability: {selectedScenario.probability}%</Badge>
                  <Badge variant="outline">Growth: {selectedScenario.growth}%</Badge>
                </div>
              </div>
            )}
            
            {isAnalyzing ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground">Running deep simulation...</p>
                  <p className="text-xs text-muted-foreground">Analyzing 6-month, 2-year, and 5-year timelines</p>
                </div>
              </div>
            ) : aiAnalysis ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 whitespace-pre-wrap">
                  {aiAnalysis}
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => {
              setSimulationDialogOpen(false);
              setAiAnalysis('');
            }}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
        </div>
      </ScrollArea>
    </div>
  );
}