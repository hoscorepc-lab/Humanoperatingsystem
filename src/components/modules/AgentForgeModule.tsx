import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Bot,
  Save,
  Zap,
  Brain,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface AgentForgeModuleProps {
  userId: string;
  onBackToDashboard?: () => void;
}

interface AgentFormData {
  name: string;
  purpose: string;
  personality: string;
  tone: 'professional' | 'friendly' | 'creative' | 'technical' | 'casual';
  systemPrompt: string;
  capabilities: string;
  restrictions: string;
  description: string;
  tags: string;
  category: string;
  avatar: string;
}

export function AgentForgeModule({ userId, onBackToDashboard }: AgentForgeModuleProps) {
  const [totalAgents, setTotalAgents] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [agentLimit, setAgentLimit] = useState(10);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<AgentFormData>({
    name: '',
    purpose: '',
    personality: '',
    tone: 'friendly',
    systemPrompt: '',
    capabilities: '',
    restrictions: '',
    description: '',
    tags: '',
    category: '',
    avatar: ''
  });

  useEffect(() => {
    loadAgentCount();
  }, [userId]);

  const loadAgentCount = async () => {
    if (!userId) {
      console.log('No userId yet, skipping agent count load');
      return;
    }
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8d51d9e2/forge/agents?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTotalAgents(data.agents?.length || 0);
        setAgentLimit(data.limit || 10);
      }
    } catch (error) {
      console.error('Failed to load agent count:', error);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 250 * 1024) {
      toast.error('Logo must be under 250KB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
      setFormData({ ...formData, avatar: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const createAgent = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter a name for your agent');
      return;
    }
    if (!formData.purpose.trim()) {
      toast.error('Please enter a purpose for your agent');
      return;
    }
    if (!formData.category.trim()) {
      toast.error('Please select a category');
      return;
    }

    // Check if limit reached
    if (totalAgents >= agentLimit) {
      toast.error(`Agent limit reached (${agentLimit}). Delete an agent to create a new one.`);
      return;
    }

    setIsLoading(true);

    try {
      const agentData = {
        name: formData.name,
        purpose: formData.purpose,
        personality: formData.personality,
        tone: formData.tone,
        systemPrompt: formData.systemPrompt || formData.purpose,
        capabilities: formData.capabilities.split(',').map(s => s.trim()).filter(Boolean),
        restrictions: formData.restrictions.split(',').map(s => s.trim()).filter(Boolean),
        description: formData.description || formData.purpose,
        tags: formData.tags.split(',').map(s => s.trim()).filter(Boolean),
        category: formData.category,
        avatar: formData.avatar,
        status: 'factory' // Go directly to factory for testing
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8d51d9e2/forge/save`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId,
            agentData
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success('Agent created! Check your Agent Factory 🔧');
        
        // Reset form
        setFormData({
          name: '',
          purpose: '',
          personality: '',
          tone: 'friendly',
          systemPrompt: '',
          capabilities: '',
          restrictions: '',
          description: '',
          tags: '',
          category: '',
          avatar: ''
        });
        setLogoPreview('');
        loadAgentCount();
      } else {
        if (data.error === 'AGENT_LIMIT_REACHED') {
          toast.error(data.message || 'Agent limit reached');
        } else {
          toast.error(data.error || 'Failed to create agent');
        }
      }
    } catch (error) {
      console.error('Failed to create agent:', error);
      toast.error('Failed to create agent');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 h-0">
        <div className="p-4 sm:p-6 pb-20">
          {/* Header */}
          <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="relative">
            <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-purple-500" />
            <motion.div
              className="absolute -inset-2 bg-purple-500/20 rounded-full blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl mb-2">Agent Forge</h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
          Create custom AI agents that go directly to your private Factory for testing
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Badge variant="outline" className="gap-1.5">
            <Bot className="w-3 h-3" />
            {totalAgents}/{agentLimit} Agents
          </Badge>
        </div>
      </motion.div>

      {/* Creation Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <Card className="border-purple-500/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-purple-500" />
              <div>
                <CardTitle>Design Your AI Agent</CardTitle>
                <CardDescription>
                  Fill out the form below - your agent will be created in the Factory for private testing
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3">
                {/* Basic Information */}
                <div className="space-y-2">
                  <h3 className="text-xs sm:text-sm font-medium flex items-center gap-2">
                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />
                    Basic Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="name" className="text-xs sm:text-sm">
                        Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="e.g., Creative Writer"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="purpose" className="text-xs sm:text-sm">
                        Purpose <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="purpose"
                        placeholder="What tasks should this agent perform?"
                        value={formData.purpose}
                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                        rows={2}
                        className="text-sm resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="category" className="text-xs sm:text-sm">
                        Category <span className="text-destructive">*</span>
                      </Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger id="category" className="h-9">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="writing">Writing</SelectItem>
                          <SelectItem value="coding">Coding</SelectItem>
                          <SelectItem value="research">Research</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="entertainment">Entertainment</SelectItem>
                          <SelectItem value="health">Health</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="personality" className="text-xs sm:text-sm">Personality</Label>
                      <Input
                        id="personality"
                        placeholder="e.g., Friendly and helpful"
                        value={formData.personality}
                        onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-3" />

                {/* Capabilities & Logo */}
                <div className="space-y-2">
                  <h3 className="text-xs sm:text-sm font-medium flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />
                    Capabilities & Logo
                  </h3>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="capabilities" className="text-xs sm:text-sm">Capabilities</Label>
                      <Input
                        id="capabilities"
                        placeholder="e.g., Writing, Ideas (comma-separated)"
                        value={formData.capabilities}
                        onChange={(e) => setFormData({ ...formData, capabilities: e.target.value })}
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="restrictions" className="text-xs sm:text-sm">Restrictions</Label>
                      <Input
                        id="restrictions"
                        placeholder="e.g., No violent content (comma-separated)"
                        value={formData.restrictions}
                        onChange={(e) => setFormData({ ...formData, restrictions: e.target.value })}
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs sm:text-sm">Logo (Optional)</Label>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted/50 flex-shrink-0">
                          {logoPreview ? (
                            <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground/50" />
                          )}
                        </div>
                        <div className="flex-1">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-9"
                          >
                            <Upload className="w-3.5 h-3.5 mr-2" />
                            Upload
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            <div className="mt-4 pt-4 border-t">
              <Button
                onClick={createAgent}
                disabled={isLoading || !formData.name || !formData.purpose || !formData.category || totalAgents >= agentLimit}
                className="w-full gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 h-10 sm:h-11"
              >
                {isLoading ? (
                  <>Creating...</>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Create Agent
                  </>
                )}
              </Button>
              {totalAgents >= agentLimit && (
                <p className="text-xs text-center text-destructive mt-2">
                  Limit reached. Delete an agent to create new one.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
        </div>
      </ScrollArea>
    </div>
  );
}
