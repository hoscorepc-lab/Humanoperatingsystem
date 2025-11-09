import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Calendar, Clock, Plus, Sparkles, TrendingUp, Zap, Navigation } from 'lucide-react';

interface PlannedEvent {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  duration: number; // minutes
  type: 'structured' | 'flexible' | 'exploratory';
  energyImpact: number; // -10 to +10
  entropyImpact: number; // -10 to +10 (negative = more order, positive = more chaos)
  completed?: boolean;
}

interface TimeBlock {
  hour: number;
  event?: PlannedEvent;
  suggestedType?: 'focus' | 'flow' | 'creative' | 'rest';
}

const initialEvents: PlannedEvent[] = [
  {
    id: '1',
    title: 'Deep Work Session',
    description: 'Focus on project architecture',
    startTime: new Date(new Date().setHours(9, 0, 0, 0)),
    duration: 120,
    type: 'structured',
    energyImpact: -3,
    entropyImpact: -5,
    completed: true
  },
  {
    id: '2',
    title: 'Creative Exploration',
    description: 'Brainstorm new features',
    startTime: new Date(new Date().setHours(14, 0, 0, 0)),
    duration: 60,
    type: 'exploratory',
    energyImpact: 2,
    entropyImpact: 4,
    completed: false
  },
  {
    id: '3',
    title: 'Team Sync',
    description: 'Weekly alignment meeting',
    startTime: new Date(new Date().setHours(16, 0, 0, 0)),
    duration: 45,
    type: 'flexible',
    energyImpact: -1,
    entropyImpact: 2,
    completed: false
  }
];

// Helper to ensure dates are Date objects (handle deserialization from JSON)
const ensureDates = (events: PlannedEvent[]): PlannedEvent[] => {
  return events.map(e => ({
    ...e,
    startTime: e.startTime instanceof Date ? e.startTime : new Date(e.startTime)
  }));
};

