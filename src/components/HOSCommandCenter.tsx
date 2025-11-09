import { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { 
  Command, 
  Search, 
  Zap, 
  Sparkles, 
  ArrowRight, 
  Loader2,
  Brain,
  Terminal,
  Lightbulb,
  TrendingUp,
  User,
  Settings,
  Database,
  Network,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { eventBus } from '../lib/eventBus';
import { processCommand } from '../lib/commandcenter/service';
import { useTheme } from '../lib/theme';
import { toast } from 'sonner';

interface CommandSuggestion {
  id: string;
  text: string;
  description: string;
  icon: any;
  category: 'navigation' | 'creation' | 'analysis' | 'query' | 'action';
  action?: () => void;
}

interface CommandCenterProps {
  onNavigate?: (moduleId: string) => void;
}

export function HOSCommandCenter({ onNavigate }: CommandCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<CommandSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [aiResponse, setAiResponse] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();

  // Base suggestions
  const baseSuggestions: CommandSuggestion[] = [
    {
      id: 'nav-agent-factory',
      text: 'Go to Agent Factory',
      description: 'Create and manage AI agents',
      icon: Brain,
      category: 'navigation',
      action: () => onNavigate?.('agent-factory')
    },
    {
      id: 'nav-kernel',
      text: 'Go to Kernel',
      description: 'Core values and principles',
      icon: Command,
      category: 'navigation',
      action: () => onNavigate?.('kernel')
    },
    {
      id: 'nav-memory',
      text: 'Go to Memory',
      description: 'View stored experiences',
      icon: Database,
      category: 'navigation',
      action: () => onNavigate?.('memory')
    },
    {
      id: 'nav-arena',
      text: 'Go to Agents Arena',
      description: 'AI trading competition',
      icon: TrendingUp,
      category: 'navigation',
      action: () => onNavigate?.('agents-arena')
    },
    {
      id: 'nav-marketplace',
      text: 'Go to Agent Marketplace',
      description: 'Browse and share agents',
      icon: Network,
      category: 'navigation',
      action: () => onNavigate?.('agent-marketplace')
    },
    {
      id: 'create-agent',
      text: 'Create an AI agent',
      description: 'AI will help you build a custom agent',
      icon: Sparkles,
      category: 'creation'
    },
    {
      id: 'analyze-performance',
      text: 'Analyze my performance',
      description: 'Get AI insights on your progress',
      icon: TrendingUp,
      category: 'analysis'
    },
    {
      id: 'show-timeline',
      text: 'Show my timeline',
      description: 'Recent events and activities',
      icon: Clock,
      category: 'query',
      action: () => onNavigate?.('timeline')
    },
    {
      id: 'ai-assistant',
      text: 'Talk to HOS GPT',
      description: 'Chat with your AI assistant',
      icon: Brain,
      category: 'action',
      action: () => onNavigate?.('hos-gpt')
    }
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD+K or CTRL+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      
      // ESC to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setInput('');
        setAiResponse('');
      }

      // Arrow navigation
      if (isOpen && suggestions.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % suggestions.length);
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, suggestions, selectedIndex]);

  // Filter suggestions based on input
  useEffect(() => {
    if (input.trim() === '') {
      setSuggestions(baseSuggestions.slice(0, 8));
      setSelectedIndex(0);
      return;
    }

    const filtered = baseSuggestions.filter(s => 
      s.text.toLowerCase().includes(input.toLowerCase()) ||
      s.description.toLowerCase().includes(input.toLowerCase())
    );

    setSuggestions(filtered.length > 0 ? filtered : baseSuggestions.slice(0, 4));
    setSelectedIndex(0);
  }, [input]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSelectSuggestion = async (suggestion: CommandSuggestion) => {
    if (suggestion.action) {
      suggestion.action();
      setIsOpen(false);
      setInput('');
      setAiResponse('');
      toast.success(`Navigating to ${suggestion.text.replace('Go to ', '')}`);
      return;
    }

    // Process with AI
    setIsProcessing(true);
    try {
      const result = await processCommand(suggestion.text, suggestion.category);
      setAiResponse(result.response);
      
      if (result.action) {
        eventBus.emit(result.action.type, result.action.payload);
        toast.success('Command executed successfully');
      }
    } catch (error) {
      console.error('Command processing error:', error);
      toast.error('Failed to process command');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    setAiResponse('');

    try {
      const result = await processCommand(input);
      setAiResponse(result.response);
      
      if (result.action) {
        eventBus.emit(result.action.type, result.action.payload);
        
        if (result.action.type === 'navigate' && result.action.payload.moduleId) {
          setTimeout(() => {
            onNavigate?.(result.action.payload.moduleId);
            setIsOpen(false);
            setInput('');
            setAiResponse('');
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Command processing error:', error);
      setAiResponse('Sorry, I encountered an error processing your command.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'navigation': return ArrowRight;
      case 'creation': return Sparkles;
      case 'analysis': return TrendingUp;
      case 'query': return Search;
      case 'action': return Zap;
      default: return Command;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'navigation': return 'text-blue-400';
      case 'creation': return 'text-purple-400';
      case 'analysis': return 'text-green-400';
      case 'query': return 'text-orange-400';
      case 'action': return 'text-pink-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="p-0 gap-0 w-[95vw] max-w-2xl sm:w-full border-0 bg-transparent shadow-none overflow-hidden max-h-[90vh] sm:max-h-[85vh]">
        <DialogTitle className="sr-only">HOS Command Center</DialogTitle>
        <DialogDescription className="sr-only">
          Natural language AI control - Use this command palette to control all HOS modules through conversational commands
        </DialogDescription>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          className={`
            relative overflow-hidden rounded-2xl border flex flex-col
            ${theme === 'brilliant-black' 
              ? 'bg-black/95 border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.4)]' 
              : 'bg-white/95 border-gray-200 shadow-2xl'
            }
            backdrop-blur-xl
            max-h-[90vh] sm:max-h-[85vh]
          `}
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 opacity-20">
            <div className={`absolute inset-0 bg-gradient-to-br ${
              theme === 'brilliant-black'
                ? 'from-purple-500 via-pink-500 to-blue-500'
                : 'from-blue-400 via-purple-400 to-pink-400'
            } animate-gradient`} />
          </div>

          {/* Header */}
          <div className="relative p-4 sm:p-6 border-b border-gray-200/10 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className={`
                p-1.5 sm:p-2 rounded-lg
                ${theme === 'brilliant-black'
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-purple-100 text-purple-600'
                }
              `}>
                <Terminal className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg truncate">HOS Command Center</h2>
                <p className="text-xs sm:text-sm opacity-60 hidden sm:block">
                  Natural language AI control
                </p>
              </div>
              <div className="ml-auto hidden sm:flex items-center gap-2 text-xs opacity-40">
                <kbd className="px-2 py-1 rounded bg-white/5 border border-white/10">⌘K</kbd>
              </div>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 opacity-40" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="What would you like to do?"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className={`
                    pl-8 sm:pl-10 pr-10 sm:pr-12 py-4 sm:py-6 text-sm sm:text-base border-0
                    ${theme === 'brilliant-black'
                      ? 'bg-white/5 placeholder:text-gray-500'
                      : 'bg-gray-50 placeholder:text-gray-400'
                    }
                    focus-visible:ring-2 focus-visible:ring-purple-500/50
                  `}
                  disabled={isProcessing}
                />
                {isProcessing && (
                  <Loader2 className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 animate-spin text-purple-400" />
                )}
              </div>
            </form>
          </div>

          {/* AI Response */}
          <AnimatePresence>
            {aiResponse && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative border-b border-gray-200/10 flex-shrink-0"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className={`
                      p-1.5 sm:p-2 rounded-lg mt-1
                      ${theme === 'brilliant-black'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-purple-100 text-purple-600'
                      }
                    `}>
                      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm leading-relaxed">{aiResponse}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Suggestions */}
          <ScrollArea className="h-0 flex-1 min-h-0">
            <div className="p-3 sm:p-4 space-y-2">
              {suggestions.length === 0 ? (
                <div className="text-center py-8 sm:py-12 opacity-40">
                  <Lightbulb className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-30" />
                  <p className="text-xs sm:text-sm">No matching commands found</p>
                  <p className="text-xs mt-1">Try a different search or press Enter to use AI</p>
                </div>
              ) : (
                suggestions.map((suggestion, index) => {
                  const Icon = suggestion.icon;
                  const CategoryIcon = getCategoryIcon(suggestion.category);
                  const isSelected = index === selectedIndex;

                  return (
                    <motion.button
                      key={suggestion.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className={`
                        w-full p-3 sm:p-4 rounded-lg sm:rounded-xl text-left transition-all
                        flex items-center gap-2.5 sm:gap-4 group
                        ${isSelected
                          ? theme === 'brilliant-black'
                            ? 'bg-purple-500/20 border-purple-500/50'
                            : 'bg-purple-50 border-purple-200'
                          : theme === 'brilliant-black'
                            ? 'bg-white/5 border-transparent hover:bg-white/10'
                            : 'bg-gray-50 border-transparent hover:bg-gray-100'
                        }
                        border
                      `}
                    >
                      <div className={`
                        p-1.5 sm:p-2 rounded-lg flex-shrink-0
                        ${theme === 'brilliant-black'
                          ? 'bg-white/10'
                          : 'bg-white'
                        }
                      `}>
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                          <p className="truncate text-sm sm:text-base">{suggestion.text}</p>
                          <CategoryIcon className={`w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0 ${getCategoryColor(suggestion.category)}`} />
                        </div>
                        <p className="text-xs opacity-60 truncate">
                          {suggestion.description}
                        </p>
                      </div>

                      <ArrowRight className={`
                        w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-40 transition-opacity flex-shrink-0
                        ${isSelected ? 'opacity-40' : ''}
                      `} />
                    </motion.button>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className={`
            p-3 sm:p-4 border-t border-gray-200/10 flex-shrink-0
            flex items-center justify-between text-xs opacity-40
          `}>
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <span className="hidden sm:flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">↓</kbd>
                Navigate
              </span>
              <span className="hidden sm:flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">↵</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] sm:text-xs">esc</kbd>
                <span className="text-[10px] sm:text-xs">Close</span>
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="text-[10px] sm:text-xs">AI Powered</span>
            </span>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
