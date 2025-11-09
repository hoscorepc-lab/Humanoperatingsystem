import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Zap, Flame, Plus, Check } from 'lucide-react';

interface Habit {
  id: string;
  name: string;
  description: string;
  category: 'order' | 'balance' | 'chaos';
  entropyImpact: number;
  frequency: string;
  currentStreak: number;
  longestStreak: number;
  completions: string[];
  createdAt: string;
  updatedAt: string;
}

export function HabitForgeModule() {
  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const stored = localStorage.getItem('habits');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  
  const [loading, setLoading] = useState(false);
  
  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('habits', JSON.stringify(habits));
    } catch (error) {
      console.error('Error saving habits:', error);
    }
  }, [habits]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'balance' as 'order' | 'balance' | 'chaos',
  });

  const handleCreateHabit = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a habit name');
      return;
    }

    try {
      // Calculate entropy impact based on category
      let entropyImpact = 0;
      switch (formData.category) {
        case 'order':
          entropyImpact = -3;
          break;
        case 'balance':
          entropyImpact = 0;
          break;
        case 'chaos':
          entropyImpact = 3;
          break;
      }

      const newHabit: Habit = {
        id: `habit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        entropyImpact,
        frequency: 'daily',
        currentStreak: 0,
        longestStreak: 0,
        completions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setHabits([...habits, newHabit]);

      setFormData({
        name: '',
        description: '',
        category: 'balance',
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating habit:', error);
      alert('Failed to create habit. Please try again.');
    }
  };

  const toggleHabitCompletion = async (habit: Habit) => {
    const today = new Date().toISOString().split('T')[0];
    const isCompletedToday = habit.completions?.includes(today);

    let updatedCompletions: string[];
    let updatedStreak = habit.currentStreak;
    let updatedLongestStreak = habit.longestStreak;

    if (isCompletedToday) {
      // Remove completion
      updatedCompletions = habit.completions.filter(d => d !== today);
      updatedStreak = Math.max(0, habit.currentStreak - 1);
    } else {
      // Add completion
      updatedCompletions = [...habit.completions, today];
      updatedStreak = habit.currentStreak + 1;
      updatedLongestStreak = Math.max(habit.longestStreak, updatedStreak);
    }

    setHabits(habits.map(h => 
      h.id === habit.id 
        ? {
            ...h,
            completions: updatedCompletions,
            currentStreak: updatedStreak,
            longestStreak: updatedLongestStreak,
          }
        : h
    ));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'order':
        return {
          bg: 'bg-blue-500',
          border: 'border-blue-200',
          light: 'bg-blue-50 dark:bg-blue-950/20',
        };
      case 'balance':
        return {
          bg: 'bg-purple-500',
          border: 'border-purple-200',
          light: 'bg-purple-50 dark:bg-purple-950/20',
        };
      case 'chaos':
        return {
          bg: 'bg-orange-500',
          border: 'border-orange-200',
          light: 'bg-orange-50 dark:bg-orange-950/20',
        };
      default:
        return {
          bg: 'bg-gray-500',
          border: 'border-gray-200',
          light: 'bg-gray-50 dark:bg-gray-950/20',
        };
    }
  };

  const calculateHabitEntropy = () => {
    const completedToday = habits.filter(h => {
      const today = new Date().toISOString().split('T')[0];
      return h.completions?.includes(today);
    });

    const totalImpact = completedToday.reduce((sum, h) => sum + h.entropyImpact, 0);
    const baseEntropy = 50;
    return Math.max(0, Math.min(100, baseEntropy + totalImpact * 2));
  };

  const habitEntropy = calculateHabitEntropy();

  const orderHabits = habits.filter(h => h.category === 'order');
  const balanceHabits = habits.filter(h => h.category === 'balance');
  const chaosHabits = habits.filter(h => h.category === 'chaos');

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 h-0">
        <div className="p-4 sm:p-6 space-y-6 max-w-6xl">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2>Habit Forge</h2>
            <p className="text-muted-foreground">
              Build routines that balance order and creative chaos
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Habit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Forge a New Habit</DialogTitle>
              <DialogDescription>
                Create a habit that shapes your daily entropy
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Habit Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Morning Meditation"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What does this habit involve?"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="w-full px-3 py-2 rounded-md border border-input bg-background"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                >
                  <option value="order">Order (Reduces entropy, builds structure)</option>
                  <option value="balance">Balanced (Maintains equilibrium)</option>
                  <option value="chaos">Chaos (Increases entropy, sparks creativity)</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateHabit} disabled={!formData.name.trim()}>
                Create Habit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Habit Entropy */}
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg mb-1">Habit Entropy</h3>
              <p className="text-sm text-muted-foreground">
                Today's entropy balance from completed habits
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl text-orange-600">{Math.round(habitEntropy)}%</div>
              <p className="text-sm text-muted-foreground">Current level</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <div className="w-6 h-6 rounded bg-blue-500" />
              </div>
              <div>
                <div className="text-3xl">{orderHabits.length}</div>
                <p className="text-sm text-muted-foreground">Order Habits</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <div className="w-6 h-6 rounded bg-purple-500" />
              </div>
              <div>
                <div className="text-3xl">{balanceHabits.length}</div>
                <p className="text-sm text-muted-foreground">Balanced Habits</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <div className="w-6 h-6 rounded bg-orange-500" />
              </div>
              <div>
                <div className="text-3xl">{chaosHabits.length}</div>
                <p className="text-sm text-muted-foreground">Chaos Habits</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Habits List */}
      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Loading habits...</p>
          </CardContent>
        </Card>
      ) : habits.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Zap className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="mb-2">No habits yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building your routines by creating your first habit
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Habit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {['order', 'balance', 'chaos'].map(category => {
            const categoryHabits = habits.filter(h => h.category === category);
            if (categoryHabits.length === 0) return null;

            const colors = getCategoryColor(category);

            return (
              <Card key={category} className={`border-2 ${colors.border}`}>
                <CardHeader className={colors.light}>
                  <CardTitle className="flex items-center gap-2 capitalize">
                    <div className={`w-4 h-4 rounded ${colors.bg}`} />
                    {category} Habits
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {categoryHabits.map(habit => {
                      const today = new Date().toISOString().split('T')[0];
                      const isCompletedToday = habit.completions?.includes(today);

                      return (
                        <div
                          key={habit.id}
                          className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                            isCompletedToday ? 'bg-accent/50 border-accent' : 'bg-card'
                          }`}
                        >
                          <Button
                            variant={isCompletedToday ? "default" : "outline"}
                            size="icon"
                            className={`flex-shrink-0 ${isCompletedToday ? colors.bg : ''}`}
                            onClick={() => toggleHabitCompletion(habit)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>

                          <div className="flex-1">
                            <h4 className="text-sm mb-1">{habit.name}</h4>
                            {habit.description && (
                              <p className="text-xs text-muted-foreground">{habit.description}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="flex items-center gap-1">
                              <Flame className="w-4 h-4 text-orange-500" />
                              <span className="text-sm">{habit.currentStreak}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Best: {habit.longestStreak}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
        </div>
      </ScrollArea>
    </div>
  );
}
