import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Send, Menu, Mic, Plus, Settings } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { getTimeBasedGreeting } from '../lib/timeUtils';
import { createHOSAgent } from '../lib/ai/service';
import hosLogo from 'figma:asset/bbe2fc5ef0fe95dc7b90a9ae839402b9852277df.png';

interface Message {
  id: string;
  role: 'user' | 'hos';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface HOSChatProps {
  userName?: string;
  onModuleClick?: (moduleId: string) => void;
  onClose?: () => void;
  onBackToDashboard?: () => void;
  systemStats?: {
    activeAgents: number;
    totalAgents: number;
    avgPerformance: number;
    completedTasks: number;
    totalTasks: number;
  };
}

export function HOSChat({ userName = 'User', onModuleClick, onClose, onBackToDashboard, systemStats }: HOSChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hosAgent = useRef(createHOSAgent());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [onClose]);
  
  const getInitialMessage = (): Message => {
    const greeting = getTimeBasedGreeting();
    const greetings = [
      `${greeting}, ${userName}. Booted. Running on coffee and chaos. 74% stable | 26% debugging emotions.`,
      `Welcome back, ${userName}. Tried to multitask feelings and logic. Kernel panic. How can I help?`,
      `${greeting}. Every human's a system in beta. Some updates take longer to install. What's on your mind?`
    ];

    return {
      id: '1',
      role: 'hos',
      content: greetings[Math.floor(Math.random() * greetings.length)],
      timestamp: new Date(),
    };
  };

