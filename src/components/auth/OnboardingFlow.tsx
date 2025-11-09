import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Brain, Sparkles, Store } from 'lucide-react';

interface OnboardingFlowProps {
  userName: string;
  onComplete: () => void;
}

const modules = [
  {
    id: 'aiagency',
    title: 'AI Studio',
    description: 'Create your own AI Agents with HOS as your architect',
    icon: Sparkles,
    color: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    id: 'marketplace',
    title: 'Community Hub',
    description: 'Explore or share Agents built by others — evolution is communal',
    icon: Store,
    color: 'from-cyan-500/20 to-purple-500/20'
  },
  {
    id: 'human-modules',
    title: 'Human Modules',
    description: 'AI-powered modules to understand and optimize your life',
    icon: Brain,
    color: 'from-purple-500/20 to-pink-500/20'
  }
];

export function OnboardingFlow({ userName, onComplete }: OnboardingFlowProps) {
  const [currentModule, setCurrentModule] = useState(0);

  const handleNext = () => {
    if (currentModule < modules.length - 1) {
      setCurrentModule(currentModule + 1);
    } else {
      onComplete();
    }
  };

  const module = modules[currentModule];
  const Icon = module.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-3xl">
        {/* Welcome message */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl mb-2">
            Welcome, {userName}
          </h2>
          <p className="text-muted-foreground">
            Let's explore your new consciousness interface
          </p>
        </motion.div>

        {/* Module cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {modules.map((m, index) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0.3, scale: 0.95 }}
              animate={{
                opacity: index === currentModule ? 1 : 0.3,
                scale: index === currentModule ? 1 : 0.95
              }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`relative overflow-hidden ${index === currentModule ? 'ring-2 ring-primary' : ''}`}>
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${m.color}`}
                  animate={{
                    opacity: index === currentModule ? [0.5, 0.8, 0.5] : 0.3
                  }}
                  transition={{
                    duration: 2,
                    repeat: index === currentModule ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                />
                <CardContent className="relative z-10 p-4 text-center">
                  <div className={`w-12 h-12 rounded-lg mx-auto mb-2 flex items-center justify-center ${
                    index === currentModule ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <m.icon className="w-6 h-6" />
                  </div>
                  <div className="text-xs opacity-70">Step {index + 1}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Current module detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentModule}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${module.color}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <CardTitle>{module.title}</CardTitle>
                    <CardDescription className="text-base mt-2">
                      {module.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Module-specific content */}
                {module.id === 'aiagency' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm">
                        The AI Studio lets you create specialized AI agents for any task. Design agents with
                        unique personalities, skills, and objectives — all with AI assistance.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-3 border rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">AI-powered</div>
                        <div>Build faster with AI</div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Unlimited agents</div>
                        <div>Create endlessly</div>
                      </div>
                    </div>
                  </div>
                )}

                {module.id === 'marketplace' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm">
                        Connect with a community of creators. Discover agents built by others, share your
                        creations, and collaborate on collective intelligence projects.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-3 border rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Community driven</div>
                        <div>Share and discover</div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Collaborative</div>
                        <div>Evolve together</div>
                      </div>
                    </div>
                  </div>
                )}

                {module.id === 'human-modules' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm">
                        Human Modules are AI-powered tools designed to help you understand your life patterns,
                        make better decisions, and optimize your wellbeing across every dimension.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-3 border rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">AI-Powered</div>
                        <div>Deep insights</div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Interconnected</div>
                        <div>Learns with you</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentModule(Math.max(0, currentModule - 1))}
                    disabled={currentModule === 0}
                  >
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    {modules.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentModule ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>

                  <Button onClick={handleNext}>
                    {currentModule === modules.length - 1 ? 'Enter HOS' : 'Next'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Skip button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-6"
        >
          <Button variant="ghost" onClick={onComplete} className="text-xs">
            Skip tour and explore on my own
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
