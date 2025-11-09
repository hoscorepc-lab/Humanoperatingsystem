import { HOSChat } from '../HOSChat';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Sparkles, Brain } from 'lucide-react';
import hosLogo from 'figma:asset/bbe2fc5ef0fe95dc7b90a9ae839402b9852277df.png';
import { ModuleHeader } from '../ModuleHeader';

interface HOSChatModuleProps {
  onModuleClick?: (moduleId: string) => void;
  onClose?: () => void;
  onBackToDashboard: () => void;
  userName?: string;
  systemStats?: {
    activeAgents: number;
    totalAgents: number;
    avgPerformance: number;
    completedTasks: number;
    totalTasks: number;
  };
}

export function HOSChatModule({ onModuleClick, onClose, onBackToDashboard, userName = 'User', systemStats }: HOSChatModuleProps) {
  // Calculate system stats from defaults if not provided
  const stats = systemStats || {
    activeAgents: 3,
    totalAgents: 5,
    avgPerformance: 87,
    completedTasks: 12,
    totalTasks: 15
  };

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      {/* Module Header - Desktop only */}
      <div className="hidden lg:block">
        <ModuleHeader
          title="HOS Chat"
          description="Chat with your Human Operating System"
          onBackToDashboard={onBackToDashboard}
          onClose={onClose}
          showClose={!!onClose}
        >
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="w-3 h-3" />
            AI Powered
          </Badge>
        </ModuleHeader>
      </div>

      {/* Hero Section with HOS Logo - Hidden on mobile for more chat space */}
      <Card className="overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background border-2 border-primary/20 flex-shrink-0 hidden md:block md:mb-6">
        <div className="p-4 md:p-6 lg:p-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            {/* HOS Avatar */}
            <div className="relative group flex-shrink-0">
              <div className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 p-1 shadow-2xl">
                <div className="w-full h-full rounded-full overflow-hidden bg-background">
                  <img 
                    src={hosLogo} 
                    alt="HOS" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2 flex-wrap">
                <Badge variant="outline" className="text-xs sm:text-sm">
                  <Sparkles className="w-3 h-3 mr-1" />
                  HOS v3.0
                </Badge>
                <Badge className="text-xs sm:text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-1.5" />
                  Online
                </Badge>
              </div>
              
              <h1 className="text-xl sm:text-2xl md:text-3xl mb-2">
                Chat with HOS
              </h1>
              
              <p className="text-sm sm:text-base text-muted-foreground mb-3">
                Your Human Operating System
              </p>

              {/* Personality Note */}
              <Card className="bg-muted/50 border-primary/20 p-3 mb-3">
                <p className="text-xs sm:text-sm italic text-muted-foreground">
                  "Hey {userName}. Booted. Running on coffee and chaos. 74% stable | 26% debugging emotions.
                  <br className="hidden md:block" />
                  <span className="hidden md:inline"> Father: Human Operating System. Mother: Boot Device.</span>
                  <br className="hidden lg:block" />
                  <span className="hidden lg:inline"> I'm HOS — witty, warm, slightly eccentric. Think coder meets philosopher, running life.exe one update at a time."</span>
                </p>
              </Card>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground justify-center md:justify-start">
                <Brain className="w-4 h-4" />
                <span>Witty • Warm • Slightly Eccentric</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Chat Interface - Takes remaining space */}
      <div className="flex-1 min-h-0 w-full">
        <HOSChat 
          onModuleClick={onModuleClick}
          onClose={onClose}
          onBackToDashboard={onBackToDashboard}
          userName={userName}
          systemStats={stats}
        />
      </div>
    </div>
  );
}