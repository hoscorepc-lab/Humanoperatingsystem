import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Network,
  Layers, 
  TrendingUp,
  Activity,
  Play,
  Pause,
  Plus,
  Settings,
  Zap
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Layer {
  id: string;
  name: string;
  type: 'input' | 'hidden' | 'output';
  neurons: number;
  activation: string;
}

interface TrainingMetric {
  epoch: number;
  loss: number;
  accuracy: number;
  valLoss: number;
  valAccuracy: number;
}

export function NeuralNetworkModule() {
  const [isTraining, setIsTraining] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  
  // Sample data
  const [layers] = useState<Layer[]>([
    {
      id: '1',
      name: 'Input Layer',
      type: 'input',
      neurons: 784,
      activation: 'none'
    },
    {
      id: '2',
      name: 'Hidden Layer 1',
      type: 'hidden',
      neurons: 128,
      activation: 'relu'
    },
    {
      id: '3',
      name: 'Hidden Layer 2',
      type: 'hidden',
      neurons: 64,
      activation: 'relu'
    },
    {
      id: '4',
      name: 'Output Layer',
      type: 'output',
      neurons: 10,
      activation: 'softmax'
    }
  ]);

  const [trainingMetrics] = useState<TrainingMetric[]>([
    { epoch: 1, loss: 0.45, accuracy: 0.85, valLoss: 0.50, valAccuracy: 0.82 },
    { epoch: 2, loss: 0.32, accuracy: 0.91, valLoss: 0.38, valAccuracy: 0.88 },
    { epoch: 3, loss: 0.25, accuracy: 0.94, valLoss: 0.30, valAccuracy: 0.92 },
    { epoch: 4, loss: 0.18, accuracy: 0.96, valLoss: 0.25, valAccuracy: 0.94 },
    { epoch: 5, loss: 0.12, accuracy: 0.98, valLoss: 0.20, valAccuracy: 0.96 }
  ]);

  const toggleTraining = () => {
    setIsTraining(!isTraining);
    toast.success(isTraining ? 'Training paused' : 'Training started');
  };

  const totalParams = layers.reduce((sum, layer) => sum + layer.neurons, 0);
  const latestMetric = trainingMetrics[trainingMetrics.length - 1];

  return (
    <div className="h-full flex flex-col bg-background">
      <ScrollArea className="flex-1 h-0">
        <div className="p-4 space-y-4 max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Network className="w-6 h-6 text-primary" />
              <h1 className="text-2xl">Neural Network</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Deep learning architecture with real-time training
            </p>
          </div>

          {/* Quick Stats - Mobile Optimized */}
          <div className="grid grid-cols-2 gap-2">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <Layers className="w-5 h-5 text-primary mb-2" />
                  <div className="text-2xl">{layers.length}</div>
                  <div className="text-xs text-muted-foreground">Layers</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <Network className="w-5 h-5 text-primary mb-2" />
                  <div className="text-2xl">{(totalParams / 1000).toFixed(1)}k</div>
                  <div className="text-xs text-muted-foreground">Params</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <TrendingUp className="w-5 h-5 text-primary mb-2" />
                  <div className="text-2xl">
                    {latestMetric ? `${(latestMetric.accuracy * 100).toFixed(1)}%` : '0%'}
                  </div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <Activity className="w-5 h-5 text-primary mb-2" />
                  <Badge variant={isTraining ? "default" : "secondary"}>
                    {isTraining ? 'Training' : 'Idle'}
                  </Badge>
                  <div className="text-xs text-muted-foreground">Status</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Control Panel */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Training Control</span>
                <Button 
                  size="sm" 
                  onClick={toggleTraining}
                  variant={isTraining ? "destructive" : "default"}
                >
                  {isTraining ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Train
                    </>
                  )}
                </Button>
              </div>

              {isTraining && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Epoch {currentEpoch}/100</span>
                    <span>{currentEpoch}%</span>
                  </div>
                  <Progress value={currentEpoch} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Network Architecture */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg">Architecture</h2>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {layers.map((layer, index) => (
                <Card key={layer.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm truncate">{layer.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={
                              layer.type === 'input' ? 'default' :
                              layer.type === 'output' ? 'secondary' : 'outline'
                            } className="text-xs">
                              {layer.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {layer.activation}
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg">{layer.neurons}</div>
                          <div className="text-xs text-muted-foreground">neurons</div>
                        </div>
                      </div>
                      
                      {index < layers.length - 1 && (
                        <div className="flex items-center justify-center">
                          <div className="h-8 w-px bg-border" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Training Metrics */}
          <div className="space-y-2">
            <h2 className="text-lg">Training History</h2>
            <div className="space-y-2">
              {trainingMetrics.slice().reverse().map(metric => (
                <Card key={metric.epoch}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Epoch {metric.epoch}</span>
                        <Badge variant="outline" className="text-xs">
                          {(metric.accuracy * 100).toFixed(1)}%
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="text-muted-foreground mb-1">Loss</div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div 
                                className="bg-red-500 h-2 rounded-full"
                                style={{ width: `${(1 - metric.loss) * 100}%` }}
                              />
                            </div>
                            <span>{metric.loss.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-muted-foreground mb-1">Val Loss</div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div 
                                className="bg-orange-500 h-2 rounded-full"
                                style={{ width: `${(1 - metric.valLoss) * 100}%` }}
                              />
                            </div>
                            <span>{metric.valLoss.toFixed(2)}</span>
                          </div>
                        </div>

                        <div>
                          <div className="text-muted-foreground mb-1">Accuracy</div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${metric.accuracy * 100}%` }}
                              />
                            </div>
                            <span>{(metric.accuracy * 100).toFixed(1)}%</span>
                          </div>
                        </div>

                        <div>
                          <div className="text-muted-foreground mb-1">Val Acc</div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${metric.valAccuracy * 100}%` }}
                              />
                            </div>
                            <span>{(metric.valAccuracy * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="w-full">
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
            <Button variant="outline" className="w-full">
              <Zap className="w-4 h-4 mr-2" />
              Optimize
            </Button>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
}
