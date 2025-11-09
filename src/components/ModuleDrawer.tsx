import { X, ChevronRight } from 'lucide-react';
import { HOSModule } from '../types/hos';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

interface ModuleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  coreModules: HOSModule[];
  humanModules: HOSModule[];
  researchModules: HOSModule[];
  onModuleClick: (moduleId: string) => void;
}

export function ModuleDrawer({
  isOpen,
  onClose,
  coreModules,
  humanModules,
  researchModules,
  onModuleClick
}: ModuleDrawerProps) {
  if (!isOpen) return null;

  const handleModuleClick = (moduleId: string) => {
    onModuleClick(moduleId);
    // Don't close the drawer - let user click multiple modules
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-background border-r border-border z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold">Modules</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="md:hidden"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Module List */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {/* Core Modules */}
              {coreModules.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase text-muted-foreground mb-3 px-2">Core Modules</h3>
                  <div className="space-y-1">
                    {coreModules.map((module) => (
                      <button
                        key={module.id}
                        onClick={() => handleModuleClick(module.id)}
                        className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors flex items-center justify-between group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm mb-1">{module.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">{module.description}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Human Modules */}
              {humanModules.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase text-muted-foreground mb-3 px-2">Human Modules</h3>
                  <div className="space-y-1">
                    {humanModules.map((module) => (
                      <button
                        key={module.id}
                        onClick={() => handleModuleClick(module.id)}
                        className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors flex items-center justify-between group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm mb-1">{module.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">{module.description}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Research Modules */}
              {researchModules.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase text-muted-foreground mb-3 px-2">Research Modules</h3>
                  <div className="space-y-1">
                    {researchModules.map((module) => (
                      <button
                        key={module.id}
                        onClick={() => handleModuleClick(module.id)}
                        className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors flex items-center justify-between group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm mb-1">{module.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">{module.description}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
