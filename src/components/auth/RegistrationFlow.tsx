import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Progress } from '../ui/progress';
import { Brain, Sparkles, Terminal, Users, ChevronRight, ChevronLeft, Twitter, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface RegistrationFlowProps {
  onComplete: (userData: UserRegistration) => Promise<{ success: boolean; error?: string } | void>;
  onBack: () => void;
  onSwitchToLogin?: () => void;
}

export interface UserRegistration {
  name: string;
  email: string;
  password: string;
  interface: 'companion' | 'shell' | 'aiagency';
  consent: boolean;
}

const interfaceOptions = [
  {
    id: 'companion' as const,
    name: 'AI Companion',
    description: 'Visual / Conversational',
    icon: Brain,
    details: 'Multimodal AI that understands and responds to your needs'
  },
  {
    id: 'shell' as const,
    name: 'Minimal Shell',
    description: 'Text Command Interface',
    icon: Terminal,
    details: 'Direct command-line access to HOS functionality'
  },
  {
    id: 'aiagency' as const,
    name: 'AIgency Builder',
    description: 'For creators & developers',
    icon: Sparkles,
    details: 'Build and deploy custom AI agents and workflows'
  }
];

export function RegistrationFlow({ onComplete, onBack, onSwitchToLogin }: RegistrationFlowProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserRegistration>>({
    interface: 'companion',
    consent: false
  });
  const [isActivating, setIsActivating] = useState(false);
  const [duplicateEmailError, setDuplicateEmailError] = useState(false);

  const progress = (step / 4) * 100;

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleActivate();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  const handleActivate = async () => {
    console.log('📝 RegistrationFlow: handleActivate called with email:', formData.email);
    
    // First, try to register WITHOUT showing the loading screen
    // This way, if there's a duplicate email, we can show the error immediately
    console.log('📝 RegistrationFlow: Calling onComplete callback...');
    const result = await onComplete(formData as UserRegistration);
    console.log('📝 RegistrationFlow: Registration result:', result);
    
    // If registration failed due to duplicate email, show error and stay on step 1
    if (result && !result.success && result.error === 'DUPLICATE_EMAIL') {
      console.log('⚠️ RegistrationFlow: Duplicate email detected, showing error on step 1');
      setDuplicateEmailError(true);
      setStep(1); // Go back to step 1 to show the error
      return; // Don't proceed with activation animation
    }
    
    // If registration succeeded, show the activation animation
    if (result && result.success) {
      setIsActivating(true);
      setDuplicateEmailError(false);
      
      // Simulate activation sequence
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // The user will be automatically logged in and redirected by the auth system
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name && formData.email && formData.password;
      case 2:
        return formData.interface;
      case 3:
        return formData.consent;
      case 4:
        return true;
      default:
        return false;
    }
  };

  if (isActivating) {
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
              {'>'} Identity confirmed.
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              {'>'} Neural handshake complete.
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
            >
              {'>'} Welcome to your Operating System, {formData.name}.
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-1" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Step {step} of 4</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                {step === 1 && (
                  <>
                    <CardTitle>Identity Sync</CardTitle>
                    <CardDescription>
                      Define your presence in the system
                    </CardDescription>
                  </>
                )}
                {step === 2 && (
                  <>
                    <CardTitle>Choose Your Interface</CardTitle>
                    <CardDescription>
                      How do you wish HOS to appear?
                    </CardDescription>
                  </>
                )}
                {step === 3 && (
                  <>
                    <CardTitle>Consent & Core Values</CardTitle>
                    <CardDescription>
                      Your data, your control
                    </CardDescription>
                  </>
                )}
                {step === 4 && (
                  <>
                    <CardTitle>Ready for Activation</CardTitle>
                    <CardDescription>
                      Review and confirm your configuration
                    </CardDescription>
                  </>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                {step === 1 && (
                  <div className="space-y-4">
                    {duplicateEmailError && (
                      <Alert className="bg-destructive/10 border-destructive/30">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <AlertDescription className="space-y-3">
                          <p className="font-semibold text-destructive">This email is already registered!</p>
                          <div className="text-sm space-y-2">
                            <p>An account with <strong>{formData.email}</strong> already exists.</p>
                            <p className="text-muted-foreground">
                              If this is your account, please log in instead of creating a new account.
                            </p>
                          </div>
                          {onSwitchToLogin && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                console.log('🔄 RegistrationFlow: User clicked to switch to login');
                                onSwitchToLogin();
                              }}
                              className="w-full bg-primary/10 hover:bg-primary/20 border-primary/30"
                            >
                              Go to Login
                            </Button>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="name">Define your username in the system</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (canProceed()) handleNext();
                          }
                        }}
                        placeholder="Enter your name"
                        autoComplete="name"
                        autoFocus
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Communication port</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          setDuplicateEmailError(false); // Clear error when user types
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (canProceed()) handleNext();
                          }
                        }}
                        placeholder="your@email.com"
                        autoComplete="email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Encryption key</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password || ''}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (canProceed()) handleNext();
                          }
                        }}
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    {interfaceOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = formData.interface === option.id;
                      
                      return (
                        <button
                          key={option.id}
                          onClick={() => setFormData({ ...formData, interface: option.id })}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4>{option.name}</h4>
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-2 h-2 rounded-full bg-primary"
                                  />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{option.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">{option.details}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="consent1"
                          checked={formData.consent}
                          onCheckedChange={(checked) => setFormData({ ...formData, consent: !!checked })}
                        />
                        <div className="space-y-1">
                          <label htmlFor="consent1" className="text-sm cursor-pointer">
                            I agree to let HOS learn with me, not from me.
                          </label>
                          <p className="text-xs text-muted-foreground">
                            Your interactions help HOS adapt to you, but your data stays private and local
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Checkbox id="consent2" checked disabled />
                        <div className="space-y-1">
                          <label htmlFor="consent2" className="text-sm opacity-70">
                            My data remains local, encrypted, and mine.
                          </label>
                          <p className="text-xs text-muted-foreground">
                            Always enabled. Your data is encrypted and never leaves your control
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground italic p-4 border-l-2 border-primary/50">
                      "HOS is built on the principle of collaborative intelligence. It learns your patterns,
                      preferences, and goals — not to control you, but to amplify your capabilities."
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div>
                        <div className="text-xs text-muted-foreground">Username</div>
                        <div>{formData.name}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Email</div>
                        <div className="text-sm">{formData.email}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-xs text-muted-foreground">Interface Mode</div>
                        <div>
                          {interfaceOptions.find(o => o.id === formData.interface)?.name}
                        </div>
                      </div>
                    </div>

                    <div className="text-center p-6 space-y-2">
                      <Users className="w-12 h-12 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        You're about to join a community of human minds amplified by AI
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </Button>

                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    {step === 4 ? 'Activate' : 'Continue'}
                    {step < 4 && <ChevronRight className="w-4 h-4" />}
                  </Button>
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
        </AnimatePresence>
      </div>
    </div>
  );
}
