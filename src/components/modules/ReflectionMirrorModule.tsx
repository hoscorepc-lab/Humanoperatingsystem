import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { ScanEye, Sparkles, TrendingUp, TrendingDown, Minus, Plus } from 'lucide-react';

interface Reflection {
  id: string;
  content: string;
  mood: number;
  energy: number;
  clarity: number;
  insights: string[];
  createdAt: string;
}

export function ReflectionMirrorModule() {
  const [reflections, setReflections] = useState<Reflection[]>(() => {
    try {
      const stored = localStorage.getItem('reflections');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  
  const [loading, setLoading] = useState(false);
  
  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('reflections', JSON.stringify(reflections));
    } catch (error) {
      console.error('Error saving reflections:', error);
    }
  }, [reflections]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    mood: 5,
    energy: 5,
    clarity: 5,
  });

  // Check if user can create a new reflection (max 1 per hour)
  const canCreateReflection = () => {
    if (reflections.length === 0) return true;
    
    const lastReflection = reflections.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const lastReflectionTime = new Date(lastReflection.createdAt).getTime();
    
    return lastReflectionTime < oneHourAgo;
  };

  const getTimeUntilNextReflection = () => {
    if (reflections.length === 0) return null;
    
    const lastReflection = reflections.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    
    const lastTime = new Date(lastReflection.createdAt).getTime();
    const nextTime = lastTime + (60 * 60 * 1000);
    const minutesLeft = Math.ceil((nextTime - Date.now()) / (60 * 1000));
    
    return minutesLeft > 0 ? minutesLeft : 0;
  };

  const handleCreateReflection = async () => {
    if (!formData.content.trim()) return;

    // Check rate limit
    if (!canCreateReflection()) {
      const minutesLeft = getTimeUntilNextReflection();
      alert(`Please wait ${minutesLeft} more minute${minutesLeft !== 1 ? 's' : ''} before creating another reflection. This prevents overwhelming yourself with too many reflections at once.`);
      return;
    }

    try {
      // Create new reflection with simple insight
      const aiInsight = `Reflection recorded. Mood: ${formData.mood}/10, Energy: ${formData.energy}/10, Clarity: ${formData.clarity}/10`;

      const newReflection: Reflection = {
        id: `reflection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: formData.content,
        mood: formData.mood,
        energy: formData.energy,
        clarity: formData.clarity,
        insights: [aiInsight],
        createdAt: new Date().toISOString()
      };

      // Add to state
      setReflections([...reflections, newReflection]);
      
      // Reset form
      setFormData({
        content: '',
        mood: 5,
        energy: 5,
        clarity: 5,
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating reflection:', error);
      alert('Failed to save reflection. Please try again.');
    }
  };

  const sortedReflections = [...reflections].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const calculateEntropy = () => {
    if (sortedReflections.length === 0) return 50;
    
    // Calculate variance in recent reflections
    const recent = sortedReflections.slice(0, 5);
    const avgMood = recent.reduce((sum, r) => sum + r.mood, 0) / recent.length;
    const avgEnergy = recent.reduce((sum, r) => sum + r.energy, 0) / recent.length;
    
    const variance = recent.reduce((sum, r) => {
      return sum + Math.abs(r.mood - avgMood) + Math.abs(r.energy - avgEnergy);
    }, 0) / recent.length;
    
    return Math.min(100, 50 + variance * 5);
  };

  const entropy = calculateEntropy();

  const getEntropyTrend = () => {
    if (sortedReflections.length < 2) return 'stable';
    const recent = sortedReflections.slice(0, 3);
    const older = sortedReflections.slice(3, 6);
    
    if (older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, r) => sum + r.mood + r.energy, 0) / (recent.length * 2);
    const olderAvg = older.reduce((sum, r) => sum + r.mood + r.energy, 0) / (older.length * 2);
    
    if (recentAvg > olderAvg + 1) return 'increasing';
    if (recentAvg < olderAvg - 1) return 'decreasing';
    return 'stable';
  };

  const entropyTrend = getEntropyTrend();

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 h-0">
        <div className="space-y-6 max-w-6xl p-4 md:p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <ScanEye className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2>Reflection Mirror</h2>
            <p className="text-muted-foreground">
              Guided self-awareness and pattern recognition
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!canCreateReflection()} title={!canCreateReflection() ? `Wait ${getTimeUntilNextReflection()} min` : ''}>
              <Plus className="w-4 h-4 mr-2" />
              New Reflection
              {!canCreateReflection() && ` (${getTimeUntilNextReflection()}m)`}
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-2xl sm:w-full max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="text-base sm:text-lg">Record a Reflection</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Take a moment to reflect on your current state and thoughts
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-0 flex-1 min-h-0">
              <div className="space-y-6 py-4 px-1">
              <div className="space-y-2">
                <Label htmlFor="content">What's on your mind?</Label>
                <Textarea
                  id="content"
                  placeholder="Share your thoughts, feelings, or observations..."
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Mood: {formData.mood}/10</Label>
                  <Slider
                    value={[formData.mood]}
                    onValueChange={([value]) => setFormData(prev => ({ ...prev, mood: value }))}
                    min={1}
                    max={10}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Energy: {formData.energy}/10</Label>
                  <Slider
                    value={[formData.energy]}
                    onValueChange={([value]) => setFormData(prev => ({ ...prev, energy: value }))}
                    min={1}
                    max={10}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Clarity: {formData.clarity}/10</Label>
                  <Slider
                    value={[formData.clarity]}
                    onValueChange={([value]) => setFormData(prev => ({ ...prev, clarity: value }))}
                    min={1}
                    max={10}
                    step={1}
                  />
                </div>
              </div>
              </div>
            </ScrollArea>
            <DialogFooter className="flex-shrink-0 gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="text-sm sm:text-base">Cancel</Button>
              <Button onClick={handleCreateReflection} disabled={!formData.content.trim()} className="text-sm sm:text-base">
                Save Reflection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Entropy Overview */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg mb-1">Reflection Entropy</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Variability in your emotional and mental state
              </p>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="flex items-center gap-2">
                  {entropyTrend === 'increasing' && <TrendingUp className="w-3 h-3" />}
                  {entropyTrend === 'decreasing' && <TrendingDown className="w-3 h-3" />}
                  {entropyTrend === 'stable' && <Minus className="w-3 h-3" />}
                  {entropyTrend === 'increasing' ? 'Increasing' : entropyTrend === 'decreasing' ? 'Decreasing' : 'Stable'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {sortedReflections.length} total reflections
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-5xl text-purple-600">{Math.round(entropy)}%</div>
              <p className="text-sm text-muted-foreground">Current variance</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reflections List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Loading reflections...</p>
            </CardContent>
          </Card>
        ) : sortedReflections.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ScanEye className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="mb-2">No reflections yet</h3>
              <p className="text-muted-foreground mb-4">
                Start your self-awareness journey by recording your first reflection
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Reflection
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          sortedReflections.map(reflection => (
            <Card key={reflection.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base mb-2">{reflection.content}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(reflection.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Badge variant="outline">Mood: {reflection.mood}/10</Badge>
                    <Badge variant="outline">Energy: {reflection.energy}/10</Badge>
                    <Badge variant="outline">Clarity: {reflection.clarity}/10</Badge>
                  </div>
                </div>
              </CardHeader>
              {reflection.insights && reflection.insights.length > 0 && (
                <CardContent>
                  <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm mb-1">AI Insight</h4>
                      <p className="text-sm text-muted-foreground">{reflection.insights[0]}</p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
        </div>
      </ScrollArea>
    </div>
  );
}