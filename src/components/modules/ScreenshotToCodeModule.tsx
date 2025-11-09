import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { 
  Upload, 
  Image as ImageIcon, 
  Code, 
  Eye, 
  Download, 
  Loader2,
  Check,
  Copy,
  Wand2,
  Sparkles,
  FileCode,
  Palette,
  Layout,
  Smartphone,
  Monitor,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Screenshot, CodeFramework, ConversionOptions, GeneratedCode } from '../../types/screenshot';
import { toast } from 'sonner@2.0.3';

export function ScreenshotToCodeModule() {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedFramework, setSelectedFramework] = useState<CodeFramework>('react');
  const [isDragging, setIsDragging] = useState(false);
  
  const [options, setOptions] = useState<ConversionOptions>({
    framework: 'react',
    styling: 'tailwind',
    typescript: true,
    responsive: true,
    accessibility: true,
    comments: true,
    extractColors: true,
    optimizeImages: true
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      processFiles(files);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const processFiles = async (files: File[]) => {
    for (const file of files) {
      const preview = URL.createObjectURL(file);
      
      const newScreenshot: Screenshot = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        file,
        preview,
        status: 'uploading',
        progress: 0,
        createdAt: new Date()
      };

      setScreenshots(prev => [newScreenshot, ...prev]);
      
      await convertScreenshot(newScreenshot);
    }
  };

  const convertScreenshot = async (screenshot: Screenshot) => {
    try {
      // Phase 1: Uploading
      screenshot.status = 'uploading';
      await simulateProgress(screenshot, 20);

      // Phase 2: Analyzing
      screenshot.status = 'analyzing';
      await simulateProgress(screenshot, 50);

      // Phase 3: Generating
      screenshot.status = 'generating';
      await simulateProgress(screenshot, 90);

      // Phase 4: Complete
      screenshot.status = 'completed';
      screenshot.progress = 100;
      screenshot.code = generateMockCode(screenshot.name, options);
      screenshot.metadata = generateMockMetadata();

      setScreenshots(prev => prev.map(s => s.id === screenshot.id ? { ...screenshot } : s));
      setSelectedScreenshot({ ...screenshot });
      setActiveTab('preview');
      
      toast.success('Screenshot converted successfully!');
    } catch (error) {
      screenshot.status = 'error';
      screenshot.error = 'Failed to convert screenshot';
      setScreenshots(prev => prev.map(s => s.id === screenshot.id ? { ...screenshot } : s));
      toast.error('Failed to convert screenshot');
    }
  };

  const simulateProgress = (screenshot: Screenshot, targetProgress: number) => {
    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        screenshot.progress += 5;
        setScreenshots(prev => prev.map(s => s.id === screenshot.id ? { ...screenshot } : s));
        
        if (screenshot.progress >= targetProgress) {
          clearInterval(interval);
          resolve();
        }
      }, 150);
    });
  };

  const generateMockCode = (imageName: string, opts: ConversionOptions): GeneratedCode => {
    const componentName = imageName.split('.')[0].replace(/[^a-zA-Z0-9]/g, '');
    
    return {
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${componentName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="max-w-4xl w-full bg-white rounded-lg shadow-lg p-8">
      <header class="border-b pb-4 mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Welcome</h1>
        <p class="text-gray-600 mt-2">This is a converted design from your screenshot</p>
      </header>
      
      <main class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-blue-50 p-6 rounded-lg">
            <h3 class="font-semibold text-lg mb-2">Feature One</h3>
            <p class="text-gray-600">Description of the first feature</p>
          </div>
          <div class="bg-green-50 p-6 rounded-lg">
            <h3 class="font-semibold text-lg mb-2">Feature Two</h3>
            <p class="text-gray-600">Description of the second feature</p>
          </div>
          <div class="bg-purple-50 p-6 rounded-lg">
            <h3 class="font-semibold text-lg mb-2">Feature Three</h3>
            <p class="text-gray-600">Description of the third feature</p>
          </div>
        </div>
        
        <div class="flex gap-4">
          <button class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Get Started
          </button>
          <button class="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50">
            Learn More
          </button>
        </div>
      </main>
    </div>
  </div>
</body>
</html>`,
      react: `import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';

export default function ${componentName}() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-8">
        <header className="border-b pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Welcome</h1>
          <p className="text-gray-600 mt-2">
            This is a converted design from your screenshot
          </p>
        </header>
        
        <main className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Feature One', 'Feature Two', 'Feature Three'].map((title, idx) => (
              <Card key={idx} className="bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Description of the feature</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex gap-4">
            <Button>Get Started</Button>
            <Button variant="outline">Learn More</Button>
          </div>
        </main>
      </div>
    </div>
  );
}`,
      vue: `<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gray-50">
    <div class="max-w-4xl w-full bg-white rounded-lg shadow-lg p-8">
      <header class="border-b pb-4 mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Welcome</h1>
        <p class="text-gray-600 mt-2">
          This is a converted design from your screenshot
        </p>
      </header>
      
      <main class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            v-for="(feature, idx) in features" 
            :key="idx"
            class="bg-blue-50 p-6 rounded-lg"
          >
            <h3 class="font-semibold text-lg mb-2">{{ feature.title }}</h3>
            <p class="text-gray-600">{{ feature.description }}</p>
          </div>
        </div>
        
        <div class="flex gap-4">
          <button class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Get Started
          </button>
          <button class="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50">
            Learn More
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const features = ref([
  { title: 'Feature One', description: 'Description of the first feature' },
  { title: 'Feature Two', description: 'Description of the second feature' },
  { title: 'Feature Three', description: 'Description of the third feature' }
]);
</script>`,
      tailwind: `/* Tailwind Configuration */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#10b981',
        accent: '#8b5cf6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}`,
      css: `/* Generated CSS */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.title {
  font-size: 1.875rem;
  font-weight: bold;
  color: #111827;
}

.subtitle {
  color: #6b7280;
  margin-top: 0.5rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.feature-card {
  background: #eff6ff;
  padding: 1.5rem;
  border-radius: 0.5rem;
}

.button-primary {
  background: #3b82f6;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
}

.button-primary:hover {
  background: #2563eb;
}`
    };
  };

  const generateMockMetadata = () => ({
    width: 1920,
    height: 1080,
    framework: options.framework,
    components: 8,
    elements: 24,
    colors: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'],
    fonts: ['Inter', 'system-ui'],
    layout: {
      type: 'landing' as const,
      sections: [
        {
          id: '1',
          type: 'header' as const,
          position: { x: 0, y: 0, width: 1920, height: 80 },
          elements: []
        },
        {
          id: '2',
          type: 'hero' as const,
          position: { x: 0, y: 80, width: 1920, height: 600 },
          elements: []
        }
      ],
      responsive: options.responsive
    }
  });

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

  const downloadCode = (framework: CodeFramework) => {
    if (!selectedScreenshot?.code) return;
    
    const code = selectedScreenshot.code[framework];
    const extensions = { html: 'html', react: 'tsx', vue: 'vue', tailwind: 'config.js' };
    const extension = extensions[framework];
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedScreenshot.name.split('.')[0]}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Code downloaded!');
  };

  const deleteScreenshot = (id: string) => {
    setScreenshots(prev => prev.filter(s => s.id !== id));
    if (selectedScreenshot?.id === id) {
      setSelectedScreenshot(null);
      setActiveTab('upload');
    }
    toast.success('Screenshot deleted');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 sm:p-6 border-b">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-fuchsia-500 flex items-center justify-center flex-shrink-0">
            <Wand2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div>
            <h2>AI Screenshot to Code</h2>
            <p className="text-muted-foreground">
              Drop in a screenshot and convert it to clean code instantly
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 h-0">
        <div className="p-4 sm:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2" disabled={!selectedScreenshot}>
            <Eye className="w-4 h-4" />
            Preview & Code
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Gallery ({screenshots.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          {/* Drop Zone */}
          <Card>
            <CardContent className="p-0">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  isDragging ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                />
                
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    
                    <div>
                      <h3 className="mb-2">Drop your screenshot here</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        or click to browse files
                      </p>
                      <Button type="button">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Files
                      </Button>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Supports: PNG, JPG, WebP, SVG (Max 10MB)
                    </div>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Options</CardTitle>
              <CardDescription>
                Configure how your screenshot will be converted
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Framework Selection */}
              <div className="space-y-3">
                <Label>Target Framework</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(['html', 'react', 'vue', 'tailwind'] as CodeFramework[]).map((fw) => (
                    <button
                      key={fw}
                      onClick={() => setOptions({ ...options, framework: fw })}
                      className={`p-3 border rounded-lg text-sm transition-colors ${
                        options.framework === fw
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <FileCode className="w-4 h-4 mx-auto mb-1" />
                      {fw.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Options */}
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
                  <Label htmlFor="responsive" className="cursor-pointer flex-1">Responsive</Label>
                  <Switch
                    id="responsive"
                    checked={options.responsive}
                    onCheckedChange={(checked) => setOptions({ ...options, responsive: checked })}
                  />
                </div>

                <div className="flex items-center justify-between space-x-2 p-3 border rounded-lg">
                  <Label htmlFor="accessibility" className="cursor-pointer flex-1">Accessibility</Label>
                  <Switch
                    id="accessibility"
                    checked={options.accessibility}
                    onCheckedChange={(checked) => setOptions({ ...options, accessibility: checked })}
                  />
                </div>

                <div className="flex items-center justify-between space-x-2 p-3 border rounded-lg">
                  <Label htmlFor="comments" className="cursor-pointer flex-1">Add Comments</Label>
                  <Switch
                    id="comments"
                    checked={options.comments}
                    onCheckedChange={(checked) => setOptions({ ...options, comments: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processing Queue */}
          {screenshots.some(s => s.status !== 'completed' && s.status !== 'error') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Processing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {screenshots
                  .filter(s => s.status !== 'completed' && s.status !== 'error')
                  .map(screenshot => (
                    <div key={screenshot.id} className="space-y-2 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm font-medium truncate max-w-[200px]">
                            {screenshot.name}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {screenshot.status}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {screenshot.progress}%
                        </span>
                      </div>
                      <Progress value={screenshot.progress} />
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}

          {/* Features Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <Palette className="w-8 h-8 mb-2 text-primary" />
                <CardTitle className="text-base">Smart Detection</CardTitle>
                <CardDescription className="text-xs">
                  AI-powered element and color detection
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Layout className="w-8 h-8 mb-2 text-primary" />
                <CardTitle className="text-base">Layout Analysis</CardTitle>
                <CardDescription className="text-xs">
                  Automatic responsive grid detection
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Code className="w-8 h-8 mb-2 text-primary" />
                <CardTitle className="text-base">Clean Code</CardTitle>
                <CardDescription className="text-xs">
                  Production-ready, semantic markup
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          {selectedScreenshot ? (
            <>
              {/* Screenshot Info */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Original Screenshot */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-base">Original</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img
                      src={selectedScreenshot.preview}
                      alt={selectedScreenshot.name}
                      className="w-full rounded-lg border"
                    />
                    {selectedScreenshot.metadata && (
                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dimensions:</span>
                          <span>{selectedScreenshot.metadata.width} × {selectedScreenshot.metadata.height}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Components:</span>
                          <span>{selectedScreenshot.metadata.components}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Elements:</span>
                          <span>{selectedScreenshot.metadata.elements}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {selectedScreenshot.metadata.colors.map((color, idx) => (
                            <div
                              key={idx}
                              className="w-6 h-6 rounded border"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Code View */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">Generated Code</CardTitle>
                        <Badge>{selectedFramework.toUpperCase()}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(selectedScreenshot.code![selectedFramework])}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadCode(selectedFramework)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Framework Tabs */}
                    <div className="flex gap-2 mb-4">
                      {(['html', 'react', 'vue', 'tailwind', 'css'] as const).map((fw) => (
                        <Button
                          key={fw}
                          size="sm"
                          variant={selectedFramework === fw ? 'default' : 'outline'}
                          onClick={() => setSelectedFramework(fw as CodeFramework)}
                        >
                          {fw.toUpperCase()}
                        </Button>
                      ))}
                    </div>

                    {/* Code Display */}
                    <ScrollArea className="h-[500px]">
                      <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                        <code>{selectedScreenshot.code?.[selectedFramework]}</code>
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No screenshot selected. Upload a screenshot first to see the preview and code.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="gallery" className="space-y-6">
          {screenshots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {screenshots.map((screenshot) => (
                <Card 
                  key={screenshot.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow group"
                >
                  <CardContent className="p-0">
                    <div 
                      className="relative aspect-video overflow-hidden rounded-t-lg"
                      onClick={() => {
                        setSelectedScreenshot(screenshot);
                        setActiveTab('preview');
                      }}
                    >
                      <img
                        src={screenshot.preview}
                        alt={screenshot.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <Badge 
                        className="absolute top-2 right-2"
                        variant={screenshot.status === 'completed' ? 'default' : 'secondary'}
                      >
                        {screenshot.status === 'completed' ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        )}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm truncate">{screenshot.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(screenshot.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteScreenshot(screenshot.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {screenshot.metadata && (
                        <div className="flex gap-2 mt-3">
                          <Badge variant="outline" className="text-xs">
                            {screenshot.metadata.framework}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {screenshot.metadata.components} components
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg mb-2">No screenshots yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload your first screenshot to get started
                </p>
                <Button onClick={() => setActiveTab('upload')}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Screenshot
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}
