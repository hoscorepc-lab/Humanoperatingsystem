import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Layers, CheckCircle2, Shield, Plus, Edit, Trash2, Power } from 'lucide-react';

interface CoreValue {
  id: string;
  name: string;
  description: string;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  lastUsed?: Date;
}

const initialValues: CoreValue[] = [
  {
    id: '1',
    name: 'Continuous Growth',
    description: 'Commit to lifelong learning and personal development',
    priority: 1,
    isActive: true,
    createdAt: new Date('2024-01-15'),
    lastUsed: new Date()
  },
  {
    id: '2',
    name: 'Authenticity',
    description: 'Be true to myself and express genuine thoughts and feelings',
    priority: 1,
    isActive: true,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    name: 'Impact Over Effort',
    description: 'Focus on outcomes that create meaningful change',
    priority: 2,
    isActive: true,
    createdAt: new Date('2024-01-20'),
    lastUsed: new Date()
  },
  {
    id: '4',
    name: 'Deep Work',
    description: 'Prioritize focused, distraction-free work on important tasks',
    priority: 1,
    isActive: true,
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '5',
    name: 'Health First',
    description: 'Physical and mental wellbeing are non-negotiable foundations',
    priority: 1,
    isActive: true,
    createdAt: new Date('2024-01-15'),
    lastUsed: new Date()
  },
  {
    id: '6',
    name: 'Creative Expression',
    description: 'Make time for artistic and creative pursuits',
    priority: 2,
    isActive: true,
    createdAt: new Date('2024-02-10'),
  },
  {
    id: '7',
    name: 'Meaningful Relationships',
    description: 'Invest in deep connections over superficial interactions',
    priority: 1,
    isActive: true,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '8',
    name: 'Financial Independence',
    description: 'Build sustainable wealth and financial security',
    priority: 2,
    isActive: true,
    createdAt: new Date('2024-02-05'),
  },
  {
    id: '9',
    name: 'Environmental Stewardship',
    description: 'Make choices that protect and preserve the environment',
    priority: 3,
    isActive: true,
    createdAt: new Date('2024-03-01'),
  },
  {
    id: '10',
    name: 'Gratitude Practice',
    description: 'Regularly acknowledge and appreciate what I have',
    priority: 2,
    isActive: true,
    createdAt: new Date('2024-02-15'),
  },
  {
    id: '11',
    name: 'Curiosity & Exploration',
    description: 'Embrace the unknown and seek new experiences',
    priority: 2,
    isActive: true,
    createdAt: new Date('2024-02-20'),
  }
];

// Helper to ensure dates are Date objects (handle deserialization from JSON)
const ensureDates = (values: CoreValue[]): CoreValue[] => {
  return values.map(v => ({
    ...v,
    createdAt: v.createdAt instanceof Date ? v.createdAt : new Date(v.createdAt),
    lastUsed: v.lastUsed ? (v.lastUsed instanceof Date ? v.lastUsed : new Date(v.lastUsed)) : undefined
  }));
};

