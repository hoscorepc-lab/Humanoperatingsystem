export interface DataSource {
  id: string;
  name: string;
  type: 'csv' | 'json' | 'api' | 'manual';
  data: any[];
  columns: DataColumn[];
  rowCount: number;
  uploadedAt: Date;
}

export interface DataColumn {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  uniqueValues?: number;
  min?: number;
  max?: number;
  avg?: number;
  sample?: any[];
}

export interface ChartConfig {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'radar' | 'composed';
  title: string;
  description?: string;
  dataKey: string;
  xAxis?: string;
  yAxis?: string[];
  colors?: string[];
  config?: any;
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  dataSourceId: string;
  charts: ChartConfig[];
  layout: DashboardLayout;
  created: Date;
  lastModified: Date;
  isPublic: boolean;
}

export interface DashboardLayout {
  grid: GridItem[];
  columns: number;
  rowHeight: number;
}

export interface GridItem {
  chartId: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface AIAnalysis {
  summary: string;
  insights: string[];
  suggestedCharts: ChartConfig[];
  correlations?: Correlation[];
  trends?: Trend[];
}

export interface Correlation {
  column1: string;
  column2: string;
  coefficient: number;
  description: string;
}

export interface Trend {
  column: string;
  direction: 'increasing' | 'decreasing' | 'stable';
  description: string;
}

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: 'sales' | 'marketing' | 'finance' | 'operations' | 'analytics';
  charts: ChartConfig[];
  preview?: string;
}
