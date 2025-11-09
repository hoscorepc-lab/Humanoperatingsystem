import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Twitter, Info } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import hosLogo from 'figma:asset/bbe2fc5ef0fe95dc7b90a9ae839402b9852277df.png';

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
  onTrialAwakening?: () => void;
}

const bootSequence = [
  "Initializing HOS Core . . .",
  "Establishing link with user consciousness . . .",
  "Loading empathy protocols . . .",
  "Synchronizing identity matrix . . .",
  "Awaiting user activation . . ."
];

export function LandingPage({ onLogin, onRegister, onTrialAwakening }: LandingPageProps) {
  console.log('🏠 LandingPage component rendering');
  const [currentLine, setCurrentLine] = useState(0);
  const [showBootSequence, setShowBootSequence] = useState(true);
  const [showMainContent, setShowMainContent] = useState(false);

  useEffect(() => {
    console.log('🏠 LandingPage - currentLine:', currentLine, 'showBootSequence:', showBootSequence, 'showMainContent:', showMainContent);
    
    // If main content is already showing, don't do anything
    if (showMainContent) {
      return;
    }
    
    if (currentLine < bootSequence.length) {
      const timer = setTimeout(() => {
        setCurrentLine(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else if (showBootSequence) {
      // Only transition once
      const timer = setTimeout(() => {
        setShowBootSequence(false);
        setShowMainContent(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentLine, showBootSequence, showMainContent]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Subtle background glow - very minimal */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <motion.div
          className="w-[600px] h-[600px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(192, 192, 192, 0.08) 0%, rgba(169, 169, 169, 0.04) 40%, transparent 70%)'
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Clean minimal logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mb-12 lg:mb-16"
        >
          <div className="relative flex items-center justify-center">
            {/* Animated glow behind logo */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-gray-300/20 to-gray-400/20 rounded-full blur-2xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 0.7, 0.4]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* HOS Logo */}
            <div className="relative">
              <motion.img 
                src={hosLogo} 
                alt="HOS Logo" 
                className="w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full object-cover border-2 border-gray-300/20 shadow-lg"
                animate={{
                  y: [0, -8, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Boot sequence */}
        <AnimatePresence mode="wait">
          {showBootSequence && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3 mb-8 text-center min-h-[200px]"
            >
              {bootSequence.slice(0, currentLine).map((line, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="font-mono text-sm text-muted-foreground"
                >
                  {'>'} {line}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <AnimatePresence>
          {showMainContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center space-y-8"
            >
              {/* Headline */}
              <div className="space-y-4">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl sm:text-3xl lg:text-4xl"
                >
                  Welcome to HOS the Human Operating System
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-base sm:text-lg text-muted-foreground"
                >
                  Built by AI, for humans. A system that learns you — and with you.
                </motion.p>
              </div>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col gap-4 max-w-md mx-auto"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={onRegister}
                    size="lg"
                    className="relative group overflow-hidden flex-1"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20"
                      animate={{
                        x: ['-100%', '100%']
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                    <span className="relative z-10 flex flex-col items-center gap-1">
                      <span>Awaken</span>
                      <span className="text-xs opacity-70">Create new account</span>
                    </span>
                  </Button>

                  <Button
                    onClick={onLogin}
                    size="lg"
                    variant="outline"
                    className="group relative overflow-hidden flex-1"
                  >
                    <motion.div
                      className="absolute inset-0 border-2 border-primary/50"
                      animate={{
                        scale: [1, 1.05, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <span className="relative z-10 flex flex-col items-center gap-1">
                      <span>Resume Consciousness</span>
                      <span className="text-xs opacity-70">Log in to existing account</span>
                    </span>
                  </Button>
                </div>

                {/* Trial Awakening Button */}
                {onTrialAwakening && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <Button
                      onClick={onTrialAwakening}
                      size="lg"
                      variant="ghost"
                      className="w-full relative group"
                    >
                      <span className="flex flex-col items-center gap-1">
                        <span>Trial Awakening</span>
                        <span className="text-xs opacity-70">Experience as guest</span>
                      </span>
                    </Button>
                  </motion.div>
                )}
              </motion.div>

              {/* Getting Started Guide */}
              {/* Privacy notice */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
                className="text-xs text-muted-foreground italic"
              >
                Connection requires consent. Your mind, your data, your evolution.
              </motion.p>

              {/* Social Links */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex items-center justify-center gap-4 pt-4"
              >
                <motion.a
                  href="https://x.com/hos_core?s=21"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted/50 transition-all group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Twitter className="w-4 h-4 group-hover:text-primary transition-colors" />
                  <span className="text-sm">Twitter/X</span>
                </motion.a>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