export function KernelModule() {
  // Use localStorage with useState pattern (no HOSProvider dependency)
  const [rawValues, setRawValues] = useState<CoreValue[]>(() => {
    if (typeof window === 'undefined') return initialValues;
    const stored = localStorage.getItem('hos-module-core-values');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored core values:', e);
        return initialValues;
      }
    }
    return initialValues;
  });

  // Persist to localStorage whenever values change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hos-module-core-values', JSON.stringify(rawValues));
    }
  }, [rawValues]);
  
  // Ensure dates are properly converted
  const values = ensureDates(rawValues);
  const setValues = (newValues: CoreValue[] | ((prev: CoreValue[]) => CoreValue[])) => {
    if (typeof newValues === 'function') {
      setRawValues(prev => newValues(ensureDates(prev)));
    } else {
      setRawValues(newValues);
    }
  };
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<CoreValue | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 1
  });

  const activeValues = values.filter(v => v.isActive);
  const totalValues = values.length;
  const alignment = Math.round((activeValues.length / totalValues) * 100);

  const handleCreateValue = () => {
    const newValue: CoreValue = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      priority: formData.priority,
      isActive: true,
      createdAt: new Date()
    };

    setValues(prev => [...prev, newValue]);
    setIsDialogOpen(false);
    setFormData({ name: '', description: '', priority: 1 });
  };

  const handleUpdateValue = () => {
    if (!editingValue) return;

    setValues(prev => prev.map(v => 
      v.id === editingValue.id 
        ? { ...v, name: formData.name, description: formData.description, priority: formData.priority }
        : v
    ));
    setEditingValue(null);
    setIsDialogOpen(false);
    setFormData({ name: '', description: '', priority: 1 });
  };

  const handleDeleteValue = (id: string) => {
    setValues(prev => prev.filter(v => v.id !== id));
  };

  const toggleValueActive = (id: string) => {
    setValues(prev => prev.map(v => 
      v.id === id ? { ...v, isActive: !v.isActive } : v
    ));
  };

  const openEditDialog = (value: CoreValue) => {
    setEditingValue(value);
    setFormData({
      name: value.name,
      description: value.description,
      priority: value.priority
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingValue(null);
    setFormData({ name: '', description: '', priority: 1 });
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'Critical';
      case 2: return 'High';
      case 3: return 'Medium';
      default: return 'Low';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 h-0">
        <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto p-3 sm:p-4 md:p-6 w-full">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-purple-500 flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl md:text-2xl truncate">Core Values Kernel</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Foundational value & belief structures
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-muted-foreground">Active</span>
              </div>
              <span className="text-muted-foreground hidden sm:inline">•</span>
              <span className="text-muted-foreground">{activeValues.length} values</span>
            </div>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingValue(null); setFormData({ name: '', description: '', priority: 1 }); }} className="flex-shrink-0" size="sm">
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Install Value</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingValue ? 'Edit Value' : 'Install New Value'}</DialogTitle>
              <DialogDescription>
                {editingValue ? 'Update your core value configuration' : 'Define a new core value to guide your decisions'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Value Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Continuous Growth"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this value means to you..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level</Label>
                <select
                  id="priority"
                  className="w-full px-3 py-2 rounded-md border border-input bg-background"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                >
                  <option value={1}>Critical - Non-negotiable</option>
                  <option value={2}>High - Very Important</option>
                  <option value={3}>Medium - Important</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button onClick={editingValue ? handleUpdateValue : handleCreateValue}>
                {editingValue ? 'Update Value' : 'Install Value'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-semibold">{totalValues}</div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Values</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-semibold">{activeValues.length}</div>
                <p className="text-xs sm:text-sm text-muted-foreground">Active Values</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-semibold">{alignment}%</div>
                <p className="text-xs sm:text-sm text-muted-foreground">Alignment</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Values List */}
      <Card>
        <CardHeader>
          <CardTitle>Installed Values</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 sm:space-y-3">
            {values.map(value => (
              <div
                key={value.id}
                className={`p-3 sm:p-4 rounded-lg border transition-all ${
                  value.isActive 
                    ? 'bg-card border-border' 
                    : 'bg-muted/50 border-muted opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="text-sm sm:text-base truncate">{value.name}</h4>
                      <Badge variant="outline" className={`${getPriorityColor(value.priority)} text-white border-0 text-xs flex-shrink-0`}>
                        {getPriorityLabel(value.priority)}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{value.description}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="truncate">{value.createdAt.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      {value.lastUsed && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="truncate">Used {value.lastUsed.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 sm:h-10 sm:w-10"
                      onClick={() => toggleValueActive(value.id)}
                      title={value.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <Power className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${value.isActive ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 sm:h-10 sm:w-10"
                      onClick={() => openEditDialog(value)}
                    >
                      <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 sm:h-10 sm:w-10"
                      onClick={() => handleDeleteValue(value.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
        </div>
      </ScrollArea>
    </div>
  );
}