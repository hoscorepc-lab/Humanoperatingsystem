/**
 * Universal Persistence Layer
 * Automatically persists ANY module data to Supabase KV store
 * Simple key-value storage that works for all modules
 */

import { projectId, publicAnonKey } from '../../utils/supabase/info';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-8d51d9e2`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`,
};

/**
 * Save data for a specific module and user
 * @param userId - The user ID
 * @param moduleKey - Unique key for the module (e.g., 'habits', 'chat-history', 'agents')
 * @param data - Any JSON-serializable data
 */
export async function saveModuleData(userId: string, moduleKey: string, data: any): Promise<void> {
  try {
    const key = `user:${userId}:module:${moduleKey}`;
    console.log(`💾 Saving ${moduleKey} data for user ${userId}`);
    
    const response = await fetch(`${SERVER_URL}/user-data`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ key, data, userId }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Failed to save ${moduleKey}:`, error);
      throw new Error(`Failed to save ${moduleKey}: ${error}`);
    }

    console.log(`✅ ${moduleKey} data saved successfully`);
  } catch (error) {
    console.error(`Error saving ${moduleKey} data:`, error);
    throw error;
  }
}

/**
 * Load data for a specific module and user
 * @param userId - The user ID
 * @param moduleKey - Unique key for the module
 * @param defaultValue - Default value if no data exists
 */
export async function loadModuleData<T = any>(
  userId: string,
  moduleKey: string,
  defaultValue: T = null as T
): Promise<T> {
  try {
    const key = `user:${userId}:module:${moduleKey}`;
    console.log(`📥 Loading ${moduleKey} data for user ${userId}`);
    
    const response = await fetch(`${SERVER_URL}/user-data?key=${encodeURIComponent(key)}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Failed to load ${moduleKey}:`, error);
      return defaultValue;
    }

    const result = await response.json();
    
    // Check if data exists (new format from server)
    if (result.exists === false || result.data === null) {
      console.log(`📦 No existing data for ${moduleKey}, using default`);
      return defaultValue;
    }
    
    console.log(`✅ ${moduleKey} data loaded successfully`);
    return result.data || defaultValue;
  } catch (error) {
    console.error(`Error loading ${moduleKey} data:`, error);
    return defaultValue;
  }
}

/**
 * Delete data for a specific module and user
 * @param userId - The user ID
 * @param moduleKey - Unique key for the module
 */
export async function deleteModuleData(userId: string, moduleKey: string): Promise<void> {
  try {
    const key = `user:${userId}:module:${moduleKey}`;
    console.log(`🗑️  Deleting ${moduleKey} data for user ${userId}`);
    
    const response = await fetch(`${SERVER_URL}/user-data?key=${encodeURIComponent(key)}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Failed to delete ${moduleKey}:`, error);
      throw new Error(`Failed to delete ${moduleKey}: ${error}`);
    }

    console.log(`✅ ${moduleKey} data deleted successfully`);
  } catch (error) {
    console.error(`Error deleting ${moduleKey} data:`, error);
    throw error;
  }
}

/**
 * Load ALL module data for a user
 * Returns a map of moduleKey -> data
 */
export async function loadAllUserModuleData(userId: string): Promise<Record<string, any>> {
  try {
    const prefix = `user:${userId}:module:`;
    console.log(`📥 Loading ALL module data for user ${userId}`);
    
    const response = await fetch(`${SERVER_URL}/user-data/all?userId=${userId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.error('Failed to load all user data');
      return {};
    }

    const result = await response.json();
    console.log(`✅ Loaded data for ${Object.keys(result.data || {}).length} modules`);
    return result.data || {};
  } catch (error) {
    console.error('Error loading all user module data:', error);
    return {};
  }
}
