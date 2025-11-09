import { useEffect, useState } from 'react';

export type Theme = 'pearl' | 'silver' | 'chrome' | 'blue' | 'black';

const THEME_KEY = 'hos-theme';

export const THEME_OPTIONS = {
  pearl: {
    name: 'Pearl White',
    description: 'Soft brilliant white with subtle warmth'
  },
  silver: {
    name: 'Silver Mist',
    description: 'Elegant light silver with cool undertones'
  },
  chrome: {
    name: 'Steel Gray',
    description: 'Sophisticated dark gray with modern edge'
  },
  blue: {
    name: 'Electric Blue',
    description: 'Vibrant blue with modern energy'
  },
  black: {
    name: 'Brilliant Black',
    description: 'Deep elegant black with silver accents'
  }
} as const;

export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'pearl';
  
  const stored = localStorage.getItem(THEME_KEY) as Theme | null;
  if (stored && stored in THEME_OPTIONS) return stored;
  
  return 'pearl';
}

export function setTheme(theme: Theme) {
  localStorage.setItem(THEME_KEY, theme);
  
  // Remove all theme classes
  document.documentElement.classList.remove('pearl', 'silver', 'chrome', 'blue', 'black');
  
  // Add the selected theme class
  document.documentElement.classList.add(theme);
  
  // Set dark mode for black theme
  if (theme === 'black') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getTheme);

  useEffect(() => {
    // Initialize theme on mount
    setTheme(theme);
  }, [theme]);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    setThemeState(newTheme);
  };

  return { theme, changeTheme, themeOptions: THEME_OPTIONS };
}