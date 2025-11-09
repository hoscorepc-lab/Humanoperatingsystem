import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Switch } from '../ui/switch';
import { 
  Globe, 
  Sparkles, 
  Code, 
  Eye, 
  Download, 
  Loader2,
  Check,
  X,
  Copy,
  ExternalLink,
  Wand2,
  Zap,
  Palette,
  Layout,
  FileCode,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { ClonedApp, CloneOptions } from '../../types/appstudio';
import { toast } from 'sonner@2.0.3';
import { BotBanner, BotIllustration } from '../BotIllustration';

export function AIAppStudioModule() {
  const [url, setUrl] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const [currentApp, setCurrentApp] = useState<ClonedApp | null>(null);
  const [clonedApps, setClonedApps] = useState<ClonedApp[]>([]);
  const [selectedApp, setSelectedApp] = useState<ClonedApp | null>(null);
  const [activeTab, setActiveTab] = useState('clone');
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  
  const [options, setOptions] = useState<CloneOptions>({
    framework: 'react',
    typescript: true,
    tailwind: true,
    extractImages: true,
    extractStyles: true,
    componentize: true,
    responsive: true
  });

  const handleClone = async () => {
    if (!url) {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsCloning(true);
    
    // Create new app entry
    const newApp: ClonedApp = {
      id: Date.now().toString(),
      name: extractDomainName(url),
      sourceUrl: url,
      description: 'Cloning website...',
      status: 'analyzing',
      progress: 0,
      createdAt: new Date()
    };

    setCurrentApp(newApp);
    setClonedApps(prev => [newApp, ...prev]);

    // Simulate cloning process
    try {
      // Phase 1: Analyzing
      await simulateProgress(newApp, 'analyzing', 30);
      
      // Phase 2: Generating
      newApp.status = 'generating';
      newApp.description = 'Generating React components...';
      await simulateProgress(newApp, 'generating', 70);
      
      // Phase 3: Complete
      newApp.status = 'completed';
      newApp.progress = 100;
      newApp.description = 'Website cloned successfully!';
      newApp.code = generateMockCode(url);
      newApp.metadata = {
        framework: options.framework,
        tailwind: options.tailwind,
        typescript: options.typescript,
        components: 12,
        pages: 3
      };

      setCurrentApp({ ...newApp });
      setClonedApps(prev => prev.map(a => a.id === newApp.id ? newApp : a));
      setSelectedApp(newApp);
      setActiveTab('preview');
      
      toast.success('Website cloned successfully!');
    } catch (error) {
      newApp.status = 'error';
      newApp.error = 'Failed to clone website';
      setCurrentApp({ ...newApp });
      toast.error('Failed to clone website');
    } finally {
      setIsCloning(false);
    }
  };

  const simulateProgress = (app: ClonedApp, status: ClonedApp['status'], targetProgress: number) => {
    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        app.progress += 5;
        setCurrentApp({ ...app });
        
        if (app.progress >= targetProgress) {
          clearInterval(interval);
          resolve();
        }
      }, 200);
    });
  };

  const extractDomainName = (url: string): string => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
    } catch {
      return 'New App';
    }
  };

  const generateMockCode = (url: string) => {
    const appName = extractDomainName(url);
    
    return {
      components: [
        {
          id: '1',
          name: 'App',
          path: '/App.tsx',
          code: `import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
}`,
          type: 'page' as const,
          dependencies: ['react']
        },
        {
          id: '2',
          name: 'Header',
          path: '/components/Header.tsx',
          code: `import { Button } from './ui/button';

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <div className="text-2xl font-bold">${appName}</div>
          <div className="flex gap-4">
            <Button variant="ghost">Features</Button>
            <Button variant="ghost">Pricing</Button>
            <Button>Get Started</Button>
          </div>
        </nav>
      </div>
    </header>
  );
}`,
          type: 'component' as const,
          dependencies: ['react']
        },
        {
          id: '3',
          name: 'Hero',
          path: '/components/Hero.tsx',
          code: `import { Button } from './ui/button';

export function Hero() {
  return (
    <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Welcome to ${appName}
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Experience the future of web applications with our cutting-edge platform
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg">Get Started</Button>
          <Button size="lg" variant="outline">Learn More</Button>
        </div>
      </div>
    </section>
  );
}`,
          type: 'component' as const,
          dependencies: ['react']
        },
        {
          id: '4',
          name: 'Features',
          path: '/components/Features.tsx',
          code: `import { Zap, Shield, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized for speed and performance'
  },
  {
    icon: Shield,
    title: 'Secure',
    description: 'Enterprise-grade security built-in'
  },
  {
    icon: Sparkles,
    title: 'Modern',
    description: 'Built with the latest technologies'
  }
];

export function Features() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <CardHeader>
                  <Icon className="w-10 h-10 mb-2 text-primary" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}`,
          type: 'component' as const,
          dependencies: ['react', 'lucide-react']
        }
      ],
      styles: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #000000;
  --primary: #0070f3;
  --primary-foreground: #ffffff;
}`,
      assets: [
        {
          id: '1',
          name: 'logo.svg',
          type: 'svg' as const,
          url: '/assets/logo.svg',
          size: 2048
        }
      ]
    };
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Code copied to clipboard!');
    } catch (error) {
      // Fallback for when clipboard API is blocked
      const textArea = document.createElement('textarea');
      textArea.value = code;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success('Code copied to clipboard!');
      } catch (err) {
        toast.error('Failed to copy code. Please copy manually.');
      }
      document.body.removeChild(textArea);
    }
  };

  const downloadCode = () => {
    if (!selectedApp?.code) return;
    
    // Create a simple download of the main App component
    const blob = new Blob([selectedApp.code.components[0].code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedApp.name}-App.tsx`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Code downloaded!');
  };

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 h-0">
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header with decorative bots */}
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl">AI App Studio</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Clone and recreate any website as a modern React app
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 border-2 border-slate-300 dark:border-slate-600">
            <TabsTrigger value="clone" className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clone Website</span>
              <span className="sm:hidden">Clone</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2" disabled={!selectedApp}>
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Preview & Code</span>
              <span className="sm:hidden">Preview</span>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              <span className="hidden sm:inline">My Apps ({clonedApps.length})</span>
              <span className="sm:hidden">Apps ({clonedApps.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clone" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Clone Any Website</CardTitle>
                <CardDescription>
                  Enter a URL and let AI recreate it as a modern React application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* URL Input */}
                <div className="space-y-2">
                  <Label htmlFor="url">Website URL</Label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="pl-10"
                        disabled={isCloning}
                      />
                    </div>
                    <Button 
                      onClick={handleClone} 
                      disabled={isCloning || !url}
                      className="min-w-[120px]"
                    >
                      {isCloning ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Cloning...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Clone
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-4">
                  <h4 className="text-sm">Clone Options</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between space-x-2 p-3 border rounded-lg">
                      <Label htmlFor="typescript" className="cursor-pointer flex-1">TypeScript</Label>
                      <Switch
                        id="typescript"
                        checked={options.typescript}
                        onCheckedChange={(checked) => setOptions({ ...options, typescript: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between space-x-2 p-3 border rounded-lg">
                      <Label htmlFor="tailwind" className="cursor-pointer flex-1">Tailwind CSS</Label>
                      <Switch
                        id="tailwind"
                        checked={options.tailwind}
                        onCheckedChange={(checked) => setOptions({ ...options, tailwind: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between space-x-2 p-3 border rounded-lg">
                      <Label htmlFor="componentize" className="cursor-pointer flex-1">Auto-Componentize</Label>
                      <Switch
                        id="componentize"
                        checked={options.componentize}
                        onCheckedChange={(checked) => setOptions({ ...options, componentize: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between space-x-2 p-3 border rounded-lg">
                      <Label htmlFor="responsive" className="cursor-pointer flex-1">Responsive Design</Label>
                      <Switch
                        id="responsive"
                        checked={options.responsive}
                        onCheckedChange={(checked) => setOptions({ ...options, responsive: checked })}
                      />
                    </div>
                  </div>
                </div>

                {/* Progress */}
                {currentApp && currentApp.status !== 'completed' && (
                  <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm font-medium">{currentApp.description}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{currentApp.progress}%</span>
                    </div>
                    <Progress value={currentApp.progress} />
                  </div>
                )}

                {/* Quick Examples */}
                <div className="space-y-2">
                  <h4 className="text-sm text-muted-foreground">Try these examples:</h4>
                  <div className="flex flex-wrap gap-2">
                    {['https://stripe.com', 'https://vercel.com', 'https://linear.app'].map((example) => (
                      <Button
                        key={example}
                        variant="outline"
                        size="sm"
                        onClick={() => setUrl(example)}
                        disabled={isCloning}
                      >
                        {example.replace('https://', '')}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="border-2 hover:shadow-lg transition-all">
                <CardHeader>
                  <Palette className="w-8 h-8 mb-2 text-primary" />
                  <CardTitle className="text-base">Style Extraction</CardTitle>
                  <CardDescription className="text-xs">
                    Automatically extracts colors, fonts, and design tokens
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-all">
                <CardHeader>
                  <Zap className="w-8 h-8 mb-2 text-primary" />
                  <CardTitle className="text-base">Smart Components</CardTitle>
                  <CardDescription className="text-xs">
                    AI-powered component detection and generation
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-all">
                <CardHeader>
                  <Code className="w-8 h-8 mb-2 text-primary" />
                  <CardTitle className="text-base">Clean Code</CardTitle>
                  <CardDescription className="text-xs">
                    Production-ready, maintainable React code
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            {selectedApp ? (
              <>
                {/* App Info */}
                <Card className="border-2">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle>{selectedApp.name}</CardTitle>
                          <Badge variant={selectedApp.status === 'completed' ? 'default' : 'secondary'}>
                            {selectedApp.status === 'completed' ? (
                              <><Check className="w-3 h-3 mr-1" /> Complete</>
                            ) : (
                              <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> {selectedApp.status}</>
                            )}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-2">
                          <ExternalLink className="w-3 h-3" />
                          {selectedApp.sourceUrl}
                        </CardDescription>
                        {selectedApp.metadata && (
                          <div className="flex gap-2 mt-3">
                            <Badge variant="outline">{selectedApp.metadata.components} Components</Badge>
                            <Badge variant="outline">{selectedApp.metadata.pages} Pages</Badge>
                            <Badge variant="outline">{selectedApp.metadata.framework}</Badge>
                            {selectedApp.metadata.typescript && <Badge variant="outline">TypeScript</Badge>}
                            {selectedApp.metadata.tailwind && <Badge variant="outline">Tailwind</Badge>}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={downloadCode} size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Code Explorer */}
                {selectedApp.code && (
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* File Tree */}
                    <Card className="lg:col-span-1 border-2">
                      <CardHeader>
                        <CardTitle className="text-base">Files</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[500px]">
                          <div className="space-y-1">
                            {selectedApp.code.components.map((component) => (
                              <button
                                key={component.id}
                                onClick={() => setSelectedComponent(component.id)}
                                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                  selectedComponent === component.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-muted'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <FileCode className="w-4 h-4" />
                                  <span className="truncate">{component.name}</span>
                                </div>
                                <div className="text-xs opacity-70 ml-6">{component.path}</div>
                              </button>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    {/* Code Viewer */}
                    <Card className="lg:col-span-3 border-2">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            {selectedComponent 
                              ? selectedApp.code.components.find(c => c.id === selectedComponent)?.name
                              : 'Select a file'}
                          </CardTitle>
                          {selectedComponent && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const component = selectedApp.code?.components.find(c => c.id === selectedComponent);
                                if (component) copyToClipboard(component.code);
                              }}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copy
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[500px]">
                          {selectedComponent ? (
                            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                              <code>
                                {selectedApp.code.components.find(c => c.id === selectedComponent)?.code}
                              </code>
                            </pre>
                          ) : (
                            <div className="h-[500px] flex items-center justify-center text-muted-foreground">
                              Select a file to view its code
                            </div>
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No app selected. Clone a website first to see the preview and code.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            {/* Bot Banner for My Apps */}
            <BotBanner 
              title="My AI Studio" 
              subtitle="Your collection of AI-cloned applications"
              botCount={12}
            />

            {clonedApps.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clonedApps.map((app) => (
                  <Card 
                    key={app.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => {
                      setSelectedApp(app);
                      setActiveTab('preview');
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{app.name}</CardTitle>
                          <CardDescription className="text-xs truncate">{app.sourceUrl}</CardDescription>
                        </div>
                        <Badge variant={app.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                          {app.status === 'completed' ? (
                            <Check className="w-3 h-3" />
                          ) : app.status === 'error' ? (
                            <X className="w-3 h-3" />
                          ) : (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          )}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {app.metadata && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          <Badge variant="outline" className="text-xs">{app.metadata.components} components</Badge>
                          <Badge variant="outline" className="text-xs">{app.metadata.framework}</Badge>
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg mb-2">No apps cloned yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start by cloning your first website
                  </p>
                  <Button onClick={() => setActiveTab('clone')}>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Clone Website
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}