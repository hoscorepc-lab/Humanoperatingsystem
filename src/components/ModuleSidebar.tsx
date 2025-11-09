import { HOSModule } from '../types/hos';
import { ChevronRight } from 'lucide-react';
import { cn } from './ui/utils';
import { HOSHeader } from './HOSHeader';

interface ModuleSidebarProps {
  coreModules: HOSModule[];
  humanModules: HOSModule[];
  researchModules: HOSModule[];
  genesisModules?: HOSModule[];
  onModuleClick: (moduleId: string) => void;
  activeModule?: string;
  onLogout?: () => void;
  userName?: string;
  userEmail?: string;
}

export function ModuleSidebar({
  coreModules,
  humanModules,
  researchModules,
  genesisModules,
  onModuleClick,
  activeModule = 'dashboard',
  onLogout,
  userName,
  userEmail
}: ModuleSidebarProps) {
  const renderModuleItem = (module: HOSModule) => {
    const isActive = activeModule === module.id;
    
    return (
      <button
        key={module.id}
        onClick={() => onModuleClick(module.id)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors group",
          "hover:bg-accent/50",
          isActive && "bg-accent border-l-2 border-primary"
        )}
      >
        <div className="flex-1 min-w-0">
          <div className="text-sm truncate">{module.name}</div>
          <div className="text-xs text-muted-foreground truncate">
            {module.description}
          </div>
        </div>
        <ChevronRight className={cn(
          "w-4 h-4 flex-shrink-0 ml-2 transition-transform",
          "group-hover:translate-x-0.5",
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"
        )} />
      </button>
    );
  };

  return (
    <div className="w-full sm:w-80 lg:w-80 border-r border-border bg-background h-full flex flex-col">
      {/* Header at top of sidebar */}
      <div className="flex-shrink-0 border-b border-border">
        <HOSHeader
          version="v3.0"
          status="running"
          uptime="24h 15m"
          onLogout={onLogout}
          userName={userName}
          userEmail={userEmail}
        />
      </div>
      
      {/* Scrollable modules list */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
        <div className="py-4 pb-8">
          {/* Core Modules Section */}
          <div className="mb-6">
            <div className="px-3 py-2">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
                Core Modules
              </h3>
            </div>
            <div className="space-y-0.5">
              {coreModules.map(renderModuleItem)}
            </div>
          </div>

          {/* Human Modules Section */}
          <div className="mb-6">
            <div className="px-3 py-2">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
                Human Modules
              </h3>
            </div>
            <div className="space-y-0.5">
              {humanModules.map(renderModuleItem)}
            </div>
          </div>

          {/* Research Modules Section */}
          <div className="mb-6">
            <div className="px-3 py-2">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
                Research Modules
              </h3>
            </div>
            <div className="space-y-0.5">
              {researchModules.map(renderModuleItem)}
            </div>
          </div>

          {/* Genesis Secret Section */}
          {genesisModules && genesisModules.length > 0 && (
            <div className="mb-6">
              <div className="px-3 py-2">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
                  ◢◤ Genesis Secret ◢◤
                </h3>
              </div>
              <div className="space-y-0.5">
                {genesisModules.map(renderModuleItem)}
              </div>
            </div>
          )}
          {/* Command Center Hint */}
          <div className="px-3 py-4 mt-6 border-t border-border/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <kbd className="px-2 py-1 rounded bg-accent/50 border border-border/50 text-[10px]">⌘K</kbd>
              <span>Command Center</span>
            </div>
            <p className="text-[10px] text-muted-foreground/60">
              AI-powered universal control
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
