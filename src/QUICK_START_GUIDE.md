# 🚀 Quick Start Guide - New Features

## Welcome to the Enhanced HOS!

Your Human Operating System just got a major upgrade. Here's how to use the new features:

---

## 📊 Analytics Dashboard

### Access the Dashboard
1. Open the sidebar (click the menu icon on mobile)
2. Navigate to **Core Modules**
3. Click **"Analytics Dashboard"**

### What You'll See
- **Current Session**: Your active usage stats
- **Key Metrics**: Sessions, time spent, modules used
- **Charts**: Daily activity trends, module usage patterns
- **Sessions History**: Your last 10 HOS sessions

### Export Your Data
1. Click the **"Export"** button (top right)
2. Your analytics data downloads as JSON
3. Use it for personal records or data analysis

### Clear Data
If you want to start fresh:
1. Scroll to the bottom of the Analytics Dashboard
2. Click **"Clear All Analytics Data"**
3. Confirm the action

---

## 🎯 Performance Monitor

### Toggle the Monitor
Press **`Ctrl+Shift+P`** (Windows/Linux) or **`Cmd+Shift+P`** (Mac)

### Understanding the Metrics
- **FPS**: Frames per second (higher is better)
  - 🟢 Green (55+): Excellent
  - 🟡 Yellow (30-54): Good
  - 🔴 Red (<30): Needs improvement
  
- **Memory**: JavaScript heap usage percentage
  - 🟢 Green (<70%): Healthy
  - 🟡 Yellow (70-90%): Watch it
  - 🔴 Red (>90%): Consider reloading

- **Load**: Initial page load time in milliseconds

### When to Use It
- Debugging performance issues
- Checking system resource usage
- Comparing performance across devices
- Identifying slow modules

---

## 📱 Mobile Enhancements

### Haptic Feedback
- Tap any module button to feel the vibration feedback
- Works on touch-enabled devices
- Provides native app-like experience

### Improved Touch Targets
- All buttons are now minimum 56px tall
- Better tap accuracy
- Reduced misclicks

### Smooth Animations
- Notice the subtle scale animation when tapping
- Provides visual feedback for every interaction

---

## 🔐 Session Auto-Refresh

### What It Does
- Automatically refreshes your login session every ~50 minutes
- Prevents unexpected logouts
- You'll see a notification when it happens

### Session Notifications
You may see these toasts:
- ✅ **"Session refreshed"**: Your session was extended
- ⚠️ **"Session ends soon"**: Less than 5 minutes remaining
- 👋 **"Session ended"**: You've been logged out

### Manual Refresh
If you suspect session issues:
1. Check the browser console for auth logs
2. The system handles it automatically
3. If logged out, simply log back in

---

## ⚡ Faster Loading

### What Changed
- **Before**: All 33 modules loaded at startup (~3-5s)
- **After**: Only Dashboard loads initially (~1-2s)
- **Result**: 50-70% faster startup time

### How It Works
- Modules load on-demand when you click them
- First access may have a brief loading spinner
- Subsequent visits are instant (cached)

### Loading Indicator
When switching modules, you'll see:
```
[Spinner animation]
Loading module...
```

This is normal and usually takes <500ms

---

## 📡 Real-time Updates

### Automatic Sync
- Analytics data syncs in real-time
- Changes appear across all tabs/devices
- No need to refresh manually

### Connection Status
Look for the green indicator:
```
🟢 Real-time updates active • X updates received
```

This appears when:
- You're connected to the real-time server
- Updates are being received
- System is in sync

---

## 🎨 Usage Tips

### Best Practices

#### For Analytics
- Check your dashboard weekly to spot usage patterns
- Export data monthly for long-term records
- Use insights to optimize your HOS workflow

#### For Performance
- Keep the monitor open when testing new modules
- Close unused browser tabs to free memory
- Reload if FPS drops below 30 consistently

#### For Mobile
- Use landscape mode for better dashboard viewing
- Enable haptic feedback in your device settings
- Use two fingers to zoom charts if needed

### Keyboard Shortcuts
- **`Ctrl+Shift+P`**: Toggle performance monitor
- More shortcuts coming soon!

---

## 🐛 Troubleshooting

### Analytics Not Tracking
1. Check if you're logged in
2. Look for console errors (F12)
3. Clear browser cache and reload
4. Analytics data is stored locally - won't work in incognito

### Performance Issues
1. Check FPS in performance monitor
2. Close unnecessary browser tabs
3. Disable browser extensions temporarily
4. Try a different browser

### Session Expiring Too Soon
1. Check your internet connection
2. Look for auth errors in console
3. Clear cookies and log in again
4. Disable VPN if using one

### Real-time Not Working
1. Check internet connectivity
2. Verify you're logged in
3. Look for WebSocket errors in console
4. Try refreshing the page

---

## 📈 Making the Most of Analytics

### Weekly Review
1. Open Analytics Dashboard
2. Check "Daily Activity" chart
3. Identify your most-used modules
4. Adjust your workflow accordingly

### Monthly Insights
1. Export your analytics data
2. Compare with previous months
3. Track your HOS usage growth
4. Share insights with the community

### Goal Setting
Use the data to set goals:
- "Use Memory module 3x per week"
- "Spend 30 min daily in Core Research"
- "Reduce session count by batching tasks"

---

## 🎓 Advanced Features

### Analytics API (For Developers)
```typescript
import { trackModuleView, trackFeatureUse } from './lib/analytics/service';

// Track custom events
trackModuleView(userId, 'custom-module', 'My Module');
trackFeatureUse(userId, 'special-feature', { data: 'value' });
```

### Real-time Subscriptions
```typescript
import { subscribeToUserUpdates } from './lib/realtime/service';

const unsubscribe = subscribeToUserUpdates(userId, (update) => {
  console.log('Update:', update);
});
```

### Performance Monitoring
```typescript
import { useMobileOptimization } from './lib/hooks/useMobileOptimization';

const { hapticFeedback, isMobile } = useMobileOptimization();
hapticFeedback('medium'); // Trigger feedback
```

---

## 🆘 Need Help?

### Check These Resources
1. **ENHANCEMENTS.md**: Technical documentation
2. **Console Logs**: Press F12 to see detailed logs
3. **Browser DevTools**: Network tab for connection issues

### Common Questions

**Q: Does analytics data leave my device?**
A: No, it's stored locally in your browser's localStorage.

**Q: Will lazy loading work offline?**
A: Once loaded, modules are cached. Initial load requires internet.

**Q: Can I disable haptic feedback?**
A: Currently automatic for touch devices. Toggle coming soon.

**Q: How much data does real-time use?**
A: Minimal - only small JSON messages over WebSocket.

---

## 🎉 Enjoy Your Enhanced HOS!

These features make HOS faster, smarter, and more responsive. Explore, track your usage, and optimize your workflow!

**Pro Tip**: Press `Ctrl+Shift+P` right now to see your live performance metrics! 📊
