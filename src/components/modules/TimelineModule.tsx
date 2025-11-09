import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { 
  GitBranch, 
  GitCommit, 
  GitMerge, 
  History, 
  RotateCcw, 
  Plus, 
  Clock,
  TrendingUp,
  FileText,
  Calendar,
  Tag,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

interface Commit {
  id: string;
  branch: string;
  message: string;
  description: string;
  timestamp: Date;
  author: string;
  tags: string[];
  type: 'feature' | 'improvement' | 'fix' | 'milestone';
  impact: number; // 1-10
  changes: string[];
}

interface Branch {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  commits: number;
  status: 'active' | 'merged' | 'archived';
  color: string;
}

const initialCommits: Commit[] = [
  {
    id: 'commit-1',
    branch: 'main',
    message: 'Initial system boot',
    description: 'HOS initialization and core module setup',
    timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    author: 'System',
    tags: ['system', 'init'],
    type: 'milestone',
    impact: 10,
    changes: ['Core modules initialized', 'Event bus configured', 'Persistence layer setup']
  },
  {
    id: 'commit-2',
    branch: 'main',
    message: 'Enhanced AI integration',
    description: 'Improved LLM response quality and context management',
    timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    author: 'Self Update Engine',
    tags: ['ai', 'optimization'],
    type: 'improvement',
    impact: 8,
    changes: ['Better prompt engineering', 'Context window optimization', 'Response caching']
  },
  {
    id: 'commit-3',
    branch: 'feature/habits',
    message: 'Habit tracking system',
    description: 'Implemented comprehensive habit forge module',
    timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    author: 'User',
    tags: ['habits', 'human-modules'],
    type: 'feature',
    impact: 7,
    changes: ['Created habit forge module', 'Streak tracking', 'Entropy calculation']
  },
  {
    id: 'commit-4',
    branch: 'main',
    message: 'Fixed reflection rate limiting',
    description: 'Prevented overwhelming reflection creation',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    author: 'Self Update Engine',
    tags: ['fix', 'reflections'],
    type: 'fix',
    impact: 6,
    changes: ['Added 1-per-hour limit', 'Improved UX feedback', 'Timer display']
  },
  {
    id: 'commit-5',
    branch: 'main',
    message: 'Cognitive enhancement milestone',
    description: 'Major upgrade to reasoning and decision-making capabilities',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    author: 'Evolver Module',
    tags: ['cognitive', 'milestone'],
    type: 'milestone',
    impact: 9,
    changes: ['Enhanced cognitive core', 'Better pattern recognition', 'Improved self-awareness']
  }
];

const initialBranches: Branch[] = [
  {
    id: 'main',
    name: 'main',
    description: 'Primary development branch - stable and production-ready',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    commits: 15,
    status: 'active',
    color: 'bg-blue-500'
  },
  {
    id: 'feature/habits',
    name: 'feature/habits',
    description: 'Habit tracking and behavior construction features',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    commits: 8,
    status: 'merged',
    color: 'bg-green-500'
  }
];

// Helper to ensure dates are Date objects
const ensureCommitDates = (commits: Commit[]): Commit[] => {
  return commits.map(c => ({
    ...c,
    timestamp: c.timestamp instanceof Date ? c.timestamp : new Date(c.timestamp)
  }));
};

const ensureBranchDates = (branches: Branch[]): Branch[] => {
  return branches.map(b => ({
    ...b,
    createdAt: b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt)
  }));
};

