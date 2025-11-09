import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Store,
  Send,
  Bot,
  MessageSquare,
  AlertCircle,
  Search,
  Share2,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Star,
  Users,
  Filter,
  X
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
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
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import type { AgentManifest } from '../../types/agentforge';
import { copyToClipboard } from '../../utils/clipboard';

interface AgentMarketplaceModuleProps {
  userId: string;
  onBackToDashboard?: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export function AgentMarketplaceModule({ userId, onBackToDashboard }: AgentMarketplaceModuleProps) {
  const [publishedAgents, setPublishedAgents] = useState<AgentManifest[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<AgentManifest[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentManifest | null>(null);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [demoMessages, setDemoMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [demoMessages]);

  useEffect(() => {
    loadPublishedAgents();
  }, []);

  useEffect(() => {
    filterAgents();
  }, [publishedAgents, searchQuery, categoryFilter]);

  const loadPublishedAgents = async () => {
    try {
      // Load all published agents from all users
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8d51d9e2/forge/marketplace`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPublishedAgents(data.agents || []);
      }
    } catch (error) {
      console.error('Failed to load marketplace agents:', error);
      toast.error('Failed to load marketplace');
    }
  };

  const filterAgents = () => {
    let filtered = [...publishedAgents];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(agent => agent.metadata?.category === categoryFilter);
    }

    setFilteredAgents(filtered);
  };

  const startDemo = (agent: AgentManifest) => {
    setSelectedAgent(agent);
    setIsDemoOpen(true);
    setDemoMessages([
      {
        role: 'assistant',
        content: `Hi! I'm ${agent.name}. ${agent.purpose}\n\nThis is a demo session with limited interactions. If you like what you see, you can create your own version!`,
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const sendDemoMessage = async () => {
    if (!inputMessage.trim() || !selectedAgent || isLoading) return;

    // Limit demo to 5 messages
    if (demoMessages.length >= 10) {
      toast.info('Demo limit reached. Create your own agent in Agent Forge!');
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setDemoMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8d51d9e2/forge/demo/${selectedAgent.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            message: inputMessage,
            conversationHistory: demoMessages
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

        setDemoMessages(prev => [...prev, assistantMessage]);
      } else {
        toast.error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Failed to demo agent:', error);
      toast.error('Failed to demo agent');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareAgent = async (agent: AgentManifest) => {
    const shareUrl = `https://hoslabs.com/agent/${agent.id}`;
    
    const success = await copyToClipboard(shareUrl);
    
    if (success) {
      toast.success('✨ Share link copied!', {
        description: 'Anyone with this link can view your agent after joining HOS'
      });
    } else {
      toast.error('Failed to copy link', {
        description: `Please copy manually: ${shareUrl}`
      });
    }
  };

  const categories = Array.from(new Set(publishedAgents.map(a => a.metadata?.category).filter(Boolean)));

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
            <Store className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-500" />
            <motion.div
              className="absolute -inset-2 bg-emerald-500/20 rounded-full blur-xl"
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
        <h1 className="text-2xl sm:text-3xl mb-2">Agent Marketplace</h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
          Discover, try, and share AI agents created by the community
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Badge variant="outline" className="gap-1.5">
            <Users className="w-3 h-3" />
            {publishedAgents.length} Published Agents
          </Badge>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <div className="max-w-6xl mx-auto mb-6 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search agents by name, purpose, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat as string}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="max-w-6xl mx-auto">
        {filteredAgents.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {publishedAgents.length === 0 
                ? 'No agents published yet. Be the first to publish an agent from Agent Factory!'
                : 'No agents match your search criteria.'
              }
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredAgents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.1 }}
                  className="h-full"
                >
                  <Card className="group hover:shadow-lg hover:border-emerald-500/30 transition-all duration-300 flex flex-col h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {agent.avatar ? (
                            <img 
                              src={agent.avatar} 
                              alt={agent.name}
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                              <Bot className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-base truncate">{agent.name}</CardTitle>
                            <Badge variant="outline" className="text-xs mt-1">
                              v{agent.version}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 flex-shrink-0"
                          onClick={() => handleShareAgent(agent)}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 flex-1 flex flex-col">
                      <p className="text-sm text-muted-foreground line-clamp-3 min-h-[3.6rem]">
                        {agent.purpose || agent.metadata?.description}
                      </p>

                      <div className="flex flex-wrap gap-1 min-h-[1.75rem]">
                        {agent.metadata?.tags?.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Sparkles className="w-3 h-3" />
                        <span className="truncate">{agent.tone}</span>
                        <Separator orientation="vertical" className="h-3" />
                        <TrendingUp className="w-3 h-3" />
                        <span className="truncate">{agent.metadata?.category || 'general'}</span>
                      </div>

                      <div className="flex gap-2 mt-auto">
                        <Button
                          className="flex-1 gap-2"
                          onClick={() => startDemo(agent)}
                        >
                          <MessageSquare className="w-4 h-4" />
                          Try Demo
                        </Button>
                      </div>

                      <div className="pt-2 border-t text-xs text-muted-foreground">
                        Created by Community
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Demo Dialog */}
      <Dialog open={isDemoOpen} onOpenChange={setIsDemoOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedAgent?.avatar ? (
                  <img 
                    src={selectedAgent.avatar} 
                    alt={selectedAgent.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <DialogTitle>{selectedAgent?.name}</DialogTitle>
                  <DialogDescription>Demo Session (Limited to 5 exchanges)</DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDemoOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {demoMessages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-emerald-500 text-white'
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

          <div className="flex gap-2 pt-4 border-t">
            <Input
              placeholder="Try chatting..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendDemoMessage()}
              disabled={isLoading || demoMessages.length >= 10}
            />
            <Button 
              onClick={sendDemoMessage} 
              disabled={isLoading || !inputMessage.trim() || demoMessages.length >= 10}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              Want to create your own AI agent? Visit <strong>Agent Forge</strong> in Core Modules!
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
        </div>
      </ScrollArea>
    </div>
  );
}
