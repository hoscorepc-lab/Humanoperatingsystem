import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Heart, TrendingUp, Activity, Smile, Frown, Meh, Loader2 } from 'lucide-react';
import { calibrateEmotion } from '../../lib/humanmodules/ai-service';
import { toast } from 'sonner';

const emotionalMetrics = [
  { name: 'Joy', value: 72, color: 'bg-yellow-500', trend: '+5%' },
  { name: 'Calm', value: 65, color: 'bg-blue-500', trend: '+2%' },
  { name: 'Energy', value: 58, color: 'bg-green-500', trend: '-3%' },
  { name: 'Focus', value: 81, color: 'bg-purple-500', trend: '+8%' },
  { name: 'Resilience', value: 69, color: 'bg-orange-500', trend: '+4%' },
  { name: 'Connection', value: 54, color: 'bg-pink-500', trend: '-1%' }
];

const dailyCalibrations = [
  {
    time: '08:00',
    mood: 'positive',
    energy: 85,
    note: 'Morning meditation completed'
  },
  {
    time: '12:00',
    mood: 'neutral',
    energy: 72,
    note: 'Productive morning session'
  },
  {
    time: '16:00',
    mood: 'positive',
    energy: 68,
    note: 'Afternoon walk taken'
  },
  {
    time: '20:00',
    mood: 'neutral',
    energy: 55,
    note: 'Evening wind-down routine'
  }
];

export function EmotionalBIOSModule() {
  const [calibrationDialogOpen, setCalibrationDialogOpen] = useState(false);
  const [selectedState, setSelectedState] = useState<'great' | 'okay' | 'struggling' | null>(null);
  const [aiGuidance, setAiGuidance] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'positive': return <Smile className="w-4 h-4 text-green-500" />;
      case 'negative': return <Frown className="w-4 h-4 text-red-500" />;
      default: return <Meh className="w-4 h-4 text-gray-500" />;
    }
  };

  const overallWellbeing = Math.round(
    emotionalMetrics.reduce((sum, m) => sum + m.value, 0) / emotionalMetrics.length
  );

  const handleCalibration = async (state: 'great' | 'okay' | 'struggling') => {
    setSelectedState(state);
    setCalibrationDialogOpen(true);
    setIsAnalyzing(true);
    
    try {
      const response = await calibrateEmotion(state, {
        currentMetrics: emotionalMetrics,
        wellbeing: overallWellbeing,
        recentCalibrations: dailyCalibrations.length
      });
      
      setAiGuidance(response.content);
      toast.success(`Calibration recorded: ${state}`);
    } catch (error) {
      console.error('Error calibrating emotion:', error);
      toast.error('Failed to get guidance. Please check your OpenAI API key.');
      setAiGuidance('Unable to generate emotional guidance at this time. Please ensure your OpenAI API key is properly configured.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'great': return 'from-green-500 to-emerald-600';
      case 'okay': return 'from-blue-500 to-cyan-600';
      case 'struggling': return 'from-orange-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'great': return <Smile className="w-8 h-8 text-white" />;
      case 'okay': return <Meh className="w-8 h-8 text-white" />;
      case 'struggling': return <Frown className="w-8 h-8 text-white" />;
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 h-0">
        <div className="p-4 sm:p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-pink-500 flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h2>Affective Firmware</h2>
              <p className="text-muted-foreground">
                Regulates emotional baseline settings with AI-powered support
              </p>
            </div>
          </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Overall Wellbeing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{overallWellbeing}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">+3.2%</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Today's Calibrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{dailyCalibrations.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Check-ins completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Best Metric
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">Focus</div>
            <p className="text-xs text-muted-foreground mt-1">81% score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">12</div>
            <p className="text-xs text-muted-foreground mt-1">Days calibrated</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Emotional Metrics</CardTitle>
          <CardDescription>
            Real-time emotional state tracking across key dimensions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {emotionalMetrics.map(metric => (
              <div key={metric.name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{metric.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {metric.trend}
                    </Badge>
                  </div>
                  <span className="text-sm">{metric.value}%</span>
                </div>
                <Progress value={metric.value} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Today's Calibration Log</CardTitle>
          <CardDescription>
            Your emotional check-ins throughout the day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dailyCalibrations.map((cal, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
              >
                <div className="text-sm font-medium w-16">{cal.time}</div>
                <div className="flex items-center gap-2">
                  {getMoodIcon(cal.mood)}
                </div>
                <div className="flex-1">
                  <div className="text-sm">{cal.note}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">Energy:</span>
                    <Progress value={cal.energy} className="h-1 w-20" />
                    <span className="text-xs">{cal.energy}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Calibration</CardTitle>
          <CardDescription>
            How are you feeling right now? Get AI-powered guidance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => handleCalibration('great')}
            >
              <Smile className="w-4 h-4 mr-2" />
              Great
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => handleCalibration('okay')}
            >
              <Meh className="w-4 h-4 mr-2" />
              Okay
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => handleCalibration('struggling')}
            >
              <Frown className="w-4 h-4 mr-2" />
              Struggling
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calibration Dialog */}
      <Dialog open={calibrationDialogOpen} onOpenChange={setCalibrationDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedState && (
                <div className={`p-2 rounded-lg bg-gradient-to-br ${getStateColor(selectedState)}`}>
                  {getStateIcon(selectedState)}
                </div>
              )}
              Feeling {selectedState}
            </DialogTitle>
            <DialogDescription>
              AI-powered emotional support and guidance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedState && (
              <div className={`p-4 rounded-lg bg-gradient-to-br ${getStateColor(selectedState)}/10 border border-${getStateColor(selectedState)}/20`}>
                <p className="text-sm">
                  <span className="font-medium">Current state:</span> {selectedState.charAt(0).toUpperCase() + selectedState.slice(1)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Recorded at {new Date().toLocaleTimeString()}
                </p>
              </div>
            )}
            
            {isAnalyzing ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground">Preparing personalized guidance...</p>
                </div>
              </div>
            ) : aiGuidance ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 whitespace-pre-wrap">
                  {aiGuidance}
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setCalibrationDialogOpen(false);
              setAiGuidance('');
            }}>
              Close
            </Button>
            <Button onClick={() => {
              toast.success('Calibration saved to your emotional log');
              setCalibrationDialogOpen(false);
              setAiGuidance('');
            }}>
              Save Calibration
            </Button>
          </div>
        </DialogContent>
      </Dialog>
        </div>
      </ScrollArea>
    </div>
  );
}
