# 🎛️ HOS Settings Panel - Complete Guide

## Access Settings

### Method 1: Taskbar (Recommended)
1. Click the **START** button in the bottom-left taskbar
2. Click **"Settings"** in the quick menu

### Method 2: Keyboard Shortcut (Coming Soon)
- Press `Ctrl+,` (Windows/Linux) or `Cmd+,` (Mac)

---

## 🎨 Appearance Settings

### Theme Selection
Choose from 4 beautiful themes:
- **Pearl** ☀️ - Light, clean, professional
- **Silver** ✨ - Elegant silver tones
- **Graphite** 🌙 - Sophisticated dark gray
- **Brilliant Black** 🖥️ - Pure dark mode

**Visual Preview**: Each theme shows a color swatch so you can see before selecting.

### Display Options

#### Font Size
- **Small**: 14px - More content on screen
- **Medium**: 16px - Default, optimal readability
- **Large**: 18px - Enhanced accessibility

#### Compact Mode
Toggle to reduce spacing between elements and fit more content on screen. Perfect for power users who want maximum information density.

#### Animations
Enable/disable smooth transitions and animations. Disable for:
- Better performance on older devices
- Reduced distractions
- Accessibility needs

---

## 🔒 Privacy & Data Settings

### Data Collection

#### Analytics 📊
- **On**: Track your HOS usage patterns locally
- **Off**: No usage data collected
- **Storage**: All data stays on your device
- **Benefits**: View insights in Analytics Dashboard

#### Crash Reports 🐛
- Help improve HOS by automatically reporting errors
- No personal data is included
- Helps developers fix bugs faster

### Security

#### Auto-Logout Timer ⏱️
- **Range**: 15-240 minutes (15-minute increments)
- **Default**: 60 minutes
- **Purpose**: Automatically log out after inactivity
- **Recommended**: 60 minutes for balance of security and convenience

### Data Management

#### Export Analytics 📥
- Downloads all your usage data as JSON
- Includes: sessions, module usage, time spent
- Use for: Personal records, data portability

#### Clear Analytics 🧹
- Removes all analytics data from your browser
- **Warning**: Cannot be undone
- Keeps your settings intact

#### Clear All HOS Data 💣
- **Nuclear option**: Removes everything
- Deletes: Analytics, settings, cache, all localStorage
- **Warning**: Page will reload, you'll be logged out
- Use when: Fresh start needed, troubleshooting issues

---

## ⚡ Performance Settings

### Monitoring

#### Performance Monitor
- Shows real-time FPS, memory usage, and latency
- Toggle with `Ctrl+Shift+P` even when disabled here
- Appears in bottom-right corner
- Color indicators:
  - 🟢 Green: Excellent (55+ FPS)
  - 🟡 Yellow: Good (30-54 FPS)
  - 🔴 Red: Poor (<30 FPS)

### Real-time Features

#### Real-time Updates 📡
- **Status Indicator**: Shows active connections count
- **When On**: Live data sync across tabs/devices
- **When Off**: Manual refresh only
- **Impact**: Minimal data usage
- **Recommended**: Keep ON for best experience

### Optimization

#### Module Lazy Loading
- **Always On**: Cannot be disabled
- **Purpose**: Loads modules on-demand
- **Benefit**: 50-70% faster startup
- **Trade-off**: Brief loading spinner on first module access

#### Browser Cache
- **Recommended**: Keep enabled
- **When to disable**: Debugging issues, testing updates
- **Clear Cache Button**: Immediately clears and reloads

---

## ♿ Accessibility Settings

### Visual Accessibility

#### High Contrast Mode
- Increases contrast between text and background
- Better for:
  - Visual impairments
  - Bright environments
  - E-ink displays

#### Reduced Motion
- Minimizes animations and transitions
- **CSS Class Applied**: `.reduce-motion` on `<html>`
- Benefits:
  - Reduces motion sickness
  - Less distracting
  - Better battery life
  - Accessibility compliance

### Keyboard Navigation

#### Keyboard Shortcuts
Enable/disable all keyboard shortcuts at once.

**Available Shortcuts**:
| Action | Shortcut |
|--------|----------|
| Performance Monitor | `Ctrl+Shift+P` |
| Settings | `Ctrl+,` |
| Search Modules | `Ctrl+K` |
| Toggle Sidebar | `Ctrl+B` |

More shortcuts coming soon!

---

## 🔔 Notifications Settings

### Notification Types

#### Toast Notifications 🍞
- Pop-up messages in the bottom-right
- Examples:
  - "Settings saved"
  - "Session refreshed"
  - "Module loaded"
- **Test Button**: See how they look

#### Sound Effects 🔊
- Play sounds for notifications
- **Coming Soon**: Custom sound selection
- **Note**: Currently in development

#### Session Alerts 🔐
- Notify before session expiration
- Alerts at:
  - 5 minutes before logout
  - 1 minute before logout
- Allows you to extend session or save work

---

## 👤 Account Settings

### Profile Information
- **Name**: Display name (read-only in settings)
- **Email**: Account email (read-only in settings)
- **To Edit**: Use account management page or contact support

### Danger Zone ⚠️

#### Logout Button
- Sign out from current device
- Preserves local data
- Requires login to access again

#### Delete Account 🗑️
- **Permanently** deletes your HOS account
- **Warning**: Cannot be undone
- All data will be lost
- **Status**: Feature coming soon

---

## 🔧 Advanced Settings

### Developer Tools

