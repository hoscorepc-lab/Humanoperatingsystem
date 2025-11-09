import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { ModuleCard } from '../ModuleCard';
import { HOSModule } from '../../types/hos';

interface ModuleOverviewProps {
  coreModules: HOSModule[];
  humanModules: HOSModule[];
  researchModules: HOSModule[];
  onModuleClick: (moduleId: string) => void;
}

export function ModuleOverview({ coreModules, humanModules, researchModules, onModuleClick }: ModuleOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Module Overview</CardTitle>
        <CardDescription>
          Explore and activate HOS modules to enhance your capabilities
        </CardDescription>
      </CardHeader>
      <CardContent>
      <Tabs defaultValue="core" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="core">Core ({coreModules.length})</TabsTrigger>
          <TabsTrigger value="human">Human ({humanModules.length})</TabsTrigger>
          <TabsTrigger value="research">Research ({researchModules.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="core" className="space-y-4">
          <ScrollArea className="h-[400px] sm:h-[500px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pr-4">
              {coreModules.map(module => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  onClick={() => onModuleClick(module.id)}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="human" className="space-y-4">
          <ScrollArea className="h-[400px] sm:h-[500px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pr-4">
              {humanModules.map(module => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  onClick={() => onModuleClick(module.id)}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="research" className="space-y-4">
          <ScrollArea className="h-[400px] sm:h-[500px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pr-4">
              {researchModules.map(module => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  onClick={() => onModuleClick(module.id)}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
      </CardContent>
    </Card>
  );
}
