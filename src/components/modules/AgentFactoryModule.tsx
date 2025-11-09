import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Factory,
  Send,
  Trash2,
  Bot,
  MessageSquare,
  AlertCircle,
  Settings,
  Zap,
  Brain,
  TestTube,
  Globe,
  ArrowRight,
  ChevronRight,
  History,
  Save,
  CheckCircle2,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../ui/dialog';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import type { AgentManifest } from '../../types/agentforge';

interface AgentFactoryModuleProps {
  userId: string;
  onBackToDashboard?: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AgentVersion {
  version: string;
  timestamp: string;
  changes: string;
}

export function AgentFactoryModule({ userId, onBackToDashboard }: AgentFactoryModuleProps) {
  const [factoryAgents, setFactoryAgents] = useState<AgentManifest[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentManifest | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testMessages, setTestMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [agentConfig, setAgentConfig] = useState<any>({});
  const [versions, setVersions] = useState<AgentVersion[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [testMessages]);

  useEffect(() => {
    loadFactoryAgents();
  }, [userId]);

  const loadFactoryAgents = async () => {
    if (!userId) {
      console.log('No userId yet, skipping agent load');
      return;
    }
    
    try {
      console.log('Loading factory agents for userId:', userId);
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
        console.log('Factory agents response:', data);
        // Filter only factory status agents
        const factory = data.agents?.filter((a: AgentManifest) => a.status === 'factory') || [];
        console.log('Filtered factory agents:', factory);
        setFactoryAgents(factory);
      } else {
        console.error('Failed to load factory agents - status:', response.status);
      }
    } catch (error) {
      console.error('Failed to load factory agents:', error);
      toast.error('Failed to load factory agents');
    }
  };

  const startTesting = (agent: AgentManifest) => {
    setSelectedAgent(agent);
    setIsTesting(true);
    setTestMessages([
      {
        role: 'assistant',
        content: `Factory Test Session Started\n\nAgent: ${agent.name}\nVersion: ${agent.version}\nPurpose: ${agent.purpose}\n\nThis is a private sandbox. Test the agent's responses and behavior. Your tests won't be public.`,
        timestamp: new Date().toISOString()
      }
    ]);
    
    // Load versions
    const mockVersions = [
      { version: agent.version, timestamp: agent.updatedAt, changes: 'Current version' }
    ];
    setVersions(mockVersions);
  };

  const sendTestMessage = async () => {
    if (!inputMessage.trim() || !selectedAgent || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setTestMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8d51d9e2/forge/chat/${selectedAgent.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId,
            message: inputMessage,
            conversationHistory: testMessages
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toISOString()
        };

        setTestMessages(prev => [...prev, assistantMessage]);
      } else {
        toast.error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Failed to chat with agent:', error);
      toast.error('Failed to chat with agent');
    } finally {
      setIsLoading(false);
    }
  };

  const openConfigDialog = (agent: AgentManifest) => {
    setSelectedAgent(agent);
    setAgentConfig(agent.modelConfig);
    setShowConfigDialog(true);
  };

  const saveConfiguration = async () => {
    if (!selectedAgent) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8d51d9e2/forge/agents/${selectedAgent.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId,
            updates: {
              modelConfig: agentConfig,
              version: incrementVersion(selectedAgent.version)
            }
          })
        }
      );

      if (response.ok) {
        toast.success('Configuration saved');
        setShowConfigDialog(false);
        loadFactoryAgents();
      } else {
        toast.error('Failed to save configuration');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const publishAgent = async () => {
    if (!selectedAgent) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8d51d9e2/forge/agents/${selectedAgent.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId,
            updates: {
              status: 'published'
            }
          })
        }
      );

      if (response.ok) {
        toast.success('Agent published to Marketplace! 🎉');
        setShowPublishDialog(false);
        loadFactoryAgents();
        
        // Navigate to marketplace
        window.dispatchEvent(new CustomEvent('navigate-to-module', { detail: 'agent-marketplace' }));
      } else {
        toast.error('Failed to publish agent');
      }
    } catch (error) {
      console.error('Failed to publish:', error);
      toast.error('Failed to publish agent');
    } finally {
      setIsLoading(false);
    }
  };

  const incrementVersion = (currentVersion: string) => {
    const parts = currentVersion.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
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
            <Factory className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500" />
            <motion.div
              className="absolute -inset-2 bg-blue-500/20 rounded-full blur-xl"
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
        <h1 className="text-2xl sm:text-3xl mb-2">Agent Factory</h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
          Private sandbox for testing and evolving your agents before publishing
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Badge variant="outline" className="gap-1.5">
            <TestTube className="w-3 h-3" />
            {factoryAgents.length} In Factory
          </Badge>
        </div>
      </motion.div>

      {/* Main Content */}
      {!isTesting ? (
        <div className="max-w-6xl mx-auto space-y-6">
          {factoryAgents.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No agents in Factory yet. Create agents in Agent Forge and send them here for testing!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {factoryAgents.map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="group hover:shadow-lg hover:border-blue-500/30 transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {agent.avatar ? (
                              <img 
                                src={agent.avatar} 
                                alt={agent.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                              </div>
                            )}
                            <div>
                              <CardTitle className="text-base">{agent.name}</CardTitle>
                              <Badge variant="secondary" className="text-xs mt-1">
                                v{agent.version}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {agent.purpose}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>Testing Phase</span>
                          <Separator orientation="vertical" className="h-3" />
                          <TrendingUp className="w-3 h-3" />
                          <span>{agent.tone}</span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-2"
                            onClick={() => startTesting(agent)}
                          >
                            <TestTube className="w-3 h-3" />
                            Test
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openConfigDialog(agent)}
                          >
                            <Settings className="w-3 h-3" />
                          </Button>
                        </div>

                        <Button
                          className="w-full gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                          onClick={() => {
                            setSelectedAgent(agent);
                            setShowPublishDialog(true);
                          }}
                        >
                          <Globe className="w-4 h-4" />
                          Publish to Marketplace
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      ) : (
        /* Testing Interface */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="border-blue-500/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedAgent?.avatar ? (
                    <img 
                      src={selectedAgent.avatar} 
                      alt={selectedAgent.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <CardTitle>{selectedAgent?.name}</CardTitle>
                    <CardDescription>Private Testing Session</CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsTesting(false);
                    setTestMessages([]);
                  }}
                >
                  End Test
                </Button>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="p-0">
              <ScrollArea className="h-[400px] p-6">
                <div className="space-y-4">
                  {testMessages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          msg.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Test your agent..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendTestMessage()}
                    disabled={isLoading}
                  />
                  <Button onClick={sendTestMessage} disabled={isLoading || !inputMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Analytics */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Version History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {versions.map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">v{v.version}</Badge>
                      <span className="text-sm">{v.changes}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(v.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agent Configuration</DialogTitle>
            <DialogDescription>
              Fine-tune your agent's behavior and response parameters
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Temperature: {agentConfig.temperature?.toFixed(2)}</Label>
              <Slider
                value={[agentConfig.temperature || 0.7]}
                onValueChange={([val]) => setAgentConfig({ ...agentConfig, temperature: val })}
                min={0}
                max={2}
                step={0.1}
              />
              <p className="text-xs text-muted-foreground">
                Higher values make output more random, lower values more focused
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Max Tokens: {agentConfig.maxTokens}</Label>
              <Slider
                value={[agentConfig.maxTokens || 1000]}
                onValueChange={([val]) => setAgentConfig({ ...agentConfig, maxTokens: val })}
                min={100}
                max={4000}
                step={100}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveConfiguration} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish to Marketplace</DialogTitle>
            <DialogDescription>
              Make your agent public and shareable. Once published, it cannot be unpublished.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Your agent will be available for everyone to try and share.
              </AlertDescription>
            </Alert>
            <div className="rounded-lg border p-4">
              <h4 className="font-medium mb-2">{selectedAgent?.name}</h4>
              <p className="text-sm text-muted-foreground">{selectedAgent?.purpose}</p>
              <Badge variant="outline" className="mt-2">v{selectedAgent?.version}</Badge>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={publishAgent} 
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Globe className="w-4 h-4 mr-2" />
              Publish Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </div>
      </ScrollArea>
    </div>
  );
}
