/**
 * Mobile Optimization Hook
 * Provides utilities for better mobile UX
 */

import { useEffect, useCallback } from 'react';

export function useMobileOptimization() {
  // Detect if device is mobile
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Detect if device is touch-enabled
  const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };

  // Enhanced haptic feedback (if supported)
  const hapticFeedback = useCallback((style: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' = 'light') => {
    if ('vibrate' in navigator && isTouchDevice()) {
      let pattern: number | number[];
      
      switch (style) {
        case 'light':
          pattern = 10;
          break;
        case 'medium':
          pattern = 20;
          break;
        case 'heavy':
          pattern = 50;
          break;
        case 'success':
          pattern = [10, 30, 10]; // Double tap
          break;
        case 'error':
          pattern = [50, 50, 50]; // Triple strong pulse
          break;
        case 'warning':
          pattern = [20, 50, 20]; // Medium-heavy-medium
          break;
        default:
          pattern = 10;
      }
      
      navigator.vibrate(pattern);
    }
  }, []);

  // Smooth scroll to element
  const smoothScrollTo = useCallback((elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Prevent default pull-to-refresh on mobile
  useEffect(() => {
    if (!isMobile()) return;

    let startY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].pageY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].pageY;
      // Prevent pull-to-refresh at the top of the page
      if (window.scrollY === 0 && y > startY) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Add viewport height CSS variable for mobile browsers
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  return {
    isMobile: isMobile(),
    isTouchDevice: isTouchDevice(),
    hapticFeedback,
    smoothScrollTo,
  };
}
