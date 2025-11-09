import { useState, useEffect, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Progress } from '../ui/progress';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { 
  Network,
  Play,
  Square,
  Plus,
  Trash2,
  Download,
  Upload,
  Zap,
  Brain,
  Activity,
  TrendingUp,
  Layers,
  GitBranch,
  Database,
  Settings,
  BarChart3,
  Eye,
  Info,
  TestTube,
  RefreshCw,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { Dataset, GCNModel, GCNLayer, TrainingSession, TrainingMetrics } from '../../types/gcn';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Pre-defined datasets
const DATASETS: Dataset[] = [
  {
    id: 'cora',
    name: 'Cora',
    description: 'Citation network of machine learning papers',
    numNodes: 2708,
    numEdges: 5429,
    numClasses: 7,
    numFeatures: 1433,
    type: 'citation'
  },
  {
    id: 'citeseer',
    name: 'CiteSeer',
    description: 'Citation network of scientific publications',
    numNodes: 3327,
    numEdges: 4732,
    numClasses: 6,
    numFeatures: 3703,
    type: 'citation'
  },
  {
    id: 'pubmed',
    name: 'PubMed',
    description: 'Citation network of diabetes-related papers',
    numNodes: 19717,
    numEdges: 44338,
    numClasses: 3,
    numFeatures: 500,
    type: 'citation'
  },
  {
    id: 'karate',
    name: 'Karate Club',
    description: 'Social network of a karate club',
    numNodes: 34,
    numEdges: 78,
    numClasses: 2,
    numFeatures: 34,
    type: 'social'
  },
  {
    id: 'reddit',
    name: 'Reddit',
    description: 'Large-scale social network from Reddit',
    numNodes: 232965,
    numEdges: 11606919,
    numClasses: 41,
    numFeatures: 602,
    type: 'social'
  }
];

// Model architecture templates
const ARCHITECTURES = {
  'Simple GCN': [
    { type: 'gcn' as const, inputDim: 1433, outputDim: 16, activation: 'relu' as const, dropout: 0.5 },
    { type: 'gcn' as const, inputDim: 16, outputDim: 7, activation: 'none' as const }
  ],
  'Deep GCN': [
    { type: 'gcn' as const, inputDim: 1433, outputDim: 128, activation: 'relu' as const, dropout: 0.5 },
    { type: 'gcn' as const, inputDim: 128, outputDim: 64, activation: 'relu' as const, dropout: 0.5 },
    { type: 'gcn' as const, inputDim: 64, outputDim: 32, activation: 'relu' as const, dropout: 0.3 },
    { type: 'gcn' as const, inputDim: 32, outputDim: 7, activation: 'none' as const }
  ],
  'GraphSAGE': [
    { type: 'graphsage' as const, inputDim: 1433, outputDim: 128, activation: 'relu' as const, dropout: 0.5 },
    { type: 'graphsage' as const, inputDim: 128, outputDim: 7, activation: 'none' as const }
  ],
  'GAT': [
    { type: 'gat' as const, inputDim: 1433, outputDim: 64, activation: 'relu' as const, dropout: 0.6, heads: 8 },
    { type: 'gat' as const, inputDim: 512, outputDim: 7, activation: 'none' as const, heads: 1 }
  ],
  'GIN': [
    { type: 'gin' as const, inputDim: 1433, outputDim: 128, activation: 'relu' as const, dropout: 0.5 },
    { type: 'gin' as const, inputDim: 128, outputDim: 64, activation: 'relu' as const, dropout: 0.5 },
    { type: 'gin' as const, inputDim: 64, outputDim: 7, activation: 'none' as const }
  ]
};

export function HOSGraphConvolutionalNetworksModule() {
  const [selectedDataset, setSelectedDataset] = useState<Dataset>(DATASETS[0]);
  const [models, setModels] = useState<GCNModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<GCNModel | null>(null);
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [activeSession, setActiveSession] = useState<TrainingSession | null>(null);
  
  // Model creation state
  const [newModelName, setNewModelName] = useState('');
  const [selectedArchitecture, setSelectedArchitecture] = useState<string>('Simple GCN');
  const [learningRate, setLearningRate] = useState(0.01);
  const [epochs, setEpochs] = useState(200);
  const [optimizer, setOptimizer] = useState<'adam' | 'sgd' | 'rmsprop'>('adam');

  // Visualization state
  const [showVisualization, setShowVisualization] = useState(false);
  
  // Details and Test dialogs
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [detailsModel, setDetailsModel] = useState<GCNModel | null>(null);
  const [testModel, setTestModel] = useState<GCNModel | null>(null);
  const [testNumNodes, setTestNumNodes] = useState(100);
  const [testResult, setTestResult] = useState<{
    accuracy: number;
    f1Score: number;
    precision: number;
    recall: number;
    confusionMatrix: number[][];
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Create a new model
  const handleCreateModel = () => {
    if (!newModelName.trim()) {
      toast.error('Please enter a model name');
      return;
    }

    const architecture = ARCHITECTURES[selectedArchitecture as keyof typeof ARCHITECTURES];
    
    // Update input/output dimensions based on dataset
    const updatedArchitecture = architecture.map((layer, idx) => ({
      ...layer,
      inputDim: idx === 0 ? selectedDataset.numFeatures : layer.inputDim,
      outputDim: idx === architecture.length - 1 ? selectedDataset.numClasses : layer.outputDim
    }));

    const newModel: GCNModel = {
      id: Date.now().toString(),
      name: newModelName,
      architecture: updatedArchitecture,
      learningRate,
      epochs,
      optimizer,
      created: new Date(),
      status: 'untrained'
    };

    setModels([...models, newModel]);
    setSelectedModel(newModel);
    setNewModelName('');
    toast.success(`Model "${newModelName}" created successfully`);
  };

  // Start training
  const handleStartTraining = () => {
    if (!selectedModel) {
      toast.error('Please select a model first');
      return;
    }

    const session: TrainingSession = {
      id: Date.now().toString(),
      modelId: selectedModel.id,
      datasetId: selectedDataset.id,
      startTime: new Date(),
      status: 'running',
      metrics: []
    };

    setTrainingSessions([...trainingSessions, session]);
    setActiveSession(session);
    
    // Update model status
    setModels(models.map(m => 
      m.id === selectedModel.id ? { ...m, status: 'training' } : m
    ));

    // Simulate training
    simulateTraining(session);
    toast.success('Training started');
  };

  // Simulate training process
  const simulateTraining = (session: TrainingSession) => {
    let currentEpoch = 0;
    const totalEpochs = selectedModel?.epochs || 200;

    const interval = setInterval(() => {
      if (currentEpoch >= totalEpochs) {
        clearInterval(interval);
        
        // Update session status
        setTrainingSessions(sessions =>
          sessions.map(s =>
            s.id === session.id
              ? {
                  ...s,
                  status: 'completed',
                  endTime: new Date(),
                  finalAccuracy: 0.85 + Math.random() * 0.1
                }
              : s
          )
        );
        
        // Update model status
        setModels(models =>
          models.map(m =>
            m.id === session.modelId ? { ...m, status: 'trained' } : m
          )
        );
        
        setActiveSession(null);
        toast.success('Training completed successfully');
        return;
      }

      const metric: TrainingMetrics = {
        epoch: currentEpoch,
        trainLoss: 2.0 * Math.exp(-currentEpoch / 50) + Math.random() * 0.1,
        trainAccuracy: Math.min(0.95, 0.3 + (currentEpoch / totalEpochs) * 0.6 + Math.random() * 0.05),
        valLoss: 2.2 * Math.exp(-currentEpoch / 50) + Math.random() * 0.15,
        valAccuracy: Math.min(0.90, 0.25 + (currentEpoch / totalEpochs) * 0.55 + Math.random() * 0.05),
        timestamp: new Date()
      };

      setTrainingSessions(sessions =>
        sessions.map(s =>
          s.id === session.id
            ? { ...s, metrics: [...s.metrics, metric] }
            : s
        )
      );

      currentEpoch++;
    }, 100); // Update every 100ms for demo
  };

  // Stop training
  const handleStopTraining = () => {
    if (!activeSession) return;

    setTrainingSessions(sessions =>
      sessions.map(s =>
        s.id === activeSession.id
          ? { ...s, status: 'stopped', endTime: new Date() }
          : s
      )
    );

    if (selectedModel) {
      setModels(models =>
        models.map(m =>
          m.id === selectedModel.id ? { ...m, status: 'untrained' } : m
        )
      );
    }

    setActiveSession(null);
    toast.info('Training stopped');
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
  const handleShowDetails = (model: GCNModel, e: React.MouseEvent) => {
    e.stopPropagation();
    setDetailsModel(model);
    setDetailsDialogOpen(true);
  };

  // Test model
  const handleTestModel = (model: GCNModel, e: React.MouseEvent) => {
    e.stopPropagation();
    if (model.status !== 'trained') {
      toast.error('Model must be trained before testing');
      return;
    }
    setTestModel(model);
    setTestResult(null);
    setTestDialogOpen(true);
  };

  // Run test
  const handleRunTest = () => {
    if (!testModel) {
      toast.error('No model selected');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    // Simulate testing with realistic metrics
    setTimeout(() => {
      const baseAccuracy = 0.75 + Math.random() * 0.2;
      const numClasses = selectedDataset.numClasses;
      
      // Generate confusion matrix
      const confusionMatrix: number[][] = [];
      for (let i = 0; i < numClasses; i++) {
        confusionMatrix[i] = [];
        for (let j = 0; j < numClasses; j++) {
          if (i === j) {
            confusionMatrix[i][j] = Math.floor(testNumNodes / numClasses * baseAccuracy);
          } else {
            confusionMatrix[i][j] = Math.floor(testNumNodes / numClasses * (1 - baseAccuracy) / (numClasses - 1));
          }
        }
      }

      setTestResult({
        accuracy: baseAccuracy,
        f1Score: baseAccuracy - 0.02 + Math.random() * 0.04,
        precision: baseAccuracy - 0.01 + Math.random() * 0.03,
        recall: baseAccuracy - 0.01 + Math.random() * 0.03,
        confusionMatrix
      });
      
      setIsTesting(false);
      toast.success('Test completed successfully');
    }, 2000);
  };

  // Get current training metrics
  const currentMetrics = useMemo(() => {
    if (!activeSession) return null;
    const session = trainingSessions.find(s => s.id === activeSession.id);
    return session?.metrics || [];
  }, [activeSession, trainingSessions]);

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 h-0">
        <div className="p-4 sm:p-6 space-y-6">
          {/* Header */}
          <div>
            <h2 className="flex items-center gap-2">
              <Network className="w-6 h-6" />
              HOS Graph Convolutional Networks
            </h2>
            <p className="text-muted-foreground mt-1">
          Advanced graph neural network research and experimentation
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl">{DATASETS.length}</p>
              <p className="text-xs text-muted-foreground">Datasets</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-600" />
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
              <p className="text-2xl">{trainingSessions.filter(s => s.status === 'completed').length}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl">
                {activeSession ? 'Training' : models.filter(m => m.status === 'trained').length}
              </p>
              <p className="text-xs text-muted-foreground">
                {activeSession ? 'Status' : 'Trained'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="datasets" className="space-y-4">
        <div className="w-full overflow-x-auto">
          <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-4">
            <TabsTrigger value="datasets" className="whitespace-nowrap px-3 sm:px-4">Datasets</TabsTrigger>
            <TabsTrigger value="models" className="whitespace-nowrap px-3 sm:px-4">Models</TabsTrigger>
            <TabsTrigger value="training" className="whitespace-nowrap px-3 sm:px-4">Training</TabsTrigger>
            <TabsTrigger value="visualization" className="whitespace-nowrap px-3 sm:px-4">
              <span className="hidden sm:inline">Visualization</span>
              <span className="sm:hidden">Visual</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Datasets Tab */}
        <TabsContent value="datasets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Available Datasets
              </CardTitle>
              <CardDescription>
                Pre-loaded graph datasets for node classification and link prediction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DATASETS.map(dataset => (
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
                        {dataset.name}
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
                        <div className="flex items-center gap-1">
                          <Network className="w-3 h-3 text-muted-foreground" />
                          <span>{dataset.numNodes.toLocaleString()} nodes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GitBranch className="w-3 h-3 text-muted-foreground" />
                          <span>{dataset.numEdges.toLocaleString()} edges</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Layers className="w-3 h-3 text-muted-foreground" />
                          <span>{dataset.numClasses} classes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-muted-foreground" />
                          <span>{dataset.numFeatures} features</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {dataset.type}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
                Build a graph neural network for {selectedDataset.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm">Model Name</label>
                  <Input
                    value={newModelName}
                    onChange={e => setNewModelName(e.target.value)}
                    placeholder="e.g., My GCN Model"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Architecture</label>
                  <Select value={selectedArchitecture} onValueChange={setSelectedArchitecture}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(ARCHITECTURES).map(arch => (
                        <SelectItem key={arch} value={arch}>
                          {arch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Learning Rate: {learningRate}</label>
                  <Slider
                    value={[learningRate * 1000]}
                    onValueChange={([val]) => setLearningRate(val / 1000)}
                    min={1}
                    max={100}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Epochs: {epochs}</label>
                  <Slider
                    value={[epochs]}
                    onValueChange={([val]) => setEpochs(val)}
                    min={50}
                    max={500}
                    step={10}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Optimizer</label>
                  <Select value={optimizer} onValueChange={(val: any) => setOptimizer(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adam">Adam</SelectItem>
                      <SelectItem value="sgd">SGD</SelectItem>
                      <SelectItem value="rmsprop">RMSprop</SelectItem>
                    </SelectContent>
                  </Select>
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
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
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
                                handleDeleteModel(model.id);
                              }}
                              title="Delete Model"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                          <div>Layers: {model.architecture.length}</div>
                          <div>LR: {model.learningRate}</div>
                          <div>Epochs: {model.epochs}</div>
                          <div className="capitalize">Optimizer: {model.optimizer}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
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
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm mb-1">Selected Model:</p>
                  <p className="font-medium">
                    {selectedModel ? selectedModel.name : 'None selected'}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-sm mb-1">Dataset:</p>
                  <p className="font-medium">{selectedDataset.name}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {!activeSession ? (
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
              </div>
            </CardContent>
          </Card>

          {/* Real-time Metrics */}
          {activeSession && currentMetrics && currentMetrics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Training Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Epoch</p>
                    <p className="text-2xl">
                      {currentMetrics[currentMetrics.length - 1]?.epoch || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Train Loss</p>
                    <p className="text-2xl">
                      {currentMetrics[currentMetrics.length - 1]?.trainLoss.toFixed(4)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Train Acc</p>
                    <p className="text-2xl">
                      {(currentMetrics[currentMetrics.length - 1]?.trainAccuracy * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Val Acc</p>
                    <p className="text-2xl">
                      {(currentMetrics[currentMetrics.length - 1]?.valAccuracy * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm">Progress</p>
                    <p className="text-sm text-muted-foreground">
                      {currentMetrics[currentMetrics.length - 1]?.epoch || 0} / {selectedModel?.epochs || 0}
                    </p>
                  </div>
                  <Progress
                    value={((currentMetrics[currentMetrics.length - 1]?.epoch || 0) / (selectedModel?.epochs || 1)) * 100}
                  />
                </div>

                {/* Charts */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm mb-2">Loss Over Time</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={currentMetrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="epoch" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="trainLoss"
                          stroke="#3b82f6"
                          name="Train Loss"
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="valLoss"
                          stroke="#ef4444"
                          name="Val Loss"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h4 className="text-sm mb-2">Accuracy Over Time</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={currentMetrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="epoch" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="trainAccuracy"
                          stroke="#10b981"
                          name="Train Accuracy"
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="valAccuracy"
                          stroke="#f59e0b"
                          name="Val Accuracy"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
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
              {trainingSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No training sessions yet</p>
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {trainingSessions.reverse().map(session => {
                      const model = models.find(m => m.id === session.modelId);
                      const dataset = DATASETS.find(d => d.id === session.datasetId);
                      return (
                        <Card key={session.id}>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="text-sm font-medium">{model?.name}</p>
                                <p className="text-xs text-muted-foreground">{dataset?.name}</p>
                              </div>
                              <Badge
                                variant={
                                  session.status === 'completed'
                                    ? 'default'
                                    : session.status === 'running'
                                    ? 'secondary'
                                    : 'outline'
                                }
                                className="text-xs capitalize"
                              >
                                {session.status}
                              </Badge>
                            </div>
                            {session.finalAccuracy && (
                              <p className="text-xs">
                                Final Accuracy: {(session.finalAccuracy * 100).toFixed(2)}%
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {session.startTime.toLocaleString()}
                            </p>
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

        {/* Visualization Tab */}
        <TabsContent value="visualization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Graph Visualization
              </CardTitle>
              <CardDescription>
                Interactive visualization of graph structure and node embeddings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-8 text-center">
                <Network className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  Graph visualization for {selectedDataset.name}
                </p>
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-sm">
                  <div className="bg-background rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Nodes</p>
                    <p className="text-lg">{selectedDataset.numNodes.toLocaleString()}</p>
                  </div>
                  <div className="bg-background rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Edges</p>
                    <p className="text-lg">{selectedDataset.numEdges.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 gap-2">
                  <Eye className="w-4 h-4" />
                  View Graph Structure
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <Download className="w-4 h-4" />
                  Export Embeddings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Architecture Visualization */}
          {selectedModel && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Model Architecture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedModel.architecture.map((layer, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                        {idx + 1}
                      </div>
                      <div className="flex-1 bg-muted rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium uppercase">{layer.type}</p>
                            <p className="text-xs text-muted-foreground">
                              {layer.inputDim} → {layer.outputDim}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {layer.activation && layer.activation !== 'none' && (
                              <Badge variant="outline" className="text-xs">
                                {layer.activation}
                              </Badge>
                            )}
                            {layer.dropout && (
                              <Badge variant="outline" className="text-xs">
                                Dropout: {layer.dropout}
                              </Badge>
                            )}
                            {layer.heads && (
                              <Badge variant="outline" className="text-xs">
                                Heads: {layer.heads}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="text-sm mb-1">About Graph Convolutional Networks</h4>
              <p className="text-xs text-muted-foreground">
                Graph Convolutional Networks (GCNs) are neural networks that operate directly on graph
                structures, learning node representations by aggregating information from neighboring
                nodes. This module supports various architectures including GCN, GraphSAGE, GAT, and GIN
                for tasks like node classification, link prediction, and graph clustering.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
        </div>
      </ScrollArea>

      {/* Model Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                    <p className="text-muted-foreground">Created</p>
                    <p className="mt-1">{detailsModel.created.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Number of Layers</p>
                    <p className="mt-1">{detailsModel.architecture.length}</p>
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
                      <p className="mt-1">{detailsModel.learningRate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Epochs</p>
                      <p className="mt-1">{detailsModel.epochs}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Optimizer</p>
                      <p className="mt-1 capitalize">{detailsModel.optimizer}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Architecture Details */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Architecture Layers
                </h4>
                <div className="pl-6 space-y-3">
                  {detailsModel.architecture.map((layer, idx) => (
                    <div key={idx} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium">Layer {idx + 1}</h5>
                        <Badge variant="outline" className="uppercase">
                          {layer.type}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Input Dim</p>
                          <p>{layer.inputDim}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Output Dim</p>
                          <p>{layer.outputDim}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Activation</p>
                          <p className="capitalize">{layer.activation || 'none'}</p>
                        </div>
                        {layer.dropout !== undefined && (
                          <div>
                            <p className="text-muted-foreground text-xs">Dropout</p>
                            <p>{layer.dropout}</p>
                          </div>
                        )}
                        {layer.heads !== undefined && (
                          <div>
                            <p className="text-muted-foreground text-xs">Attention Heads</p>
                            <p>{layer.heads}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Training History */}
              {trainingSessions.filter(s => s.modelId === detailsModel.id).length > 0 && (
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Training History
                  </h4>
                  <div className="pl-6 space-y-2">
                    {trainingSessions
                      .filter(s => s.modelId === detailsModel.id)
                      .map(session => {
                        const dataset = DATASETS.find(d => d.id === session.datasetId);
                        return (
                          <div key={session.id} className="p-3 bg-muted/50 rounded-lg text-sm">
                            <div className="flex items-center justify-between mb-2">
                              <span>Training on {dataset?.name}</span>
                              <Badge variant="outline" className="capitalize">
                                {session.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                              <div>
                                <span>Started:</span>{' '}
                                <span className="text-foreground">
                                  {session.startTime.toLocaleString()}
                                </span>
                              </div>
                              {session.endTime && (
                                <div>
                                  <span>Completed:</span>{' '}
                                  <span className="text-foreground">
                                    {session.endTime.toLocaleString()}
                                  </span>
                                </div>
                              )}
                              {session.finalAccuracy !== undefined && (
                                <div>
                                  <span>Final Accuracy:</span>{' '}
                                  <span className="text-foreground">
                                    {(session.finalAccuracy * 100).toFixed(2)}%
                                  </span>
                                </div>
                              )}
                              <div>
                                <span>Epochs Trained:</span>{' '}
                                <span className="text-foreground">
                                  {session.metrics.length}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Parameter Count */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Model Statistics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Layers</p>
                    <p className="text-lg mt-1">{detailsModel.architecture.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Input Features</p>
                    <p className="text-lg mt-1">{detailsModel.architecture[0]?.inputDim}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Output Classes</p>
                    <p className="text-lg mt-1">
                      {detailsModel.architecture[detailsModel.architecture.length - 1]?.outputDim}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Training Sessions</p>
                    <p className="text-lg mt-1">
                      {trainingSessions.filter(s => s.modelId === detailsModel.id).length}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Completed Runs</p>
                    <p className="text-lg mt-1">
                      {trainingSessions.filter(s => s.modelId === detailsModel.id && s.status === 'completed').length}
                    </p>
                  </div>
                  {trainingSessions.find(s => s.modelId === detailsModel.id && s.finalAccuracy)?.finalAccuracy && (
                    <div>
                      <p className="text-muted-foreground">Best Accuracy</p>
                      <p className="text-lg mt-1">
                        {Math.max(...trainingSessions
                          .filter(s => s.modelId === detailsModel.id && s.finalAccuracy)
                          .map(s => s.finalAccuracy!) * 100
                        ).toFixed(2)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
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
                    setTestResult(null);
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              Test Model
            </DialogTitle>
            <DialogDescription>
              Evaluate {testModel?.name} on test data
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Model Info */}
            {testModel && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm mb-3">Model Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Layers</p>
                    <p>{testModel.architecture.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Learning Rate</p>
                    <p>{testModel.learningRate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Optimizer</p>
                    <p className="capitalize">{testModel.optimizer}</p>
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

            {/* Test Configuration */}
            <div className="space-y-4">
              <h4 className="text-sm">Test Configuration</h4>
              <div className="space-y-2">
                <Label>Number of Test Nodes: {testNumNodes}</Label>
                <Slider
                  value={[testNumNodes]}
                  onValueChange={([val]) => setTestNumNodes(val)}
                  min={10}
                  max={1000}
                  step={10}
                  disabled={isTesting}
                />
              </div>
              <div className="p-3 bg-muted/30 rounded-lg text-xs">
                <p className="text-muted-foreground">
                  Dataset: <span className="text-foreground font-medium">{selectedDataset.name}</span>
                </p>
                <p className="text-muted-foreground mt-1">
                  Classes: <span className="text-foreground font-medium">{selectedDataset.numClasses}</span>
                </p>
              </div>
            </div>

            {/* Test Button */}
            <Button
              onClick={handleRunTest}
              disabled={isTesting}
              className="w-full gap-2"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  Run Test
                </>
              )}
            </Button>

            {/* Test Results */}
            {testResult && (
              <div className="space-y-4">
                <h4 className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Test Results
                </h4>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Accuracy</p>
                      <p className="text-2xl">{(testResult.accuracy * 100).toFixed(2)}%</p>
                      <Progress value={testResult.accuracy * 100} className="mt-2" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">F1 Score</p>
                      <p className="text-2xl">{(testResult.f1Score * 100).toFixed(2)}%</p>
                      <Progress value={testResult.f1Score * 100} className="mt-2" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Precision</p>
                      <p className="text-2xl">{(testResult.precision * 100).toFixed(2)}%</p>
                      <Progress value={testResult.precision * 100} className="mt-2" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Recall</p>
                      <p className="text-2xl">{(testResult.recall * 100).toFixed(2)}%</p>
                      <Progress value={testResult.recall * 100} className="mt-2" />
                    </CardContent>
                  </Card>
                </div>

                {/* Confusion Matrix */}
                <div className="space-y-2">
                  <h5 className="text-sm">Confusion Matrix</h5>
                  <div className="overflow-x-auto">
                    <div className="inline-block min-w-full">
                      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${testResult.confusionMatrix.length + 1}, minmax(0, 1fr))` }}>
                        <div className="p-2"></div>
                        {testResult.confusionMatrix.map((_, idx) => (
                          <div key={idx} className="p-2 text-center text-xs font-medium bg-muted/50 rounded">
                            Class {idx}
                          </div>
                        ))}
                        {testResult.confusionMatrix.map((row, rowIdx) => (
                          <>
                            <div key={`label-${rowIdx}`} className="p-2 text-xs font-medium bg-muted/50 rounded flex items-center justify-center">
                              Class {rowIdx}
                            </div>
                            {row.map((val, colIdx) => (
                              <div
                                key={`${rowIdx}-${colIdx}`}
                                className="p-2 text-center text-xs rounded"
                                style={{
                                  backgroundColor: rowIdx === colIdx 
                                    ? `rgba(34, 197, 94, ${val / Math.max(...row)})` 
                                    : `rgba(239, 68, 68, ${val / Math.max(...row)})`
                                }}
                              >
                                {val}
                              </div>
                            ))}
                          </>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Green diagonal indicates correct predictions, red off-diagonal indicates misclassifications
                  </p>
                </div>

                {/* Summary */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h5 className="text-sm mb-2">Test Summary</h5>
                  <div className="space-y-1 text-xs">
                    <p className="text-muted-foreground">
                      The model achieved an overall accuracy of{' '}
                      <span className="text-foreground font-medium">{(testResult.accuracy * 100).toFixed(2)}%</span>
                      {' '}on {testNumNodes} test nodes from the {selectedDataset.name} dataset.
                    </p>
                    <p className="text-muted-foreground">
                      With an F1 score of{' '}
                      <span className="text-foreground font-medium">{(testResult.f1Score * 100).toFixed(2)}%</span>,
                      the model demonstrates{' '}
                      {testResult.f1Score > 0.8 ? 'excellent' : testResult.f1Score > 0.6 ? 'good' : 'moderate'}
                      {' '}performance in balancing precision and recall across all classes.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setTestDialogOpen(false);
                setTestResult(null);
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
