import { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { LogOut, Settings } from 'lucide-react';
import hosLogo from 'figma:asset/bbe2fc5ef0fe95dc7b90a9ae839402b9852277df.png';
import { ThemeToggle } from './ThemeToggle';
import { BrilliantBlackToggle } from './BrilliantBlackToggle';
import { SettingsPanel } from './SettingsPanel';

interface HOSHeaderProps {
  version?: string;
  status?: 'running' | 'idle' | 'learning' | 'processing';
  uptime?: string;
  onLogout?: () => void;
  userName?: string;
  userEmail?: string;
}

export function HOSHeader({ 
  version = 'v3.0', 
  status = 'running', 
  uptime = '24/7',
  onLogout,
  userName = 'Human',
  userEmail = 'user@hos.ai'
}: HOSHeaderProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const statusColors = {
    running: 'bg-green-500',
    idle: 'bg-gray-400',
    learning: 'bg-blue-500',
    processing: 'bg-yellow-500'
  };

  return (
    <>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 shadow-md flex-shrink-0">
            <img 
              src={hosLogo} 
              alt="HOS Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base truncate">HOS</h2>
              <Badge variant="outline" className="text-xs flex-shrink-0">
                {version}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">Human Operating System</p>
          </div>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusColors[status]} animate-pulse flex-shrink-0`} />
            <span className="capitalize text-muted-foreground">{status}</span>
          </div>
          <div className="text-muted-foreground">
            Uptime: <span className="text-foreground">{uptime}</span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <ThemeToggle />
            <BrilliantBlackToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSettingsOpen(true)}
              className="h-9 px-2"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
            {onLogout && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="h-9 px-2"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <SettingsPanel
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        userName={userName}
        userEmail={userEmail}
        onLogout={onLogout}
      />
    </>
  );
}