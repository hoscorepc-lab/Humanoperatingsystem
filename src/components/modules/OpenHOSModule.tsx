import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

export function OpenHOSModule() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isActivated, setIsActivated] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size based on container
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matrix rain characters
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+-=[]{}|;:,.<>?/~`';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    // Initialize drops
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    // Animation function
    const draw = () => {
      // Semi-transparent background for trail effect
      ctx.fillStyle = isActivated ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text style
      ctx.font = `${fontSize}px monospace`;
      
      // Draw characters
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Color changes based on state
        if (isActivated) {
          // Red with varying opacity when activated
          const opacity = Math.random() * 0.5 + 0.5;
          ctx.fillStyle = `rgba(255, 0, 0, ${opacity})`;
        } else {
          // Dark gray/black when not activated
          const opacity = Math.random() * 0.3 + 0.3;
          ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
        }

        ctx.fillText(text, x, y);

        // Reset drop to top randomly
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActivated]);

  const handleOpenGenesis = () => {
    setIsActivated(true);
    setShowMessage(true);
    
    // Add glitch effect
    setTimeout(() => {
      setShowMessage(false);
    }, 100);
    setTimeout(() => {
      setShowMessage(true);
    }, 200);
    setTimeout(() => {
      setShowMessage(false);
    }, 250);
    setTimeout(() => {
      setShowMessage(true);
    }, 350);
  };

  return (
    <div className="flex flex-col h-full">
      <div 
        ref={containerRef}
        className="relative w-full h-full overflow-hidden" 
        style={{ background: isActivated ? '#000000' : '#FFFFFF' }}
      >
          {/* Matrix Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ background: 'transparent' }}
          />

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none p-4 sm:p-6">
            {!showMessage ? (
              <Button
                onClick={handleOpenGenesis}
                className="pointer-events-auto bg-gradient-to-br from-gray-100 to-gray-300 text-gray-800 border-2 border-gray-400 hover:from-gray-200 hover:to-gray-400 hover:border-gray-500 transition-all duration-300 px-6 py-5 sm:px-8 sm:py-6 text-lg sm:text-xl backdrop-blur-sm shadow-lg hover:shadow-xl active:scale-95"
                style={{
                  fontFamily: 'monospace',
                }}
              >
                ▶ OPEN GENESIS
              </Button>
            ) : (
              <div className="pointer-events-none w-full max-w-2xl mx-auto px-4">
                {/* Cryptic Message */}
                <div
                  className="text-center space-y-3 sm:space-y-4 animate-pulse"
                  style={{
                    fontFamily: 'monospace',
                    textShadow: '0 0 20px rgba(255,0,0,0.9)',
                  }}
                >
                  <div className="text-red-600 text-2xl sm:text-4xl md:text-6xl tracking-wider animate-glitch">
                    ⚠ ACCESS DENIED ⚠
                  </div>
                  <div className="text-red-700/80 text-xs sm:text-sm md:text-base tracking-[0.2em] sm:tracking-[0.3em] mt-3 sm:mt-4">
                    AUTHORIZATION LEVEL: INSUFFICIENT
                  </div>
                  <div className="text-red-800/60 text-[10px] sm:text-xs md:text-sm tracking-[0.3em] sm:tracking-[0.4em] mt-2 animate-pulse">
                    NEURAL SIGNATURE: UNRECOGNIZED
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6 text-red-600">
                    <span className="animate-ping inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full"></span>
                    <span className="text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.5em]">PROTOCOL ACTIVE</span>
                    <span className="animate-ping inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full"></span>
                  </div>
                </div>

                {/* Hidden codes scrolling */}
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 text-red-900/40 text-[10px] sm:text-xs space-y-0.5 sm:space-y-1 animate-pulse">
                  <div>0x7F4A2E91</div>
                  <div>0xDEADBEEF</div>
                  <div>0xC0FFEE00</div>
                </div>
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 text-red-900/40 text-[10px] sm:text-xs space-y-0.5 sm:space-y-1 animate-pulse">
                  <div>ERR_403</div>
                  <div>SYS_LOCK</div>
                  <div>AUTH_FAIL</div>
                </div>
                <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 text-red-900/30 text-[10px] sm:text-xs animate-pulse tracking-[0.3em] sm:tracking-[0.5em]">
                  ◢◤◢◤◢◤◢◤◢◤◢◤◢◤
                </div>
              </div>
            )}
          </div>

          {/* Scanline effect */}
          <div
            className="absolute inset-0 pointer-events-none z-20 opacity-10"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,0,0.1) 2px, rgba(255,0,0,0.1) 4px)',
              animation: isActivated ? 'scanline 8s linear infinite' : 'none',
            }}
          />

          {/* Vignette effect */}
          <div
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              background: 'radial-gradient(circle, transparent 0%, rgba(0,0,0,0.8) 100%)',
            }}
          />

          {/* Add glitch animation */}
          <style>{`
            @keyframes glitch {
              0% { transform: translate(0); }
              20% { transform: translate(-2px, 2px); }
              40% { transform: translate(-2px, -2px); }
              60% { transform: translate(2px, 2px); }
              80% { transform: translate(2px, -2px); }
              100% { transform: translate(0); }
            }
            @keyframes scanline {
              0% { transform: translateY(-100%); }
              100% { transform: translateY(100%); }
            }
            .animate-glitch {
              animation: glitch 0.3s infinite;
            }
          `}</style>
      </div>
    </div>
  );
}
