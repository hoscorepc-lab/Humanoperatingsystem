import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Mic, Bot, Network, Download, Play, Copy, ArrowRight, Twitter } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface PublicAgentViewProps {
  agentType: 'ai' | 'voice' | 'flow';
  agentId: string;
  agentData?: any;
  onJoinHOS: () => void;
  onClosePreview: () => void;
}

export function PublicAgentView({
  agentType,
  agentId,
  agentData,
  onJoinHOS,
  onClosePreview
}: PublicAgentViewProps) {
  // Mock agent data if not provided
  const agent = agentData || {
    id: agentId,
    name: agentType === 'ai' ? 'Shared AI Agent' : 
          agentType === 'voice' ? 'Shared Voice Agent' : 'Shared Workflow',
    description: 'This is a shared agent from the HOS community',
    creator: 'HOS User',
    capabilities: ['Analysis', 'Automation', 'Intelligence'],
    tags: ['productivity', 'ai', 'automation']
  };

  const getIcon = () => {
    switch (agentType) {
      case 'ai': return <Bot className="w-12 h-12 text-primary" />;
      case 'voice': return <Mic className="w-12 h-12 text-primary" />;
      case 'flow': return <Network className="w-12 h-12 text-primary" />;
    }
  };

  const getTypeLabel = () => {
    switch (agentType) {
      case 'ai': return 'AI Agent';
      case 'voice': return 'Voice Agent';
      case 'flow': return 'Workflow';
    }
  };

  const handleClone = () => {
    toast.success('Join HOS to clone this agent!');
    onJoinHOS();
  };

  const handleTryDemo = () => {
    toast.success('Join HOS to try this agent!');
    onJoinHOS();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl">Welcome to HOS</h1>
          <p className="text-muted-foreground">
            Someone shared this {getTypeLabel().toLowerCase()} with you
          </p>
        </div>

        {/* Agent Preview Card */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-start gap-4">
              {agent.avatarUrl ? (
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 border-2 border-border">
                  <img 
                    src={agent.avatarUrl} 
                    alt={agent.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to default icon if image fails to load
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.className = 'p-3 rounded-lg bg-primary/10 flex-shrink-0';
                        parent.innerHTML = getIcon() ? '' : '';
                        // We can't easily re-render the icon here, so we'll just show a generic icon
                        const iconSvg = agentType === 'ai' ? 
                          '<svg class="w-12 h-12 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>' :
                          agentType === 'voice' ?
                          '<svg class="w-12 h-12 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>' :
                          '<svg class="w-12 h-12 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>';
                        parent.innerHTML = iconSvg;
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-primary/10">
                  {getIcon()}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle>{agent.name}</CardTitle>
                  <Badge variant="outline">{getTypeLabel()}</Badge>
                </div>
                <CardDescription>{agent.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Creator */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Created by</p>
              <p className="text-sm">{agent.creator}</p>
            </div>

            {/* Capabilities */}
            {agent.capabilities && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Capabilities</p>
                <div className="flex flex-wrap gap-2">
                  {agent.capabilities.map((cap: string, idx: number) => (
                    <Badge key={idx} variant="secondary">
                      {cap}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {agent.tags && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {agent.tags.map((tag: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <p className="text-2xl">4.8</p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
              <div className="text-center">
                <p className="text-2xl">1.2k</p>
                <p className="text-xs text-muted-foreground">Users</p>
              </div>
              <div className="text-center">
                <p className="text-2xl">342</p>
                <p className="text-xs text-muted-foreground">Clones</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6 space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-lg">Join HOS to use this {getTypeLabel()}</h3>
              <p className="text-sm text-muted-foreground">
                Create your free account to clone, customize, and deploy this {getTypeLabel().toLowerCase()}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={onJoinHOS} size="lg" className="flex-1">
                <ArrowRight className="w-4 h-4 mr-2" />
                Join HOS - It's Free
              </Button>
              <Button onClick={handleClone} variant="outline" size="lg" className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                Clone Agent
              </Button>
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <Button onClick={handleTryDemo} variant="ghost" size="sm">
                <Play className="w-4 h-4 mr-2" />
                Try Demo
              </Button>
              <Button onClick={onClosePreview} variant="ghost" size="sm">
                View More Agents
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* HOS Features */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <Bot className="w-8 h-8 mx-auto text-primary" />
            <p className="text-xs">AI Agents</p>
          </div>
          <div className="space-y-2">
            <Mic className="w-8 h-8 mx-auto text-primary" />
            <p className="text-xs">Voice Interface</p>
          </div>
          <div className="space-y-2">
            <Network className="w-8 h-8 mx-auto text-primary" />
            <p className="text-xs">Workflows</p>
          </div>
        </div>

        {/* Social Links */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">Join the HOS Community</p>
              <div className="flex items-center justify-center gap-3">
                <a
                  href="https://x.com/hos_core?s=21"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted/50 transition-all group"
                  title="Follow us on Twitter/X"
                >
                  <Twitter className="w-4 h-4 group-hover:text-primary transition-colors" />
                  <span className="text-sm">Twitter/X</span>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
