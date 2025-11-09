import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { BookOpen, Sparkles, Calendar, TrendingUp, Loader2, Edit } from 'lucide-react';
import { generateChapterContent, editChapter, generateStoryInsights } from '../../lib/humanmodules/ai-service';
import { toast } from 'sonner';

const storyChapters = [
  {
    id: '1',
    chapter: 'Chapter 1',
    title: 'The Foundation Years',
    period: '2015-2018',
    theme: 'Learning & Discovery',
    keyEvents: 12,
    status: 'complete'
  },
  {
    id: '2',
    chapter: 'Chapter 2',
    title: 'Breaking Through',
    period: '2018-2021',
    theme: 'Growth & Challenges',
    keyEvents: 18,
    status: 'complete'
  },
  {
    id: '3',
    chapter: 'Chapter 3',
    title: 'Evolution & Transformation',
    period: '2021-2024',
    theme: 'Mastery & Innovation',
    keyEvents: 24,
    status: 'complete'
  },
  {
    id: '4',
    chapter: 'Chapter 4',
    title: 'The Current Arc',
    period: '2024-Present',
    theme: 'Integration & Purpose',
    keyEvents: 7,
    status: 'active'
  },
  {
    id: '5',
    chapter: 'Chapter 5',
    title: 'Future Possibilities',
    period: '2025-2028',
    theme: 'Envisioned Path',
    keyEvents: 0,
    status: 'draft'
  }
];

const narrativeInsights = [
  {
    type: 'Pattern',
    title: 'Recurring Theme: Resilience',
    description: 'Your story shows consistent patterns of overcoming obstacles through adaptation and learning.',
    strength: 'high'
  },
  {
    type: 'Character Arc',
    title: 'From Learner to Leader',
    description: 'Clear progression from seeking guidance to mentoring others.',
    strength: 'medium'
  },
  {
    type: 'Plot Twist',
    title: 'The 2020 Pivot',
    description: 'Major directional change that became a turning point in your narrative.',
    strength: 'high'
  },
  {
    type: 'Supporting Cast',
    title: 'Key Relationships',
    description: '15 individuals who played pivotal roles in your story development.',
    strength: 'medium'
  }
];

