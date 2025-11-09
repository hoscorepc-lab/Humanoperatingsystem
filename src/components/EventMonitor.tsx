import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { eventBus, HOSEvent } from '../lib/eventBus';
import { Activity, Trash2 } from 'lucide-react';

export function EventMonitor() {
  const [events, setEvents] = useState<HOSEvent[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Subscribe to all events
    const unsubscribe = eventBus.onAll((event) => {
      setEvents(prev => [event, ...prev].slice(0, 50)); // Keep last 50 events
    });

    return unsubscribe;
  }, []);

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
        onClick={() => setIsVisible(true)}
      >
        <Activity className="w-4 h-4 mr-2" />
        Event Monitor ({events.length})
      </Button>
    );
  }

  const getEventColor = (type: string) => {
    if (type.includes('TASK')) return 'bg-blue-500';
    if (type.includes('HABIT')) return 'bg-orange-500';
    if (type.includes('REFLECTION')) return 'bg-purple-500';
    if (type.includes('MOOD') || type.includes('BIOS')) return 'bg-pink-500';
    if (type.includes('ENTROPY')) return 'bg-cyan-500';
    if (type.includes('MIND')) return 'bg-green-500';
    if (type.includes('AI') || type.includes('AGENT')) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  return (
    <Card className="fixed bottom-4 right-4 w-96 z-50 shadow-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="w-4 h-4" />
            Event Monitor
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                eventBus.clearHistory();
                setEvents([]);
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setIsVisible(false)}
            >
              Hide
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Real-time system events • {events.length} recent
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="space-y-2 p-4">
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No events yet. Interact with modules to see activity.
              </p>
            ) : (
              events.map((event, index) => (
                <div
                  key={index}
                  className="text-xs p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge className={`${getEventColor(event.type)} text-white text-[10px] px-1.5 py-0`}>
                      {event.type}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1">
                    <span className="font-medium">{event.source}</span>
                    {event.target && (
                      <>
                        <span>→</span>
                        <span className="font-medium">{event.target}</span>
                      </>
                    )}
                  </div>
                  {event.data && Object.keys(event.data).length > 0 && (
                    <div className="mt-2 p-2 bg-muted/30 rounded text-[10px] font-mono">
                      {JSON.stringify(event.data, null, 2).slice(0, 200)}
                      {JSON.stringify(event.data).length > 200 && '...'}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
