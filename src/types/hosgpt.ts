export interface GPTConfig {
  // Model architecture
  blockSize: number; // context length
  vocabSize: number; // vocab size
  nLayer: number; // number of layers
  nHead: number; // number of heads
  nEmbd: number; // embedding dimension
  dropout: number; // dropout rate
  bias: boolean; // use bias in linear layers
}

export interface TrainingConfig {
  // Training hyperparameters
  batchSize: number;
  learningRate: number;
  maxIters: number;
  weightDecay: number;
  beta1: number;
  beta2: number;
  gradClip: number;
  // Learning rate decay
  decayLr: boolean;
  warmupIters: number;
  lrDecayIters: number;
  minLr: number;
  // System
  device: 'cpu' | 'gpu';
  compileModel: boolean;
}

export interface GPTModel {
  id: string;
  name: string;
  description: string;
  config: GPTConfig;
  trainingConfig: TrainingConfig;
  created: Date;
  lastModified: Date;
  status: 'untrained' | 'training' | 'trained' | 'error';
  totalParams?: number;
  checkpointPath?: string;
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'code' | 'custom';
  size: number; // in characters
  vocabSize: number;
  source?: string;
  preprocessed: boolean;
}

export interface TrainingMetrics {
  iter: number;
  loss: number;
  lr: number;
  tokensPerSec?: number;
  timestamp: Date;
}

export interface TrainingRun {
  id: string;
  modelId: string;
  datasetId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'paused' | 'error';
  currentIter: number;
  totalIters: number;
  metrics: TrainingMetrics[];
  bestLoss: number;
  error?: string;
}

export interface GenerationConfig {
  prompt: string;
  maxNewTokens: number;
  temperature: number;
  topK: number;
  seed?: number;
}

export interface GeneratedText {
  id: string;
  modelId: string;
  prompt: string;
  generated: string;
  config: GenerationConfig;
  timestamp: Date;
}

// Pre-configured model templates
export const MODEL_TEMPLATES: Record<string, GPTConfig> = {
  'gpt2-small': {
    blockSize: 1024,
    vocabSize: 50257,
    nLayer: 12,
    nHead: 12,
    nEmbd: 768,
    dropout: 0.0,
    bias: true
  },
  'gpt2-medium': {
    blockSize: 1024,
    vocabSize: 50257,
    nLayer: 24,
    nHead: 16,
    nEmbd: 1024,
    dropout: 0.0,
    bias: true
  },
  'gpt2-large': {
    blockSize: 1024,
    vocabSize: 50257,
    nLayer: 36,
    nHead: 20,
    nEmbd: 1280,
    dropout: 0.0,
    bias: true
  },
  'gpt2-xl': {
    blockSize: 1024,
    vocabSize: 50257,
    nLayer: 48,
    nHead: 25,
    nEmbd: 1600,
    dropout: 0.0,
    bias: true
  },
  'tiny': {
    blockSize: 256,
    vocabSize: 50257,
    nLayer: 4,
    nHead: 4,
    nEmbd: 128,
    dropout: 0.1,
    bias: false
  },
  'small': {
    blockSize: 512,
    vocabSize: 50257,
    nLayer: 6,
    nHead: 6,
    nEmbd: 384,
    dropout: 0.1,
    bias: false
  }
};

export const DEFAULT_TRAINING_CONFIG: TrainingConfig = {
  batchSize: 12,
  learningRate: 6e-4,
  maxIters: 5000,
  weightDecay: 1e-1,
  beta1: 0.9,
  beta2: 0.95,
  gradClip: 1.0,
  decayLr: true,
  warmupIters: 100,
  lrDecayIters: 5000,
  minLr: 6e-5,
  device: 'cpu',
  compileModel: false
};
