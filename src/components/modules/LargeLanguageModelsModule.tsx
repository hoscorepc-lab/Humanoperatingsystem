import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Slider } from '../ui/slider';
import { 
  Brain, 
  Zap, 
  Database, 
  Settings, 
  Play, 
  Pause, 
  BarChart3,
  FileText,
  Cpu,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  Layers,
  MessageSquare,
  Sparkles,
  GitBranch,
  Target,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { generateText, analyzeTrainingProgress, optimizeModelArchitecture } from '../../lib/research/ai-service';

interface ModelConfig {
  id: string;
  name: string;
  architecture: string;
  parameters: string;
  status: 'idle' | 'training' | 'evaluating' | 'deployed';
  accuracy: number;
  loss: number;
  epoch: number;
  totalEpochs: number;
}

interface TrainingMetric {
  epoch: number;
  loss: number;
  accuracy: number;
  valLoss: number;
  valAccuracy: number;
}

interface Experiment {
  id: string;
  name: string;
  model: string;
  dataset: string;
  status: 'running' | 'completed' | 'failed';
  startTime: Date;
  duration: string;
  metrics: {
    perplexity: number;
    bleu: number;
    rouge: number;
  };
}

export function LargeLanguageModelsModule() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isAnalyzingTraining, setIsAnalyzingTraining] = useState(false);
  const [isOptimizingArchitecture, setIsOptimizingArchitecture] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [prompt, setPrompt] = useState('');
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [experimentDialogOpen, setExperimentDialogOpen] = useState(false);
  const [experimentDetailsOpen, setExperimentDetailsOpen] = useState(false);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelConfig | null>(null);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [compareExperiments, setCompareExperiments] = useState<Experiment[]>([]);
  const [modelConfig, setModelConfig] = useState({
    learningRate: 0.001,
    batchSize: 32,
    optimizer: 'adam',
    temperature: 0.7,
    maxTokens: 2048,
    dropoutRate: 0.1,
  });
  const [newExperiment, setNewExperiment] = useState({
    name: '',
    model: 'llm-2',
    dataset: '',
    description: '',
  });
  
  const [models] = useState<ModelConfig[]>([
    {
      id: 'llm-1',
      name: 'HOS-GPT-Small',
      architecture: 'Transformer',
      parameters: '125M',
      status: 'training',
      accuracy: 87.5,
      loss: 0.342,
      epoch: 12,
      totalEpochs: 20
    },
    {
      id: 'llm-2',
      name: 'HOS-GPT-Medium',
      architecture: 'Transformer',
      parameters: '350M',
      status: 'idle',
      accuracy: 91.2,
      loss: 0.198,
      epoch: 20,
      totalEpochs: 20
    },
    {
      id: 'llm-3',
      name: 'HOS-GPT-Large',
      architecture: 'Transformer',
      parameters: '1.3B',
      status: 'evaluating',
      accuracy: 94.8,
      loss: 0.124,
      epoch: 15,
      totalEpochs: 15
    },
    {
      id: 'llm-4',
      name: 'HOS-BERT-Base',
      architecture: 'BERT',
      parameters: '110M',
      status: 'deployed',
      accuracy: 89.3,
      loss: 0.267,
      epoch: 10,
      totalEpochs: 10
    }
  ]);

  const [experiments, setExperiments] = useState<Experiment[]>([
    {
      id: 'exp-1',
      name: 'Fine-tuning on Conversational Data',
      model: 'HOS-GPT-Medium',
      dataset: 'DialogueCorpus-50K',
      status: 'running',
      startTime: new Date(Date.now() - 3600000),
      duration: '1h 24m',
      metrics: {
        perplexity: 12.4,
        bleu: 0.78,
        rouge: 0.82
      }
    },
    {
      id: 'exp-2',
      name: 'Zero-shot Classification',
      model: 'HOS-GPT-Large',
      dataset: 'MultiClass-10K',
      status: 'completed',
      startTime: new Date(Date.now() - 7200000),
      duration: '2h 15m',
      metrics: {
        perplexity: 8.9,
        bleu: 0.85,
        rouge: 0.88
      }
    },
    {
      id: 'exp-3',
      name: 'Prompt Engineering Study',
      model: 'HOS-GPT-Small',
      dataset: 'PromptBench-5K',
      status: 'completed',
      startTime: new Date(Date.now() - 14400000),
      duration: '45m',
      metrics: {
        perplexity: 15.2,
        bleu: 0.72,
        rouge: 0.76
      }
    }
  ]);

  const [trainingMetrics] = useState<TrainingMetric[]>([
    { epoch: 1, loss: 2.45, accuracy: 45.2, valLoss: 2.52, valAccuracy: 43.8 },
    { epoch: 2, loss: 1.89, accuracy: 58.6, valLoss: 1.95, valAccuracy: 57.2 },
    { epoch: 3, loss: 1.52, accuracy: 68.4, valLoss: 1.61, valAccuracy: 66.9 },
    { epoch: 4, loss: 1.24, accuracy: 75.3, valLoss: 1.35, valAccuracy: 73.5 },
    { epoch: 5, loss: 0.98, accuracy: 81.2, valLoss: 1.12, valAccuracy: 78.9 },
    { epoch: 6, loss: 0.78, accuracy: 85.7, valLoss: 0.94, valAccuracy: 83.2 },
    { epoch: 7, loss: 0.62, accuracy: 88.9, valLoss: 0.81, valAccuracy: 86.4 },
    { epoch: 8, loss: 0.51, accuracy: 91.2, valLoss: 0.72, valAccuracy: 88.7 }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'training':
      case 'running':
        return 'bg-blue-500';
      case 'evaluating':
        return 'bg-yellow-500';
      case 'deployed':
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'training':
      case 'running':
        return <Activity className="w-4 h-4" />;
      case 'evaluating':
        return <BarChart3 className="w-4 h-4" />;
      case 'deployed':
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Pause className="w-4 h-4" />;
    }
  };

  // AI Functions
  const handleGenerateText = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    setIsGeneratingText(true);
    try {
      const text = await generateText(prompt, {
        temperature: 0.8,
        maxTokens: 500,
        style: 'creative and informative'
      });
      setGeneratedText(text);
      toast.success('Text Generated!');
    } catch (error: any) {
      toast.error('Failed to generate text', {
        description: error.message,
      });
    } finally {
      setIsGeneratingText(false);
    }
  };

  const handleAnalyzeTraining = async (model: ModelConfig) => {
    setIsAnalyzingTraining(true);
    try {
      const analysis = await analyzeTrainingProgress(
        model.name,
        trainingMetrics
      );
      toast.success('Training Analysis Complete', {
        description: analysis.slice(0, 150) + '...',
        duration: 5000,
      });
    } catch (error: any) {
      toast.error('Failed to analyze training', {
        description: error.message,
      });
    } finally {
      setIsAnalyzingTraining(false);
    }
  };

  const handleOptimizeArchitecture = async (model: ModelConfig) => {
    setIsOptimizingArchitecture(true);
    try {
      const optimization = await optimizeModelArchitecture(
        model.architecture,
        {
          accuracy: model.accuracy,
          loss: model.loss,
          parameters: model.parameters
        }
      );
      toast.success('Architecture Optimization Suggestions', {
        description: optimization.slice(0, 150) + '...',
        duration: 5000,
      });
    } catch (error: any) {
      toast.error('Failed to optimize architecture', {
        description: error.message,
      });
    } finally {
      setIsOptimizingArchitecture(false);
    }
  };

  const handleOpenConfig = (model: ModelConfig) => {
    setSelectedModel(model);
    setConfigDialogOpen(true);
  };

  const handleSaveConfig = () => {
    if (selectedModel) {
      toast.success('Configuration Saved', {
        description: `Updated configuration for ${selectedModel.name}`,
      });
      setConfigDialogOpen(false);
    }
  };

  const handleOpenExperimentDialog = () => {
    setExperimentDialogOpen(true);
  };

  const handleViewDetails = (experiment: Experiment) => {
    setSelectedExperiment(experiment);
    setExperimentDetailsOpen(true);
  };

  const handleCompare = (experiment: Experiment) => {
    if (compareExperiments.length === 0) {
      setCompareExperiments([experiment]);
      toast.info('Select another experiment to compare');
    } else if (compareExperiments.length === 1 && compareExperiments[0].id !== experiment.id) {
      setCompareExperiments([...compareExperiments, experiment]);
      setCompareDialogOpen(true);
    } else if (compareExperiments[0].id === experiment.id) {
      toast.info('This experiment is already selected');
    }
  };

  const handleCloseCompare = () => {
    setCompareDialogOpen(false);
    setCompareExperiments([]);
  };

  const handleCreateExperiment = () => {
    if (!newExperiment.name.trim()) {
      toast.error('Please enter an experiment name');
      return;
    }
    if (!newExperiment.dataset.trim()) {
      toast.error('Please enter a dataset name');
      return;
    }
    
    // Find the selected model name
    const selectedModelData = models.find(m => m.id === newExperiment.model);
    
    // Create new experiment object
    const createdExperiment: Experiment = {
      id: `exp-${Date.now()}`,
      name: newExperiment.name,
      model: selectedModelData?.name || 'HOS-GPT-Medium',
      dataset: newExperiment.dataset,
      status: 'running',
      startTime: new Date(),
      duration: '0m',
      metrics: {
        perplexity: 0,
        bleu: 0,
        rouge: 0
      }
    };
    
    // Add to experiments list at the beginning
    setExperiments(prev => [createdExperiment, ...prev]);
    
    toast.success('Experiment Created!', {
      description: `${newExperiment.name} is now running. Check the Experiments tab to monitor progress.`,
      duration: 5000,
    });
    
    // Reset form
    setNewExperiment({
      name: '',
      model: 'llm-2',
      dataset: '',
      description: '',
    });
    setExperimentDialogOpen(false);
    
    // Switch to experiments tab to show the new experiment
    setActiveTab('experiments');
  };

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 h-0">
        <div className="p-4 sm:p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="flex items-center gap-3">
                <Brain className="w-8 h-8 text-primary" />
                HOS Large Language Models
              </h2>
              <p className="text-muted-foreground mt-1">
                Advanced LLM research, training, and experimentation platform
              </p>
            </div>
        <Button className="gap-2" onClick={handleOpenExperimentDialog}>
          <Sparkles className="w-4 h-4" />
          New Experiment
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Models</p>
                <p className="text-2xl mt-1">4</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Layers className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                2 training
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Experiments</p>
                <p className="text-2xl mt-1">24</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <GitBranch className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Activity className="w-3 h-3 mr-1" />
                1 running
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Parameters</p>
                <p className="text-2xl mt-1">1.9B</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Cpu className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Across 4 models
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Accuracy</p>
                <p className="text-2xl mt-1">90.7%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                +3.2% this week
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="w-full overflow-x-auto">
          <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-5">
            <TabsTrigger value="overview" className="whitespace-nowrap px-3 sm:px-4">Overview</TabsTrigger>
            <TabsTrigger value="models" className="whitespace-nowrap px-3 sm:px-4">Models</TabsTrigger>
            <TabsTrigger value="experiments" className="whitespace-nowrap px-3 sm:px-4">
              <span className="hidden sm:inline">Experiments</span>
              <span className="sm:hidden">Exp</span>
            </TabsTrigger>
            <TabsTrigger value="training" className="whitespace-nowrap px-3 sm:px-4">Training</TabsTrigger>
            <TabsTrigger value="evaluation" className="whitespace-nowrap px-3 sm:px-4">
              <span className="hidden sm:inline">Evaluation</span>
              <span className="sm:hidden">Eval</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Active Training */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Active Training Sessions
              </CardTitle>
              <CardDescription>
                Real-time monitoring of ongoing model training
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {models
                  .filter(m => m.status === 'training')
                  .map((model) => (
                    <motion.div
                      key={model.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="flex items-center gap-2">
                            {model.name}
                            <Badge variant="outline" className="text-xs">
                              {model.architecture}
                            </Badge>
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {model.parameters} parameters
                          </p>
                        </div>
                        <Badge className={`${getStatusColor(model.status)} text-white`}>
                          {getStatusIcon(model.status)}
                          <span className="ml-1 capitalize">{model.status}</span>
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Epoch {model.epoch}/{model.totalEpochs}</span>
                          <span>{Math.round((model.epoch / model.totalEpochs) * 100)}%</span>
                        </div>
                        <Progress value={(model.epoch / model.totalEpochs) * 100} />
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Accuracy</p>
                          <p className="text-lg mt-1">{model.accuracy}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Loss</p>
                          <p className="text-lg mt-1">{model.loss.toFixed(3)}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Experiments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Recent Experiments
              </CardTitle>
              <CardDescription>
                Latest experimental runs and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {experiments.slice(0, 3).map((exp) => (
                  <div
                    key={exp.id}
                    className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="flex items-center gap-2">
                          {exp.name}
                          <Badge variant="outline" className="text-xs">
                            {exp.model}
                          </Badge>
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Dataset: {exp.dataset}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(exp.status)} text-white`}>
                        {exp.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Perplexity</p>
                        <p className="mt-1">{exp.metrics.perplexity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">BLEU Score</p>
                        <p className="mt-1">{exp.metrics.bleu}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">ROUGE Score</p>
                        <p className="mt-1">{exp.metrics.rouge}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {exp.duration}
                      </span>
                      <span>Started {exp.startTime.toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Training Metrics Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Training Performance
              </CardTitle>
              <CardDescription>
                Loss and accuracy curves over training epochs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2 border-b border-l border-border pl-8 pb-8">
                {trainingMetrics.map((metric, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col gap-1">
                      {/* Accuracy bar */}
                      <div
                        className="w-full bg-green-500 rounded-t transition-all duration-300 hover:bg-green-600"
                        style={{ height: `${metric.accuracy * 2}px` }}
                        title={`Accuracy: ${metric.accuracy}%`}
                      />
                      {/* Loss bar (inverted) */}
                      <div
                        className="w-full bg-red-500 rounded-b transition-all duration-300 hover:bg-red-600"
                        style={{ height: `${metric.loss * 50}px` }}
                        title={`Loss: ${metric.loss}`}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">E{metric.epoch}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span className="text-sm">Accuracy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded" />
                  <span className="text-sm">Loss</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Models Tab */}
        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Model Registry
              </CardTitle>
              <CardDescription>
                All registered language models and their configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {models.map((model) => (
                  <motion.div
                    key={model.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 border border-border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="flex items-center gap-2">
                          {model.name}
                          <Badge variant="outline">{model.architecture}</Badge>
                          <Badge variant="outline">{model.parameters}</Badge>
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Last updated: {new Date().toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(model.status)} text-white`}>
                        {getStatusIcon(model.status)}
                        <span className="ml-1 capitalize">{model.status}</span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Accuracy</p>
                        <p className="text-xl mt-1">{model.accuracy}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Loss</p>
                        <p className="text-xl mt-1">{model.loss.toFixed(3)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Epoch</p>
                        <p className="text-xl mt-1">{model.epoch}/{model.totalEpochs}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Progress</p>
                        <p className="text-xl mt-1">
                          {Math.round((model.epoch / model.totalEpochs) * 100)}%
                        </p>
                      </div>
                    </div>

                    {model.status === 'training' && (
                      <Progress value={(model.epoch / model.totalEpochs) * 100} className="mb-4" />
                    )}

                    <div className="flex gap-2 flex-wrap">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => handleAnalyzeTraining(model)}
                        disabled={isAnalyzingTraining}
                      >
                        <Brain className="w-4 h-4" />
                        {isAnalyzingTraining ? 'Analyzing...' : 'AI Analyze Training'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => handleOptimizeArchitecture(model)}
                        disabled={isOptimizingArchitecture}
                      >
                        <Sparkles className="w-4 h-4" />
                        {isOptimizingArchitecture ? 'Optimizing...' : 'AI Optimize'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => handleOpenConfig(model)}
                      >
                        <Settings className="w-4 h-4" />
                        Configure
                      </Button>
                      {model.status === 'idle' && (
                        <Button variant="outline" size="sm" className="gap-2">
                          <Play className="w-4 h-4" />
                          Resume Training
                        </Button>
                      )}
                      {model.status === 'training' && (
                        <Button variant="outline" size="sm" className="gap-2">
                          <Pause className="w-4 h-4" />
                          Pause Training
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Experiments Tab */}
        <TabsContent value="experiments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Experimental Runs
              </CardTitle>
              <CardDescription>
                Track and compare model experiments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4 pr-4">
                  {experiments.map((exp) => (
                    <motion.div
                      key={exp.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-6 border border-border rounded-lg hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="flex items-center gap-2 mb-2">
                            {exp.name}
                            <Badge variant="outline" className="text-xs">
                              {exp.model}
                            </Badge>
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Database className="w-4 h-4" />
                              {exp.dataset}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {exp.duration}
                            </span>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(exp.status)} text-white`}>
                          {getStatusIcon(exp.status)}
                          <span className="ml-1 capitalize">{exp.status}</span>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-6 mb-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Perplexity</p>
                          <p className="text-2xl">{exp.metrics.perplexity}</p>
                          <p className="text-xs text-green-500">Lower is better</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">BLEU Score</p>
                          <p className="text-2xl">{exp.metrics.bleu}</p>
                          <Progress value={exp.metrics.bleu * 100} className="mt-2" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">ROUGE Score</p>
                          <p className="text-2xl">{exp.metrics.rouge}</p>
                          <Progress value={exp.metrics.rouge * 100} className="mt-2" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <span className="text-xs text-muted-foreground">
                          Started: {exp.startTime.toLocaleString()}
                        </span>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDetails(exp)}
                          >
                            View Details
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCompare(exp)}
                            className={compareExperiments.some(e => e.id === exp.id) ? 'bg-primary/10' : ''}
                          >
                            {compareExperiments.some(e => e.id === exp.id) ? '✓ Selected' : 'Compare'}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Training Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Training Configuration
                </CardTitle>
                <CardDescription>
                  Configure model training parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="train-model">Model</Label>
                    <Select defaultValue="llm-1">
                      <SelectTrigger id="train-model">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map(model => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataset">Dataset</Label>
                    <Select defaultValue="dataset-1">
                      <SelectTrigger id="dataset">
                        <SelectValue placeholder="Select dataset" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dataset-1">DialogueCorpus-50K</SelectItem>
                        <SelectItem value="dataset-2">MultiClass-10K</SelectItem>
                        <SelectItem value="dataset-3">PromptBench-5K</SelectItem>
                        <SelectItem value="dataset-4">CustomDataset</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="epochs">Epochs</Label>
                    <Input id="epochs" type="number" defaultValue="20" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="batch">Batch Size</Label>
                    <Select defaultValue="32">
                      <SelectTrigger id="batch">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8">8</SelectItem>
                        <SelectItem value="16">16</SelectItem>
                        <SelectItem value="32">32</SelectItem>
                        <SelectItem value="64">64</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lr">Learning Rate: 0.001</Label>
                    <input 
                      type="range" 
                      id="lr"
                      min="0.0001" 
                      max="0.01" 
                      step="0.0001" 
                      defaultValue="0.001"
                      className="w-full"
                    />
                  </div>

                  <Button className="w-full gap-2">
                    <Play className="w-4 h-4" />
                    Start Training
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Training Logs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Training Logs
                </CardTitle>
                <CardDescription>
                  Real-time training console output
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] w-full rounded-lg bg-black/90 p-4 font-mono text-xs">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">[2025-01-14 10:23:15] Initializing model...</p>
                    <p className="text-muted-foreground">[2025-01-14 10:23:18] Loading dataset: DialogueCorpus-50K</p>
                    <p className="text-green-500">[2025-01-14 10:23:25] Dataset loaded successfully</p>
                    <p className="text-muted-foreground">[2025-01-14 10:23:26] Starting training...</p>
                    <p className="text-blue-500">[2025-01-14 10:23:28] Epoch 1/20 - Loss: 2.452, Acc: 45.2%</p>
                    <p className="text-blue-500">[2025-01-14 10:24:15] Epoch 2/20 - Loss: 1.893, Acc: 58.6%</p>
                    <p className="text-blue-500">[2025-01-14 10:25:02] Epoch 3/20 - Loss: 1.524, Acc: 68.4%</p>
                    <p className="text-blue-500">[2025-01-14 10:25:48] Epoch 4/20 - Loss: 1.242, Acc: 75.3%</p>
                    <p className="text-green-500">[2025-01-14 10:26:12] Validation - Loss: 1.351, Acc: 73.5%</p>
                    <p className="text-blue-500">[2025-01-14 10:26:35] Epoch 5/20 - Loss: 0.982, Acc: 81.2%</p>
                    <p className="text-blue-500">[2025-01-14 10:27:21] Epoch 6/20 - Loss: 0.784, Acc: 85.7%</p>
                    <p className="text-green-500">[2025-01-14 10:27:45] Checkpoint saved</p>
                    <p className="text-blue-500">[2025-01-14 10:28:08] Epoch 7/20 - Loss: 0.623, Acc: 88.9%</p>
                    <p className="text-blue-500">[2025-01-14 10:28:54] Epoch 8/20 - Loss: 0.512, Acc: 91.2%</p>
                    <p className="text-green-500">[2025-01-14 10:29:18] Validation - Loss: 0.721, Acc: 88.7%</p>
                    <p className="text-muted-foreground">[2025-01-14 10:29:42] Training in progress...</p>
                    <p className="animate-pulse">█</p>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Evaluation Tab */}
        <TabsContent value="evaluation" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Prompt Testing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Prompt Testing
                </CardTitle>
                <CardDescription>
                  Test model responses to custom prompts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="eval-model">Model</Label>
                    <Select defaultValue="llm-2">
                      <SelectTrigger id="eval-model">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map(model => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prompt">Prompt</Label>
                    <Textarea 
                      id="prompt"
                      placeholder="Enter your prompt here..."
                      rows={4}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature: 0.7</Label>
                    <input 
                      type="range" 
                      id="temperature"
                      min="0" 
                      max="1" 
                      step="0.1" 
                      defaultValue="0.7"
                      className="w-full"
                    />
                  </div>

                  <Button 
                    className="w-full gap-2"
                    onClick={handleGenerateText}
                    disabled={isGeneratingText}
                  >
                    <Sparkles className="w-4 h-4" />
                    {isGeneratingText ? 'Generating...' : 'AI Generate Text'}
                  </Button>

                  {generatedText && (
                    <div className="p-4 border border-border rounded-lg bg-muted/30">
                      <p className="text-sm text-muted-foreground mb-2">Generated Response:</p>
                      <p className="text-sm whitespace-pre-wrap">
                        {generatedText}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>
                  Comprehensive model evaluation metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">F1 Score</span>
                      <span className="text-sm">0.89/1.0</span>
                    </div>
                    <Progress value={89} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Precision</span>
                      <span className="text-sm">0.92/1.0</span>
                    </div>
                    <Progress value={92} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Recall</span>
                      <span className="text-sm">0.86/1.0</span>
                    </div>
                    <Progress value={86} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Accuracy</span>
                      <span className="text-sm">0.91/1.0</span>
                    </div>
                    <Progress value={91} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Perplexity</span>
                      <span className="text-sm">12.4</span>
                    </div>
                    <Progress value={75} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">BLEU Score</span>
                      <span className="text-sm">68.5/100</span>
                    </div>
                    <Progress value={68.5} />
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h4 className="mb-3">Additional Metrics</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Tokens/sec</p>
                        <p className="text-lg mt-1">1,247</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Latency</p>
                        <p className="text-lg mt-1">42ms</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Memory</p>
                        <p className="text-lg mt-1">2.8 GB</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">GPU Usage</p>
                        <p className="text-lg mt-1">73%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Experiment Details Dialog */}
      <Dialog open={experimentDetailsOpen} onOpenChange={setExperimentDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Experiment Details
            </DialogTitle>
            <DialogDescription>
              Comprehensive information about {selectedExperiment?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedExperiment && (
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Basic Information
                </h4>
                <div className="grid grid-cols-2 gap-4 pl-6 text-sm">
                  <div>
                    <p className="text-muted-foreground">Experiment Name</p>
                    <p className="mt-1">{selectedExperiment.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Model</p>
                    <p className="mt-1">{selectedExperiment.model}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Dataset</p>
                    <p className="mt-1">{selectedExperiment.dataset}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge className={`${getStatusColor(selectedExperiment.status)} text-white mt-1`}>
                      {selectedExperiment.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Started</p>
                    <p className="mt-1">{selectedExperiment.startTime.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="mt-1">{selectedExperiment.duration}</p>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Performance Metrics
                </h4>
                <div className="pl-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Perplexity</span>
                      <span className="font-mono">{selectedExperiment.metrics.perplexity}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Lower values indicate better language modeling performance</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>BLEU Score</span>
                      <span className="font-mono">{selectedExperiment.metrics.bleu}</span>
                    </div>
                    <Progress value={selectedExperiment.metrics.bleu * 100} />
                    <p className="text-xs text-muted-foreground">Measures translation quality (0-1 scale)</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>ROUGE Score</span>
                      <span className="font-mono">{selectedExperiment.metrics.rouge}</span>
                    </div>
                    <Progress value={selectedExperiment.metrics.rouge * 100} />
                    <p className="text-xs text-muted-foreground">Evaluates automatic summarization quality (0-1 scale)</p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="mb-3">Experiment Configuration</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Learning Rate</p>
                    <p>0.001</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Batch Size</p>
                    <p>32</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Optimizer</p>
                    <p>Adam</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Epochs</p>
                    <p>20</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setExperimentDetailsOpen(false)}>
              Close
            </Button>
            <Button className="gap-2">
              <FileText className="w-4 h-4" />
              Export Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compare Dialog */}
      <Dialog open={compareDialogOpen} onOpenChange={handleCloseCompare}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5" />
              Compare Experiments
            </DialogTitle>
            <DialogDescription>
              Side-by-side comparison of experiment results
            </DialogDescription>
          </DialogHeader>
          
          {compareExperiments.length === 2 && (
            <div className="space-y-6 py-4">
              {/* Header Comparison */}
              <div className="grid grid-cols-2 gap-6">
                {compareExperiments.map((exp, idx) => (
                  <div key={exp.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="flex items-center gap-2">
                        Experiment {idx + 1}
                        <Badge className={`${getStatusColor(exp.status)} text-white`}>
                          {exp.status}
                        </Badge>
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCompareExperiments([]);
                          setCompareDialogOpen(false);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="mt-2">{exp.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">Model: {exp.model}</p>
                    <p className="text-sm text-muted-foreground">Dataset: {exp.dataset}</p>
                  </div>
                ))}
              </div>

              {/* Metrics Comparison */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Performance Metrics
                </h4>
                
                {/* Perplexity */}
                <div className="p-4 border border-border rounded-lg">
                  <h5 className="mb-3">Perplexity (Lower is better)</h5>
                  <div className="grid grid-cols-2 gap-4">
                    {compareExperiments.map((exp) => (
                      <div key={exp.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{exp.metrics.perplexity}</span>
                          {exp.metrics.perplexity < compareExperiments[(compareExperiments.indexOf(exp) + 1) % 2].metrics.perplexity && (
                            <Badge className="bg-green-500 text-white">Better</Badge>
                          )}
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all"
                            style={{ width: `${(1 / exp.metrics.perplexity) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* BLEU Score */}
                <div className="p-4 border border-border rounded-lg">
                  <h5 className="mb-3">BLEU Score (Higher is better)</h5>
                  <div className="grid grid-cols-2 gap-4">
                    {compareExperiments.map((exp) => (
                      <div key={exp.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{exp.metrics.bleu}</span>
                          {exp.metrics.bleu > compareExperiments[(compareExperiments.indexOf(exp) + 1) % 2].metrics.bleu && (
                            <Badge className="bg-green-500 text-white">Better</Badge>
                          )}
                        </div>
                        <Progress value={exp.metrics.bleu * 100} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* ROUGE Score */}
                <div className="p-4 border border-border rounded-lg">
                  <h5 className="mb-3">ROUGE Score (Higher is better)</h5>
                  <div className="grid grid-cols-2 gap-4">
                    {compareExperiments.map((exp) => (
                      <div key={exp.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{exp.metrics.rouge}</span>
                          {exp.metrics.rouge > compareExperiments[(compareExperiments.indexOf(exp) + 1) % 2].metrics.rouge && (
                            <Badge className="bg-green-500 text-white">Better</Badge>
                          )}
                        </div>
                        <Progress value={exp.metrics.rouge * 100} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Duration Comparison */}
                <div className="p-4 border border-border rounded-lg">
                  <h5 className="mb-3">Training Duration</h5>
                  <div className="grid grid-cols-2 gap-4">
                    {compareExperiments.map((exp) => (
                      <div key={exp.id} className="flex items-center justify-between">
                        <span className="text-lg">{exp.duration}</span>
                        <span className="text-sm text-muted-foreground">
                          Started: {exp.startTime.toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseCompare}>
              Close
            </Button>
            <Button className="gap-2">
              <FileText className="w-4 h-4" />
              Export Comparison
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Experiment Dialog */}
      <Dialog open={experimentDialogOpen} onOpenChange={setExperimentDialogOpen}>
        <DialogContent className="w-[95vw] max-w-2xl sm:w-full max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              Create New Experiment
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Set up a new training experiment with custom parameters
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-0 flex-1 min-h-0">
            <div className="space-y-4 py-4 px-1">
              <div className="space-y-2">
              <Label htmlFor="exp-name">Experiment Name</Label>
              <Input
                id="exp-name"
                placeholder="e.g., Fine-tuning on Custom Dataset"
                value={newExperiment.name}
                onChange={(e) => setNewExperiment({ ...newExperiment, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exp-model">Model</Label>
              <Select 
                value={newExperiment.model} 
                onValueChange={(value) => setNewExperiment({ ...newExperiment, model: value })}
              >
                <SelectTrigger id="exp-model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {models.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name} ({model.parameters})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exp-dataset">Dataset</Label>
              <Input
                id="exp-dataset"
                placeholder="e.g., ConversationalData-100K"
                value={newExperiment.dataset}
                onChange={(e) => setNewExperiment({ ...newExperiment, dataset: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exp-description">Description (Optional)</Label>
              <Textarea
                id="exp-description"
                placeholder="Describe the goals and parameters of this experiment..."
                rows={3}
                value={newExperiment.description}
                onChange={(e) => setNewExperiment({ ...newExperiment, description: e.target.value })}
              />
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4" />
                Selected Model Info
              </h4>
              {models.find(m => m.id === newExperiment.model) && (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Architecture</p>
                    <p>{models.find(m => m.id === newExperiment.model)?.architecture}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Parameters</p>
                    <p>{models.find(m => m.id === newExperiment.model)?.parameters}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="capitalize">{models.find(m => m.id === newExperiment.model)?.status}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Accuracy</p>
                    <p>{models.find(m => m.id === newExperiment.model)?.accuracy}%</p>
                  </div>
                </div>
              )}
            </div>
            </div>
          </ScrollArea>

          <DialogFooter className="flex-shrink-0 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setExperimentDialogOpen(false)} className="text-sm sm:text-base">
              Cancel
            </Button>
            <Button onClick={handleCreateExperiment} className="gap-2 text-sm sm:text-base">
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Create & Start Experiment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configuration Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure Model</DialogTitle>
            <DialogDescription>
              {selectedModel && `Adjust training and inference parameters for ${selectedModel.name}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Training Parameters */}
            <div className="space-y-4">
              <h4 className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Training Parameters
              </h4>
              
              <div className="space-y-4 pl-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="learning-rate">Learning Rate</Label>
                    <span className="text-sm text-muted-foreground">{modelConfig.learningRate}</span>
                  </div>
                  <Slider
                    id="learning-rate"
                    min={0.0001}
                    max={0.01}
                    step={0.0001}
                    value={[modelConfig.learningRate]}
                    onValueChange={([value]) => setModelConfig({ ...modelConfig, learningRate: value })}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="batch-size">Batch Size</Label>
                    <span className="text-sm text-muted-foreground">{modelConfig.batchSize}</span>
                  </div>
                  <Slider
                    id="batch-size"
                    min={8}
                    max={128}
                    step={8}
                    value={[modelConfig.batchSize]}
                    onValueChange={([value]) => setModelConfig({ ...modelConfig, batchSize: value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="optimizer">Optimizer</Label>
                  <Select 
                    value={modelConfig.optimizer} 
                    onValueChange={(value) => setModelConfig({ ...modelConfig, optimizer: value })}
                  >
                    <SelectTrigger id="optimizer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adam">Adam</SelectItem>
                      <SelectItem value="sgd">SGD</SelectItem>
                      <SelectItem value="adamw">AdamW</SelectItem>
                      <SelectItem value="rmsprop">RMSprop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dropout">Dropout Rate</Label>
                    <span className="text-sm text-muted-foreground">{modelConfig.dropoutRate}</span>
                  </div>
                  <Slider
                    id="dropout"
                    min={0}
                    max={0.5}
                    step={0.05}
                    value={[modelConfig.dropoutRate]}
                    onValueChange={([value]) => setModelConfig({ ...modelConfig, dropoutRate: value })}
                  />
                </div>
              </div>
            </div>

            {/* Inference Parameters */}
            <div className="space-y-4">
              <h4 className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Inference Parameters
              </h4>
              
              <div className="space-y-4 pl-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="temp">Temperature</Label>
                    <span className="text-sm text-muted-foreground">{modelConfig.temperature}</span>
                  </div>
                  <Slider
                    id="temp"
                    min={0}
                    max={2}
                    step={0.1}
                    value={[modelConfig.temperature]}
                    onValueChange={([value]) => setModelConfig({ ...modelConfig, temperature: value })}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="max-tokens">Max Tokens</Label>
                    <span className="text-sm text-muted-foreground">{modelConfig.maxTokens}</span>
                  </div>
                  <Slider
                    id="max-tokens"
                    min={256}
                    max={4096}
                    step={256}
                    value={[modelConfig.maxTokens]}
                    onValueChange={([value]) => setModelConfig({ ...modelConfig, maxTokens: value })}
                  />
                </div>
              </div>
            </div>

            {/* Model Info */}
            {selectedModel && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <h4 className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Model Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm pl-6">
                  <div>
                    <p className="text-muted-foreground">Architecture</p>
                    <p>{selectedModel.architecture}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Parameters</p>
                    <p>{selectedModel.parameters}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Current Accuracy</p>
                    <p>{selectedModel.accuracy}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Current Loss</p>
                    <p>{selectedModel.loss.toFixed(3)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveConfig}>
              <Settings className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </div>
      </ScrollArea>
    </div>
  );
}
