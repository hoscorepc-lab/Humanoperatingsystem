import { Message } from '../types/agent';
import { Brain, Zap, CheckCircle2, Users } from 'lucide-react';

interface MessageStreamProps {
  messages: Message[];
}

export function MessageStream({ messages }: MessageStreamProps) {
  const getIcon = (type: Message['type']) => {
    switch (type) {
      case 'thought':
        return <Brain className="w-4 h-4 text-purple-500" />;
      case 'action':
        return <Zap className="w-4 h-4 text-blue-500" />;
      case 'result':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'collaboration':
        return <Users className="w-4 h-4 text-orange-500" />;
    }
  };

  const getTypeLabel = (type: Message['type']) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="h-[400px] overflow-y-auto pr-4">
      <div className="space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className="p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">
                {getIcon(message.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-medium text-sm">{message.agentName}</span>
                  <span className="text-xs text-muted-foreground">
                    {getTypeLabel(message.type)}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {message.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
