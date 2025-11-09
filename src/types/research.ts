export interface ResearchProject {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'active' | 'paused' | 'completed' | 'archived';
  field: string;
  tags: string[];
  startDate: Date;
  endDate?: Date;
  progress: number;
  hypothesis?: string;
  methodology?: string;
  findings: Finding[];
  papers: ResearchPaper[];
  experiments: Experiment[];
  collaborators?: string[];
  publications?: Publication[];
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  url?: string;
  arxivId?: string;
  doi?: string;
  publishedDate?: Date;
  citations: number;
  field: string;
  tags: string[];
  notes?: string;
  keyFindings: string[];
  relevanceScore: number;
  status: 'to-read' | 'reading' | 'completed' | 'referenced';
}

export interface Experiment {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  methodology: string;
  status: 'planned' | 'running' | 'completed' | 'failed';
  startDate: Date;
  endDate?: Date;
  variables: Variable[];
  results?: ExperimentResult[];
  observations: Observation[];
  conclusions?: string;
}

export interface Variable {
  id: string;
  name: string;
  type: 'independent' | 'dependent' | 'control';
  value: string | number;
  unit?: string;
}

export interface ExperimentResult {
  id: string;
  timestamp: Date;
  data: Record<string, any>;
  metrics: Metric[];
  success: boolean;
  notes?: string;
}

export interface Metric {
  name: string;
  value: number;
  unit?: string;
  benchmark?: number;
}

export interface Observation {
  id: string;
  timestamp: Date;
  content: string;
  type: 'note' | 'insight' | 'anomaly' | 'breakthrough';
  attachments?: string[];
}

export interface Finding {
  id: string;
  title: string;
  description: string;
  type: 'insight' | 'discovery' | 'validation' | 'refutation';
  date: Date;
  evidence: string[];
  significance: 'low' | 'medium' | 'high' | 'critical';
  relatedPapers?: string[];
}

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  status: 'draft' | 'submitted' | 'under-review' | 'accepted' | 'published';
  submissionDate?: Date;
  publicationDate?: Date;
  url?: string;
}

export interface LiteratureReview {
  id: string;
  topic: string;
  papers: ResearchPaper[];
  summary: string;
  gaps: string[];
  trends: string[];
  createdDate: Date;
  updatedDate: Date;
}

export interface ResearchNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  projectId?: string;
  createdDate: Date;
  updatedDate: Date;
  type: 'idea' | 'analysis' | 'summary' | 'question';
}