  const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle mobile keyboard appearance/dismissal
  useEffect(() => {
    if (!isMobile) return;
    
    const handleFocus = () => {
      // When input is focused, scroll to keep it visible
      setTimeout(() => {
        inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    };
    
    const handleBlur = () => {
      // When input loses focus (keyboard dismissed), reset scroll to prevent layout issues
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    };
    
    const input = inputRef.current;
    if (input) {
      input.addEventListener('focus', handleFocus);
      input.addEventListener('blur', handleBlur);
      
      return () => {
        input.removeEventListener('focus', handleFocus);
        input.removeEventListener('blur', handleBlur);
      };
    }
  }, [isMobile]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      // Use the real AI agent to get HOS response
      const aiResponse = await hosAgent.current.chat(currentInput, {
        mood: systemStats?.avgPerformance ? Math.round(systemStats.avgPerformance / 10) : undefined,
        energy: systemStats?.activeAgents,
        currentGoals: systemStats ? [`${systemStats.completedTasks}/${systemStats.totalTasks} tasks completed`] : undefined,
      });

      const hosMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'hos',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, hosMessage]);
    } catch (error: any) {
      console.error('Error getting HOS response:', error);
      
      // Fallback response if AI fails
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'hos',
        content: "System hiccup detected. Neural pathways momentarily fuzzy. Try again? (Error: " + (error.message || 'AI service unavailable') + ")",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      toast.error('AI service temporarily unavailable');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // HOS state based on system performance
  const getHOSState = () => {
    if (!systemStats) return { status: 'Optimal', color: 'from-indigo-500 via-purple-500 to-pink-500' };
    
    if (systemStats.avgPerformance >= 90) {
      return { status: 'Peak Performance', color: 'from-green-400 via-emerald-500 to-teal-500' };
    } else if (systemStats.avgPerformance >= 70) {
      return { status: 'Optimal', color: 'from-indigo-500 via-purple-500 to-pink-500' };
    } else if (systemStats.avgPerformance >= 50) {
      return { status: 'Calibrating', color: 'from-yellow-400 via-orange-500 to-amber-500' };
    } else {
      return { status: 'Needs Attention', color: 'from-red-400 via-rose-500 to-pink-500' };
    }
  };

  const hosState = getHOSState();

  // Mobile-first ChatGPT-style interface
  if (isMobile) {
    return (
      <div 
        className="h-full w-full flex flex-col bg-background" 
        style={{ 
          height: '100%',
          maxHeight: '100%',
          overflow: 'hidden',
          position: 'relative',
          touchAction: 'pan-y' // Enable vertical scrolling on touch devices
        }}
      >
        {/* Messages Area - Scrollable - Takes remaining space above fixed input */}
        <div 
          className="flex-1 overflow-y-auto overflow-x-hidden min-h-0" 
          style={{ 
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain'
          }}
        >
          <div className="px-4 pb-4 space-y-4" style={{ paddingTop: '20px', paddingBottom: 'calc(120px + env(safe-area-inset-bottom))' }}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'hos' && (
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 p-0.5 shadow-md flex-shrink-0">
                    <div className="w-full h-full rounded-full overflow-hidden bg-background">
                      <img 
                        src={hosLogo} 
                        alt="HOS" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                
                <div className={`flex flex-col gap-1 max-w-[75%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`rounded-2xl px-4 py-2.5 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50'
                    }`}
                  >
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                  
                  <span className="text-xs text-muted-foreground px-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">{userName.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 p-0.5 shadow-md flex-shrink-0">
                  <div className="w-full h-full rounded-full overflow-hidden bg-background">
                    <img 
                      src={hosLogo} 
                      alt="HOS" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="bg-muted/50 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            {/* Invisible div to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Fixed Bottom Input - ChatGPT Style */}
        <div 
          className="absolute left-0 right-0 px-4 border-t border-border bg-background shadow-lg" 
          style={{ 
            bottom: 'max(16px, env(safe-area-inset-bottom))',
            paddingTop: '12px',
            paddingBottom: '12px',
            zIndex: 50
          }}
        >
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything"
                disabled={isTyping}
                className="h-11 pr-20 rounded-full border-border/50 bg-muted/30"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  aria-label="Voice input"
                >
                  <Mic className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isTyping}
              size="icon"
              className="h-11 w-11 rounded-full flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Back Button - Mobile Only - Below Input */}
          {onClose && (
            <div className="mt-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full h-11 rounded-full border-2 gap-2"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back to Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop interface (original design)
  return (
    <div className="h-full w-full flex flex-col" style={{ height: '100%', maxHeight: '100%', overflow: 'hidden' }}>
      <Card className="flex-1 flex flex-col min-h-0 h-full" style={{ overflow: 'hidden', height: '100%' }}>
        {/* Fixed Header for Desktop */}
        <div className="border-b border-border p-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 p-0.5 shadow-md flex-shrink-0">
              <div className="w-full h-full rounded-full overflow-hidden bg-background">
                <img 
                  src={hosLogo} 
                  alt="HOS" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg truncate">HOS Chat</h3>
              <p className="text-xs text-muted-foreground truncate">Your AI Assistant</p>
            </div>
            <Badge variant="secondary" className="gap-1 text-xs flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Online</span>
            </Badge>
          </div>
        </div>

        {/* Messages Area - Scrollable - Takes all remaining space */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 sm:gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'hos' && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 p-0.5 shadow-md flex-shrink-0">
                    <div className="w-full h-full rounded-full overflow-hidden bg-background">
                      <img 
                        src={hosLogo} 
                        alt="HOS" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                
                <div className={`flex flex-col gap-1 sm:gap-2 max-w-[85%] sm:max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`rounded-lg p-2.5 sm:p-3 text-sm sm:text-base ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                  
                  <span className="text-xs text-muted-foreground px-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {message.role === 'user' && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-xs sm:text-sm">
                    <span>{userName.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 sm:gap-3 justify-start">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 p-0.5 shadow-md flex-shrink-0">
                  <div className="w-full h-full rounded-full overflow-hidden bg-background">
                    <img 
                      src={hosLogo} 
                      alt="HOS" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-2.5 sm:p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            {/* Invisible div to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Fixed Input Area at Bottom */}
        <div className="p-3 sm:p-4 border-t border-border bg-background flex-shrink-0">
          <div className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask me anything - code, research, life advice, or just chat..."
              disabled={isTyping}
              className="flex-1 min-h-[80px] max-h-[200px] resize-none"
              rows={3}
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isTyping}
              size="icon"
              className="h-[80px] w-[80px] rounded-xl flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
