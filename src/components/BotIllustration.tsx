import { motion } from 'motion/react';

interface BotIllustrationProps {
  size?: number;
  delay?: number;
  className?: string;
}

export function BotIllustration({ size = 60, delay = 0, className = '' }: BotIllustrationProps) {
  const scale = size / 60; // Base size is 60px

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Shadow */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-gray-400/30 rounded-full blur-sm"
        style={{ 
          width: size * 0.8, 
          height: size * 0.15,
          transform: 'translateX(-50%) translateY(10%)'
        }}
      />
      
      {/* Antenna */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 bg-black rounded-full"
        style={{ 
          width: size * 0.12, 
          height: size * 0.12,
          transform: 'translateX(-50%)'
        }}
      />
      <div 
        className="absolute bg-black"
        style={{ 
          width: size * 0.05, 
          height: size * 0.2,
          left: '50%',
          top: size * 0.08,
          transform: 'translateX(-50%)'
        }}
      />

      {/* Main body */}
      <div 
        className="absolute bg-black rounded-full border-4 border-white shadow-lg"
        style={{ 
          width: size * 0.85, 
          height: size * 0.6,
          left: '50%',
          top: size * 0.25,
          transform: 'translateX(-50%)',
          borderWidth: size * 0.06
        }}
      >
        {/* Eyes */}
        <div 
          className="absolute bg-gray-300 rounded-full"
          style={{ 
            width: size * 0.15, 
            height: size * 0.15,
            left: '25%',
            top: '35%',
            transform: 'translate(-50%, -50%)'
          }}
        />
        <div 
          className="absolute bg-gray-300 rounded-full"
          style={{ 
            width: size * 0.15, 
            height: size * 0.15,
            left: '75%',
            top: '35%',
            transform: 'translate(-50%, -50%)'
          }}
        />
      </div>
    </motion.div>
  );
}

interface BotBannerProps {
  title?: string;
  subtitle?: string;
  botCount?: number;
}

export function BotBanner({ title, subtitle, botCount = 8 }: BotBannerProps) {
  return (
    <div className="relative w-full bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      {/* Engineering grid pattern - subtle */}
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Circuit board accent corners */}
      <div className="absolute top-0 left-0 w-32 h-32 opacity-[0.06] dark:opacity-[0.1]">
        <svg viewBox="0 0 100 100" className="w-full h-full text-slate-400">
          <circle cx="10" cy="10" r="2" fill="currentColor"/>
          <circle cx="30" cy="10" r="2" fill="currentColor"/>
          <circle cx="10" cy="30" r="2" fill="currentColor"/>
          <line x1="10" y1="10" x2="30" y2="10" stroke="currentColor" strokeWidth="0.5"/>
          <line x1="10" y1="10" x2="10" y2="30" stroke="currentColor" strokeWidth="0.5"/>
          <rect x="25" y="25" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="0.5"/>
        </svg>
      </div>

      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-[0.06] dark:opacity-[0.1] rotate-180">
        <svg viewBox="0 0 100 100" className="w-full h-full text-slate-400">
          <circle cx="10" cy="10" r="2" fill="currentColor"/>
          <circle cx="30" cy="10" r="2" fill="currentColor"/>
          <circle cx="10" cy="30" r="2" fill="currentColor"/>
          <line x1="10" y1="10" x2="30" y2="10" stroke="currentColor" strokeWidth="0.5"/>
          <line x1="10" y1="10" x2="10" y2="30" stroke="currentColor" strokeWidth="0.5"/>
          <rect x="25" y="25" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="0.5"/>
        </svg>
      </div>

      {/* Top edge highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-600" />

      {/* Content - High contrast text */}
      <div className="relative z-10 px-6 py-8 md:px-8 md:py-12 text-center">
        {title && (
          <h3 className="text-2xl sm:text-3xl md:text-4xl text-slate-900 dark:text-white mb-2 md:mb-3">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm sm:text-base md:text-lg text-slate-700 dark:text-slate-300 max-w-3xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

interface BotGridPatternProps {
  className?: string;
}

export function BotGridPattern({ className = '' }: BotGridPatternProps) {
  const bots = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: 30 + Math.random() * 20,
    delay: Math.random() * 0.8
  }));

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4 sm:p-6 ${className}`}>
      {bots.map((bot) => (
        <div key={bot.id} className="flex items-center justify-center">
          <BotIllustration size={bot.size} delay={bot.delay} />
        </div>
      ))}
    </div>
  );
}