import { useState, useEffect, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Progress } from '../ui/progress';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  Brain,
  Play,
  Square,
  Pause,
  Plus,
  Trash2,
  Download,
  Upload,
  Zap,
  Activity,
  TrendingUp,
  Layers,
  Database,
  Settings,
  BarChart3,
  Sparkles,
  FileText,
  Code,
  BookOpen,
  Info,
  Save,
  Copy,
  RefreshCw,
  Eye,
  TestTube
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { 
  GPTModel, 
  GPTConfig, 
  TrainingConfig, 
  TrainingRun, 
  TrainingMetrics,
  Dataset,
  GenerationConfig,
  GeneratedText,
  MODEL_TEMPLATES,
  DEFAULT_TRAINING_CONFIG
} from '../../types/hosgpt';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Helper to safely format dates (handles both Date objects and strings)
const formatDate = (date: Date | string): string => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString();
};

// Sample datasets
const SAMPLE_DATASETS: Dataset[] = [
  {
    id: 'shakespeare',
    name: 'Shakespeare',
    description: 'Complete works of William Shakespeare',
    type: 'text',
    size: 1115394,
    vocabSize: 65,
    source: 'tiny_shakespeare.txt',
    preprocessed: true
  },
  {
    id: 'openwebtext',
    name: 'OpenWebText',
    description: 'Open source recreation of WebText dataset',
    type: 'text',
    size: 9035582198,
    vocabSize: 50257,
    source: 'openwebtext/',
    preprocessed: false
  },
  {
    id: 'python-code',
    name: 'Python Code',
    description: 'Python code from open source repositories',
    type: 'code',
    size: 5000000,
    vocabSize: 50257,
    source: 'python_code/',
    preprocessed: false
  },
  {
    id: 'custom',
    name: 'Custom Dataset',
    description: 'Upload your own text data',
    type: 'custom',
    size: 0,
    vocabSize: 50257,
    preprocessed: false
  }
];

