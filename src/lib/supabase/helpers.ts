/**
 * HOS Persistence Helpers
 * Utility functions for common persistence operations
 */

import { projectId, publicAnonKey } from '../../utils/supabase/info';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-8d51d9e2`;

/**
 * Helper to save module state
 */
export async function saveModuleState(
  userId: string,
  moduleId: string,
  state: any
): Promise<boolean> {
  try {
    const response = await fetch(
      `${SERVER_URL}/user/${userId}/module-state/${moduleId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(state),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Failed to save module state:', error);
    return false;
  }
}

/**
 * Helper to load module state
 */
export async function loadModuleState(
  userId: string,
  moduleId: string
): Promise<any | null> {
  try {
    const response = await fetch(
      `${SERVER_URL}/user/${userId}/module-state/${moduleId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data.state;
  } catch (error) {
    console.error('Failed to load module state:', error);
    return null;
  }
}

/**
 * Helper to save conversation
 */
export async function saveConversation(
  userId: string,
  conversationId: string,
  messages: any[]
): Promise<boolean> {
  try {
    const response = await fetch(
      `${SERVER_URL}/user/${userId}/conversations/${conversationId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ messages }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Failed to save conversation:', error);
    return false;
  }
}

/**
 * Helper to load conversation
 */
export async function loadConversation(
  userId: string,
  conversationId: string
): Promise<any[] | null> {
  try {
    const response = await fetch(
      `${SERVER_URL}/user/${userId}/conversations/${conversationId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data.conversation?.messages || null;
  } catch (error) {
    console.error('Failed to load conversation:', error);
    return null;
  }
}

/**
 * Helper to save user preferences
 */
export async function savePreferences(
  userId: string,
  preferences: any
): Promise<boolean> {
  try {
    const response = await fetch(
      `${SERVER_URL}/user/${userId}/preferences`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(preferences),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Failed to save preferences:', error);
    return false;
  }
}

/**
 * Helper to load user preferences
 */
export async function loadPreferences(userId: string): Promise<any | null> {
  try {
    const response = await fetch(
      `${SERVER_URL}/user/${userId}/preferences`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data.preferences;
  } catch (error) {
    console.error('Failed to load preferences:', error);
    return null;
  }
}

/**
 * Debounce helper for auto-save
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Hook helper for auto-saving module state
 */
export function createAutoSave<T>(
  userId: string | null,
  moduleId: string,
  delay: number = 1000
) {
  return debounce((state: T) => {
    if (!userId) return;
    saveModuleState(userId, moduleId, state);
  }, delay);
}