export function TimelineModule() {
  const [commits, setCommits] = useState<Commit[]>(() => {
    try {
      const stored = localStorage.getItem('version-commits');
      return stored ? ensureCommitDates(JSON.parse(stored)) : initialCommits;
    } catch {
      return initialCommits;
    }
  });
  
  const [branches, setBranches] = useState<Branch[]>(() => {
    try {
      const stored = localStorage.getItem('version-branches');
      return stored ? ensureBranchDates(JSON.parse(stored)) : initialBranches;
    } catch {
      return initialBranches;
    }
  });
  
  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('version-commits', JSON.stringify(commits));
    } catch (error) {
      console.error('Error saving commits:', error);
    }
  }, [commits]);
  
  useEffect(() => {
    try {
      localStorage.setItem('version-branches', JSON.stringify(branches));
    } catch (error) {
      console.error('Error saving branches:', error);
    }
  }, [branches]);
  
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [isCommitDialogOpen, setIsCommitDialogOpen] = useState(false);
  const [isBranchDialogOpen, setIsBranchDialogOpen] = useState(false);
  const [commitForm, setCommitForm] = useState({
    message: '',
    description: '',
    type: 'improvement' as 'feature' | 'improvement' | 'fix' | 'milestone',
    branch: 'main',
    tags: '',
    impact: 5
  });
  const [branchForm, setBranchForm] = useState({
    name: '',
    description: ''
  });

  const sortedCommits = ensureCommitDates(commits).sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  );

  const filteredCommits = selectedBranch === 'all' 
    ? sortedCommits 
    : sortedCommits.filter(c => c.branch === selectedBranch);

  const activeBranches = ensureBranchDates(branches);

  const handleCreateCommit = () => {
    if (!commitForm.message.trim()) {
      alert('Please enter a commit message');
      return;
    }

    const newCommit: Commit = {
      id: `commit-${Date.now()}`,
      branch: commitForm.branch,
      message: commitForm.message,
      description: commitForm.description,
      timestamp: new Date(),
      author: 'User',
      tags: commitForm.tags.split(',').map(t => t.trim()).filter(t => t),
      type: commitForm.type,
      impact: commitForm.impact,
      changes: []
    };

    setCommits([...commits, newCommit]);

    // Update branch commit count
    const updatedBranches = branches.map(b => 
      b.name === commitForm.branch ? { ...b, commits: b.commits + 1 } : b
    );
    setBranches(updatedBranches);

    setCommitForm({
      message: '',
      description: '',
      type: 'improvement',
      branch: 'main',
      tags: '',
      impact: 5
    });
    setIsCommitDialogOpen(false);
  };

  const handleCreateBranch = () => {
    if (!branchForm.name.trim()) {
      alert('Please enter a branch name');
      return;
    }

    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-cyan-500', 'bg-pink-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newBranch: Branch = {
      id: branchForm.name.toLowerCase().replace(/\s+/g, '-'),
      name: branchForm.name,
      description: branchForm.description,
      createdAt: new Date(),
      commits: 0,
      status: 'active',
      color: randomColor
    };

    setBranches([...branches, newBranch]);
    setBranchForm({ name: '', description: '' });
    setIsBranchDialogOpen(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return Plus;
      case 'improvement': return TrendingUp;
      case 'fix': return CheckCircle2;
      case 'milestone': return Sparkles;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-blue-500';
      case 'improvement': return 'bg-green-500';
      case 'fix': return 'bg-yellow-500';
      case 'milestone': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle2;
      case 'merged': return GitMerge;
      case 'archived': return XCircle;
      default: return AlertTriangle;
    }
  };

  const totalCommits = commits.length;
  const avgImpact = commits.reduce((sum, c) => sum + c.impact, 0) / commits.length || 0;
  const recentActivity = commits.filter(c => {
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return ensureCommitDates([c])[0].timestamp.getTime() > dayAgo;
  }).length;

  return (
    <div className="space-y-6 max-w-6xl p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-3 md:gap-4">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <GitBranch className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl">Version Control</h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Life history and revision system - track your evolution
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap md:flex-nowrap">
          <Dialog open={isBranchDialogOpen} onOpenChange={setIsBranchDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 md:flex-initial">
                <GitBranch className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">New Branch</span>
                <span className="sm:hidden">Branch</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Branch</DialogTitle>
                <DialogDescription>
                  Start a new development branch for experimental features
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="branch-name">Branch Name</Label>
                  <Input
                    id="branch-name"
                    placeholder="e.g., feature/new-capability"
                    value={branchForm.name}
                    onChange={(e) => setBranchForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch-desc">Description</Label>
                  <Textarea
                    id="branch-desc"
                    placeholder="What will this branch focus on?"
                    value={branchForm.description}
                    onChange={(e) => setBranchForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsBranchDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateBranch} disabled={!branchForm.name.trim()}>
                  Create Branch
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCommitDialogOpen} onOpenChange={setIsCommitDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <GitCommit className="w-4 h-4 mr-2" />
                New Commit
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-2xl sm:w-full max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle className="text-base sm:text-lg">Create New Commit</DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  Record a significant change or milestone in your journey
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-0 flex-1 min-h-0">
                <div className="space-y-4 py-4 px-1">
                <div className="space-y-2">
                  <Label htmlFor="message">Commit Message</Label>
                  <Input
                    id="message"
                    placeholder="Brief description of the change"
                    value={commitForm.message}
                    onChange={(e) => setCommitForm(prev => ({ ...prev, message: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed explanation of what changed and why"
                    value={commitForm.description}
                    onChange={(e) => setCommitForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <select
                      id="type"
                      className="w-full px-3 py-2 rounded-md border border-input bg-background"
                      value={commitForm.type}
                      onChange={(e) => setCommitForm(prev => ({ ...prev, type: e.target.value as any }))}
                    >
                      <option value="feature">Feature</option>
                      <option value="improvement">Improvement</option>
                      <option value="fix">Fix</option>
                      <option value="milestone">Milestone</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                    <select
                      id="branch"
                      className="w-full px-3 py-2 rounded-md border border-input bg-background"
                      value={commitForm.branch}
                      onChange={(e) => setCommitForm(prev => ({ ...prev, branch: e.target.value }))}
                    >
                      {activeBranches.filter(b => b.status === 'active').map(branch => (
                        <option key={branch.id} value={branch.name}>{branch.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="e.g., productivity, habits, ai"
                    value={commitForm.tags}
                    onChange={(e) => setCommitForm(prev => ({ ...prev, tags: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="impact">Impact Level: {commitForm.impact}/10</Label>
                  <input
                    type="range"
                    id="impact"
                    min="1"
                    max="10"
                    value={commitForm.impact}
                    onChange={(e) => setCommitForm(prev => ({ ...prev, impact: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                </div>
              </ScrollArea>
              <DialogFooter className="flex-shrink-0 gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setIsCommitDialogOpen(false)} className="text-sm sm:text-base">Cancel</Button>
                <Button onClick={handleCreateCommit} disabled={!commitForm.message.trim()} className="text-sm sm:text-base">
                  Create Commit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <GitCommit className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <div className="text-3xl">{totalCommits}</div>
                <p className="text-sm text-muted-foreground">Total Commits</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <GitBranch className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <div className="text-3xl">{activeBranches.length}</div>
                <p className="text-sm text-muted-foreground">Branches</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <div className="text-3xl">{avgImpact.toFixed(1)}</div>
                <p className="text-sm text-muted-foreground">Avg Impact</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <div className="text-3xl">{recentActivity}</div>
                <p className="text-sm text-muted-foreground">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="commits" className="space-y-4">
        <TabsList>
          <TabsTrigger value="commits">
            <History className="w-4 h-4 mr-2" />
            Commits
          </TabsTrigger>
          <TabsTrigger value="branches">
            <GitBranch className="w-4 h-4 mr-2" />
            Branches
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Clock className="w-4 h-4 mr-2" />
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="commits" className="space-y-4">
          {/* Branch Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Filter by branch:</span>
                <Button
                  variant={selectedBranch === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedBranch('all')}
                >
                  All
                </Button>
                {activeBranches.map(branch => (
                  <Button
                    key={branch.id}
                    variant={selectedBranch === branch.name ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedBranch(branch.name)}
                  >
                    <div className={`w-2 h-2 rounded-full ${branch.color} mr-2`} />
                    {branch.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Commits List */}
          <div className="space-y-3">
            {filteredCommits.map((commit, index) => {
              const TypeIcon = getTypeIcon(commit.type);
              const typeColor = getTypeColor(commit.type);
              const branch = activeBranches.find(b => b.name === commit.branch);

              return (
                <Card key={commit.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-4">
                      <div className={`w-10 h-10 rounded-lg ${typeColor} flex items-center justify-center flex-shrink-0`}>
                        <TypeIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex flex-col gap-3 mb-2">
                          <div className="flex-1">
                            <h4 className="mb-1 text-base md:text-lg">{commit.message}</h4>
                            {commit.description && (
                              <p className="text-sm text-muted-foreground">{commit.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {branch && (
                              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                                <div className={`w-2 h-2 rounded-full ${branch.color}`} />
                                <span className="truncate max-w-[120px]">{branch.name}</span>
                              </Badge>
                            )}
                            <Badge variant="secondary" className="capitalize text-xs">
                              {commit.type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Impact: {commit.impact}/10
                            </Badge>
                          </div>
                        </div>
                        {commit.tags.length > 0 && (
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {commit.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {commit.changes.length > 0 && (
                          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-2">Changes:</p>
                            <ul className="text-xs space-y-1">
                              {commit.changes.map((change, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
                                  <span className="break-words">{change}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span className="break-words">{commit.timestamp.toLocaleString()}</span>
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span>{commit.author}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredCommits.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <GitCommit className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="mb-2">No commits yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start tracking your evolution by creating your first commit
                </p>
                <Button onClick={() => setIsCommitDialogOpen(true)}>
                  <GitCommit className="w-4 h-4 mr-2" />
                  Create First Commit
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="branches" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBranches.map(branch => {
              const StatusIcon = getStatusIcon(branch.status);
              const branchCommits = commits.filter(c => c.branch === branch.name);
              
              return (
                <Card key={branch.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${branch.color} flex items-center justify-center`}>
                          <GitBranch className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{branch.name}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">
                            Created {branch.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={branch.status === 'active' ? 'default' : 'secondary'} className="flex items-center gap-1">
                        <StatusIcon className="w-3 h-3" />
                        {branch.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{branch.description}</p>
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Commits</span>
                      <span className="font-medium">{branchCommits.length}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {activeBranches.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <GitBranch className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="mb-2">No branches yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create branches to organize different areas of development
                </p>
                <Button onClick={() => setIsBranchDialogOpen(true)}>
                  <GitBranch className="w-4 h-4 mr-2" />
                  Create First Branch
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolution Timeline</CardTitle>
              <CardDescription>
                Chronological view of your personal development and system improvements
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-border" />
                
                {/* Timeline items */}
                <div className="space-y-6 md:space-y-8">
                  {sortedCommits.map((commit, index) => {
                    const TypeIcon = getTypeIcon(commit.type);
                    const typeColor = getTypeColor(commit.type);
                    
                    return (
                      <div key={commit.id} className="relative flex gap-3 md:gap-6">
                        <div className={`relative z-10 w-8 h-8 md:w-12 md:h-12 rounded-full ${typeColor} flex items-center justify-center flex-shrink-0`}>
                          <TypeIcon className="w-4 h-4 md:w-6 md:h-6 text-white" />
                        </div>
                        <div className="flex-1 pb-6 md:pb-8 min-w-0">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                            <h4 className="text-base md:text-lg break-words">{commit.message}</h4>
                            <Badge variant="outline" className="text-xs self-start md:self-auto flex-shrink-0">
                              {commit.timestamp.toLocaleDateString()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 break-words">{commit.description}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="capitalize text-xs">{commit.type}</Badge>
                            <Badge variant="secondary" className="text-xs">Impact: {commit.impact}/10</Badge>
                            {commit.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}