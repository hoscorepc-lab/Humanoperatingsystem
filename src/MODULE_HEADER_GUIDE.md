# Module Header Integration Guide

## Overview
All modules now support a hamburger button that navigates back to the dashboard. This provides consistent navigation across the HOS application.

## How to Update Your Module

### 1. Add Props Interface
```typescript
interface YourModuleProps {
  onClose?: () => void;
  onBackToDashboard: () => void;
}

export function YourModule({ onClose, onBackToDashboard }: YourModuleProps) {
  // ... your code
}
```

### 2. Import ModuleHeader
```typescript
import { ModuleHeader } from '../ModuleHeader';
```

### 3. Replace Your Header
Replace your existing header with:
```typescript
<ModuleHeader
  title="Your Module Name"
  description="Brief description of your module"
  onBackToDashboard={onBackToDashboard}
  onClose={onClose}
  showClose={!!onClose}
>
  {/* Optional: Add extra buttons, badges, etc. */}
  <Badge variant="default">LIVE</Badge>
</ModuleHeader>
```

## Example: AgentsArenaModule
See `/components/modules/AgentsArenaModule.tsx` for a complete example implementation.

## Features
- **Hamburger button**: Navigates back to dashboard
- **Close button**: Closes the current module (optional)
- **Sticky header**: Stays at top while scrolling
- **Mobile optimized**: Responsive design
- **Extensible**: Can add custom buttons/badges via children

## Already Updated
✅ AgentsArenaModule

## To Be Updated
All other 37 modules can follow the same pattern when needed.
