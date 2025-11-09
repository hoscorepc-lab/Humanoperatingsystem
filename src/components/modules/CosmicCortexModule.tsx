import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Brain, 
  Target, 
  BookOpen,
  TrendingUp,
  Activity,
  Play,
  Pause,
  Plus,
  Search
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface LearningTask {
  id: string;
  title: string;
  category: string;
  status: 'pending' | 'active' | 'completed';
  confidence: number;
  dueDate: Date | string;
}

interface KnowledgeNode {
  id: string;
  concept: string;
  category: string;
  mastery: number;
  connections: string[];
}

export function CosmicCortexModule() {
  const [isLearning, setIsLearning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample data
  const [learningTasks] = useState<LearningTask[]>([
    {
      id: '1',
      title: 'Machine Learning Fundamentals',
      category: 'AI',
      status: 'active',
      confidence: 75,
      dueDate: new Date()
    },
    {
      id: '2',
      title: 'Neural Network Architecture',
      category: 'Deep Learning',
      status: 'active',
      confidence: 60,
      dueDate: new Date()
    },
    {
      id: '3',
      title: 'Natural Language Processing',
      category: 'NLP',
      status: 'pending',
      confidence: 40,
      dueDate: new Date()
    }
  ]);

  const [knowledgeGraph] = useState<KnowledgeNode[]>([
    {
      id: '1',
      concept: 'Neural Networks',
      category: 'AI',
      mastery: 0.85,
      connections: ['2', '3']
    },
    {
      id: '2',
      concept: 'Deep Learning',
      category: 'AI',
      mastery: 0.70,
      connections: ['1', '4']
    },
    {
      id: '3',
      concept: 'Machine Learning',
      category: 'AI',
      mastery: 0.90,
      connections: ['1']
    },
    {
      id: '4',
      concept: 'Computer Vision',
      category: 'AI',
      mastery: 0.65,
      connections: ['2']
    }
  ]);

  const toggleLearning = () => {
    setIsLearning(!isLearning);
    toast.success(isLearning ? 'Learning paused' : 'Learning started');
  };

  const activeTasks = learningTasks.filter(t => t.status === 'active').length;
  const avgMastery = (knowledgeGraph.reduce((sum, n) => sum + n.mastery, 0) / knowledgeGraph.length * 100).toFixed(0);

  return (
    <div className="h-full flex flex-col bg-background">
      <ScrollArea className="flex-1 h-0">
        <div className="p-4 space-y-4 max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              <h1 className="text-2xl">Cosmic Cortex</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Self-learning AI agent with knowledge graph mapping
            </p>
          </div>

          {/* Quick Stats - Mobile Optimized */}
          <div className="grid grid-cols-2 gap-2">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <Target className="w-5 h-5 text-primary mb-2" />
                  <div className="text-2xl">{activeTasks}</div>
                  <div className="text-xs text-muted-foreground">Active</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <BookOpen className="w-5 h-5 text-primary mb-2" />
                  <div className="text-2xl">{knowledgeGraph.length}</div>
                  <div className="text-xs text-muted-foreground">Nodes</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <TrendingUp className="w-5 h-5 text-primary mb-2" />
                  <div className="text-2xl">{avgMastery}%</div>
                  <div className="text-xs text-muted-foreground">Mastery</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <Activity className="w-5 h-5 text-primary mb-2" />
                  <Badge variant={isLearning ? "default" : "secondary"}>
                    {isLearning ? 'Active' : 'Idle'}
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
                <span className="text-sm">Learning Engine</span>
                <Button 
                  size="sm" 
                  onClick={toggleLearning}
                  variant={isLearning ? "destructive" : "default"}
                >
                  {isLearning ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </>
                  )}
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search knowledge..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Learning Tasks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg">Learning Tasks</h2>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {learningTasks.map(task => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 flex-1 min-w-0">
                          <h3 className="text-sm truncate">{task.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {task.category}
                            </Badge>
                            <Badge variant={
                              task.status === 'active' ? 'default' :
                              task.status === 'completed' ? 'secondary' : 'outline'
                            } className="text-xs">
                              {task.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg">{task.confidence}%</div>
                          <div className="text-xs text-muted-foreground">confidence</div>
                        </div>
                      </div>
                      <Progress value={task.confidence} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Knowledge Graph */}
          <div className="space-y-2">
            <h2 className="text-lg">Knowledge Graph</h2>
            <div className="space-y-2">
              {knowledgeGraph.map(node => (
                <Card key={node.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm truncate">{node.concept}</h3>
                          <p className="text-xs text-muted-foreground">{node.category}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg">{(node.mastery * 100).toFixed(0)}%</div>
                          <div className="text-xs text-muted-foreground">mastery</div>
                        </div>
                      </div>
                      <Progress value={node.mastery * 100} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {node.connections.length} connection{node.connections.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
}