export function QuantumPlannerModule() {
  const [events, setEvents] = useState<PlannedEvent[]>(() => {
    try {
      const stored = localStorage.getItem('quantum-planner-events');
      return stored ? ensureDates(JSON.parse(stored)) : initialEvents;
    } catch {
      return initialEvents;
    }
  });
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Persist to localStorage whenever events change
  useEffect(() => {
    try {
      localStorage.setItem('quantum-planner-events', JSON.stringify(events));
    } catch (error) {
      console.error('Error saving events:', error);
    }
  }, [events]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    duration: 60,
    type: 'flexible' as 'structured' | 'flexible' | 'exploratory'
  });

  // Calculate current entropy based on events
  const calculateEntropy = () => {
    const completedEvents = events.filter(e => e.completed);
    const totalImpact = completedEvents.reduce((sum, e) => sum + e.entropyImpact, 0);
    const baseEntropy = 50; // neutral starting point
    return Math.max(0, Math.min(100, baseEntropy + totalImpact * 2));
  };

  const currentEntropy = calculateEntropy();

  const getEntropyState = (entropy: number) => {
    if (entropy < 25) return { label: 'Stasis', color: 'text-blue-500', bg: 'bg-blue-500' };
    if (entropy < 50) return { label: 'Order', color: 'text-green-500', bg: 'bg-green-500' };
    if (entropy < 75) return { label: 'Flow', color: 'text-cyan-500', bg: 'bg-cyan-500' };
    return { label: 'Turbulent', color: 'text-yellow-500', bg: 'bg-yellow-500' };
  };

  const entropyState = getEntropyState(currentEntropy);

  const generateTimeBlocks = (): TimeBlock[] => {
    const blocks: TimeBlock[] = [];
    for (let hour = 6; hour <= 22; hour++) {
      const event = events.find(e => e.startTime.getHours() === hour);
      const block: TimeBlock = { hour, event };
      
      // Suggest block type based on time and current entropy
      if (!event) {
        if (hour >= 9 && hour <= 11 && currentEntropy > 60) {
          block.suggestedType = 'focus'; // Need more structure
        } else if (hour >= 14 && hour <= 16 && currentEntropy < 40) {
          block.suggestedType = 'creative'; // Need more exploration
        } else if (hour >= 19 && hour <= 21) {
          block.suggestedType = 'rest';
        } else {
          block.suggestedType = 'flow';
        }
      }
      
      blocks.push(block);
    }
    return blocks;
  };

  const timeBlocks = generateTimeBlocks();

  const handleCreateEvent = async () => {
    if (!formData.title.trim() || !formData.startTime) {
      alert('Please fill in title and start time');
      return;
    }

    try {
      const [hours, minutes] = formData.startTime.split(':').map(Number);
      const startTime = new Date();
      startTime.setHours(hours, minutes, 0, 0);

      // Calculate impact based on type
      let entropyImpact = 0;
      let energyImpact = 0;

      switch (formData.type) {
        case 'structured':
          entropyImpact = -3;
          energyImpact = -2;
          break;
        case 'flexible':
          entropyImpact = 0;
          energyImpact = 0;
          break;
        case 'exploratory':
          entropyImpact = 3;
          energyImpact = 1;
          break;
      }

      const newEvent: PlannedEvent = {
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: formData.title,
        description: formData.description,
        startTime,
        duration: formData.duration,
        type: formData.type,
        energyImpact,
        entropyImpact,
        completed: false
      };

      setEvents([...events, newEvent]);

      setIsDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        startTime: '',
        duration: 60,
        type: 'flexible'
      });
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    }
  };

  const toggleEventComplete = (id: string) => {
    setEvents(events.map(e => 
      e.id === id ? { ...e, completed: !e.completed } : e
    ));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'structured': return 'bg-blue-500';
      case 'flexible': return 'bg-purple-500';
      case 'exploratory': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'structured': return Calendar;
      case 'flexible': return Sparkles;
      case 'exploratory': return Zap;
      default: return Clock;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ScrollArea className="flex-1 h-0">
        <div className="space-y-3 sm:space-y-4 md:space-y-6 w-full overflow-x-hidden p-2 sm:p-4 md:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <Navigation className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h2>Probability Mapper</h2>
                <p className="text-muted-foreground">
                  Navigate between order and chaos in your schedule
                </p>
              </div>
            </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Plan New Event</DialogTitle>
              <DialogDescription>
                Add a time block to your quantum schedule
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Deep Work Session"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What will you work on?"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Event Type</Label>
                <select
                  id="type"
                  className="w-full px-3 py-2 rounded-md border border-input bg-background"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                >
                  <option value="structured">Structured (Decreases entropy)</option>
                  <option value="flexible">Flexible (Neutral)</option>
                  <option value="exploratory">Exploratory (Increases entropy)</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateEvent} disabled={!formData.title.trim() || !formData.startTime}>
                Add Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Entropy Compass */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg mb-1">Schedule Entropy</h3>
              <p className="text-sm text-muted-foreground">
                Current balance: {entropyState.label}
              </p>
            </div>
            <div className={`text-5xl ${entropyState.color}`}>
              {currentEntropy}%
            </div>
          </div>

          {/* Entropy Gauge */}
          <div className="relative h-40 flex items-center justify-center">
            <svg width="280" height="160" viewBox="0 0 280 160" className="overflow-visible">
              {/* Background arc */}
              <path
                d="M 40 140 A 100 100 0 0 1 240 140"
                fill="none"
                stroke="currentColor"
                strokeWidth="20"
                className="text-gray-200 dark:text-gray-700"
              />
              
              {/* Colored segments */}
              <path
                d="M 40 140 A 100 100 0 0 1 90 56"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="20"
              />
              <path
                d="M 90 56 A 100 100 0 0 1 140 40"
                fill="none"
                stroke="#10b981"
                strokeWidth="20"
              />
              <path
                d="M 140 40 A 100 100 0 0 1 190 56"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="20"
              />
              <path
                d="M 190 56 A 100 100 0 0 1 240 140"
                fill="none"
                stroke="#eab308"
                strokeWidth="20"
              />
              
              {/* Needle */}
              <g transform={`rotate(${-90 + currentEntropy * 1.8} 140 140)`}>
                <line
                  x1="140"
                  y1="140"
                  x2="140"
                  y2="60"
                  stroke="currentColor"
                  strokeWidth="3"
                  className={entropyState.color}
                />
                <circle
                  cx="140"
                  cy="140"
                  r="8"
                  fill="currentColor"
                  className={entropyState.color}
                />
              </g>
            </svg>
            
            {/* Labels */}
            <div className="absolute bottom-0 left-0 text-xs text-blue-600">STASIS</div>
            <div className="absolute top-4 left-1/4 text-xs text-green-600">ORDER</div>
            <div className="absolute top-4 right-1/4 text-xs text-cyan-600">FLOW</div>
            <div className="absolute bottom-0 right-0 text-xs text-yellow-600">TURBULENT</div>
          </div>

          {/* Recommendations */}
          <div className="mt-6 p-4 bg-white/50 dark:bg-black/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Sparkles className={`w-5 h-5 mt-0.5 ${entropyState.color}`} />
              <div>
                <h4 className="text-sm mb-1">Optimization Suggestion</h4>
                <p className="text-sm text-muted-foreground">
                  {currentEntropy < 40 && "Your schedule is very structured. Consider adding exploratory time blocks for creativity."}
                  {currentEntropy >= 40 && currentEntropy < 60 && "Perfect balance! You're in the flow state between order and chaos."}
                  {currentEntropy >= 60 && "High entropy detected. Add structured deep work blocks to regain focus."}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline View */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Timeline</CardTitle>
          <p className="text-sm text-muted-foreground">
            Your quantum schedule with entropy-aware suggestions
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {timeBlocks.map(block => {
              const Icon = block.event ? getTypeIcon(block.event.type) : Clock;
              return (
                <div
                  key={block.hour}
                  className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg border transition-all ${
                    block.event 
                      ? 'bg-card hover:shadow-md' 
                      : 'bg-muted/30 border-dashed'
                  }`}
                >
                  <div className="w-16 sm:w-20 text-sm text-muted-foreground flex-shrink-0">
                    {block.hour.toString().padStart(2, '0')}:00
                  </div>
                  
                  {block.event ? (
                    <>
                      <div className={`w-10 h-10 rounded-lg ${getTypeColor(block.event.type)} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0 w-full sm:w-auto">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="text-sm">{block.event.title}</h4>
                          <Badge variant="outline" className="capitalize text-xs">
                            {block.event.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{block.event.duration} min • Entropy: {block.event.entropyImpact > 0 ? '+' : ''}{block.event.entropyImpact}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                        <Button
                          variant={block.event.completed ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleEventComplete(block.event!.id)}
                          className="w-full sm:w-auto"
                        >
                          {block.event.completed ? 'Completed' : 'Mark Done'}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground">Open time block</p>
                        {block.suggestedType && (
                          <p className="text-xs text-muted-foreground">
                            Suggested: {block.suggestedType} work
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        <Card className="min-w-0">
          <CardContent className="!p-3 sm:!p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl">{events.filter(e => e.type === 'structured').length}</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Structured Events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardContent className="!p-3 sm:!p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-orange-500" />
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl">{events.filter(e => e.type === 'exploratory').length}</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Exploratory Blocks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardContent className="!p-3 sm:!p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl">{events.filter(e => e.completed).length}</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Completed Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
        </div>
      </ScrollArea>
    </div>
  );
}
