/**
 * HOS Settings Panel
 * Comprehensive settings interface with amazing UX
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Alert, AlertDescription } from './ui/alert';
import {
  Palette,
  Shield,
  Zap,
  Bell,
  User,
  Code,
  Info,
  Download,
  Trash2,
  Eye,
  Volume2,
  Keyboard,
  Sparkles,
  Moon,
  Sun,
  Monitor,
  Database,
  RefreshCw,
  Lock,
  Mail,
  HelpCircle,
  FileText,
  BarChart3,
  Wifi,
  WifiOff,
  Settings2,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Github,
  Heart,
  ArrowLeft,
  X,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { getTheme, setTheme } from '../lib/theme';
import { clearAnalyticsData, getUserActivitySummary } from '../lib/analytics/service';
import { getActiveSubscriptionCount, unsubscribeAll } from '../lib/realtime/service';

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
}

interface Settings {
  // Appearance
  theme: 'pearl' | 'silver' | 'chrome' | 'platinum' | 'black';
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  animationsEnabled: boolean;
  accentColor: string;
  
  // Privacy
  analyticsEnabled: boolean;
  crashReportsEnabled: boolean;
  autoLogoutMinutes: number;
  
  // Performance
  performanceMonitorEnabled: boolean;
  realtimeEnabled: boolean;
  cacheEnabled: boolean;
  lazyLoadingEnabled: boolean;
  
  // Accessibility
  highContrast: boolean;
  reducedMotion: boolean;
  keyboardShortcuts: boolean;
  
  // Notifications
  toastNotifications: boolean;
  soundEnabled: boolean;
  sessionAlerts: boolean;
  
  // Advanced
  developerMode: boolean;
  debugLogs: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'pearl',
  fontSize: 'medium',
  compactMode: false,
  animationsEnabled: true,
  accentColor: '#8b5cf6',
  analyticsEnabled: true,
  crashReportsEnabled: true,
  autoLogoutMinutes: 60,
  performanceMonitorEnabled: false,
  realtimeEnabled: true,
  cacheEnabled: true,
  lazyLoadingEnabled: true,
  highContrast: false,
  reducedMotion: false,
  keyboardShortcuts: true,
  toastNotifications: true,
  soundEnabled: false,
  sessionAlerts: true,
  developerMode: false,
  debugLogs: false,
};

export function SettingsPanel({
  open,
  onOpenChange,
  userName = 'Human',
  userEmail = 'user@hos.ai',
  onLogout,
}: SettingsPanelProps) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [realtimeConnections, setRealtimeConnections] = useState(0);

  // Load settings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('hos_settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  // Update realtime connection count
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeConnections(getActiveSubscriptionCount());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem('hos_settings', JSON.stringify(settings));
    setHasUnsavedChanges(false);
    
    // Apply theme change immediately
    setTheme(settings.theme);
    
    // Apply font size
    document.documentElement.style.fontSize = 
      settings.fontSize === 'small' ? '14px' : 
      settings.fontSize === 'large' ? '18px' : '16px';
    
    // Apply reduced motion
    if (settings.reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
    
    // Apply high contrast
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    toast.success('Settings saved', {
      description: 'Your preferences have been updated',
    });
  };

  // Update a setting
  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  // Reset to defaults
  const resetToDefaults = () => {
    if (confirm('Reset all settings to defaults? This cannot be undone.')) {
      setSettings(DEFAULT_SETTINGS);
      setHasUnsavedChanges(true);
      toast.info('Settings reset to defaults');
    }
  };

  // Export settings
  const exportSettings = () => {
    const data = JSON.stringify(settings, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hos-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Settings exported');
  };

  // Clear all data
  const clearAllData = () => {
    if (confirm('Clear all HOS data including analytics, cache, and preferences? This cannot be undone.')) {
      localStorage.clear();
      sessionStorage.clear();
      clearAnalyticsData();
      unsubscribeAll();
      toast.success('All data cleared', {
        description: 'The page will reload',
      });
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[100dvh] sm:h-[90vh] max-h-[100dvh] sm:max-h-[90vh] p-0 gap-0 w-full sm:max-w-4xl">
        {/* Mobile Header with Back Button */}
        <div className="lg:hidden flex items-center gap-3 p-4 border-b border-border flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="flex-shrink-0 h-12 w-12"
          >
            <ArrowLeft className="w-9 h-9" />
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold truncate">HOS Settings</h2>
            <p className="text-xs text-muted-foreground truncate">Customize your experience</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="flex-shrink-0 h-10 w-10"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Desktop Header */}
        <DialogHeader className="hidden lg:block p-4 sm:p-6 pb-3 sm:pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <Settings2 className="w-5 h-5 sm:w-6 sm:h-6" />
            HOS Settings
          </DialogTitle>
          <DialogDescription className="text-sm">
            Customize your Human Operating System experience
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="appearance" className="flex-1 flex flex-col min-h-0">
          <div className="px-4 sm:px-6 flex-shrink-0">
            <TabsList className="flex w-full gap-1 h-auto p-1 overflow-x-auto">
              <TabsTrigger value="appearance" className="flex-shrink-0 px-3">
                <Palette className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex-shrink-0 px-3">
                <Shield className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex-shrink-0 px-3">
                <Zap className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="accessibility" className="flex-shrink-0 px-3">
                <Eye className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex-shrink-0 px-3">
                <Bell className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="account" className="flex-shrink-0 px-3">
                <User className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="about" className="flex-shrink-0 px-3">
                <Info className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 px-4 sm:px-6 py-4">
            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Theme</CardTitle>
                  <CardDescription>Choose your visual style</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[
                      { value: 'pearl', label: 'Pearl White', icon: Sun, color: 'bg-slate-100' },
                      { value: 'silver', label: 'Silver Mist', icon: Sparkles, color: 'bg-slate-300' },
                      { value: 'chrome', label: 'Steel Gray', icon: Monitor, color: 'bg-[#43464B]' },
                      { value: 'blue', label: 'Electric Blue', icon: Zap, color: 'bg-[#0052FF]' },
                      { value: 'black', label: 'Brilliant Black', icon: Moon, color: 'bg-black' },
                    ].map(theme => (
                      <button
                        key={theme.value}
                        onClick={() => updateSetting('theme', theme.value as any)}
                        className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                          settings.theme === theme.value
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className={`w-full h-12 rounded ${theme.color} mb-2`} />
                        <div className="flex items-center justify-center gap-2">
                          <theme.icon className="w-4 h-4" />
                          <span className="text-sm">{theme.label}</span>
                        </div>
                        {settings.theme === theme.value && (
                          <CheckCircle2 
                            className={`w-5 h-5 mx-auto mt-2 ${theme.value === 'black' ? '' : 'text-primary'}`}
                            style={theme.value === 'black' ? { color: '#000000' } : undefined}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Display</CardTitle>
                  <CardDescription>Adjust visual preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Animations</Label>
                      <p className="text-sm text-muted-foreground">Enable smooth transitions</p>
                    </div>
                    <Switch
                      checked={settings.animationsEnabled}
                      onCheckedChange={v => updateSetting('animationsEnabled', v)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Data Collection</CardTitle>
                  <CardDescription>Control what data is tracked</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Analytics
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Track usage patterns locally
                      </p>
                    </div>
                    <Switch
                      checked={settings.analyticsEnabled}
                      onCheckedChange={v => updateSetting('analyticsEnabled', v)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Crash Reports
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Help improve HOS by reporting errors
                      </p>
                    </div>
                    <Switch
                      checked={settings.crashReportsEnabled}
                      onCheckedChange={v => updateSetting('crashReportsEnabled', v)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Session and authentication settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Auto-Logout Timer</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[settings.autoLogoutMinutes]}
                        onValueChange={([v]) => updateSetting('autoLogoutMinutes', v)}
                        min={15}
                        max={240}
                        step={15}
                        className="flex-1"
                      />
                      <Badge variant="secondary">{settings.autoLogoutMinutes}m</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Auto-logout after inactivity (15-240 minutes)
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>Export or delete your data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const summary = getUserActivitySummary(userEmail);
                        const data = JSON.stringify(summary, null, 2);
                        const blob = new Blob([data], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `hos-analytics-${new Date().toISOString().split('T')[0]}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        toast.success('Analytics data exported');
                      }}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Analytics
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        clearAnalyticsData();
                        toast.success('Analytics data cleared');
                      }}
                      className="flex-1"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear Analytics
                    </Button>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={clearAllData}
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All HOS Data
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6 mt-0">
              <Alert>
                <Zap className="w-4 h-4" />
                <AlertDescription>
                  Performance settings affect how HOS loads and runs. Changes take effect after saving.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle>Monitoring</CardTitle>
                  <CardDescription>Performance tracking tools</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Performance Monitor</Label>
                      <p className="text-sm text-muted-foreground">
                        Show FPS and memory usage (Ctrl+Shift+P)
                      </p>
                    </div>
                    <Switch
                      checked={settings.performanceMonitorEnabled}
                      onCheckedChange={v => updateSetting('performanceMonitorEnabled', v)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Real-time Features</CardTitle>
                  <CardDescription>Live updates and synchronization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        {settings.realtimeEnabled ? (
                          <Wifi className="w-4 h-4 text-green-500" />
                        ) : (
                          <WifiOff className="w-4 h-4 text-muted-foreground" />
                        )}
                        Real-time Updates
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {realtimeConnections > 0 
                          ? `${realtimeConnections} active connection${realtimeConnections > 1 ? 's' : ''}`
                          : 'Enable live data synchronization'
                        }
                      </p>
                    </div>
                    <Switch
                      checked={settings.realtimeEnabled}
                      onCheckedChange={v => updateSetting('realtimeEnabled', v)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Optimization</CardTitle>
                  <CardDescription>Performance enhancements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Module Lazy Loading</Label>
                      <p className="text-sm text-muted-foreground">
                        Load modules on-demand for faster startup
                      </p>
                    </div>
                    <Switch
                      checked={settings.lazyLoadingEnabled}
                      onCheckedChange={v => updateSetting('lazyLoadingEnabled', v)}
                      disabled
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Browser Cache</Label>
                      <p className="text-sm text-muted-foreground">
                        Cache assets for faster loading
                      </p>
                    </div>
                    <Switch
                      checked={settings.cacheEnabled}
                      onCheckedChange={v => updateSetting('cacheEnabled', v)}
                    />
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => {
                      if ('caches' in window) {
                        caches.keys().then(names => {
                          names.forEach(name => caches.delete(name));
                        });
                      }
                      toast.success('Cache cleared', {
                        description: 'Page will reload',
                      });
                      setTimeout(() => window.location.reload(), 1000);
                    }}
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Clear Cache & Reload
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Accessibility Tab */}
            <TabsContent value="accessibility" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Visual Accessibility</CardTitle>
                  <CardDescription>Improve readability and reduce strain</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>High Contrast</Label>
                      <p className="text-sm text-muted-foreground">
                        Increase contrast for better visibility
                      </p>
                    </div>
                    <Switch
                      checked={settings.highContrast}
                      onCheckedChange={v => updateSetting('highContrast', v)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Reduced Motion</Label>
                      <p className="text-sm text-muted-foreground">
                        Minimize animations and transitions
                      </p>
                    </div>
                    <Switch
                      checked={settings.reducedMotion}
                      onCheckedChange={v => updateSetting('reducedMotion', v)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Keyboard Navigation</CardTitle>
                  <CardDescription>Shortcuts and keyboard controls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Keyboard className="w-4 h-4" />
                        Keyboard Shortcuts
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Enable keyboard navigation
                      </p>
                    </div>
                    <Switch
                      checked={settings.keyboardShortcuts}
                      onCheckedChange={v => updateSetting('keyboardShortcuts', v)}
                    />
                  </div>

                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <h4 className="text-sm">Available Shortcuts:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Performance Monitor:</span>
                        <Badge variant="outline" className="text-xs">Ctrl+Shift+P</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Settings:</span>
                        <Badge variant="outline" className="text-xs">Ctrl+,</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Search Modules:</span>
                        <Badge variant="outline" className="text-xs">Ctrl+K</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Toggle Sidebar:</span>
                        <Badge variant="outline" className="text-xs">Ctrl+B</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Control alerts and sounds</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Toast Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Show pop-up notifications
                      </p>
                    </div>
                    <Switch
                      checked={settings.toastNotifications}
                      onCheckedChange={v => updateSetting('toastNotifications', v)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4" />
                        Sound Effects
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Play sounds for notifications
                      </p>
                    </div>
                    <Switch
                      checked={settings.soundEnabled}
                      onCheckedChange={v => updateSetting('soundEnabled', v)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Session Alerts
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Notify before session expiration
                      </p>
                    </div>
                    <Switch
                      checked={settings.sessionAlerts}
                      onCheckedChange={v => updateSetting('sessionAlerts', v)}
                    />
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => {
                      toast.success('Test Notification', {
                        description: 'This is how notifications will appear',
                      });
                    }}
                    className="w-full"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Test Notification
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Your HOS account information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={userName} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={userEmail} disabled />
                  </div>
                  <Alert>
                    <Mail className="w-4 h-4" />
                    <AlertDescription>
                      To change your account details, contact support or use the account management page.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card className="border-red-500/20">
                <CardHeader>
                  <CardTitle className="text-red-500">Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (onLogout) {
                        onLogout();
                        toast.info('Logged out successfully');
                      }
                    }}
                    className="w-full bg-red-500 hover:bg-red-600 text-white"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full text-red-500 border-red-500/50 hover:bg-red-500/10"
                    onClick={() => {
                      if (confirm('Delete your HOS account? This cannot be undone and all data will be lost.')) {
                        toast.error('Account deletion', {
                          description: 'This feature is not yet implemented',
                        });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary" />
                    HOS - Human Operating System
                  </CardTitle>
                  <CardDescription>Your self-learning AI agent platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Version</p>
                      <p className="font-mono">3.0.0</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Build</p>
                      <p className="font-mono">{new Date().toISOString().split('T')[0]}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Modules</p>
                      <p>33+ Active</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Theme System</p>
                      <p>4-Shade Silver</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                      Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> for humans
                    </p>
                    <p className="text-xs text-muted-foreground">
                      © {new Date().getFullYear()} HOS. All rights reserved.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>

          {/* Footer with Save/Cancel buttons */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t bg-background flex-shrink-0">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <div className="text-xs sm:text-sm text-muted-foreground min-w-0">
                {hasUnsavedChanges && (
                  <span className="flex items-center gap-1 sm:gap-2">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">You have unsaved changes</span>
                    <span className="sm:hidden">Unsaved</span>
                  </span>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    saveSettings();
                    onOpenChange(false);
                  }}
                  disabled={!hasUnsavedChanges}
                  size="sm"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
