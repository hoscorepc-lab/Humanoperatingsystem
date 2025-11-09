/**
 * Real-time Service
 * Manages WebSocket connections and real-time updates using Supabase Realtime
 */

import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';
import { RealtimeUpdate } from '../../types/analytics';

type SubscriptionCallback = (update: RealtimeUpdate) => void;

interface ActiveSubscription {
  channel: RealtimeChannel;
  callbacks: Set<SubscriptionCallback>;
}

// Store active subscriptions
const activeSubscriptions = new Map<string, ActiveSubscription>();

/**
 * Subscribe to real-time updates for a specific user
 */
export function subscribeToUserUpdates(userId: string, callback: SubscriptionCallback): () => void {
  const channelName = `user:${userId}`;
  
  // Check if channel already exists
  let subscription = activeSubscriptions.get(channelName);
  
  if (!subscription) {
    console.log(`📡 Creating real-time channel: ${channelName}`);
    
    // Create new channel
    const channel = supabase.channel(channelName);
    
    // Listen for broadcast messages
    channel
      .on('broadcast', { event: 'update' }, (payload) => {
        console.log('📨 Received real-time update:', payload);
        const update: RealtimeUpdate = {
          type: payload.type || 'notification',
          payload: payload.payload,
          timestamp: new Date().toISOString(),
          userId,
        };
        
        // Call all registered callbacks
        subscription?.callbacks.forEach(cb => {
          try {
            cb(update);
          } catch (error) {
            console.error('Error in real-time callback:', error);
          }
        });
      })
      .subscribe((status) => {
        console.log(`📡 Channel ${channelName} status:`, status);
      });
    
    subscription = {
      channel,
      callbacks: new Set(),
    };
    
    activeSubscriptions.set(channelName, subscription);
  }
  
  // Add callback
  subscription.callbacks.add(callback);
  console.log(`✅ Added callback to ${channelName} (${subscription.callbacks.size} total)`);
  
  // Return unsubscribe function
  return () => {
    const sub = activeSubscriptions.get(channelName);
    if (sub) {
      sub.callbacks.delete(callback);
      console.log(`🔇 Removed callback from ${channelName} (${sub.callbacks.size} remaining)`);
      
      // If no more callbacks, close the channel
      if (sub.callbacks.size === 0) {
        console.log(`🔌 Closing channel ${channelName}`);
        sub.channel.unsubscribe();
        activeSubscriptions.delete(channelName);
      }
    }
  };
}

/**
 * Subscribe to analytics updates
 */
export function subscribeToAnalytics(callback: SubscriptionCallback): () => void {
  const channelName = 'analytics:global';
  
  let subscription = activeSubscriptions.get(channelName);
  
  if (!subscription) {
    console.log(`📡 Creating analytics channel: ${channelName}`);
    
    const channel = supabase.channel(channelName);
    
    channel
      .on('broadcast', { event: 'analytics' }, (payload) => {
        const update: RealtimeUpdate = {
          type: 'analytics',
          payload: payload.payload,
          timestamp: new Date().toISOString(),
        };
        
        subscription?.callbacks.forEach(cb => {
          try {
            cb(update);
          } catch (error) {
            console.error('Error in analytics callback:', error);
          }
        });
      })
      .subscribe();
    
    subscription = {
      channel,
      callbacks: new Set(),
    };
    
    activeSubscriptions.set(channelName, subscription);
  }
  
  subscription.callbacks.add(callback);
  
  return () => {
    const sub = activeSubscriptions.get(channelName);
    if (sub) {
      sub.callbacks.delete(callback);
      if (sub.callbacks.size === 0) {
        sub.channel.unsubscribe();
        activeSubscriptions.delete(channelName);
      }
    }
  };
}

/**
 * Broadcast a real-time update
 */
export async function broadcastUpdate(channelName: string, type: RealtimeUpdate['type'], payload: any): Promise<void> {
  try {
    const channel = supabase.channel(channelName);
    await channel.send({
      type: 'broadcast',
      event: type === 'analytics' ? 'analytics' : 'update',
      payload: { type, payload },
    });
    console.log(`📤 Broadcast sent to ${channelName}:`, type);
  } catch (error) {
    console.error('Failed to broadcast update:', error);
  }
}

/**
 * Unsubscribe from all channels
 */
export function unsubscribeAll(): void {
  console.log(`🔌 Closing all channels (${activeSubscriptions.size} total)`);
  activeSubscriptions.forEach((sub, channelName) => {
    sub.channel.unsubscribe();
  });
  activeSubscriptions.clear();
}

/**
 * Get active subscription count
 */
export function getActiveSubscriptionCount(): number {
  return activeSubscriptions.size;
}