#### Developer Mode 👨‍💻
Enables advanced features:
- Additional debug panels
- Experimental modules
- API access indicators
- Performance profiling tools

#### Debug Logs 📝
- Enables verbose console logging
- Shows:
  - Module loading details
  - Analytics events
  - Real-time connection status
  - Performance metrics
- **Use for**: Troubleshooting, development

### Configuration Management

#### Export Settings 📤
- Downloads your preferences as JSON
- Use for:
  - Backing up settings
  - Sharing configurations
  - Moving to new device

**File Format**:
```json
{
  "theme": "brilliant-black",
  "fontSize": "medium",
  "analyticsEnabled": true,
  ...
}
```

#### Import Settings 📥
- Upload previously exported settings
- Merges with defaults (missing values use defaults)
- Validates JSON before applying
- **Error Handling**: Shows toast if file is invalid

#### Reset to Defaults 🔄
- Restores all settings to factory defaults
- **Requires Confirmation**
- Marks settings as unsaved (must click Save)
- Useful when: Settings corrupted, want fresh start

---

## ℹ️ About Section

### System Information
- **Version**: Current HOS version (e.g., 3.0.0)
- **Build**: Build date
- **Modules**: Active module count (33+)
- **Theme System**: 4-Shade Silver architecture

### Documentation Links
- **View Enhancements**: Technical changelog
- **Quick Start Guide**: User guide for new features
- **GitHub**: Source code and issues

### Credits
- Made with ❤️ for humans
- Copyright information
- Version history

---

## 💡 Best Practices

### Recommended Settings for...

#### **Maximum Performance**
```
✅ Animations: Disabled
✅ Reduced Motion: Enabled
✅ Performance Monitor: Enabled
✅ Cache: Enabled
✅ Real-time: Disabled (if not needed)
```

#### **Best Visual Experience**
```
✅ Theme: Brilliant Black / Silver
✅ Font Size: Medium
✅ Animations: Enabled
✅ Compact Mode: Disabled
✅ High Contrast: Disabled
```

#### **Accessibility**
```
✅ Font Size: Large
✅ High Contrast: Enabled
✅ Reduced Motion: Enabled
✅ Keyboard Shortcuts: Enabled
✅ Sound Effects: Disabled
```

#### **Privacy-Focused**
```
✅ Analytics: Disabled
✅ Crash Reports: Disabled
✅ Auto-Logout: 15 minutes
✅ Regular data exports
```

#### **Developer/Power User**
```
✅ Developer Mode: Enabled
✅ Debug Logs: Enabled
✅ Performance Monitor: Enabled
✅ Keyboard Shortcuts: Enabled
✅ Real-time Updates: Enabled
```

---

## 🔍 Troubleshooting

### Settings Won't Save
1. Check for "Unsaved changes" warning
2. Click "Save Changes" button
3. Look for success toast
4. If fails, check browser console for errors

### Settings Reset After Reload
- **Cause**: LocalStorage is disabled or cleared
- **Solution**: 
  - Check browser privacy settings
  - Disable "Clear data on exit"
  - Not using incognito/private mode

### Theme Not Applying
1. Save settings first
2. Check if theme toggle in sidebar conflicts
3. Reload page
4. Clear cache if persistent

### Performance Monitor Not Showing
1. Enable in Settings
2. Or press `Ctrl+Shift+P`
3. Check if hidden behind other elements
4. Try different screen position

### Real-time Connection Issues
1. Check internet connection
2. Look for WebSocket errors in console
3. Try disabling/re-enabling real-time
4. Refresh page
5. Check firewall/VPN settings

---

## 📱 Mobile Experience

### Optimized for Touch
- All settings accessible on mobile
- Tabs scroll horizontally on small screens
- Touch-friendly toggle switches
- Responsive grid layouts

### Mobile-Specific Tips
1. Use landscape for better tab visibility
2. Scroll within each settings section
3. Haptic feedback on switches (if supported)
4. Performance settings especially important on mobile

---

## 🎯 Quick Actions Cheatsheet

| Want to... | Go to... |
|------------|----------|
| Change theme | Appearance → Theme |
| Make text bigger | Appearance → Display → Font Size |
| Export my data | Privacy → Data Management → Export |
| Speed up HOS | Performance → Clear Cache |
| Reduce eye strain | Accessibility → High Contrast |
| See shortcuts | Accessibility → Keyboard Navigation |
| Test notifications | Notifications → Test Notification |
| Logout | Account → Logout |
| Enable debug mode | Advanced → Developer Mode |
| Reset everything | Advanced → Reset to Defaults |

---

## 🆕 What's New in Settings

### Latest Features
- ✨ 8 organized tab categories
- 🎨 Visual theme preview cards
- 📊 Real-time connection counter
- 🔔 Test notification button
- 📥 Import/Export configuration
- ⚠️ Unsaved changes indicator
- 🎯 One-click reset to defaults
- 📱 Fully mobile-responsive

### Coming Soon
- 🔊 Custom notification sounds
- 🎨 Custom accent colors
- ⌨️ Customizable keyboard shortcuts
- 📧 Email notification preferences
- 🌍 Language selection
- 🎭 Theme scheduling (auto dark mode at night)
- 💾 Cloud sync settings across devices
- 🔐 Two-factor authentication settings

---

## 💬 Feedback

Love a setting? Want more options? 
Found a bug? Let us know!

The Settings Panel is designed to grow with HOS. Every setting is there to give you more control and a better experience.

**Pro Tip**: Export your settings regularly as a backup! 📦
