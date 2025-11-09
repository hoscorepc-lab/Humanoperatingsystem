import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Brain, Database, TrendingUp, Search, BookMarked, Lightbulb, Calendar, Tag } from 'lucide-react';

interface Memory {
  id: string;
  type: 'experience' | 'learning' | 'insight' | 'fact';
  title: string;
  content: string;
  tags: string[];
  importance: number;
  createdAt: Date;
  accessCount: number;
  lastAccessed?: Date;
}

interface Pattern {
  id: string;
  name: string;
  description: string;
  occurrences: number;
  confidence: number;
  relatedMemories: string[];
}

const initialMemories: Memory[] = [
  {
    id: '1',
    type: 'insight',
    title: 'Morning routines increase productivity',
    content: 'Noticed that days starting with exercise and meditation lead to 40% more focused work time',
    tags: ['productivity', 'habits', 'wellness'],
    importance: 9,
    createdAt: new Date('2024-03-01'),
    accessCount: 15,
    lastAccessed: new Date()
  },
  {
    id: '2',
    type: 'learning',
    title: 'React Hooks lifecycle patterns',
    content: 'useEffect with empty dependency array runs once on mount, similar to componentDidMount',
    tags: ['react', 'programming', 'frontend'],
    importance: 8,
    createdAt: new Date('2024-02-28'),
    accessCount: 23,
    lastAccessed: new Date('2024-03-05')
  },
  {
    id: '3',
    type: 'experience',
    title: 'Successful client presentation',
    content: 'Client loved the prototype demo. Key was showing real data early and iterating based on feedback',
    tags: ['work', 'client', 'presentation'],
    importance: 7,
    createdAt: new Date('2024-03-03'),
    accessCount: 5,
    lastAccessed: new Date('2024-03-04')
  },
  {
    id: '4',
    type: 'fact',
    title: 'Pomodoro technique timing',
    content: '25 minutes of focused work followed by 5-minute break. Every 4 pomodoros, take a longer 15-30 minute break',
    tags: ['productivity', 'time-management'],
    importance: 6,
    createdAt: new Date('2024-02-20'),
    accessCount: 8
  },
  {
    id: '5',
    type: 'insight',
    title: 'Communication clarity reduces stress',
    content: 'Team conflicts often stem from unclear expectations. Being explicit about deliverables and timelines prevents misunderstandings',
    tags: ['communication', 'team', 'leadership'],
    importance: 9,
    createdAt: new Date('2024-02-25'),
    accessCount: 12,
    lastAccessed: new Date('2024-03-02')
  },
  {
    id: '6',
    type: 'learning',
    title: 'TypeScript generic constraints',
    content: 'Use "extends" keyword to constrain generic types: function getValue<T extends object>(obj: T)',
    tags: ['typescript', 'programming'],
    importance: 7,
    createdAt: new Date('2024-03-04'),
    accessCount: 6,
    lastAccessed: new Date()
  }
];

const learnedPatterns: Pattern[] = [
  {
    id: '1',
    name: 'Peak Performance Hours',
    description: 'Most productive work happens between 9 AM - 12 PM',
    occurrences: 45,
    confidence: 87,
    relatedMemories: ['1', '3']
  },
  {
    id: '2',
    name: 'Learning Through Practice',
    description: 'Retention increases 3x when immediately applying new concepts',
    occurrences: 28,
    confidence: 92,
    relatedMemories: ['2', '6']
  },
  {
    id: '3',
    name: 'Iterative Feedback Loop',
    description: 'Early prototypes and frequent feedback lead to better outcomes',
    occurrences: 18,
    confidence: 79,
    relatedMemories: ['3']
  },
  {
    id: '4',
    name: 'Proactive Communication',
    description: 'Over-communication prevents 85% of potential conflicts',
    occurrences: 34,
    confidence: 88,
    relatedMemories: ['5']
  }
];

// Helper to ensure dates are Date objects (handle deserialization from JSON)
const ensureDates = (memories: Memory[]): Memory[] => {
  return memories.map(m => ({
    ...m,
    createdAt: m.createdAt instanceof Date ? m.createdAt : new Date(m.createdAt),
    lastAccessed: m.lastAccessed ? (m.lastAccessed instanceof Date ? m.lastAccessed : new Date(m.lastAccessed)) : undefined
  }));
};

