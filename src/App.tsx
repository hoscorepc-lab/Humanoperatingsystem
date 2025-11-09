import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HOSProvider, useHOS } from './lib/supabase/HOSProvider';
import { ModuleSidebar } from './components/ModuleSidebar';
import { ThemeToggle } from './components/ThemeToggle';
import { BrilliantBlackToggle } from './components/BrilliantBlackToggle';
import { LandingPage } from './components/auth/LandingPage';
import { LoginFlow } from './components/auth/LoginFlow';
import { RegistrationFlow } from './components/auth/RegistrationFlow';
import { PasswordResetFlow } from './components/auth/PasswordResetFlow';
import { coreModules, humanModules, researchModules, genesisModules } from './lib/hosData';
import { initialAgents, initialTasks, initialEvolutions } from './lib/mockData';
import { cn } from './components/ui/utils';
import { useAnalytics } from './lib/hooks/useAnalytics';
import { HOSCommandCenter } from './components/HOSCommandCenter';

// Lazy load all modules
const DashboardModule = lazy(() => import('./components/modules/DashboardModule').then(m => ({ default: m.DashboardModule })));
const HOSChatModule = lazy(() => import('./components/modules/HOSChatModule').then(m => ({ default: m.HOSChatModule })));
const EvolverModule = lazy(() => import('./components/modules/EvolverModule').then(m => ({ default: m.EvolverModule })));
const HOSChipModule = lazy(() => import('./components/modules/HOSChipModule').then(m => ({ default: m.HOSChipModule })));
const AgentForgeModule = lazy(() => import('./components/modules/AgentForgeModule').then(m => ({ default: m.AgentForgeModule })));
const AgentFactoryModule = lazy(() => import('./components/modules/AgentFactoryModule').then(m => ({ default: m.AgentFactoryModule })));
const AgentMarketplaceModule = lazy(() => import('./components/modules/AgentMarketplaceModule').then(m => ({ default: m.AgentMarketplaceModule })));
const AIAppStudioModule = lazy(() => import('./components/modules/AIAppStudioModule').then(m => ({ default: m.AIAppStudioModule })));
const ScreenshotToCodeModule = lazy(() => import('./components/modules/ScreenshotToCodeModule').then(m => ({ default: m.ScreenshotToCodeModule })));
const HOSGraphConvolutionalNetworksModule = lazy(() => import('./components/modules/HOSGraphConvolutionalNetworksModule').then(m => ({ default: m.HOSGraphConvolutionalNetworksModule })));
const HOSGPTModule = lazy(() => import('./components/modules/HOSGPTModule').then(m => ({ default: m.HOSGPTModule })));
const HOSFinancialResearchModule = lazy(() => import('./components/modules/HOSFinancialResearchModule').then(m => ({ default: m.HOSFinancialResearchModule })));
const WhitepaperModule = lazy(() => import('./components/modules/WhitepaperModule').then(m => ({ default: m.WhitepaperModule })));
const AnalyticsDashboardModule = lazy(() => import('./components/modules/AnalyticsDashboardModule').then(m => ({ default: m.AnalyticsDashboardModule })));
const AgentsArenaModule = lazy(() => import('./components/modules/AgentsArenaModule').then(m => ({ default: m.AgentsArenaModule })));
const RDPModule = lazy(() => import('./components/modules/RDPModule').then(m => ({ default: m.RDPModule })));
const KernelModule = lazy(() => import('./components/modules/KernelModule').then(m => ({ default: m.KernelModule })));
const MindModule = lazy(() => import('./components/modules/MindModule').then(m => ({ default: m.MindModule })));
const ProcessesModule = lazy(() => import('./components/modules/ProcessesModule').then(m => ({ default: m.ProcessesModule })));
const MemoryModule = lazy(() => import('./components/modules/MemoryModule').then(m => ({ default: m.MemoryModule })));
const TimelineModule = lazy(() => import('./components/modules/TimelineModule').then(m => ({ default: m.TimelineModule })));
const ParallelSelvesModule = lazy(() => import('./components/modules/ParallelSelvesModule').then(m => ({ default: m.ParallelSelvesModule })));
const LifeDebuggerModule = lazy(() => import('./components/modules/LifeDebuggerModule').then(m => ({ default: m.LifeDebuggerModule })));
const EmotionalBIOSModule = lazy(() => import('./components/modules/EmotionalBIOSModule').then(m => ({ default: m.EmotionalBIOSModule })));
const NarrativeEngineModule = lazy(() => import('./components/modules/NarrativeEngineModule').then(m => ({ default: m.NarrativeEngineModule })));
const QuantumPlannerModule = lazy(() => import('./components/modules/QuantumPlannerModule').then(m => ({ default: m.QuantumPlannerModule })));
const ReflectionMirrorModule = lazy(() => import('./components/modules/ReflectionMirrorModule').then(m => ({ default: m.ReflectionMirrorModule })));
const HabitForgeModule = lazy(() => import('./components/modules/HabitForgeModule').then(m => ({ default: m.HabitForgeModule })));
const CoreResearchModule = lazy(() => import('./components/modules/CoreResearchModule').then(m => ({ default: m.CoreResearchModule })));
const LargeLanguageModelsModule = lazy(() => import('./components/modules/LargeLanguageModelsModule').then(m => ({ default: m.LargeLanguageModelsModule })));
const NeuralNetworkModule = lazy(() => import('./components/modules/NeuralNetworkModule').then(m => ({ default: m.NeuralNetworkModule })));
const CosmicCortexModule = lazy(() => import('./components/modules/CosmicCortexModule').then(m => ({ default: m.CosmicCortexModule })));
const AutonomousModule = lazy(() => import('./components/modules/AutonomousModule').then(m => ({ default: m.AutonomousModule })));
const OpenHOSModule = lazy(() => import('./components/modules/OpenHOSModule').then(m => ({ default: m.OpenHOSModule })));

