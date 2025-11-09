import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Progress } from '../ui/progress';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  FlaskConical, 
  FileText, 
  Lightbulb, 
  TrendingUp, 
  BookOpen,
  Plus,
  Search,
  ExternalLink,
  Calendar,
  Users,
  BarChart3,
  Target,
  Microscope,
  Brain,
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle,
  Star,
  Download,
  Upload,
  Sparkles
} from 'lucide-react';
import { ResearchProject, ResearchPaper, Experiment, Finding } from '../../types/research';
import { toast } from 'sonner@2.0.3';
import { generateResearchInsight, analyzeResearchPaper, suggestExperiment } from '../../lib/research/ai-service';

// Helper to safely format dates (handles both Date objects and strings)
const formatDate = (date: Date | string): string => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString();
};

export function CoreResearchModule() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProject, setSelectedProject] = useState<ResearchProject | null>(null);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [isAnalyzingPaper, setIsAnalyzingPaper] = useState(false);
  const [isSuggestingExperiment, setIsSuggestingExperiment] = useState(false);

  // Mock data
  const [projects, setProjects] = useState<ResearchProject[]>([
    {
      id: '1',
      title: 'Self-Learning AI Agent Architectures',
      description: 'Investigating novel architectures for autonomous learning in multi-agent systems',
      status: 'active',
      field: 'Artificial Intelligence',
      tags: ['machine-learning', 'multi-agent', 'reinforcement-learning'],
      startDate: new Date('2024-01-15'),
      progress: 67,
      hypothesis: 'Distributed learning across specialized agents improves overall system performance',
      methodology: 'Comparative analysis of centralized vs. distributed learning architectures',
      findings: [
        {
          id: 'f1',
          title: 'Distributed Learning Superiority',
          description: 'Distributed agents showed 34% faster convergence than centralized systems',
          type: 'discovery',
          date: new Date('2024-02-20'),
          evidence: ['Experiment #12 results', 'Benchmark comparison'],
          significance: 'high'
        }
      ],
      papers: [],
      experiments: []
    },
    {
      id: '2',
      title: 'Human-AI Collaborative Intelligence',
      description: 'Exploring optimal interaction patterns for human-AI collaboration',
      status: 'active',
      field: 'Human-Computer Interaction',
      tags: ['collaboration', 'ui/ux', 'cognitive-science'],
      startDate: new Date('2024-02-01'),
      progress: 45,
      findings: [],
      papers: [],
      experiments: []
    },
    {
      id: '3',
      title: 'Ethical AI Decision Making',
      description: 'Frameworks for embedding ethical reasoning in autonomous systems',
      status: 'planning',
      field: 'AI Ethics',
      tags: ['ethics', 'decision-making', 'philosophy'],
      startDate: new Date('2024-03-01'),
      progress: 15,
      findings: [],
      papers: [],
      experiments: []
    }
  ]);

  const [papers, setPapers] = useState<ResearchPaper[]>([
    {
      id: 'p1',
      title: 'Attention Is All You Need',
      authors: ['Vaswani et al.'],
      abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...',
      arxivId: '1706.03762',
      publishedDate: new Date('2017-06-12'),
      citations: 85000,
      field: 'Deep Learning',
      tags: ['transformers', 'nlp', 'attention'],
      keyFindings: ['Transformer architecture', 'Self-attention mechanism', 'Positional encoding'],
      relevanceScore: 95,
      status: 'completed'
    },
    {
      id: 'p2',
      title: 'Language Models are Few-Shot Learners',
      authors: ['Brown et al.'],
      abstract: 'We demonstrate that scaling up language models greatly improves task-agnostic, few-shot performance...',
      arxivId: '2005.14165',
      publishedDate: new Date('2020-05-28'),
      citations: 45000,
      field: 'Natural Language Processing',
      tags: ['gpt', 'few-shot', 'language-models'],
      keyFindings: ['Few-shot learning capability', 'Emergent abilities at scale', 'In-context learning'],
      relevanceScore: 92,
      status: 'completed'
    },
    {
      id: 'p3',
      title: 'Multi-Agent Reinforcement Learning: A Review',
      authors: ['Zhang et al.'],
      abstract: 'This paper provides a comprehensive review of multi-agent reinforcement learning algorithms...',
      publishedDate: new Date('2023-03-15'),
      citations: 1250,
      field: 'Reinforcement Learning',
      tags: ['marl', 'game-theory', 'coordination'],
      keyFindings: ['Cooperation strategies', 'Communication protocols', 'Scalability challenges'],
      relevanceScore: 88,
      status: 'reading'
    }
  ]);

  const [experiments, setExperiments] = useState<Experiment[]>([
    {
      id: 'e1',
      name: 'Agent Coordination Protocol Test',
      description: 'Testing effectiveness of different coordination protocols in multi-agent scenarios',
      hypothesis: 'Explicit communication improves task completion time',
      methodology: 'A/B testing with 100 trial runs per protocol',
      status: 'running',
      startDate: new Date('2024-03-15'),
      variables: [
        { id: 'v1', name: 'Protocol Type', type: 'independent', value: 'explicit' },
        { id: 'v2', name: 'Task Completion Time', type: 'dependent', value: 0, unit: 'seconds' },
        { id: 'v3', name: 'Agent Count', type: 'control', value: 4 }
      ],
      observations: [
        {
          id: 'o1',
          timestamp: new Date(),
          content: 'Early results show 15% improvement with explicit communication',
          type: 'insight'
        }
      ]
    },
    {
      id: 'e2',
      name: 'Learning Rate Optimization',
      description: 'Finding optimal learning rates for different agent types',
      hypothesis: 'Adaptive learning rates outperform fixed rates',
      methodology: 'Grid search with performance benchmarking',
      status: 'completed',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-03-01'),
      variables: [],
      observations: [],
      conclusions: 'Adaptive learning rates showed 23% better performance across all agent types'
    }
  ]);

  const getStatusColor = (status: ResearchProject['status']) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'default';
      case 'planning': return 'secondary';
      case 'paused': return 'secondary';
      case 'archived': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: ResearchProject['status']) => {
    switch (status) {
      case 'active': return <Zap className="w-4 h-4" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'planning': return <Clock className="w-4 h-4" />;
      case 'paused': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // AI Functions
  const handleGenerateInsight = async (project: ResearchProject) => {
    setIsGeneratingInsight(true);
    try {
      const insight = await generateResearchInsight(
        project.title,
        project.description,
        project.findings.map(f => f.description)
      );
      toast.success('AI Insight Generated!', {
        description: insight.slice(0, 100) + '...',
      });
      // Add insight to project findings
      const newFinding: Finding = {
        id: Date.now().toString(),
        title: 'AI Generated Insight',
        description: insight,
        type: 'discovery',
        date: new Date(),
        evidence: ['AI Analysis'],
        significance: 'high'
      };
      setProjects(projects.map(p => 
        p.id === project.id 
          ? { ...p, findings: [...p.findings, newFinding] }
          : p
      ));
    } catch (error: any) {
      toast.error('Failed to generate insight', {
        description: error.message,
      });
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  const handleAnalyzePaper = async (paper: ResearchPaper) => {
    setIsAnalyzingPaper(true);
    try {
      const analysis = await analyzeResearchPaper(paper.title, paper.abstract);
      toast.success('Paper Analyzed!', {
        description: analysis.summary,
      });
      // Update paper with AI analysis
      setPapers(papers.map(p =>
        p.id === paper.id
          ? { ...p, keyFindings: analysis.keyFindings, relevanceScore: analysis.relevanceScore }
          : p
      ));
    } catch (error: any) {
      toast.error('Failed to analyze paper', {
        description: error.message,
      });
    } finally {
      setIsAnalyzingPaper(false);
    }
  };

  const handleSuggestExperiment = async (project: ResearchProject) => {
    setIsSuggestingExperiment(true);
    try {
      const experimentDesign = await suggestExperiment(
        project.hypothesis || 'No hypothesis provided',
        `${project.description}\n\nMethodology: ${project.methodology || 'Not specified'}`
      );
      toast.success('Experiment Suggested!', {
        description: experimentDesign.slice(0, 100) + '...',
      });
      // You could add this to the experiments array
      console.log('Suggested Experiment:', experimentDesign);
    } catch (error: any) {
      toast.error('Failed to suggest experiment', {
        description: error.message,
      });
    } finally {
      setIsSuggestingExperiment(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 h-0">
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <Microscope className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div>
            <h2>HOS Core Research</h2>
            <p className="text-muted-foreground">
              Advanced research platform for AI exploration and discovery
            </p>
          </div>
        </div>
        <Button onClick={() => setNewProjectOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Projects</CardTitle>
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{projects.filter(p => p.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              {projects.length} total projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Research Papers</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{papers.length}</div>
            <p className="text-xs text-muted-foreground">
              {papers.filter(p => p.status === 'completed').length} analyzed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Experiments</CardTitle>
            <Microscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{experiments.length}</div>
            <p className="text-xs text-muted-foreground">
              {experiments.filter(e => e.status === 'running').length} running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Key Findings</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {projects.reduce((sum, p) => sum + p.findings.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="w-full overflow-x-auto">
          <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-5">
            <TabsTrigger value="overview" className="whitespace-nowrap px-3 sm:px-4">Overview</TabsTrigger>
            <TabsTrigger value="projects" className="whitespace-nowrap px-3 sm:px-4">Projects</TabsTrigger>
            <TabsTrigger value="papers" className="whitespace-nowrap px-3 sm:px-4">Papers</TabsTrigger>
            <TabsTrigger value="experiments" className="whitespace-nowrap px-3 sm:px-4">
              <span className="hidden sm:inline">Experiments</span>
              <span className="sm:hidden">Exp</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="whitespace-nowrap px-3 sm:px-4">Insights</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Active Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Active Research Projects</CardTitle>
              <CardDescription>
                Currently running research initiatives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.filter(p => p.status === 'active').map((project) => (
                  <Card key={project.id} className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      setSelectedProject(project);
                      setActiveTab('projects');
                    }}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-base">{project.title}</CardTitle>
                            <Badge variant={getStatusColor(project.status)}>
                              {getStatusIcon(project.status)}
                              <span className="ml-1">{project.status}</span>
                            </Badge>
                          </div>
                          <CardDescription>{project.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline">{project.field}</Badge>
                        {project.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} />
                      </div>
                      <div className="mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleGenerateInsight(project)}
                          disabled={isGeneratingInsight}
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          {isGeneratingInsight ? 'Generating...' : 'AI Insight'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSuggestExperiment(project)}
                          disabled={isSuggestingExperiment}
                        >
                          <Microscope className="w-3 h-3 mr-1" />
                          {isSuggestingExperiment ? 'Suggesting...' : 'Suggest Experiment'}
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Papers */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Papers</CardTitle>
                  <CardDescription>Latest research papers added to library</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('papers')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {papers.slice(0, 3).map((paper) => (
                  <div key={paper.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm line-clamp-1">{paper.title}</h4>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {paper.relevanceScore}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {paper.authors.join(', ')}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {paper.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Running Experiments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Running Experiments</CardTitle>
                  <CardDescription>Active experimental trials</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('experiments')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {experiments.filter(e => e.status === 'running').map((exp) => (
                  <div key={exp.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Microscope className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="text-sm">{exp.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{exp.description}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {exp.variables.length} variables
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {exp.observations.length} observations
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Badge variant="default" className="shrink-0">
                        <Zap className="w-3 h-3 mr-1" />
                        Running
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search projects..." className="pl-10" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {projects.map((project) => (
              <Card key={project.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-base">{project.title}</CardTitle>
                      </div>
                      <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                    </div>
                    <Badge variant={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{project.field}</Badge>
                    {project.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>

                  {project.hypothesis && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Hypothesis</p>
                      <p className="text-sm">{project.hypothesis}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <div className="text-muted-foreground">Findings</div>
                      <div className="font-medium mt-1">{project.findings.length}</div>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <div className="text-muted-foreground">Papers</div>
                      <div className="font-medium mt-1">{project.papers.length}</div>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <div className="text-muted-foreground">Experiments</div>
                      <div className="font-medium mt-1">{project.experiments.length}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(project.startDate)}
                    </div>
                    {project.collaborators && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {project.collaborators.length} collaborators
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="papers" className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search papers..." className="pl-10" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                <SelectItem value="ai">Artificial Intelligence</SelectItem>
                <SelectItem value="ml">Machine Learning</SelectItem>
                <SelectItem value="nlp">NLP</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>

          <div className="space-y-3">
            {papers.map((paper) => (
              <Card key={paper.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <CardTitle className="text-base">{paper.title}</CardTitle>
                        <div className="flex gap-2 shrink-0">
                          <Badge variant="outline">
                            <Star className="w-3 h-3 mr-1" />
                            {paper.relevanceScore}%
                          </Badge>
                          <Badge variant={paper.status === 'completed' ? 'default' : 'secondary'}>
                            {paper.status}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{paper.authors.join(', ')}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{paper.abstract}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{paper.field}</Badge>
                      {paper.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>

                    {paper.keyFindings.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Key Findings:</p>
                        <ul className="space-y-1">
                          {paper.keyFindings.map((finding, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              {finding}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                      <div className="flex items-center gap-4">
                        {paper.publishedDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(paper.publishedDate)}
                          </div>
                        )}
                        <div>{paper.citations.toLocaleString()} citations</div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleAnalyzePaper(paper)}
                          disabled={isAnalyzingPaper}
                        >
                          <Brain className="w-3 h-3 mr-1" />
                          {isAnalyzingPaper ? 'Analyzing...' : 'AI Analyze'}
                        </Button>
                        {paper.arxivId && (
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            arXiv
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="experiments" className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search experiments..." className="pl-10" />
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Experiment
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {experiments.map((exp) => (
              <Card key={exp.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Microscope className="w-5 h-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <CardTitle className="text-base">{exp.name}</CardTitle>
                        <CardDescription>{exp.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={exp.status === 'running' ? 'default' : exp.status === 'completed' ? 'default' : 'secondary'}>
                      {exp.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                    <p className="text-xs text-muted-foreground">Hypothesis</p>
                    <p className="text-sm">{exp.hypothesis}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Variables ({exp.variables.length})</p>
                    <div className="space-y-1">
                      {exp.variables.map(variable => (
                        <div key={variable.id} className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded">
                          <span>{variable.name}</span>
                          <Badge variant="outline" className="text-xs">{variable.type}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {exp.observations.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Latest Observation</p>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm">{exp.observations[0].content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {exp.observations[0].timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {exp.conclusions && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Conclusions</p>
                      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <p className="text-sm">{exp.conclusions}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(exp.startDate)}
                      {exp.endDate && ` - ${formatDate(exp.endDate)}`}
                    </div>
                    <Button variant="ghost" size="sm">
                      <BarChart3 className="w-3 h-3 mr-1" />
                      View Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Research Insights & Findings</CardTitle>
              <CardDescription>
                Key discoveries and breakthroughs across all projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.flatMap(p => p.findings.map(f => ({ ...f, projectTitle: p.title }))).map((finding) => (
                  <Card key={finding.id} className="border-l-4 border-l-primary">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-5 h-5 text-primary" />
                            <CardTitle className="text-base">{finding.title}</CardTitle>
                            <Badge variant={
                              finding.significance === 'critical' ? 'destructive' :
                              finding.significance === 'high' ? 'default' : 'secondary'
                            }>
                              {finding.significance}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            From: {finding.projectTitle}
                          </p>
                          <p className="text-sm">{finding.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Evidence:</p>
                          <ul className="space-y-1">
                            {finding.evidence.map((ev, idx) => (
                              <li key={idx} className="text-sm flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                {ev}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDate(finding.date)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Project Dialog */}
      <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
        <DialogContent className="w-[95vw] max-w-2xl sm:w-full max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-base sm:text-lg">Create New Research Project</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Define a new research initiative and set objectives
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-0 flex-1 min-h-0">
            <div className="space-y-4 px-1 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input id="title" placeholder="Enter project title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe the research project" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="field">Research Field</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai">Artificial Intelligence</SelectItem>
                    <SelectItem value="ml">Machine Learning</SelectItem>
                    <SelectItem value="nlp">Natural Language Processing</SelectItem>
                    <SelectItem value="hci">Human-Computer Interaction</SelectItem>
                    <SelectItem value="ethics">AI Ethics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Initial Status</Label>
                <Select defaultValue="planning">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hypothesis">Research Hypothesis</Label>
              <Textarea id="hypothesis" placeholder="State your research hypothesis" rows={2} />
            </div>
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 flex-shrink-0 pt-4 border-t">
            <Button variant="outline" onClick={() => setNewProjectOpen(false)} className="text-sm sm:text-base">
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success('Research project created!');
              setNewProjectOpen(false);
            }} className="text-sm sm:text-base">
              Create Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
        </div>
      </ScrollArea>
    </div>
  );
}