export function MemoryModule() {
  const [memories, setMemories] = useState<Memory[]>(() => {
    try {
      const stored = localStorage.getItem('memories');
      return stored ? ensureDates(JSON.parse(stored)) : initialMemories;
    } catch {
      return initialMemories;
    }
  });
  
  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('memories', JSON.stringify(memories));
    } catch (error) {
      console.error('Error saving memories:', error);
    }
  }, [memories]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const totalMemories = memories.length;
  const totalPatterns = learnedPatterns.length;
  const avgImportance = Math.round(memories.reduce((sum, m) => sum + m.importance, 0) / memories.length);
  const totalAccesses = memories.reduce((sum, m) => sum + m.accessCount, 0);

  const filteredMemories = memories.filter(memory => {
    const matchesSearch = searchQuery === '' || 
      memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = selectedType === 'all' || memory.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'experience': return Calendar;
      case 'learning': return BookMarked;
      case 'insight': return Lightbulb;
      case 'fact': return Database;
      default: return Brain;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'experience': return 'bg-blue-500';
      case 'learning': return 'bg-purple-500';
      case 'insight': return 'bg-yellow-500';
      case 'fact': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="h-full flex flex-col max-w-6xl">
      <ScrollArea className="flex-1 h-0">
        <div className="p-4 sm:p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start gap-3 md:gap-4">
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-cyan-500 flex items-center justify-center flex-shrink-0">
          <Brain className="w-6 h-6 md:w-7 md:h-7 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl md:text-2xl">Memory - Knowledge Base</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Your system's accumulated knowledge and learned patterns
          </p>
          <p className="text-xs text-muted-foreground mt-1">v1.2.0</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Database className="w-6 h-6 text-cyan-500" />
              </div>
              <div>
                <div className="text-3xl font-semibold">{totalMemories}</div>
                <p className="text-sm text-muted-foreground">Memories</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <div className="text-3xl font-semibold">{totalPatterns}</div>
                <p className="text-sm text-muted-foreground">Patterns</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <div className="text-3xl font-semibold">{avgImportance}/10</div>
                <p className="text-sm text-muted-foreground">Avg Importance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Search className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <div className="text-3xl font-semibold">{totalAccesses}</div>
                <p className="text-sm text-muted-foreground">Total Recalls</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="memories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="memories">Memories</TabsTrigger>
          <TabsTrigger value="patterns">Learned Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="memories" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search memories, tags, or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={selectedType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={selectedType === 'experience' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('experience')}
                  >
                    Experiences
                  </Button>
                  <Button
                    variant={selectedType === 'learning' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('learning')}
                  >
                    Learning
                  </Button>
                  <Button
                    variant={selectedType === 'insight' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('insight')}
                  >
                    Insights
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Memories List */}
          <div className="space-y-3">
            {filteredMemories.map(memory => {
              const TypeIcon = getTypeIcon(memory.type);
              return (
                <Card key={memory.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-4">
                      <div className={`w-10 h-10 rounded-lg ${getTypeColor(memory.type)} flex items-center justify-center flex-shrink-0`}>
                        <TypeIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex flex-col gap-2 mb-2">
                          <h4 className="text-base md:text-lg break-words">{memory.title}</h4>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="capitalize text-xs">
                              {memory.type}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {memory.importance}/10
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 break-words">{memory.content}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            {memory.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 sm:ml-auto">
                            <span>Recalled {memory.accessCount}x</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{memory.createdAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredMemories.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No memories found matching your search</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recognized Patterns</CardTitle>
              <p className="text-sm text-muted-foreground">
                Behavioral patterns and insights automatically learned from your memories
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {learnedPatterns.map(pattern => (
                  <div key={pattern.id} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h4>{pattern.name}</h4>
                      <Badge variant="secondary" className="flex-shrink-0">
                        {pattern.confidence}% confident
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{pattern.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{pattern.occurrences} occurrences</span>
                      <span>•</span>
                      <span>{pattern.relatedMemories.length} related memories</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}