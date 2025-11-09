import { useState, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sparkles, Zap, MessageCircle } from 'lucide-react';
import hosLogo from 'figma:asset/bbe2fc5ef0fe95dc7b90a9ae839402b9852277df.png';
import { getTimeBasedGreeting, getTimeBasedContext } from '../lib/timeUtils';

interface HOSWelcomeBannerProps {
  userName?: string;
  onChatClick?: () => void;
  isTrialMode?: boolean;
}

export function HOSWelcomeBanner({ userName = 'User', onChatClick, isTrialMode = false }: HOSWelcomeBannerProps) {
  const greeting = getTimeBasedGreeting();
  const timeContext = getTimeBasedContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  
  const handleChatClick = () => {
    if (isProcessing) {
      console.log('Chat click already processing, ignoring duplicate');
      return;
    }
    
    console.log('🎯 Chat button clicked - opening chat');
    setIsProcessing(true);
    
    // Call the handler
    if (onChatClick) {
      onChatClick();
    }
    
    // Reset processing flag after a short delay
    setTimeout(() => {
      setIsProcessing(false);
    }, 500);
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    
    // Check if this was a tap (not a scroll)
    if (touchStartRef.current && e.changedTouches[0]) {
      const touch = e.changedTouches[0];
      const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
      
      // If movement is less than 10px, treat as a tap
      if (deltaX < 10 && deltaY < 10) {
        console.log('🎯 Touch tap detected on chat button');
        handleChatClick();
      } else {
        console.log('Touch was a scroll, ignoring');
      }
    }
    
    touchStartRef.current = null;
  };

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background border-2">
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 p-1 shrink-0">
            <div className="w-full h-full rounded-full overflow-hidden bg-background">
              <img 
                src={hosLogo} 
                alt="HOS Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                HOS v3.0
              </Badge>
              <Badge className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                Running
              </Badge>
              {isTrialMode && (
                <Badge variant="secondary" className="text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  Trial Mode
                </Badge>
              )}
            </div>
            <h2 className="mb-2 text-xl sm:text-2xl">
              {greeting}, {userName}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base mb-4">
              {timeContext}. All core modules operational.
            </p>
            
            {/* Chat with HOS Button */}
            <button
              onClick={handleChatClick}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              disabled={isProcessing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-14 px-6 rounded-md bg-gradient-to-r from-slate-300 via-slate-200 to-slate-300 hover:from-slate-400 hover:via-slate-300 hover:to-slate-400 text-slate-900 shadow-lg hover:shadow-xl transition-all duration-150 group border-2 border-slate-400 relative overflow-hidden disabled:opacity-70 active:scale-95"
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                cursor: 'pointer',
                userSelect: 'none',
                touchAction: 'manipulation'
              }}
            >
              {/* Animated gradient background */}
              <span 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
                style={{
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 3s ease-in-out infinite'
                }} 
              />
              
              <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform relative z-10 pointer-events-none shrink-0" />
              <span className="font-semibold relative z-10 pointer-events-none">Chat with HOS</span>
              <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform relative z-10 pointer-events-none shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}