/**
 * Smart time-based greeting utility
 * Returns appropriate greeting based on current time
 */
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  
  // 5 AM - 11:59 AM: Morning
  if (hour >= 5 && hour < 12) {
    return 'Good morning';
  }
  
  // 12 PM - 4:59 PM: Afternoon
  if (hour >= 12 && hour < 17) {
    return 'Good afternoon';
  }
  
  // 5 PM - 9:59 PM: Evening
  if (hour >= 17 && hour < 22) {
    return 'Good evening';
  }
  
  // 10 PM - 4:59 AM: Night
  return 'Good night';
}

/**
 * Get time period (for analytics/logging)
 */
export function getTimePeriod(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

/**
 * Get contextual time-based message
 */
export function getTimeBasedContext(): string {
  const period = getTimePeriod();
  
  const contexts: Record<typeof period, string> = {
    morning: 'Neural networks calibrated and ready for peak productivity',
    afternoon: 'Maintaining optimal performance through your active hours',
    evening: 'Winding down and preparing for reflection mode',
    night: 'Systems entering low-power state for regeneration'
  };
  
  return contexts[period];
}

/**
 * Get emoji for current time period
 */
export function getTimePeriodEmoji(): string {
  const period = getTimePeriod();
  
  const emojis: Record<typeof period, string> = {
    morning: '🌅',
    afternoon: '☀️',
    evening: '🌆',
    night: '🌙'
  };
  
  return emojis[period];
}