// Inner component that can use useHOS hook
function AppContent() {
  console.log('🎨 AppContent rendering...');
  
  // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY EARLY RETURNS
  const { isAuthenticated, isLoading, logout, login, register, startTrialMode, isTrialMode, userId } = useHOS();
  
  console.log('📊 AppContent state:', { isAuthenticated, isLoading, isTrialMode, userId });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [authView, setAuthView] = useState<'landing' | 'login' | 'register' | 'reset-password'>('landing');
  
  // Initialize analytics tracking - MUST be called before any early returns
  const { trackModule } = useAnalytics({ 
    userId: userId || undefined, 
    enabled: isAuthenticated || isTrialMode 
  });
  
  // Safety check - if somehow still loading after a long time, force reload
  useEffect(() => {
    if (isLoading) {
      const forceLoadTimeout = setTimeout(() => {
        console.error('❌ CRITICAL: App stuck in loading state - forcing reload');
        window.location.reload();
      }, 10000); // 10 second absolute maximum
      
      return () => clearTimeout(forceLoadTimeout);
    }
  }, [isLoading]);
  
  // Reset scroll and layout when module changes
  useEffect(() => {
    // Scroll to top on module change
    window.scrollTo(0, 0);
    // Force a layout recalculation on mobile to fix any keyboard-induced issues
    if (window.innerWidth < 1024) {
      document.body.style.height = '100vh';
      setTimeout(() => {
        document.body.style.height = '';
      }, 0);
    }
  }, [activeModule]);

  // Track module views for analytics
  useEffect(() => {
    if (!isAuthenticated && !isTrialMode) return;
    
    // Find the module name
    const allModules = [...coreModules, ...humanModules, ...researchModules, ...genesisModules];
    const currentModule = allModules.find(m => m.id === activeModule);
    const moduleName = currentModule?.name || activeModule;
    
    // Track the module view
    trackModule(activeModule, moduleName);
  }, [activeModule, isAuthenticated, isTrialMode, trackModule]);
  
  // ALL EVENT HANDLERS - DEFINED AFTER HOOKS BUT BEFORE EARLY RETURNS
  const handleOpenModule = (moduleId: string) => {
    setActiveModule(moduleId);
    // Close mobile sidebar after selection
    setIsMobileSidebarOpen(false);
    // Reset scroll position to top when switching modules
    window.scrollTo(0, 0);
  };

  const handleBackToDashboard = () => {
    setActiveModule('dashboard');
    // Reset scroll position to top
    window.scrollTo(0, 0);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(prev => !prev);
  };
  
  const handleLogout = async () => {
    await logout();
    setActiveModule('dashboard');
    setAuthView('landing'); // Reset to landing page after logout
  };
  
  // NOW SAFE TO DO EARLY RETURNS - ALL HOOKS HAVE BEEN CALLED

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Initializing HOS...</p>
          <p className="text-xs text-muted-foreground/50">This should only take a moment</p>
        </div>
      </div>
    );
  }

  // Show auth flow if not authenticated
  if (!isAuthenticated) {
    const handleLogin = async (credentials: { email: string; password: string }) => {
      console.log('🔐 App.tsx handleLogin called with email:', credentials.email);
      await login(credentials.email, credentials.password);
    };

    const handleRegister = async (userData: { name: string; email: string; password: string; interface: string; consent: boolean }) => {
      console.log('📝 App.tsx handleRegister called with email:', userData.email);
      const result = await register(userData.email, userData.password, userData.name);
      console.log('📝 App.tsx handleRegister result:', result);
      return result;
    };

    return (
      <div className="min-h-screen bg-background">
        {authView === 'landing' && (
          <LandingPage
            onLogin={() => {
              console.log('🔵 Landing Page: Switching to login view');
              setAuthView('login');
            }}
            onRegister={() => {
              console.log('🟢 Landing Page: Switching to register view');
              setAuthView('register');
            }}
            onTrialAwakening={() => {
              console.log('🎭 Landing Page: Starting trial mode');
              startTrialMode();
            }}
          />
        )}
        {authView === 'login' && (
          <LoginFlow 
            onBack={() => {
              console.log('🔙 Login Flow: Going back to landing');
              setAuthView('landing');
            }}
            onComplete={handleLogin}
            onSwitchToRegister={() => {
              console.log('🔄 Login Flow: Switching to register');
              setAuthView('register');
            }}
            onForgotPassword={() => {
              console.log('🔑 Login Flow: Switching to password reset');
              setAuthView('reset-password');
            }}
          />
        )}
        {authView === 'register' && (
          <RegistrationFlow 
            onBack={() => {
              console.log('🔙 Registration Flow: Going back to landing');
              setAuthView('landing');
            }}
            onComplete={handleRegister}
            onSwitchToLogin={() => {
              console.log('🔄 Registration Flow: Switching to login');
              setAuthView('login');
            }}
          />
        )}
        {authView === 'reset-password' && (
          <PasswordResetFlow 
            onBack={() => {
              console.log('🔙 Password Reset Flow: Going back to login');
              setAuthView('login');
            }}
          />
        )}
        <Toaster />
      </div>
    );
  }

  // Show main app if authenticated
  return (
    <ErrorBoundary>
        <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Fixed Header - Mobile only with theme toggles */}
        <div className="fixed top-0 left-0 right-0 z-30 bg-background border-b border-border h-14 lg:h-0 lg:border-0">
          <div className="flex items-center justify-between gap-3 px-3 h-full lg:hidden">
            {/* Mobile Hamburger Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileSidebar}
              className="flex-shrink-0 h-14 w-14 active:scale-95 transition-transform"
            >
              {isMobileSidebarOpen ? <X className="w-10 h-10" /> : <Menu className="w-10 h-10" />}
            </Button>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <BrilliantBlackToggle />
            </div>
          </div>
        </div>

        {/* Main Layout: Sidebar + Content */}
        <div className="flex flex-1 pt-14 lg:pt-0">
          {/* Desktop Sidebar - Always visible on lg+ screens */}
          <div className="hidden lg:block fixed left-0 top-0 bottom-0 z-20">
            <ModuleSidebar
              coreModules={coreModules}
              humanModules={humanModules}
              researchModules={researchModules}
              genesisModules={genesisModules}
              onModuleClick={handleOpenModule}
              activeModule={activeModule}
              onLogout={handleLogout}
              userName={isTrialMode ? 'Trial User' : 'Human'}
              userEmail={userId ? `${userId.slice(0, 8)}@hos.ai` : 'user@hos.ai'}
            />
          </div>

          {/* Mobile Sidebar - Overlay */}
          {isMobileSidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <div 
                className="fixed left-0 top-14 bottom-0 z-50 bg-background"
                onClick={(e) => e.stopPropagation()}
              >
                <ModuleSidebar
                  coreModules={coreModules}
                  humanModules={humanModules}
                  researchModules={researchModules}
                  genesisModules={genesisModules}
                  onModuleClick={handleOpenModule}
                  activeModule={activeModule}
                  onLogout={handleLogout}
                  userName={isTrialMode ? 'Trial User' : 'Human'}
                  userEmail={userId ? `${userId.slice(0, 8)}@hos.ai` : 'user@hos.ai'}
                />
              </div>
            </div>
          )}

          {/* Main Content Area - Single active module */}
          <div className={cn(
            "flex-1 overflow-hidden",
            "h-[calc(100vh-3.5rem)] lg:h-screen", // Account for mobile header (3.5rem = 56px = 14*4)
            "lg:ml-80" // Offset for desktop sidebar (320px)
          )}>
            <div 
              key={activeModule}
              className={cn(
                "h-full flex flex-col overflow-hidden",
                (activeModule === 'chat' || activeModule === 'open-hos') ? 'p-0' : 'p-3 sm:p-4 lg:p-6'
              )}
            >
              <Suspense fallback={
                <div className="flex items-center justify-center h-64">
                  <div className="text-muted-foreground">Loading module...</div>
                </div>
              }>
                <div className="h-full flex flex-col overflow-hidden">
                  {/* Render active module */}
                  {(() => {
                  switch (activeModule) {
                    case 'dashboard':
                      return (
                        <DashboardModule
                          agents={initialAgents}
                          tasks={initialTasks}
                          evolutions={initialEvolutions}
                          coreModules={coreModules}
                          humanModules={humanModules}
                          researchModules={researchModules}
                          onModuleClick={handleOpenModule}
                          userName="Human"
                          isTrialMode={isTrialMode}
                        />
                      );
                    case 'chat':
                      return (
                        <HOSChatModule onBackToDashboard={handleBackToDashboard} />
                      );
                    case 'evolver':
                      return <EvolverModule onBackToDashboard={handleBackToDashboard} />;
                    case 'hos-chip':
                      return <HOSChipModule onBackToDashboard={handleBackToDashboard} />;
                    case 'agent-forge':
                      return <AgentForgeModule userId={userId || ''} onBackToDashboard={handleBackToDashboard} />;
                    case 'agent-factory':
                      return <AgentFactoryModule userId={userId || ''} onBackToDashboard={handleBackToDashboard} />;
                    case 'agent-marketplace':
                      return <AgentMarketplaceModule userId={userId || ''} onBackToDashboard={handleBackToDashboard} />;
                    case 'appstudio':
                      return <AIAppStudioModule onBackToDashboard={handleBackToDashboard} />;
                    case 'screenshot':
                      return <ScreenshotToCodeModule onBackToDashboard={handleBackToDashboard} />;
                    case 'gcn':
                      return <HOSGraphConvolutionalNetworksModule onBackToDashboard={handleBackToDashboard} />;
                    case 'hosgpt':
                      return <HOSGPTModule onBackToDashboard={handleBackToDashboard} />;
                    case 'financial-research':
                      return <HOSFinancialResearchModule onBackToDashboard={handleBackToDashboard} />;
                    case 'whitepaper':
                      return <WhitepaperModule />;
                    case 'analytics':
                      return <AnalyticsDashboardModule userId={userId || undefined} />;
                    case 'agents-arena':
                      return <AgentsArenaModule />;
                    case 'rdp':
                      return <RDPModule />;
                    case 'kernel':
                      return <KernelModule onBackToDashboard={handleBackToDashboard} />;
                    case 'mind':
                      return <MindModule />;
                    case 'processes':
                      return <ProcessesModule onBackToDashboard={handleBackToDashboard} />;
                    case 'memory':
                      return <MemoryModule onBackToDashboard={handleBackToDashboard} />;
                    case 'timeline':
                      return <TimelineModule onBackToDashboard={handleBackToDashboard} />;
                    case 'parallel-selves':
                      return <ParallelSelvesModule onBackToDashboard={handleBackToDashboard} />;
                    case 'life-debugger':
                      return <LifeDebuggerModule onBackToDashboard={handleBackToDashboard} />;
                    case 'emotional-bios':
                      return <EmotionalBIOSModule onBackToDashboard={handleBackToDashboard} />;
                    case 'narrative-engine':
                      return <NarrativeEngineModule onBackToDashboard={handleBackToDashboard} />;
                    case 'quantum-planner':
                      return <QuantumPlannerModule />;
                    case 'reflection-mirror':
                      return <ReflectionMirrorModule onBackToDashboard={handleBackToDashboard} />;
                    case 'habit-forge':
                      return <HabitForgeModule onBackToDashboard={handleBackToDashboard} />;
                    case 'core-research':
                      return <CoreResearchModule onBackToDashboard={handleBackToDashboard} />;
                    case 'llm':
                      return <LargeLanguageModelsModule onBackToDashboard={handleBackToDashboard} />;
                    case 'neural-network':
                      return <NeuralNetworkModule />;
                    case 'cosmic-cortex':
                      return <CosmicCortexModule />;
                    case 'autonomous':
                      return <AutonomousModule onBackToDashboard={handleBackToDashboard} />;
                    case 'open-hos':
                      return <OpenHOSModule />;
                    default:
                      return null;
                  }
                })()}
                </div>
              </Suspense>
            </div>
          </div>
        </div>

        {/* HOS Command Center - CMD+K / CTRL+K */}
        <HOSCommandCenter onNavigate={handleOpenModule} />
        
        <Toaster />
        </div>
      </ErrorBoundary>
  );
}

// Main App wrapper with HOSProvider and error recovery
function App() {
  console.log('🚀 App component mounting...');
  
  try {
    return (
      <HOSProvider>
        <AppContent />
      </HOSProvider>
    );
  } catch (error) {
    console.error('❌ CRITICAL ERROR in App render:', error);
    // Show a basic error screen
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-400">Critical Error</h1>
          <p className="text-slate-300">
            The application failed to initialize. Please check the console for details.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}

export default App;