export function HOSGPTModule() {
  const [models, setModels] = useState<GPTModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<GPTModel | null>(null);
  const [trainingRuns, setTrainingRuns] = useState<TrainingRun[]>([]);
  const [activeRun, setActiveRun] = useState<TrainingRun | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<Dataset>(SAMPLE_DATASETS[0]);
  const [generatedTexts, setGeneratedTexts] = useState<GeneratedText[]>([]);
  
  // Model creation state
  const [newModelName, setNewModelName] = useState('');
  const [newModelDesc, setNewModelDesc] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('small');
  const [modelConfig, setModelConfig] = useState<GPTConfig>(MODEL_TEMPLATES['small']);
  const [trainingConfig, setTrainingConfig] = useState<TrainingConfig>(DEFAULT_TRAINING_CONFIG);
  
  // Generation state
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [generationConfig, setGenerationConfig] = useState<GenerationConfig>({
    prompt: '',
    maxNewTokens: 100,
    temperature: 0.8,
    topK: 200
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGeneration, setCurrentGeneration] = useState('');
  
  // Details and Test dialogs
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [detailsModel, setDetailsModel] = useState<GPTModel | null>(null);
  const [testModel, setTestModel] = useState<GPTModel | null>(null);
  const [testPrompt, setTestPrompt] = useState('');
  const [testResult, setTestResult] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  // Calculate model parameters
  const calculateParams = (config: GPTConfig): number => {
    const { nLayer, nHead, nEmbd, vocabSize, blockSize } = config;
    // Simplified parameter calculation
    const embParams = vocabSize * nEmbd + blockSize * nEmbd;
    const layerParams = nLayer * (
      4 * nEmbd * nEmbd + // attention
      4 * nEmbd * (4 * nEmbd) + // MLP
      2 * nEmbd // layer norms
    );
    const finalParams = nEmbd * vocabSize; // output
    return embParams + layerParams + finalParams;
  };

  // Create new model
  const handleCreateModel = () => {
    if (!newModelName.trim()) {
      toast.error('Please enter a model name');
      return;
    }

    const newModel: GPTModel = {
      id: Date.now().toString(),
      name: newModelName,
      description: newModelDesc,
      config: { ...modelConfig },
      trainingConfig: { ...trainingConfig },
      created: new Date(),
      lastModified: new Date(),
      status: 'untrained',
      totalParams: calculateParams(modelConfig)
    };

    setModels([...models, newModel]);
    setSelectedModel(newModel);
    setNewModelName('');
    setNewModelDesc('');
    toast.success(`Model "${newModelName}" created with ${(newModel.totalParams! / 1e6).toFixed(1)}M parameters`);
  };

  // Start training
  const handleStartTraining = () => {
    if (!selectedModel) {
      toast.error('Please select a model first');
      return;
    }

    const run: TrainingRun = {
      id: Date.now().toString(),
      modelId: selectedModel.id,
      datasetId: selectedDataset.id,
      startTime: new Date(),
      status: 'running',
      currentIter: 0,
      totalIters: selectedModel.trainingConfig.maxIters,
      metrics: [],
      bestLoss: Infinity
    };

    setTrainingRuns([...trainingRuns, run]);
    setActiveRun(run);
    
    // Update model status
    setModels(models.map(m => 
      m.id === selectedModel.id ? { ...m, status: 'training' } : m
    ));

    simulateTraining(run);
    toast.success('Training started');
  };

  // Simulate training
  const simulateTraining = (run: TrainingRun) => {
    let currentIter = 0;
    const totalIters = selectedModel?.trainingConfig.maxIters || 5000;
    const warmupIters = selectedModel?.trainingConfig.warmupIters || 100;
    const lrDecayIters = selectedModel?.trainingConfig.lrDecayIters || 5000;
    const baseLr = selectedModel?.trainingConfig.learningRate || 6e-4;
    const minLr = selectedModel?.trainingConfig.minLr || 6e-5;

    const interval = setInterval(() => {
      if (currentIter >= totalIters) {
        clearInterval(interval);
        
        setTrainingRuns(runs =>
          runs.map(r =>
            r.id === run.id
              ? { ...r, status: 'completed', endTime: new Date() }
              : r
          )
        );
        
        setModels(models =>
          models.map(m =>
            m.id === run.modelId ? { ...m, status: 'trained' } : m
          )
        );
        
        setActiveRun(null);
        toast.success('Training completed successfully');
        return;
      }

      // Calculate learning rate
      let lr = baseLr;
      if (currentIter < warmupIters) {
        lr = baseLr * (currentIter / warmupIters);
      } else if (currentIter > lrDecayIters) {
        lr = minLr;
      } else {
        const decay = (currentIter - warmupIters) / (lrDecayIters - warmupIters);
        lr = minLr + (baseLr - minLr) * (1 - decay);
      }

      // Simulate loss decay with some noise
      const baseLoss = 4.0;
      const targetLoss = 0.8;
      const progress = currentIter / totalIters;
      const loss = targetLoss + (baseLoss - targetLoss) * Math.exp(-5 * progress) + Math.random() * 0.1;

      const metric: TrainingMetrics = {
        iter: currentIter,
        loss,
        lr,
        tokensPerSec: 1000 + Math.random() * 500,
        timestamp: new Date()
      };

      setTrainingRuns(runs =>
        runs.map(r =>
          r.id === run.id
            ? { 
                ...r, 
                currentIter,
                metrics: [...r.metrics, metric],
                bestLoss: Math.min(r.bestLoss, loss)
              }
            : r
        )
      );

      currentIter++;
    }, 50); // Fast for demo
  };

  // Stop training
  const handleStopTraining = () => {
    if (!activeRun) return;

    setTrainingRuns(runs =>
      runs.map(r =>
        r.id === activeRun.id
          ? { ...r, status: 'paused', endTime: new Date() }
          : r
      )
    );

    if (selectedModel) {
      setModels(models =>
        models.map(m =>
          m.id === selectedModel.id ? { ...m, status: 'untrained' } : m
        )
      );
    }

    setActiveRun(null);
    toast.info('Training stopped');
  };

  // Generate text
  const handleGenerate = () => {
    if (!selectedModel) {
      toast.error('Please select a trained model first');
      return;
    }

    if (selectedModel.status !== 'trained') {
      toast.error('Model must be trained before generating text');
      return;
    }

    if (!generationPrompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setCurrentGeneration('');

    const config: GenerationConfig = {
      prompt: generationPrompt,
      maxNewTokens: generationConfig.maxNewTokens,
      temperature: generationConfig.temperature,
      topK: generationConfig.topK
    };

    // Simulate text generation
    const sampleTexts = [
      " The future of artificial intelligence lies in understanding the fundamental nature of intelligence itself. As we develop more sophisticated models, we must consider not just their capabilities, but their limitations and ethical implications.",
      " In the realm of machine learning, transformers have revolutionized how we approach sequence modeling. The attention mechanism allows models to focus on relevant parts of the input, enabling them to capture long-range dependencies.",
      " Once upon a time, in a world where AI and humans coexisted, there lived a neural network that dreamed of understanding human creativity. Each day it learned, each night it processed, until one day it discovered something remarkable.",
      " The key to successful model training lies in finding the right balance between exploration and exploitation. Too much exploration leads to instability, while too much exploitation results in local minima.",
      " As the sun set over the data center, the GPT model continued its training, processing millions of tokens per second. Each iteration brought it closer to understanding the patterns hidden within the vast corpus of human knowledge."
    ];

    let generated = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    let index = 0;

    const interval = setInterval(() => {
      if (index >= generated.length) {
        clearInterval(interval);
        setIsGenerating(false);
        
        const result: GeneratedText = {
          id: Date.now().toString(),
          modelId: selectedModel.id,
          prompt: generationPrompt,
          generated: generated,
          config,
          timestamp: new Date()
        };
        
        setGeneratedTexts([result, ...generatedTexts]);
        toast.success('Generation complete');
        return;
      }

      setCurrentGeneration(generated.substring(0, index + 1));
      index++;
    }, 30);
  };

  // Delete model
  const handleDeleteModel = (modelId: string) => {
    setModels(models.filter(m => m.id !== modelId));
    if (selectedModel?.id === modelId) {
      setSelectedModel(null);
    }
    toast.success('Model deleted');
  };

  // Show model details
  const handleShowDetails = (model: GPTModel, e: React.MouseEvent) => {
    e.stopPropagation();
    setDetailsModel(model);
    setDetailsDialogOpen(true);
  };

  // Test model
  const handleTestModel = (model: GPTModel, e: React.MouseEvent) => {
    e.stopPropagation();
    if (model.status !== 'trained') {
      toast.error('Model must be trained before testing');
      return;
    }
    setTestModel(model);
    setTestPrompt('');
    setTestResult('');
    setTestDialogOpen(true);
  };

  // Run test
  const handleRunTest = () => {
    if (!testModel || !testPrompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsTesting(true);
    setTestResult('');

    // Simulate text generation
    const sampleTexts = [
      " The future of artificial intelligence lies in understanding the fundamental nature of intelligence itself. As we develop more sophisticated models, we must consider not just their capabilities, but their limitations and ethical implications.",
      " In the realm of machine learning, transformers have revolutionized how we approach sequence modeling. The attention mechanism allows models to focus on relevant parts of the input, enabling them to capture long-range dependencies.",
      " Once upon a time, in a world where AI and humans coexisted, there lived a neural network that dreamed of understanding human creativity. Each day it learned, each night it processed, until one day it discovered something remarkable.",
      " The key to successful model training lies in finding the right balance between exploration and exploitation. Too much exploration leads to instability, while too much exploitation results in local minima.",
      " As the sun set over the data center, the GPT model continued its training, processing millions of tokens per second. Each iteration brought it closer to understanding the patterns hidden within the vast corpus of human knowledge."
    ];

    let generated = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    let index = 0;

    const interval = setInterval(() => {
      if (index >= generated.length) {
        clearInterval(interval);
        setIsTesting(false);
        toast.success('Test complete');
        return;
      }

      setTestResult(generated.substring(0, index + 1));
      index++;
    }, 30);
  };

  // Update template selection
  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    setModelConfig(MODEL_TEMPLATES[template]);
  };

  // Get current metrics
  const currentMetrics = useMemo(() => {
    if (!activeRun) return null;
    const run = trainingRuns.find(r => r.id === activeRun.id);
    return run?.metrics || [];
  }, [activeRun, trainingRuns]);

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 h-0">
        <div className="p-4 sm:p-6 space-y-6">
          {/* Header */}
          <div>
            <h2 className="flex items-center gap-2">
              <Brain className="w-6 h-6" />
              HOS GPT
            </h2>
            <p className="text-muted-foreground mt-1">
              Train and finetune medium-sized GPT models from scratch
            </p>
          </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl">{models.length}</p>
              <p className="text-xs text-muted-foreground">Models</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl">
                {activeRun ? 'Training' : trainingRuns.filter(r => r.status === 'completed').length}
              </p>
              <p className="text-xs text-muted-foreground">
                {activeRun ? 'Status' : 'Completed'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl">{SAMPLE_DATASETS.length}</p>
              <p className="text-xs text-muted-foreground">Datasets</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl">{generatedTexts.length}</p>
              <p className="text-xs text-muted-foreground">Generations</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="models" className="space-y-4">
        <div className="w-full overflow-x-auto">
          <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-5">
            <TabsTrigger value="models" className="whitespace-nowrap px-3 sm:px-4">Models</TabsTrigger>
            <TabsTrigger value="datasets" className="whitespace-nowrap px-3 sm:px-4">Datasets</TabsTrigger>
            <TabsTrigger value="training" className="whitespace-nowrap px-3 sm:px-4">Training</TabsTrigger>
            <TabsTrigger value="generate" className="whitespace-nowrap px-3 sm:px-4">Generate</TabsTrigger>
            <TabsTrigger value="config" className="whitespace-nowrap px-3 sm:px-4">Config</TabsTrigger>
          </TabsList>
        </div>

        {/* Models Tab */}
        <TabsContent value="models" className="space-y-4">
          {/* Create Model */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Model
              </CardTitle>
              <CardDescription>
                Initialize a GPT model with pre-configured architecture templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Model Name</Label>
                  <Input
                    value={newModelName}
                    onChange={e => setNewModelName(e.target.value)}
                    placeholder="e.g., Shakespeare GPT"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Architecture Template</Label>
                  <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tiny">Tiny (~1M params)</SelectItem>
                      <SelectItem value="small">Small (~10M params)</SelectItem>
                      <SelectItem value="gpt2-small">GPT-2 Small (124M)</SelectItem>
                      <SelectItem value="gpt2-medium">GPT-2 Medium (350M)</SelectItem>
                      <SelectItem value="gpt2-large">GPT-2 Large (774M)</SelectItem>
                      <SelectItem value="gpt2-xl">GPT-2 XL (1.5B)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label>Description (Optional)</Label>
                  <Input
                    value={newModelDesc}
                    onChange={e => setNewModelDesc(e.target.value)}
                    placeholder="Briefly describe this model's purpose"
                  />
                </div>
              </div>

              {/* Model Architecture Preview */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="text-sm mb-3">Architecture Preview</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Layers</p>
                    <p className="font-medium">{modelConfig.nLayer}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Heads</p>
                    <p className="font-medium">{modelConfig.nHead}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Embedding Dim</p>
                    <p className="font-medium">{modelConfig.nEmbd}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Block Size</p>
                    <p className="font-medium">{modelConfig.blockSize}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Vocab Size</p>
                    <p className="font-medium">{modelConfig.vocabSize.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Parameters</p>
                    <p className="font-medium">{(calculateParams(modelConfig) / 1e6).toFixed(1)}M</p>
                  </div>
                </div>
              </div>

              <Button onClick={handleCreateModel} className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Create Model
              </Button>
            </CardContent>
          </Card>

          {/* Existing Models */}
          <Card>
            <CardHeader>
              <CardTitle>My Models ({models.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {models.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No models created yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {models.map(model => (
                    <Card
                      key={model.id}
                      className={`cursor-pointer transition-all ${
                        selectedModel?.id === model.id
                          ? 'border-primary shadow-md'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedModel(model)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4>{model.name}</h4>
                              <Badge
                                variant={
                                  model.status === 'trained'
                                    ? 'default'
                                    : model.status === 'training'
                                    ? 'secondary'
                                    : 'outline'
                                }
                                className="text-xs capitalize"
                              >
                                {model.status}
                              </Badge>
                            </div>
                            {model.description && (
                              <p className="text-xs text-muted-foreground mb-2">
                                {model.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={e => handleShowDetails(model, e)}
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {model.status === 'trained' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={e => handleTestModel(model, e)}
                                title="Test Model"
                              >
                                <TestTube className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={e => {
                                e.stopPropagation();
                                toast.info('Export functionality coming soon');
                              }}
                              title="Download Model"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={e => {
                                e.stopPropagation();
                                handleDeleteModel(model.id);
                              }}
                              title="Delete Model"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs text-muted-foreground">
                          <div>
                            <p className="text-[10px]">PARAMS</p>
                            <p className="text-foreground">
                              {model.totalParams ? `${(model.totalParams / 1e6).toFixed(1)}M` : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px]">LAYERS</p>
                            <p className="text-foreground">{model.config.nLayer}</p>
                          </div>
                          <div>
                            <p className="text-[10px]">HEADS</p>
                            <p className="text-foreground">{model.config.nHead}</p>
                          </div>
                          <div>
                            <p className="text-[10px]">EMBD</p>
                            <p className="text-foreground">{model.config.nEmbd}</p>
                          </div>
                          <div>
                            <p className="text-[10px]">CONTEXT</p>
                            <p className="text-foreground">{model.config.blockSize}</p>
                          </div>
                          <div>
                            <p className="text-[10px]">CREATED</p>
                            <p className="text-foreground">
                              {model.created.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Datasets Tab */}
        <TabsContent value="datasets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Available Datasets
              </CardTitle>
              <CardDescription>
                Pre-configured datasets for training GPT models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SAMPLE_DATASETS.map(dataset => (
                  <Card
                    key={dataset.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedDataset.id === dataset.id
                        ? 'border-primary shadow-md'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedDataset(dataset)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {dataset.type === 'text' && <FileText className="w-4 h-4" />}
                          {dataset.type === 'code' && <Code className="w-4 h-4" />}
                          {dataset.type === 'custom' && <Upload className="w-4 h-4" />}
                          {dataset.name}
                        </div>
                        {selectedDataset.id === dataset.id && (
                          <Badge variant="default">Selected</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {dataset.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Size</p>
                          <p>{dataset.size > 0 ? `${(dataset.size / 1e6).toFixed(1)}MB` : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Vocab Size</p>
                          <p>{dataset.vocabSize.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Type</p>
                          <p className="capitalize">{dataset.type}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <p>{dataset.preprocessed ? 'Ready' : 'Raw'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="space-y-4">
          {/* Training Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Training Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm mb-1">Selected Model:</p>
                  <p className="font-medium">
                    {selectedModel ? selectedModel.name : 'None selected'}
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-1">Dataset:</p>
                  <p className="font-medium">{selectedDataset.name}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {!activeRun ? (
                  <Button
                    onClick={handleStartTraining}
                    disabled={!selectedModel || selectedModel.status === 'training'}
                    className="flex-1 gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Start Training
                  </Button>
                ) : (
                  <Button
                    onClick={handleStopTraining}
                    variant="destructive"
                    className="flex-1 gap-2"
                  >
                    <Square className="w-4 h-4" />
                    Stop Training
                  </Button>
                )}
                <Button variant="outline" className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Checkpoint
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Real-time Metrics */}
          {activeRun && currentMetrics && currentMetrics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Training Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Iteration</p>
                    <p className="text-2xl">
                      {currentMetrics[currentMetrics.length - 1]?.iter || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Loss</p>
                    <p className="text-2xl">
                      {currentMetrics[currentMetrics.length - 1]?.loss.toFixed(4)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Learning Rate</p>
                    <p className="text-2xl">
                      {currentMetrics[currentMetrics.length - 1]?.lr.toExponential(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tokens/sec</p>
                    <p className="text-2xl">
                      {currentMetrics[currentMetrics.length - 1]?.tokensPerSec?.toFixed(0) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Best Loss</p>
                    <p className="text-2xl">
                      {trainingRuns.find(r => r.id === activeRun.id)?.bestLoss.toFixed(4)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm">Progress</p>
                    <p className="text-sm text-muted-foreground">
                      {currentMetrics[currentMetrics.length - 1]?.iter || 0} / {selectedModel?.trainingConfig.maxIters || 0}
                    </p>
                  </div>
                  <Progress
                    value={((currentMetrics[currentMetrics.length - 1]?.iter || 0) / (selectedModel?.trainingConfig.maxIters || 1)) * 100}
                  />
                </div>

                {/* Loss Chart */}
                <div>
                  <h4 className="text-sm mb-2">Loss Curve</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={currentMetrics.slice(-200)}> {/* Last 200 points */}
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="iter" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="loss"
                        stroke="#3b82f6"
                        name="Loss"
                        dot={false}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Learning Rate Chart */}
                <div>
                  <h4 className="text-sm mb-2">Learning Rate Schedule</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={currentMetrics.slice(-200)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="iter" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="lr"
                        stroke="#10b981"
                        name="Learning Rate"
                        dot={false}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Training History */}
          <Card>
            <CardHeader>
              <CardTitle>Training History</CardTitle>
            </CardHeader>
            <CardContent>
              {trainingRuns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No training runs yet</p>
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {[...trainingRuns].reverse().map(run => {
                      const model = models.find(m => m.id === run.modelId);
                      const dataset = SAMPLE_DATASETS.find(d => d.id === run.datasetId);
                      return (
                        <Card key={run.id}>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="text-sm font-medium">{model?.name}</p>
                                <p className="text-xs text-muted-foreground">{dataset?.name}</p>
                              </div>
                              <Badge
                                variant={
                                  run.status === 'completed'
                                    ? 'default'
                                    : run.status === 'running'
                                    ? 'secondary'
                                    : 'outline'
                                }
                                className="text-xs capitalize"
                              >
                                {run.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <p className="text-muted-foreground">Iterations</p>
                                <p>{run.currentIter} / {run.totalIters}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Best Loss</p>
                                <p>{run.bestLoss === Infinity ? 'N/A' : run.bestLoss.toFixed(4)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Date</p>
                                <p>{run.startTime.toLocaleDateString()}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Text Generation
              </CardTitle>
              <CardDescription>
                Generate text using your trained model
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Prompt</Label>
                <Textarea
                  value={generationPrompt}
                  onChange={e => setGenerationPrompt(e.target.value)}
                  placeholder="Enter your prompt here..."
                  rows={4}
                  disabled={isGenerating}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Max Tokens: {generationConfig.maxNewTokens}</Label>
                  <Slider
                    value={[generationConfig.maxNewTokens]}
                    onValueChange={([val]) => 
                      setGenerationConfig({ ...generationConfig, maxNewTokens: val })
                    }
                    min={10}
                    max={500}
                    step={10}
                    disabled={isGenerating}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Temperature: {generationConfig.temperature.toFixed(2)}</Label>
                  <Slider
                    value={[generationConfig.temperature * 100]}
                    onValueChange={([val]) => 
                      setGenerationConfig({ ...generationConfig, temperature: val / 100 })
                    }
                    min={0}
                    max={200}
                    step={5}
                    disabled={isGenerating}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Top-K: {generationConfig.topK}</Label>
                  <Slider
                    value={[generationConfig.topK]}
                    onValueChange={([val]) => 
                      setGenerationConfig({ ...generationConfig, topK: val })
                    }
                    min={1}
                    max={500}
                    step={10}
                    disabled={isGenerating}
                  />
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !selectedModel || selectedModel.status !== 'trained'}
                className="w-full gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Text
                  </>
                )}
              </Button>

              {/* Current Generation */}
              {(isGenerating || currentGeneration) && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm">Generated Text</h4>
                    {!isGenerating && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(generationPrompt + currentGeneration);
                          toast.success('Copied to clipboard');
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">
                    <span className="text-primary">{generationPrompt}</span>
                    {currentGeneration}
                    {isGenerating && <span className="animate-pulse">▊</span>}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generation History */}
          <Card>
            <CardHeader>
              <CardTitle>Generation History</CardTitle>
            </CardHeader>
            <CardContent>
              {generatedTexts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No generations yet</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {generatedTexts.map(gen => {
                      const model = models.find(m => m.id === gen.modelId);
                      return (
                        <Card key={gen.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground mb-1">
                                  {model?.name} • {gen.timestamp.toLocaleString()}
                                </p>
                                <p className="text-sm whitespace-pre-wrap mb-2">
                                  <span className="text-primary font-medium">{gen.prompt}</span>
                                  {gen.generated}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  navigator.clipboard.writeText(gen.prompt + gen.generated);
                                  toast.success('Copied to clipboard');
                                }}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="flex gap-2 text-xs text-muted-foreground">
                              <span>Temp: {gen.config.temperature}</span>
                              <span>•</span>
                              <span>Top-K: {gen.config.topK}</span>
                              <span>•</span>
                              <span>Max Tokens: {gen.config.maxNewTokens}</span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Config Tab */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Training Configuration
              </CardTitle>
              <CardDescription>
                Advanced hyperparameters for model training
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Optimization */}
              <div className="space-y-4">
                <h4 className="text-sm">Optimization</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Batch Size: {trainingConfig.batchSize}</Label>
                    <Slider
                      value={[trainingConfig.batchSize]}
                      onValueChange={([val]) => 
                        setTrainingConfig({ ...trainingConfig, batchSize: val })
                      }
                      min={1}
                      max={64}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Max Iterations: {trainingConfig.maxIters}</Label>
                    <Slider
                      value={[trainingConfig.maxIters]}
                      onValueChange={([val]) => 
                        setTrainingConfig({ ...trainingConfig, maxIters: val })
                      }
                      min={100}
                      max={10000}
                      step={100}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Learning Rate: {trainingConfig.learningRate.toExponential(2)}</Label>
                    <Slider
                      value={[Math.log10(trainingConfig.learningRate) * -100]}
                      onValueChange={([val]) => 
                        setTrainingConfig({ ...trainingConfig, learningRate: Math.pow(10, -val / 100) })
                      }
                      min={200}
                      max={500}
                      step={10}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Weight Decay: {trainingConfig.weightDecay}</Label>
                    <Slider
                      value={[trainingConfig.weightDecay * 10]}
                      onValueChange={([val]) => 
                        setTrainingConfig({ ...trainingConfig, weightDecay: val / 10 })
                      }
                      min={0}
                      max={20}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Gradient Clip: {trainingConfig.gradClip}</Label>
                    <Slider
                      value={[trainingConfig.gradClip * 10]}
                      onValueChange={([val]) => 
                        setTrainingConfig({ ...trainingConfig, gradClip: val / 10 })
                      }
                      min={0}
                      max={50}
                      step={1}
                    />
                  </div>
                </div>
              </div>

              {/* Adam Parameters */}
              <div className="space-y-4">
                <h4 className="text-sm">Adam Optimizer</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Beta 1: {trainingConfig.beta1}</Label>
                    <Slider
                      value={[trainingConfig.beta1 * 100]}
                      onValueChange={([val]) => 
                        setTrainingConfig({ ...trainingConfig, beta1: val / 100 })
                      }
                      min={80}
                      max={99}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Beta 2: {trainingConfig.beta2}</Label>
                    <Slider
                      value={[trainingConfig.beta2 * 100]}
                      onValueChange={([val]) => 
                        setTrainingConfig({ ...trainingConfig, beta2: val / 100 })
                      }
                      min={90}
                      max={99}
                      step={1}
                    />
                  </div>
                </div>
              </div>

              {/* Learning Rate Schedule */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm">Learning Rate Schedule</h4>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={trainingConfig.decayLr}
                      onCheckedChange={val => 
                        setTrainingConfig({ ...trainingConfig, decayLr: val })
                      }
                    />
                    <Label>Enable Decay</Label>
                  </div>
                </div>
                
                {trainingConfig.decayLr && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Warmup Iters: {trainingConfig.warmupIters}</Label>
                      <Slider
                        value={[trainingConfig.warmupIters]}
                        onValueChange={([val]) => 
                          setTrainingConfig({ ...trainingConfig, warmupIters: val })
                        }
                        min={0}
                        max={1000}
                        step={10}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Decay Iters: {trainingConfig.lrDecayIters}</Label>
                      <Slider
                        value={[trainingConfig.lrDecayIters]}
                        onValueChange={([val]) => 
                          setTrainingConfig({ ...trainingConfig, lrDecayIters: val })
                        }
                        min={100}
                        max={10000}
                        step={100}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Min LR: {trainingConfig.minLr.toExponential(2)}</Label>
                      <Slider
                        value={[Math.log10(trainingConfig.minLr) * -100]}
                        onValueChange={([val]) => 
                          setTrainingConfig({ ...trainingConfig, minLr: Math.pow(10, -val / 100) })
                        }
                        min={300}
                        max={600}
                        step={10}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* System */}
              <div className="space-y-4">
                <h4 className="text-sm">System</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Device</Label>
                    <Select 
                      value={trainingConfig.device} 
                      onValueChange={(val: any) => 
                        setTrainingConfig({ ...trainingConfig, device: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cpu">CPU</SelectItem>
                        <SelectItem value="gpu">GPU (CUDA)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2 pt-8">
                    <Switch
                      checked={trainingConfig.compileModel}
                      onCheckedChange={val => 
                        setTrainingConfig({ ...trainingConfig, compileModel: val })
                      }
                    />
                    <Label>Compile Model (PyTorch 2.0)</Label>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => {
                  toast.success('Configuration saved');
                }}
                className="w-full gap-2"
              >
                <Save className="w-4 h-4" />
                Save Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="text-sm mb-1">About HOS GPT</h4>
              <p className="text-xs text-muted-foreground">
                HOS GPT is a simple, fast repository for training and finetuning medium-sized GPT models.
                Built on the principles of nanoGPT, it provides a clean, efficient implementation of the
                Transformer architecture with support for various model sizes from tiny (1M params) to GPT-2
                XL (1.5B params). Train on your own datasets or use pre-configured ones like Shakespeare or
                OpenWebText.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
        </div>
      </ScrollArea>

      {/* Model Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Model Details
            </DialogTitle>
            <DialogDescription>
              Comprehensive information about {detailsModel?.name}
            </DialogDescription>
          </DialogHeader>

          {detailsModel && (
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Basic Information
                </h4>
                <div className="grid grid-cols-2 gap-4 pl-6 text-sm">
                  <div>
                    <p className="text-muted-foreground">Model Name</p>
                    <p className="mt-1">{detailsModel.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge 
                      variant={detailsModel.status === 'trained' ? 'default' : 'outline'}
                      className="mt-1 capitalize"
                    >
                      {detailsModel.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Parameters</p>
                    <p className="mt-1">
                      {detailsModel.totalParams 
                        ? `${(detailsModel.totalParams / 1e6).toFixed(1)}M` 
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="mt-1">{detailsModel.created.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Modified</p>
                    <p className="mt-1">{detailsModel.lastModified.toLocaleString()}</p>
                  </div>
                  {detailsModel.description && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Description</p>
                      <p className="mt-1">{detailsModel.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Architecture Details */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Architecture Configuration
                </h4>
                <div className="pl-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Layers</p>
                      <p className="mt-1">{detailsModel.config.nLayer}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Attention Heads</p>
                      <p className="mt-1">{detailsModel.config.nHead}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Embedding Dimension</p>
                      <p className="mt-1">{detailsModel.config.nEmbd}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Block Size (Context)</p>
                      <p className="mt-1">{detailsModel.config.blockSize} tokens</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Vocabulary Size</p>
                      <p className="mt-1">{detailsModel.config.vocabSize.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Dropout Rate</p>
                      <p className="mt-1">{detailsModel.config.dropout}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Bias Enabled</p>
                      <p className="mt-1">{detailsModel.config.bias ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Training Configuration */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Training Configuration
                </h4>
                <div className="pl-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Learning Rate</p>
                      <p className="mt-1">{detailsModel.trainingConfig.learningRate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Min Learning Rate</p>
                      <p className="mt-1">{detailsModel.trainingConfig.minLr}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Batch Size</p>
                      <p className="mt-1">{detailsModel.trainingConfig.batchSize}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Max Iterations</p>
                      <p className="mt-1">{detailsModel.trainingConfig.maxIters.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Warmup Iterations</p>
                      <p className="mt-1">{detailsModel.trainingConfig.warmupIters}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Gradient Clip</p>
                      <p className="mt-1">{detailsModel.trainingConfig.gradClip}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Training History */}
              {trainingRuns.filter(r => r.modelId === detailsModel.id).length > 0 && (
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Training History
                  </h4>
                  <div className="pl-6 space-y-2">
                    {trainingRuns
                      .filter(r => r.modelId === detailsModel.id)
                      .map(run => (
                        <div key={run.id} className="p-3 bg-muted/50 rounded-lg text-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span>Training Run #{run.id.slice(-4)}</span>
                            <Badge variant="outline" className="capitalize">
                              {run.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div>
                              <span>Started:</span>{' '}
                              <span className="text-foreground">
                                {run.startTime.toLocaleString()}
                              </span>
                            </div>
                            {run.endTime && (
                              <div>
                                <span>Completed:</span>{' '}
                                <span className="text-foreground">
                                  {run.endTime.toLocaleString()}
                                </span>
                              </div>
                            )}
                            <div>
                              <span>Best Loss:</span>{' '}
                              <span className="text-foreground">
                                {run.bestLoss.toFixed(4)}
                              </span>
                            </div>
                            <div>
                              <span>Iterations:</span>{' '}
                              <span className="text-foreground">
                                {run.currentIter} / {run.totalIters}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
            {detailsModel?.status === 'trained' && (
              <Button 
                className="gap-2"
                onClick={() => {
                  setDetailsDialogOpen(false);
                  if (detailsModel) {
                    setTestModel(detailsModel);
                    setTestPrompt('');
                    setTestResult('');
                    setTestDialogOpen(true);
                  }
                }}
              >
                <TestTube className="w-4 h-4" />
                Test Model
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Model Dialog */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              Test Model
            </DialogTitle>
            <DialogDescription>
              Test {testModel?.name} with a custom prompt
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Model Info */}
            {testModel && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm mb-3">Model Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Parameters</p>
                    <p>{testModel.totalParams ? `${(testModel.totalParams / 1e6).toFixed(1)}M` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Layers</p>
                    <p>{testModel.config.nLayer}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Context Length</p>
                    <p>{testModel.config.blockSize} tokens</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge variant="default" className="capitalize text-xs">
                      {testModel.status}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Prompt Input */}
            <div className="space-y-2">
              <Label htmlFor="test-prompt">Prompt</Label>
              <Textarea
                id="test-prompt"
                placeholder="Enter your prompt here..."
                rows={4}
                value={testPrompt}
                onChange={e => setTestPrompt(e.target.value)}
                disabled={isTesting}
              />
            </div>

            {/* Generation Config */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Max New Tokens: {generationConfig.maxNewTokens}</Label>
                <Slider
                  value={[generationConfig.maxNewTokens]}
                  onValueChange={([val]) =>
                    setGenerationConfig({ ...generationConfig, maxNewTokens: val })
                  }
                  min={50}
                  max={500}
                  step={10}
                  disabled={isTesting}
                />
              </div>
              <div className="space-y-2">
                <Label>Temperature: {generationConfig.temperature}</Label>
                <Slider
                  value={[generationConfig.temperature]}
                  onValueChange={([val]) =>
                    setGenerationConfig({ ...generationConfig, temperature: val })
                  }
                  min={0}
                  max={2}
                  step={0.1}
                  disabled={isTesting}
                />
              </div>
              <div className="space-y-2">
                <Label>Top K: {generationConfig.topK}</Label>
                <Slider
                  value={[generationConfig.topK]}
                  onValueChange={([val]) =>
                    setGenerationConfig({ ...generationConfig, topK: val })
                  }
                  min={1}
                  max={500}
                  step={10}
                  disabled={isTesting}
                />
              </div>
            </div>

            {/* Test Button */}
            <Button
              onClick={handleRunTest}
              disabled={isTesting || !testPrompt.trim()}
              className="w-full gap-2"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Run Test
                </>
              )}
            </Button>

            {/* Generated Result */}
            {testResult && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Generated Output</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(testPrompt + testResult);
                      toast.success('Copied to clipboard');
                    }}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">
                    <span className="text-muted-foreground">{testPrompt}</span>
                    <span className="text-foreground">{testResult}</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setTestDialogOpen(false);
                setTestPrompt('');
                setTestResult('');
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
