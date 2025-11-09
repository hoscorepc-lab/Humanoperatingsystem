import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Brain, ChevronLeft, Twitter, AlertCircle } from 'lucide-react';

interface LoginFlowProps {
  onComplete: (credentials: { email: string; password: string }) => void | Promise<void>;
  onBack: () => void;
  onForgotPassword?: () => void;
  onSwitchToRegister?: () => void;
}

export function LoginFlow({ onComplete, onBack, onForgotPassword, onSwitchToRegister }: LoginFlowProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    console.log('🔐 LoginFlow: handleSubmit called with email:', email);
    
    try {
      // Simple validation
      if (!email || !password) {
        setError('Please enter both email and password');
        setIsLoading(false);
        return;
      }

      console.log('🔐 LoginFlow: Calling onComplete callback...');
      // Call the onComplete callback
      const result = onComplete({ email, password });
      
      // If it returns a promise, wait for it
      if (result && typeof result.then === 'function') {
        await result;
      }
      
      console.log('🔐 LoginFlow: Login attempt completed');
      // Reset loading state after completion
      setIsLoading(false);
    } catch (err) {
      console.error('🔐 LoginFlow: Error during login:', err);
      setError('Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  const canSubmit = email && password && !isLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-8"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Brain className="w-16 h-16 mx-auto text-primary" />
          </motion.div>

          <div className="space-y-3 font-mono text-sm text-muted-foreground">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {'>'} Verifying neural signature . . .
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {'>'} Restoring consciousness state . . .
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              {'>'} Synchronizing memory banks . . .
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <CardTitle>Resume Consciousness</CardTitle>
            <CardDescription>
              Log in to your existing HOS account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                  {(error.includes('Invalid email or password') || error.includes('invalid credentials')) && (
                    <div className="text-xs text-muted-foreground pl-6 space-y-2">
                      <p className="font-semibold text-foreground">Common issues:</p>
                      <p>• <strong>Don't have an account?</strong> You need to register first</p>
                      <p>• Wrong password - passwords are case-sensitive</p>
                      <p>• Typo in email address - check spelling carefully</p>
                      <p>• Caps Lock is on - turn it off and try again</p>
                      {onSwitchToRegister && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={onSwitchToRegister}
                          className="w-full mt-2 bg-primary/10 hover:bg-primary/20 border-primary/30"
                        >
                          Create New Account
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="login-email">Communication port</Label>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoComplete="email"
                  autoFocus
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">Encryption key</Label>
                  {onForgotPassword && (
                    <button
                      type="button"
                      onClick={onForgotPassword}
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>

                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="flex-1"
                >
                  Resume
                </Button>
              </div>
            </form>

            <div className="mt-6 space-y-4">
              <div className="text-center text-xs text-muted-foreground">
                <p className="italic">
                  "Your consciousness persists across sessions."
                </p>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-border">
              <a
                href="https://x.com/hos_core?s=21"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-all group"
                title="Follow us on Twitter/X"
              >
                <Twitter className="w-4 h-4 group-hover:text-primary transition-colors" />
                <span className="text-xs">Twitter/X</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}