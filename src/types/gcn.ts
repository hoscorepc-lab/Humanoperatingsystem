export interface GraphNode {
  id: string;
  label: string;
  features: number[];
  class?: number;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight?: number;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  name: string;
  numClasses: number;
  numFeatures: number;
}

export interface GCNLayer {
  type: 'gcn' | 'graphsage' | 'gat' | 'gin';
  inputDim: number;
  outputDim: number;
  activation?: 'relu' | 'tanh' | 'sigmoid' | 'none';
  dropout?: number;
  heads?: number; // For GAT
}

export interface GCNModel {
  id: string;
  name: string;
  architecture: GCNLayer[];
  learningRate: number;
  epochs: number;
  optimizer: 'adam' | 'sgd' | 'rmsprop';
  created: Date;
  status: 'untrained' | 'training' | 'trained' | 'error';
}

export interface TrainingMetrics {
  epoch: number;
  trainLoss: number;
  trainAccuracy: number;
  valLoss: number;
  valAccuracy: number;
  testAccuracy?: number;
  timestamp: Date;
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  numNodes: number;
  numEdges: number;
  numClasses: number;
  numFeatures: number;
  type: 'citation' | 'social' | 'knowledge' | 'custom';
  graph?: Graph;
}

export interface TrainingSession {
  id: string;
  modelId: string;
  datasetId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'stopped' | 'error';
  metrics: TrainingMetrics[];
  finalAccuracy?: number;
}