export function NarrativeEngineModule() {
  const [selectedChapter, setSelectedChapter] = useState<typeof storyChapters[0] | null>(null);
  const [readDialogOpen, setReadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [insightsDialogOpen, setInsightsDialogOpen] = useState(false);
  const [aiContent, setAiContent] = useState<string>('');
  const [editRequest, setEditRequest] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge variant="secondary">Complete</Badge>;
      case 'active':
        return <Badge>Active</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return null;
    }
  };

  const handleReadChapter = async (chapter: typeof storyChapters[0]) => {
    setSelectedChapter(chapter);
    setReadDialogOpen(true);
    setIsGenerating(true);
    
    try {
      const response = await generateChapterContent(chapter);
      setAiContent(response.content);
      toast.success('Chapter generated');
    } catch (error) {
      console.error('Error generating chapter:', error);
      toast.error('Failed to generate chapter. Please check your OpenAI API key.');
      setAiContent('Unable to generate chapter content at this time. Please ensure your OpenAI API key is properly configured.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditChapter = async (chapter: typeof storyChapters[0]) => {
    setSelectedChapter(chapter);
    setEditDialogOpen(true);
  };

  const handleSubmitEdit = async () => {
    if (!selectedChapter || !editRequest.trim()) {
      toast.error('Please enter your edit request');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await editChapter(selectedChapter, editRequest);
      setAiContent(response.content);
      toast.success('Edit suggestions generated');
    } catch (error) {
      console.error('Error editing chapter:', error);
      toast.error('Failed to generate edits. Please check your OpenAI API key.');
      setAiContent('Unable to generate edit suggestions at this time. Please ensure your OpenAI API key is properly configured.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateSummary = async () => {
    setInsightsDialogOpen(true);
    setIsGenerating(true);
    
    try {
      const response = await generateStoryInsights(storyChapters);
      setAiContent(response.content);
      toast.success('Story insights generated');
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate insights. Please check your OpenAI API key.');
      setAiContent('Unable to generate story insights at this time. Please ensure your OpenAI API key is properly configured.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 h-0">
        <div className="space-y-6 p-4 md:p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-amber-500 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl">Story Compiler</h2>
              <p className="text-sm md:text-base text-muted-foreground">
                Generates cohesive life narratives using AI-powered storytelling
              </p>
            </div>
          </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Total Chapters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{storyChapters.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {storyChapters.filter(c => c.status === 'complete').length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Key Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">
              {storyChapters.reduce((sum, c) => sum + c.keyEvents, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Documented moments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Story Coherence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">87%</div>
            <p className="text-xs text-muted-foreground mt-1">Narrative strength</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Character Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Positive trajectory</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Story Timeline</CardTitle>
          <CardDescription>
            Life chapters organized as a coherent narrative
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {storyChapters.map((chapter, idx) => (
            <div 
              key={chapter.id}
              className="relative p-3 md:p-4 rounded-lg border border-border hover:shadow-md transition-shadow"
            >
              {idx < storyChapters.length - 1 && (
                <div className="absolute left-6 top-full h-3 w-0.5 bg-border" />
              )}
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 w-full min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs text-muted-foreground">{chapter.chapter}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{chapter.period}</span>
                      </div>
                      <h4 className="text-sm md:text-base break-words">{chapter.title}</h4>
                    </div>
                    <div className="self-start flex-shrink-0">
                      {getStatusBadge(chapter.status)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground">Theme: </span>
                        <span className="break-words">{chapter.theme}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Events: </span>
                        <span>{chapter.keyEvents}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1 sm:flex-initial"
                        onClick={() => handleReadChapter(chapter)}
                      >
                        <BookOpen className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline">Read Chapter</span>
                        <span className="sm:hidden">Read</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1 sm:flex-initial"
                        onClick={() => handleEditChapter(chapter)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      {chapter.status === 'active' && (
                        <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
                          <Sparkles className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">AI Insights</span>
                          <span className="sm:hidden">Insights</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Narrative Insights</CardTitle>
          <CardDescription>
            AI-detected patterns and themes in your life story
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {narrativeInsights.map((insight, idx) => (
            <div 
              key={idx}
              className="p-3 md:p-4 rounded-lg bg-muted/50"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <Badge variant="outline" className="text-xs mb-2">
                    {insight.type}
                  </Badge>
                  <h4 className="text-sm break-words">{insight.title}</h4>
                </div>
                <Badge variant={insight.strength === 'high' ? 'default' : 'secondary'} className="self-start flex-shrink-0">
                  {insight.strength} strength
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground break-words">{insight.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Generate Story Summary</CardTitle>
            <CardDescription>
              Create an AI-powered narrative summary of your journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={handleGenerateSummary}>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Summary
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create New Chapter</CardTitle>
            <CardDescription>
              Begin documenting a new phase of your life
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Add Chapter
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Read Chapter Dialog */}
      <Dialog open={readDialogOpen} onOpenChange={setReadDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {selectedChapter?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedChapter?.period} • {selectedChapter?.theme}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedChapter && (
              <div className="flex gap-2">
                <Badge>{selectedChapter.chapter}</Badge>
                <Badge variant="outline">{selectedChapter.keyEvents} key events</Badge>
                {getStatusBadge(selectedChapter.status)}
              </div>
            )}
            
            {isGenerating ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground">AI is writing your chapter...</p>
                </div>
              </div>
            ) : aiContent ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="p-6 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 whitespace-pre-wrap">
                  {aiContent}
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => {
              setReadDialogOpen(false);
              setAiContent('');
            }}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Chapter Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-primary" />
              Edit: {selectedChapter?.title}
            </DialogTitle>
            <DialogDescription>
              Describe how you'd like to edit this chapter
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedChapter && (
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-sm mb-1"><span className="font-medium">Period:</span> {selectedChapter.period}</p>
                <p className="text-sm"><span className="font-medium">Theme:</span> {selectedChapter.theme}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Edit Request</label>
              <Textarea
                placeholder="Example: Add more detail about the career transition, emphasize the challenges faced..."
                value={editRequest}
                onChange={(e) => setEditRequest(e.target.value)}
                rows={4}
              />
            </div>
            
            {isGenerating ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground">Generating edit suggestions...</p>
                </div>
              </div>
            ) : aiContent ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 whitespace-pre-wrap">
                  {aiContent}
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setEditDialogOpen(false);
              setAiContent('');
              setEditRequest('');
            }}>
              Close
            </Button>
            <Button onClick={handleSubmitEdit} disabled={!editRequest.trim()}>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Suggestions
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Story Insights Dialog */}
      <Dialog open={insightsDialogOpen} onOpenChange={setInsightsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Your Life Story: AI Analysis
            </DialogTitle>
            <DialogDescription>
              Deep narrative insights across all chapters
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {isGenerating ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground">Analyzing your life narrative...</p>
                </div>
              </div>
            ) : aiContent ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="p-6 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 whitespace-pre-wrap">
                  {aiContent}
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => {
              setInsightsDialogOpen(false);
              setAiContent('');
            }}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
        </div>
      </ScrollArea>
    </div>
  );
}