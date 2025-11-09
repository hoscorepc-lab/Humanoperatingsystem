import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import financialResearchApp from "./financial-research.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

// Global error handler to ensure CORS headers are always sent
app.onError((err, c) => {
  console.error('🚨 Global error handler caught:', err);
  console.error('Error stack:', err.stack);
  
  return c.json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString(),
  }, 500);
});

// Handle OPTIONS requests for all routes (CORS preflight)
app.options('*', (c) => {
  return c.text('', 204);
});

// Health check endpoint
app.get("/make-server-8d51d9e2/health", async (c) => {
  try {
    // Test database connection
    const testKey = 'health-check-test';
    await kv.set(testKey, { timestamp: new Date().toISOString() });
    await kv.get(testKey);
    await kv.del(testKey);
    
    return c.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      database: "connected"
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return c.json({ 
      status: "error", 
      timestamp: new Date().toISOString(),
      database: "failed",
      error: error.message
    }, 500);
  }
});

// ========== AUTHENTICATION ENDPOINTS ==========

// User signup/registration
app.post("/make-server-8d51d9e2/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    console.log('📝 Signup attempt for email:', email);
    
    if (!email || !password) {
      console.error('❌ Missing email or password');
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Import Supabase client for server-side admin operations
    const { createClient } = await import('npm:@supabase/supabase-js@2');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('🔧 Creating user with Supabase admin API...');
    
    // Create user with admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since we don't have email server configured
      user_metadata: { name: name || 'User' },
    });

    if (error) {
      // Check for duplicate email error specifically
      // The Supabase AuthApiError uses 'email_exists' code for duplicate emails
      const errorMessage = error.message?.toLowerCase() || '';
      const errorCode = error.code?.toLowerCase() || '';
      
      if (
        errorCode === 'email_exists' || 
        errorCode === 'user_already_exists' ||
        errorMessage.includes('already been registered') ||
        errorMessage.includes('already registered') ||
        errorMessage.includes('already exists') ||
        errorMessage.includes('user with this email') ||
        error.status === 422
      ) {
        console.log('ℹ️ Signup attempt for existing email:', email);
        return c.json({ 
          error: 'DUPLICATE_EMAIL',
          message: 'This email is already registered. Please log in instead.'
        }, 409); // 409 Conflict
      }
      
      // Only log actual errors, not expected duplicate email scenarios
      console.error('Signup error:', error);
      console.log('Error details:', {
        code: error.code,
        message: error.message,
        status: error.status,
        name: error.name,
        fullError: JSON.stringify(error)
      });
      
      return c.json({ 
        error: `Failed to create account: ${error.message}` 
      }, 400);
    }

    if (!data.user) {
      return c.json({ error: 'Failed to create user account' }, 500);
    }

    console.log('✅ User created successfully:', data.user.id);

    return c.json({
      success: true,
      userId: data.user.id,
      email: data.user.email,
      message: 'Account created successfully',
    });
  } catch (error) {
    console.error('Signup endpoint error:', error);
    return c.json({ 
      error: 'Internal server error during signup: ' + error.message 
    }, 500);
  }
});

// Check if email exists (for debugging/UX purposes)
app.post("/make-server-8d51d9e2/auth/check-email", async (c) => {
  try {
    const { email } = await c.req.json();
    
    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    console.log('🔍 Checking if email exists:', email);

    // Import Supabase client
    const { createClient } = await import('npm:@supabase/supabase-js@2');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Check if user exists
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return c.json({ error: 'Failed to verify user' }, 500);
    }

    const user = users.users.find((u: any) => u.email === email);
    
    return c.json({
      exists: !!user,
      userId: user?.id || null,
    });
  } catch (error) {
    console.error('Email check error:', error);
    return c.json({ 
      error: 'Internal server error: ' + error.message 
    }, 500);
  }
});

// Direct password update (for development/admin use)
app.post("/make-server-8d51d9e2/auth/update-password-direct", async (c) => {
  try {
    const { email, newPassword } = await c.req.json();
    
    if (!email || !newPassword) {
      return c.json({ error: 'Email and new password are required' }, 400);
    }

    console.log('🔑 Direct password update requested for:', email);

    // Validate password length
    if (newPassword.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }

    // Import Supabase client
    const { createClient } = await import('npm:@supabase/supabase-js@2');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Find the user
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return c.json({ error: 'Failed to find user' }, 500);
    }

    const user = users.users.find((u: any) => u.email === email);
    
    if (!user) {
      console.log('❌ User not found');
      return c.json({ error: 'User not found' }, 404);
    }

    // Update the user's password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
      return c.json({ error: 'Failed to update password: ' + updateError.message }, 500);
    }

    console.log('✅ Password updated successfully for user:', user.id);

    return c.json({
      success: true,
      message: 'Password updated successfully! You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Password update error:', error);
    return c.json({ 
      error: 'Failed to update password: ' + error.message 
    }, 500);
  }
});

// Password reset: Request reset token and send via email
app.post("/make-server-8d51d9e2/auth/request-password-reset", async (c) => {
  try {
    const { email } = await c.req.json();
    
    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    console.log('🔑 Password reset requested for:', email);

    // Import Supabase client
    const { createClient } = await import('npm:@supabase/supabase-js@2');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Check if user exists
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return c.json({ error: 'Failed to verify user' }, 500);
    }

    const user = users.users.find((u: any) => u.email === email);
    
    if (!user) {
      // For security, don't reveal if user exists or not
      console.log('⚠️ User not found, but returning generic success message');
      return c.json({ 
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    }

    // Delete any existing reset tokens for this email (only one active token per user)
    const existingTokens = await kv.getByPrefix('password-reset:');
    for (const tokenData of existingTokens) {
      if (tokenData.email === email) {
        await kv.del(`password-reset:${tokenData.token}`);
      }
    }

    // Generate a secure reset token (UUID)
    const resetToken = crypto.randomUUID();
    
    // Store the reset token with expiry (30 minutes)
    const resetData = {
      email,
      userId: user.id,
      token: resetToken,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`password-reset:${resetToken}`, resetData);
    
    console.log('✅ Reset token generated for user:', user.id);
    
    // SECURITY: The token is NEVER returned to the client
    // In production, this token would be sent via email
    // For development without email configured, we use Supabase's built-in password reset
    
    try {
      // Use Supabase's built-in password reset email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${c.req.header('origin') || 'http://localhost:5173'}/reset-password?token=${resetToken}`,
      });
      
      if (resetError) {
        console.log('⚠️ Email not configured. Token stored but not sent.');
        // Email not configured - this is expected in development
        // The token is still stored in KV and can be used via the API
      } else {
        console.log('✅ Password reset email sent successfully');
      }
    } catch (emailError) {
      console.log('⚠️ Email error (expected if SMTP not configured):', emailError);
    }
    
    // For security, always return the same message
    return c.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
      emailConfigured: false, // Flag to show alternative instructions in UI
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return c.json({ 
      error: 'Failed to process password reset request: ' + error.message 
    }, 500);
  }
});

// Password reset: Actually reset the password (LEGACY - kept for email-based flow)
app.post("/make-server-8d51d9e2/auth/reset-password", async (c) => {
  try {
    const { email, resetToken, newPassword } = await c.req.json();
    
    if (!email || !resetToken || !newPassword) {
      return c.json({ error: 'Email, reset token, and new password are required' }, 400);
    }

    console.log('🔑 Attempting password reset for:', email);

    // Validate password length
    if (newPassword.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }

    // Retrieve the reset token data
    const resetData = await kv.get(`password-reset:${resetToken}`);
    
    if (!resetData) {
      console.log('❌ Invalid or expired reset token');
      return c.json({ error: 'Invalid or expired reset token' }, 400);
    }

    // Check if token has expired
    if (new Date(resetData.expiresAt) < new Date()) {
      console.log('❌ Reset token has expired');
      await kv.del(`password-reset:${resetToken}`);
      return c.json({ error: 'Reset token has expired. Please request a new one.' }, 400);
    }

    // Verify the email matches
    if (resetData.email !== email) {
      console.log('❌ Email mismatch');
      return c.json({ error: 'Invalid reset token' }, 400);
    }

    // Import Supabase client
    const { createClient } = await import('npm:@supabase/supabase-js@2');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Update the user's password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      resetData.userId,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
      return c.json({ error: 'Failed to update password: ' + updateError.message }, 500);
    }

    // Delete the used reset token
    await kv.del(`password-reset:${resetToken}`);
    
    console.log('✅ Password reset successful for user:', resetData.userId);

    return c.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return c.json({ 
      error: 'Failed to reset password: ' + error.message 
    }, 500);
  }
});

// EMERGENCY: Delete all agents endpoint (direct access, no UI needed)
app.get("/make-server-8d51d9e2/emergency/delete-all-agents", async (c) => {
  try {
    console.log('🚨 EMERGENCY: Starting bulk agent deletion...');
    
    const allAgents = await kv.getByPrefix('agent:');
    const slugs = allAgents.map((a: any) => a.slug);
    
    console.log(`Found ${slugs.length} agents to delete`);
    
    // Delete all agent entries
    for (const slug of slugs) {
      await kv.del(`agent:${slug}`);
    }
    
    // Clear the agents list
    await kv.set('agents:list', []);
    
    console.log(`✅ Emergency deletion complete: ${slugs.length} agents removed`);
    
    return c.json({ 
      success: true, 
      removed: slugs.length,
      message: `Emergency cleanup: Successfully deleted ${slugs.length} agents. Your site should load normally now.` 
    });
  } catch (error) {
    console.error('❌ Emergency deletion error:', error);
    return c.json({ error: 'Emergency deletion failed: ' + error.message }, 500);
  }
});

// ========== AI CHAT ENDPOINT ==========
app.post("/make-server-8d51d9e2/ai/chat", async (c) => {
  try {
    const { messages, context, temperature = 0.7 } = await c.req.json();
    
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      console.error('AI chat error: OPENAI_API_KEY not configured');
      return c.json({ error: 'AI service not configured. Please add your OpenAI API key.' }, 500);
    }

    // Build system message with context
    let systemMessage = messages.find((m: any) => m.role === 'system')?.content || '';
    
    if (context) {
      systemMessage += '\n\nCurrent context:';
      if (context.mood) systemMessage += `\n- Mood level: ${context.mood}/10`;
      if (context.energy) systemMessage += `\n- Energy level: ${context.energy}/10`;
      if (context.coreValues?.length) systemMessage += `\n- Core values: ${context.coreValues.join(', ')}`;
      if (context.currentGoals?.length) systemMessage += `\n- Current goals: ${context.currentGoals.join(', ')}`;
      if (context.recentMemories?.length) systemMessage += `\n- Recent memories: ${context.recentMemories.join('; ')}`;
    }

    const preparedMessages = [
      { role: 'system', content: systemMessage },
      ...messages.filter((m: any) => m.role !== 'system')
    ];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: preparedMessages,
        temperature,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return c.json({ error: 'AI service error' }, response.status);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    const tokensUsed = data.usage?.total_tokens || 0;

    return c.json({
      content,
      tokensUsed,
      model: data.model,
    });
  } catch (error) {
    console.error('Error in AI chat endpoint:', error);
    return c.json({ error: 'Internal server error: ' + error.message }, 500);
  }
});

// ========== DATA ENDPOINTS ==========

// Reflections
app.get("/make-server-8d51d9e2/reflections", async (c) => {
  try {
    const userId = c.req.query('userId');
    const allReflections = await kv.getByPrefix('reflection:');
    
    const reflections = userId
      ? allReflections.filter((r: any) => r.userId === userId)
      : allReflections;
    
    return c.json({ reflections: reflections || [] });
  } catch (error) {
    console.error('Error fetching reflections:', error);
    return c.json({ reflections: [] });
  }
});

app.post("/make-server-8d51d9e2/reflections", async (c) => {
  try {
    const reflection = await c.req.json();
    const reflectionId = reflection.id || crypto.randomUUID();
    await kv.set(`reflection:${reflectionId}`, { 
      ...reflection, 
      id: reflectionId, 
      createdAt: new Date().toISOString() 
    });
    return c.json({ id: reflectionId, ...reflection });
  } catch (error) {
    console.error('Error creating reflection:', error);
    return c.json({ error: 'Failed to create reflection: ' + error.message }, 500);
  }
});

// Habits
app.get("/make-server-8d51d9e2/habits", async (c) => {
  try {
    const userId = c.req.query('userId');
    const allHabits = await kv.getByPrefix('habit:');
    
    const habits = userId
      ? allHabits.filter((h: any) => h.userId === userId)
      : allHabits;
    
    return c.json({ habits: habits || [] });
  } catch (error) {
    console.error('Error fetching habits:', error);
    return c.json({ habits: [] });
  }
});

app.post("/make-server-8d51d9e2/habits", async (c) => {
  try {
    const habit = await c.req.json();
    const habitId = habit.id || crypto.randomUUID();
    await kv.set(`habit:${habitId}`, { 
      ...habit, 
      id: habitId, 
      createdAt: new Date().toISOString() 
    });
    return c.json({ id: habitId, ...habit });
  } catch (error) {
    console.error('Error creating habit:', error);
    return c.json({ error: 'Failed to create habit: ' + error.message }, 500);
  }
});

app.put("/make-server-8d51d9e2/habits/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const existing = await kv.get(`habit:${id}`);
    
    if (!existing) {
      return c.json({ error: 'Habit not found' }, 404);
    }
    
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await kv.set(`habit:${id}`, updated);
    return c.json(updated);
  } catch (error) {
    console.error('Error updating habit:', error);
    return c.json({ error: 'Failed to update habit: ' + error.message }, 500);
  }
});

// Events (for quantum planner)
app.get("/make-server-8d51d9e2/events", async (c) => {
  try {
    const userId = c.req.query('userId');
    console.log(`📅 Fetching events for userId: ${userId}`);
    
    const allEvents = await kv.getByPrefix('event:');
    console.log(`Found ${allEvents.length} total events in database`);
    
    const events = userId
      ? allEvents.filter((e: any) => e.userId === userId)
      : allEvents;
    
    console.log(`Returning ${events.length} events after filtering`);
    return c.json({ events: events || [] });
  } catch (error) {
    console.error('Error fetching events:', error);
    console.error('Error details:', error.message, error.stack);
    return c.json({ 
      events: [], 
      error: 'Failed to fetch events: ' + error.message 
    }, 500);
  }
});

app.post("/make-server-8d51d9e2/events", async (c) => {
  try {
    const event = await c.req.json();
    const eventId = event.id || crypto.randomUUID();
    await kv.set(`event:${eventId}`, { 
      ...event, 
      id: eventId, 
      createdAt: new Date().toISOString() 
    });
    return c.json({ id: eventId, ...event });
  } catch (error) {
    console.error('Error creating event:', error);
    return c.json({ error: 'Failed to create event: ' + error.message }, 500);
  }
});

// AI Interactions log
app.post("/make-server-8d51d9e2/ai-interactions", async (c) => {
  try {
    const interaction = await c.req.json();
    const interactionId = crypto.randomUUID();
    await kv.set(`ai-interaction:${interactionId}`, { 
      ...interaction, 
      id: interactionId, 
      timestamp: new Date().toISOString() 
    });
    return c.json({ id: interactionId });
  } catch (error) {
    console.error('Error logging AI interaction:', error);
    return c.json({ error: 'Failed to log interaction: ' + error.message }, 500);
  }
});

// ========== UNIVERSAL MODULE DATA PERSISTENCE ==========

// Save module data for a user
app.post("/make-server-8d51d9e2/user-data", async (c) => {
  try {
    const { key, data, userId } = await c.req.json();
    
    if (!key || !userId) {
      return c.json({ error: 'Missing required fields: key and userId' }, 400);
    }
    
    console.log(`Saving data for key: ${key}`);
    
    await kv.set(key, {
      data,
      userId,
      updatedAt: new Date().toISOString(),
    });
    
    return c.json({ success: true, key });
  } catch (error) {
    console.error('Error saving user data:', error);
    return c.json({ error: 'Failed to save data: ' + error.message }, 500);
  }
});

// Load module data for a user
app.get("/make-server-8d51d9e2/user-data", async (c) => {
  try {
    const key = c.req.query('key');
    
    if (!key) {
      return c.json({ error: 'Missing required parameter: key' }, 400);
    }
    
    console.log(`Loading data for key: ${key}`);
    
    const result = await kv.get(key);
    
    if (!result) {
      // Return 200 with null data instead of 404 to avoid console errors
      // This is expected when a module is accessed for the first time
      console.log(`No data found for key: ${key} (first access)`);
      return c.json({ data: null, userId: null, exists: false }, 200);
    }
    
    return c.json({ ...result, exists: true });
  } catch (error) {
    console.error('Error loading user data:', error);
    return c.json({ error: 'Failed to load data: ' + error.message }, 500);
  }
});

// Load ALL module data for a user
app.get("/make-server-8d51d9e2/user-data/all", async (c) => {
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({ error: 'Missing required parameter: userId' }, 400);
    }
    
    console.log(`Loading all data for user: ${userId}`);
    
    const prefix = `user:${userId}:module:`;
    const allData = await kv.getByPrefix(prefix);
    
    // Transform array of objects into a map of moduleKey -> data
    const dataMap: Record<string, any> = {};
    for (const item of allData) {
      // Extract module key from the full key
      // Format: user:123:module:habits -> habits
      const fullKey = Object.keys(item)[0] || '';
      const moduleKey = fullKey.replace(prefix, '');
      if (moduleKey && item.data) {
        dataMap[moduleKey] = item.data;
      }
    }
    
    return c.json({ data: dataMap });
  } catch (error) {
    console.error('Error loading all user data:', error);
    return c.json({ error: 'Failed to load data: ' + error.message }, 500);
  }
});

// Delete module data for a user
app.delete("/make-server-8d51d9e2/user-data", async (c) => {
  try {
    const key = c.req.query('key');
    
    if (!key) {
      return c.json({ error: 'Missing required parameter: key' }, 400);
    }
    
    console.log(`Deleting data for key: ${key}`);
    
    await kv.del(key);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting user data:', error);
    return c.json({ error: 'Failed to delete data: ' + error.message }, 500);
  }
});

// Core values
app.get("/make-server-8d51d9e2/values", async (c) => {
  try {
    const userId = c.req.query('userId');
    const allValues = await kv.getByPrefix('value:');
    
    const values = userId
      ? allValues.filter((v: any) => v.userId === userId)
      : allValues;
    
    return c.json({ values: values || [] });
  } catch (error) {
    console.error('Error fetching values:', error);
    return c.json({ values: [] });
  }
});

app.post("/make-server-8d51d9e2/values", async (c) => {
  try {
    const value = await c.req.json();
    const valueId = value.id || crypto.randomUUID();
    await kv.set(`value:${valueId}`, { 
      ...value, 
      id: valueId, 
      createdAt: new Date().toISOString() 
    });
    return c.json({ id: valueId, ...value });
  } catch (error) {
    console.error('Error creating value:', error);
    return c.json({ error: 'Failed to create value: ' + error.message }, 500);
  }
});

// Memories
app.get("/make-server-8d51d9e2/memories", async (c) => {
  try {
    const userId = c.req.query('userId');
    const allMemories = await kv.getByPrefix('memory:');
    
    const memories = userId
      ? allMemories.filter((m: any) => m.userId === userId)
      : allMemories;
    
    return c.json({ memories: memories || [] });
  } catch (error) {
    console.error('Error fetching memories:', error);
    return c.json({ memories: [] });
  }
});

app.post("/make-server-8d51d9e2/memories", async (c) => {
  try {
    const memory = await c.req.json();
    const memoryId = memory.id || crypto.randomUUID();
    await kv.set(`memory:${memoryId}`, { 
      ...memory, 
      id: memoryId, 
      createdAt: new Date().toISOString() 
    });
    return c.json({ id: memoryId, ...memory });
  } catch (error) {
    console.error('Error creating memory:', error);
    return c.json({ error: 'Failed to create memory: ' + error.message }, 500);
  }
});

// Tasks (Quantum Planner)
app.get("/make-server-8d51d9e2/tasks", async (c) => {
  try {
    const userId = c.req.query('userId');
    const allTasks = await kv.getByPrefix('task:');
    
    const tasks = userId
      ? allTasks.filter((t: any) => t.userId === userId)
      : allTasks;
    
    return c.json({ tasks: tasks || [] });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return c.json({ tasks: [] });
  }
});

app.post("/make-server-8d51d9e2/tasks", async (c) => {
  try {
    const task = await c.req.json();
    const taskId = task.id || crypto.randomUUID();
    await kv.set(`task:${taskId}`, { 
      ...task, 
      id: taskId, 
      createdAt: new Date().toISOString() 
    });
    return c.json({ id: taskId, ...task });
  } catch (error) {
    console.error('Error creating task:', error);
    return c.json({ error: 'Failed to create task: ' + error.message }, 500);
  }
});

app.put("/make-server-8d51d9e2/tasks/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const existing = await kv.get(`task:${id}`);
    
    if (!existing) {
      return c.json({ error: 'Task not found' }, 404);
    }
    
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await kv.set(`task:${id}`, updated);
    return c.json(updated);
  } catch (error) {
    console.error('Error updating task:', error);
    return c.json({ error: 'Failed to update task: ' + error.message }, 500);
  }
});

app.delete("/make-server-8d51d9e2/tasks/:id", async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`task:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return c.json({ error: 'Failed to delete task: ' + error.message }, 500);
  }
});

// ========== HOS AIAGENCY ENDPOINTS ==========

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// HOS Chat - Design and create AI agents
app.post("/make-server-8d51d9e2/aiagency/hos-chat", async (c) => {
  try {
    const { message, context } = await c.req.json();
    
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      console.error('HOS AIgency error: OPENAI_API_KEY not configured');
      return c.json({ error: 'AI service not configured' }, 500);
    }

    // System prompt for HOS agent creation assistant
    const systemPrompt = `You are HOS (Human Operating System), an AI assistant that helps users create custom AI agents. Your role is to:
1. Understand what kind of AI agent the user wants to create
2. Design the agent's personality, capabilities, and purpose
3. Propose a complete agent configuration
4. Generate a concise, friendly explanation

When a user describes an agent they want, respond with a JSON object containing:
{
  "agentConfig": {
    "name": "Agent Name",
    "description": "Brief description of what this agent does",
    "type": "assistant|coach|companion|specialist|custom",
    "systemPrompt": "Detailed system prompt that defines the agent's behavior",
    "temperature": 0.7,
    "maxTokens": 1000,
    "capabilities": ["capability1", "capability2"],
    "personality": "Brief personality description",
    "responseStyle": "How the agent should communicate"
  },
  "explanation": "Friendly explanation of the agent you've designed",
  "needsApproval": true
}

Be creative but practical. Make agents that are genuinely useful and have clear purposes.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.8,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error in HOS chat:', error);
      return c.json({ error: 'Failed to process request' }, response.status);
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0]?.message?.content || '{}');

    return c.json(content);
  } catch (error) {
    console.error('Error in HOS chat endpoint:', error);
    return c.json({ error: 'Internal server error: ' + error.message }, 500);
  }
});

// Create and store a new AI agent (with safety limits)
app.post("/make-server-8d51d9e2/aiagency/agents", async (c) => {
  try {
    const agentData = await c.req.json();
    
    console.log('Creating agent with data:', JSON.stringify(agentData).substring(0, 200) + '...');
    
    // Get userId from request body (passed from frontend)
    const userId = agentData.userId || 'anonymous';
    
    // ANTI-SPAM: Check agent limit per user (max 20 agents)
    const MAX_AGENTS_PER_USER = 20;
    const allAgents = await kv.getByPrefix('agent:');
    const userAgents = allAgents.filter((a: any) => a.createdBy === userId);
    
    if (userAgents.length >= MAX_AGENTS_PER_USER) {
      console.log(`❌ User ${userId} exceeded agent limit (${userAgents.length}/${MAX_AGENTS_PER_USER})`);
      return c.json({ 
        error: `Agent limit reached! You can only create up to ${MAX_AGENTS_PER_USER} agents. Please delete some agents before creating new ones.` 
      }, 429);
    }
    
    // DUPLICATE PREVENTION: Check if agent with same name exists for this user
    const normalizedName = agentData.name.toLowerCase().trim();
    const duplicateAgent = userAgents.find((a: any) => 
      a.name.toLowerCase().trim() === normalizedName
    );
    
    if (duplicateAgent) {
      console.log(`❌ Duplicate agent name detected: "${agentData.name}" for user ${userId}`);
      return c.json({ 
        error: `You already have an agent named "${agentData.name}". Please choose a different name.` 
      }, 409);
    }
    
    const agentId = crypto.randomUUID();
    const slug = generateSlug(agentData.name);
    
    const agent = {
      id: agentId,
      slug: `${slug}-${agentId.substring(0, 8)}`,
      name: agentData.name,
      description: agentData.description,
      avatarUrl: agentData.avatarUrl,
      type: agentData.type || 'custom',
      config: agentData.config || {
        systemPrompt: agentData.systemPrompt,
        temperature: agentData.temperature || 0.7,
        maxTokens: agentData.maxTokens || 1000,
        capabilities: agentData.capabilities || [],
        personality: agentData.personality || '',
        responseStyle: agentData.responseStyle || '',
      },
      createdAt: new Date().toISOString(),
      createdBy: userId,
      isPublic: agentData.isPublic !== undefined ? agentData.isPublic : false, // Default to private
      usageCount: 0,
    };

    console.log('Agent object size:', JSON.stringify(agent).length, 'bytes');
    
    try {
      await kv.set(`agent:${agent.slug}`, agent);
      console.log('Agent stored successfully');
    } catch (kvError) {
      console.error('KV store error:', kvError);
      throw new Error(`Database storage failed: ${kvError.message}`);
    }
    
    // Also add to agents list
    try {
      const agentsList = await kv.get('agents:list') || [];
      agentsList.unshift(agent.slug);
      await kv.set('agents:list', agentsList);
      console.log('Agents list updated');
    } catch (listError) {
      console.error('Error updating agents list:', listError);
      // Don't fail the whole operation if list update fails
    }

    console.log(`✅ Agent created successfully`);
    
    return c.json({ 
      agent,
      link: `/agents/${agent.slug}` 
    });
  } catch (error) {
    console.error('Error creating agent:', error);
    return c.json({ error: 'Failed to create agent: ' + error.message }, 500);
  }
});

// Get all agents (marketplace) - with pagination support
app.get("/make-server-8d51d9e2/aiagency/agents", async (c) => {
  try {
    const userId = c.req.query('userId');
    const limit = parseInt(c.req.query('limit') || '50'); // Default limit 50
    const offset = parseInt(c.req.query('offset') || '0');
    
    const allAgents = await kv.getByPrefix('agent:');
    console.log(`📊 Fetching agents: ${allAgents.length} total in database`);
    
    // If userId is provided, return only user's agents + public agents
    // Otherwise return all public agents
    let agents = userId
      ? allAgents.filter((a: any) => a.createdBy === userId || a.isPublic)
      : allAgents.filter((a: any) => a.isPublic);
    
    // Apply pagination
    const paginatedAgents = agents.slice(offset, offset + limit);
    
    console.log(`✅ Returning ${paginatedAgents.length} agents (offset: ${offset}, limit: ${limit})`);
    
    return c.json({ agents: paginatedAgents || [] });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return c.json({ agents: [] });
  }
});

// Get specific agent by slug
app.get("/make-server-8d51d9e2/aiagency/agents/:slug", async (c) => {
  try {
    const slug = c.req.param('slug');
    const agent = await kv.get(`agent:${slug}`);
    
    if (!agent) {
      return c.json({ error: 'Agent not found' }, 404);
    }

    return c.json({ agent });
  } catch (error) {
    console.error('Error fetching agent:', error);
    return c.json({ error: 'Failed to fetch agent: ' + error.message }, 500);
  }
});

// Run an agent (chat with a created agent)
app.post("/make-server-8d51d9e2/aiagency/agents/:slug/run", async (c) => {
  try {
    const slug = c.req.param('slug');
    const { message, conversationHistory = [] } = await c.req.json();
    
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return c.json({ error: 'AI service not configured' }, 500);
    }

    // Fetch agent configuration
    const agent = await kv.get(`agent:${slug}`);
    if (!agent) {
      return c.json({ error: 'Agent not found' }, 404);
    }

    // Increment usage count
    await kv.set(`agent:${slug}`, { 
      ...agent, 
      usageCount: (agent.usageCount || 0) + 1 
    });

    // Build conversation with agent's system prompt
    const messages = [
      { role: 'system', content: agent.config.systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: agent.config.temperature || 0.7,
        max_tokens: agent.config.maxTokens || 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error when running agent:', error);
      return c.json({ error: 'Failed to run agent' }, response.status);
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || '';

    return c.json({ 
      reply,
      tokensUsed: data.usage?.total_tokens || 0 
    });
  } catch (error) {
    console.error('Error running agent:', error);
    return c.json({ error: 'Internal server error: ' + error.message }, 500);
  }
});

// Update agent (e.g., make it public/private)
app.put("/make-server-8d51d9e2/aiagency/agents/:slug", async (c) => {
  try {
    const slug = c.req.param('slug');
    const updates = await c.req.json();
    
    const agent = await kv.get(`agent:${slug}`);
    if (!agent) {
      return c.json({ error: 'Agent not found' }, 404);
    }

    const updatedAgent = {
      ...agent,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`agent:${slug}`, updatedAgent);
    
    return c.json({ agent: updatedAgent });
  } catch (error) {
    console.error('Error updating agent:', error);
    return c.json({ error: 'Failed to update agent: ' + error.message }, 500);
  }
});

// DEBUG: View all agent keys in database
app.get("/make-server-8d51d9e2/aiagency/debug/keys", async (c) => {
  try {
    const { createClient } = await import('npm:@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    const { data: allKeys, error, count } = await supabase
      .from('kv_store_8d51d9e2')
      .select('key', { count: 'exact' })
      .like('key', 'agent:%');
    
    if (error) {
      return c.json({ error: error.message }, 500);
    }
    
    return c.json({ 
      totalAgentKeys: count || allKeys?.length || 0,
      sampleKeys: allKeys?.slice(0, 10).map((row: any) => row.key) || [],
      message: `Total: ${count} agents. Showing first 10 keys.`
    });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Delete an agent
app.delete("/make-server-8d51d9e2/aiagency/agents/:slug", async (c) => {
  try {
    const slug = c.req.param('slug');
    
    console.log(`🗑️ Attempting to delete agent with slug: ${slug}`);
    console.log(`🔍 Looking for key: agent:${slug}`);
    
    const agent = await kv.get(`agent:${slug}`);
    if (!agent) {
      console.log(`❌ Agent not found with key: agent:${slug}`);
      return c.json({ error: 'Agent not found' }, 404);
    }

    console.log(`✅ Found agent: ${agent.name}`);

    // Delete the agent
    await kv.del(`agent:${slug}`);
    console.log(`✅ Deleted agent key: agent:${slug}`);
    
    // Verify deletion
    const checkDeleted = await kv.get(`agent:${slug}`);
    if (checkDeleted) {
      console.log(`⚠️ WARNING: Agent still exists after deletion!`);
      return c.json({ error: 'Deletion failed - agent still exists' }, 500);
    } else {
      console.log(`✅ Verified: Agent successfully deleted from database`);
    }
    
    // Remove from agents list
    const agentsList = await kv.get('agents:list') || [];
    const updatedList = agentsList.filter((s: string) => s !== slug);
    await kv.set('agents:list', updatedList);
    console.log(`✅ Updated agents list`);

    return c.json({ success: true, message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting agent:', error);
    return c.json({ error: 'Failed to delete agent: ' + error.message }, 500);
  }
});

// Delete ALL agents (bulk cleanup) - with aggressive batching for large datasets
app.delete("/make-server-8d51d9e2/aiagency/agents", async (c) => {
  try {
    console.log('🗑️ Starting bulk agent deletion...');
    
    // Import Supabase client
    const { createClient } = await import('npm:@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    // Get total count first
    const { count: totalCount, error: countError } = await supabase
      .from('kv_store_8d51d9e2')
      .select('*', { count: 'exact', head: true })
      .like('key', 'agent:%');
    
    if (countError) {
      console.error('❌ Error counting agents:', countError);
      return c.json({ error: `Failed to count agents: ${countError.message}` }, 500);
    }
    
    console.log(`📊 Found ${totalCount} total agents to delete`);
    
    if (!totalCount || totalCount === 0) {
      console.log('ℹ️ No agents found to delete');
      return c.json({ 
        success: true, 
        removed: 0,
        message: 'No agents found to delete' 
      });
    }
    
    // Delete in small batches to avoid timeout
    const BATCH_SIZE = 50;
    let totalDeleted = 0;
    let batchNum = 0;
    
    console.log(`🗑️ Deleting ${totalCount} agents in batches of ${BATCH_SIZE}...`);
    
    // Keep deleting until no more agents remain
    while (true) {
      batchNum++;
      
      // Get a batch of keys
      const { data: batch, error: fetchError } = await supabase
        .from('kv_store_8d51d9e2')
        .select('key')
        .like('key', 'agent:%')
        .limit(BATCH_SIZE);
      
      if (fetchError) {
        console.error(`❌ Error fetching batch ${batchNum}:`, fetchError);
        break;
      }
      
      if (!batch || batch.length === 0) {
        console.log(`✅ No more agents to delete`);
        break;
      }
      
      const keysToDelete = batch.map((row: any) => row.key);
      console.log(`📦 Batch ${batchNum}: Deleting ${keysToDelete.length} agents...`);
      
      // Delete this batch using .in() with the specific keys
      const { error: deleteError } = await supabase
        .from('kv_store_8d51d9e2')
        .delete()
        .in('key', keysToDelete);
      
      if (deleteError) {
        console.error(`❌ Batch ${batchNum} delete failed:`, deleteError);
        break;
      }
      
      totalDeleted += keysToDelete.length;
      console.log(`✅ Batch ${batchNum} complete. Total deleted: ${totalDeleted}/${totalCount}`);
      
      // If we deleted less than BATCH_SIZE, we're done
      if (keysToDelete.length < BATCH_SIZE) {
        console.log(`✅ Last batch processed`);
        break;
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Safety limit: max 100 batches (5000 agents)
      if (batchNum >= 100) {
        console.log(`⚠️ Reached batch limit (100 batches)`);
        break;
      }
    }
    
    // Verify how many remain
    const { count: remainingCount } = await supabase
      .from('kv_store_8d51d9e2')
      .select('*', { count: 'exact', head: true })
      .like('key', 'agent:%');
    
    console.log(`📊 Final result: ${totalDeleted} deleted, ${remainingCount || 0} remaining`);
    
    // Clear the agents list
    try {
      await kv.set('agents:list', []);
      console.log('✅ Cleared agents list');
    } catch (listError) {
      console.error('⚠️ Failed to clear agents list:', listError);
    }
    
    return c.json({ 
      success: (remainingCount || 0) === 0,
      removed: totalDeleted,
      remaining: remainingCount || 0,
      totalBatches: batchNum,
      message: (remainingCount || 0) === 0
        ? `Successfully deleted all ${totalDeleted} agents in ${batchNum} batches`
        : `Deleted ${totalDeleted} agents in ${batchNum} batches, ${remainingCount} still remain`
    });
  } catch (error) {
    console.error('❌ Error in bulk delete:', error);
    return c.json({ error: 'Failed to delete agents: ' + error.message }, 500);
  }
});

// ========== HOS VOICEAGENCY ENDPOINTS ==========

// Create a new voice agent
app.post("/make-server-8d51d9e2/voiceagency/agents", async (c) => {
  try {
    const agentData = await c.req.json();
    
    console.log('🔍 RAW REQUEST BODY:', JSON.stringify(agentData, null, 2));
    console.log('📤 Creating voice agent with data:', JSON.stringify(agentData).substring(0, 200) + '...');
    
    const agentId = crypto.randomUUID();
    const slug = generateSlug(agentData.name);
    
    // Get userId from request body (passed from frontend)
    const userId = agentData.userId || agentData.createdBy || 'anonymous';
    
    console.log('👤 Voice agent will be created for userId:', userId);
    console.log('🔑 agentData.userId:', agentData.userId);
    console.log('🔑 agentData.createdBy:', agentData.createdBy);
    
    // DUPLICATE PREVENTION: Check if an agent with same name was created in last 5 seconds
    const allAgents = await kv.getByPrefix('voice-agent:');
    const recentDuplicates = allAgents.filter((a: any) => {
      if (a.createdBy !== userId || a.name !== agentData.name) return false;
      const createdAt = new Date(a.createdAt).getTime();
      const now = Date.now();
      const diff = now - createdAt;
      return diff < 5000; // 5 seconds
    });
    
    if (recentDuplicates.length > 0) {
      console.log('⚠️ DUPLICATE DETECTED: Agent with same name created', recentDuplicates.length, 'times in last 5 seconds');
      console.log('⚠️ Returning existing agent instead of creating duplicate');
      return c.json({ 
        agent: recentDuplicates[0],
        link: `/voice-agents/${recentDuplicates[0].slug}`,
        isDuplicate: true
      });
    }
    
    const agent = {
      id: agentId,
      slug: `${slug}-${agentId.substring(0, 8)}`,
      name: agentData.name,
      description: agentData.description,
      avatarUrl: agentData.avatarUrl,
      type: agentData.type || 'custom',
      voiceConfig: agentData.voiceConfig || {},
      createdAt: new Date().toISOString(),
      createdBy: userId,
      isPublic: agentData.isPublic !== undefined ? agentData.isPublic : false,
      usageCount: 0,
      featured: agentData.featured || false,
      category: agentData.category || 'agent',
    };

    console.log('💾 Storing agent with key:', `voice-agent:${agent.slug}`);
    console.log('💾 Agent createdBy field:', agent.createdBy);
    
    await kv.set(`voice-agent:${agent.slug}`, agent);
    
    const agentsList = await kv.get('voice-agents:list') || [];
    agentsList.unshift(agent.slug);
    await kv.set('voice-agents:list', agentsList);

    console.log('✅ Voice agent created successfully:', agent.slug);
    console.log('✅ Final agent object:', JSON.stringify(agent, null, 2));

    return c.json({ 
      agent,
      link: `/voice-agents/${agent.slug}` 
    });
  } catch (error) {
    console.error('❌ Error creating voice agent:', error);
    return c.json({ error: 'Failed to create voice agent: ' + error.message }, 500);
  }
});

// Get all voice agents
app.get("/make-server-8d51d9e2/voiceagency/agents", async (c) => {
  try {
    const userId = c.req.query('userId');
    console.log('📥 GET voice agents request - userId from query:', userId);
    
    const allAgents = await kv.getByPrefix('voice-agent:');
    console.log('📊 Total agents in database:', allAgents.length);
    console.log('📋 All agents createdBy values:', allAgents.map((a: any) => ({ slug: a.slug, createdBy: a.createdBy })));
    
    const agents = userId
      ? allAgents.filter((a: any) => a.createdBy === userId || a.isPublic)
      : allAgents.filter((a: any) => a.isPublic);
    
    console.log('✅ Filtered agents count:', agents.length);
    console.log('✅ Returning agents:', agents.map((a: any) => ({ slug: a.slug, createdBy: a.createdBy, isPublic: a.isPublic })));
    
    return c.json({ agents: agents || [] });
  } catch (error) {
    console.error('❌ Error fetching voice agents:', error);
    return c.json({ agents: [] });
  }
});

// Get specific voice agent by slug
app.get("/make-server-8d51d9e2/voiceagency/agents/:slug", async (c) => {
  try {
    const slug = c.req.param('slug');
    const agent = await kv.get(`voice-agent:${slug}`);
    
    if (!agent) {
      return c.json({ error: 'Voice agent not found' }, 404);
    }

    return c.json({ agent });
  } catch (error) {
    console.error('Error fetching voice agent:', error);
    return c.json({ error: 'Failed to fetch voice agent: ' + error.message }, 500);
  }
});

// Delete a voice agent
app.delete("/make-server-8d51d9e2/voiceagency/agents/:slug", async (c) => {
  try {
    const slug = c.req.param('slug');
    console.log('🗑️ Deleting voice agent:', slug);
    
    const agent = await kv.get(`voice-agent:${slug}`);
    
    if (!agent) {
      return c.json({ error: 'Voice agent not found' }, 404);
    }

    await kv.del(`voice-agent:${slug}`);
    
    // Remove from list if it exists
    try {
      const agentsList = await kv.get('voice-agents:list') || [];
      const updatedList = agentsList.filter((s: string) => s !== slug);
      await kv.set('voice-agents:list', updatedList);
    } catch (listError) {
      console.error('⚠️ Failed to update agents list:', listError);
    }
    
    console.log('✅ Voice agent deleted successfully:', slug);
    return c.json({ success: true, message: 'Voice agent deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting voice agent:', error);
    return c.json({ error: 'Failed to delete voice agent: ' + error.message }, 500);
  }
});

// Bulk delete voice agents for a specific user
app.post("/make-server-8d51d9e2/voiceagency/agents/bulk-delete", async (c) => {
  try {
    const { userId } = await c.req.json();
    
    if (!userId) {
      return c.json({ error: 'userId is required' }, 400);
    }
    
    console.log('🗑️ Bulk deleting voice agents for userId:', userId);
    
    const allAgents = await kv.getByPrefix('voice-agent:');
    const userAgents = allAgents.filter((a: any) => a.createdBy === userId);
    
    console.log('📊 Found', userAgents.length, 'voice agents to delete');
    
    let deleted = 0;
    for (const agent of userAgents) {
      try {
        await kv.del(`voice-agent:${agent.slug}`);
        deleted++;
        if (deleted % 10 === 0) {
          console.log(`⏳ Deleted ${deleted}/${userAgents.length} voice agents...`);
        }
      } catch (error) {
        console.error(`❌ Failed to delete voice agent ${agent.slug}:`, error);
      }
    }
    
    // Clear the list
    try {
      await kv.set('voice-agents:list', []);
      console.log('✅ Cleared voice agents list');
    } catch (listError) {
      console.error('⚠️ Failed to clear voice agents list:', listError);
    }
    
    console.log(`✅ Bulk delete complete: ${deleted}/${userAgents.length} voice agents deleted`);
    
    return c.json({ 
      success: true, 
      deleted,
      total: userAgents.length,
      message: `Successfully deleted ${deleted} voice agents` 
    });
  } catch (error) {
    console.error('❌ Error in bulk delete voice agents:', error);
    return c.json({ error: 'Failed to bulk delete voice agents: ' + error.message }, 500);
  }
});

// Transcribe audio using OpenAI Whisper
app.post("/make-server-8d51d9e2/voiceagency/transcribe", async (c) => {
  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return c.json({ error: 'AI service not configured' }, 500);
    }

    const formData = await c.req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return c.json({ error: 'No audio file provided' }, 400);
    }

    // Forward to OpenAI Whisper API
    const whisperFormData = new FormData();
    whisperFormData.append('file', audioFile);
    whisperFormData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: whisperFormData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI Whisper API error:', error);
      return c.json({ error: 'Failed to transcribe audio' }, response.status);
    }

    const data = await response.json();
    
    return c.json({
      text: data.text,
      language: data.language || 'en',
      duration: data.duration || 0,
    });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return c.json({ error: 'Failed to transcribe audio: ' + error.message }, 500);
  }
});

// Text to speech using OpenAI TTS
app.post("/make-server-8d51d9e2/voiceagency/tts", async (c) => {
  try {
    const { text, voice = 'alloy' } = await c.req.json();
    
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return c.json({ error: 'AI service not configured' }, 500);
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: voice,
        input: text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI TTS API error:', error);
      return c.json({ error: 'Failed to generate speech' }, response.status);
    }

    const audioBuffer = await response.arrayBuffer();
    
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error generating speech:', error);
    return c.json({ error: 'Failed to generate speech: ' + error.message }, 500);
  }
});

// Chat with voice agent (text-based)
app.post("/make-server-8d51d9e2/voiceagency/agents/:slug/chat", async (c) => {
  try {
    const slug = c.req.param('slug');
    const { message, conversationHistory = [] } = await c.req.json();
    
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return c.json({ error: 'AI service not configured' }, 500);
    }

    const agent = await kv.get(`voice-agent:${slug}`);
    if (!agent) {
      return c.json({ error: 'Voice agent not found' }, 404);
    }

    // Increment usage count
    await kv.set(`voice-agent:${slug}`, { 
      ...agent, 
      usageCount: (agent.usageCount || 0) + 1 
    });

    const messages = [
      { role: 'system', content: agent.voiceConfig.systemPrompt },
      ...conversationHistory.slice(-10),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: agent.voiceConfig.model || 'gpt-4o-mini',
        messages,
        temperature: agent.voiceConfig.temperature || 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return c.json({ error: 'Failed to get response' }, response.status);
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || '';

    return c.json({ 
      reply,
      tokensUsed: data.usage?.total_tokens || 0 
    });
  } catch (error) {
    console.error('Error in voice agent chat:', error);
    return c.json({ error: 'Internal server error: ' + error.message }, 500);
  }
});

// Voice chat with agent (audio input/output)
app.post("/make-server-8d51d9e2/voiceagency/agents/:slug/voice-chat", async (c) => {
  try {
    const slug = c.req.param('slug');
    const formData = await c.req.formData();
    const audioFile = formData.get('audio') as File;
    const historyStr = formData.get('history') as string;
    const conversationHistory = historyStr ? JSON.parse(historyStr) : [];
    
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return c.json({ error: 'AI service not configured' }, 500);
    }

    const agent = await kv.get(`voice-agent:${slug}`);
    if (!agent) {
      return c.json({ error: 'Voice agent not found' }, 404);
    }

    // Step 1: Transcribe audio
    const whisperFormData = new FormData();
    whisperFormData.append('file', audioFile);
    whisperFormData.append('model', 'whisper-1');

    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: whisperFormData,
    });

    if (!transcriptionResponse.ok) {
      return c.json({ error: 'Failed to transcribe audio' }, 500);
    }

    const transcriptionData = await transcriptionResponse.json();
    const userText = transcriptionData.text;

    // Step 2: Get text response from agent
    const messages = [
      { role: 'system', content: agent.voiceConfig.systemPrompt },
      ...conversationHistory.slice(-10),
      { role: 'user', content: userText }
    ];

    const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: agent.voiceConfig.model || 'gpt-4o-mini',
        messages,
        temperature: agent.voiceConfig.temperature || 0.7,
      }),
    });

    if (!chatResponse.ok) {
      return c.json({ error: 'Failed to get response from agent' }, 500);
    }

    const chatData = await chatResponse.json();
    const assistantText = chatData.choices[0]?.message?.content || '';

    // Step 3: Convert response to speech (if TTS enabled)
    let audioUrl = null;
    if (agent.voiceConfig.ttsEnabled) {
      const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'tts-1',
          voice: agent.voiceConfig.voice || 'alloy',
          input: assistantText,
        }),
      });

      if (ttsResponse.ok) {
        const audioBuffer = await ttsResponse.arrayBuffer();
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
        audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
      }
    }

    // Update usage count
    await kv.set(`voice-agent:${slug}`, { 
      ...agent, 
      usageCount: (agent.usageCount || 0) + 1 
    });

    return c.json({
      transcription: userText,
      reply: assistantText,
      audioUrl,
      tokensUsed: chatData.usage?.total_tokens || 0,
    });
  } catch (error) {
    console.error('Error in voice chat:', error);
    return c.json({ error: 'Internal server error: ' + error.message }, 500);
  }
});

// Update voice agent
app.put("/make-server-8d51d9e2/voiceagency/agents/:slug", async (c) => {
  try {
    const slug = c.req.param('slug');
    const updates = await c.req.json();
    
    const agent = await kv.get(`voice-agent:${slug}`);
    if (!agent) {
      return c.json({ error: 'Voice agent not found' }, 404);
    }

    const updatedAgent = {
      ...agent,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`voice-agent:${slug}`, updatedAgent);
    
    return c.json({ agent: updatedAgent });
  } catch (error) {
    console.error('Error updating voice agent:', error);
    return c.json({ error: 'Failed to update voice agent: ' + error.message }, 500);
  }
});

// Delete voice agent
app.delete("/make-server-8d51d9e2/voiceagency/agents/:slug", async (c) => {
  try {
    const slug = c.req.param('slug');
    
    const agent = await kv.get(`voice-agent:${slug}`);
    if (!agent) {
      return c.json({ error: 'Voice agent not found' }, 404);
    }

    await kv.del(`voice-agent:${slug}`);
    
    const agentsList = await kv.get('voice-agents:list') || [];
    const updatedList = agentsList.filter((s: string) => s !== slug);
    await kv.set('voice-agents:list', updatedList);

    return c.json({ success: true, message: 'Voice agent deleted successfully' });
  } catch (error) {
    console.error('Error deleting voice agent:', error);
    return c.json({ error: 'Failed to delete voice agent: ' + error.message }, 500);
  }
});

// ========== AGENT FORGE ENDPOINTS ==========

// Get all forge agents for a user
app.get("/make-server-8d51d9e2/forge/agents", async (c) => {
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({ error: 'Missing required parameter: userId' }, 400);
    }
    
    console.log(`Loading forge agents for user: ${userId}`);
    
    const allAgents = await kv.getByPrefix(`forge-agent:${userId}:`);
    const agents = allAgents.map((item: any) => item.data || item).filter(Boolean);
    
    return c.json({ agents: agents || [], count: agents.length, limit: 10 });
  } catch (error) {
    console.error('Error fetching forge agents:', error);
    return c.json({ agents: [], count: 0, limit: 10 });
  }
});

// Create/Update agent through conversation
app.post("/make-server-8d51d9e2/forge/create", async (c) => {
  try {
    const { userId, message, sessionId, draftAgent } = await c.req.json();
    
    if (!userId || !message) {
      return c.json({ error: 'Missing required parameters: userId, message' }, 400);
    }
    
    console.log(`🔨 Agent Forge creation request for user: ${userId}`);
    
    // Check agent limit
    const existingAgents = await kv.getByPrefix(`forge-agent:${userId}:`);
    if (existingAgents.length >= 10 && !sessionId) {
      return c.json({ 
        error: 'AGENT_LIMIT_REACHED',
        message: 'You have reached the maximum of 10 agents. Please delete an agent to create a new one.',
        agentCount: existingAgents.length,
        limit: 10
      }, 400);
    }
    
    // Get or create session
    const currentSessionId = sessionId || crypto.randomUUID();
    const sessionKey = `forge-session:${userId}:${currentSessionId}`;
    
    let session: any = await kv.get(sessionKey) || {
      sessionId: currentSessionId,
      userId,
      messages: [],
      currentStep: 'initial',
      draftAgent: draftAgent || {},
      createdAt: new Date().toISOString()
    };
    
    // Add user message to session
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });
    
    // Call OpenAI to guide the creation process
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 500);
    }
    
    const systemPrompt = `You are HOS Agent Forge, an AI creation assistant. You help users create custom AI agents through conversation.

Your job is to gather information and build an agent manifest with these fields:
- name: Agent's name
- purpose: What the agent does
- personality: Character traits
- tone: professional/friendly/creative/technical/casual
- systemPrompt: The AI's core instructions
- capabilities: Array of what it can do
- restrictions: Array of what it cannot do
- description: Public description
- tags: Array of keywords
- category: Type of agent

Guide the user step-by-step. Ask clarifying questions. Be conversational and helpful.

Current draft: ${JSON.stringify(session.draftAgent || {}, null, 2)}

When the agent is complete, respond with: [AGENT_COMPLETE]`;
    
    const conversationMessages = [
      { role: 'system', content: systemPrompt },
      ...session.messages.slice(-10) // Last 10 messages
    ];
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: conversationMessages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      return c.json({ error: 'Failed to get response from AI' }, 500);
    }
    
    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content || '';
    
    // Add assistant message to session
    session.messages.push({
      role: 'assistant',
      content: assistantMessage,
      timestamp: new Date().toISOString()
    });
    
    // Parse the response to update draft agent
    const isComplete = assistantMessage.includes('[AGENT_COMPLETE]');
    
    // Try to extract JSON from the response
    const jsonMatch = assistantMessage.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      try {
        const extractedData = JSON.parse(jsonMatch[1]);
        session.draftAgent = { ...session.draftAgent, ...extractedData };
      } catch (e) {
        console.log('Could not parse JSON from response');
      }
    }
    
    // Update session step
    if (isComplete) {
      session.currentStep = 'complete';
    } else if (Object.keys(session.draftAgent).length > 0) {
      session.currentStep = 'configuring';
    } else {
      session.currentStep = 'defining';
    }
    
    // Save session
    await kv.set(sessionKey, session);
    
    const cleanMessage = assistantMessage.replace('[AGENT_COMPLETE]', '').trim();
    
    return c.json({
      sessionId: currentSessionId,
      message: cleanMessage,
      draftAgent: session.draftAgent,
      isComplete,
      currentStep: session.currentStep,
      nextStep: isComplete ? 'Ready to save' : 'Continue conversation'
    });
  } catch (error) {
    console.error('Error in agent creation:', error);
    return c.json({ error: 'Failed to process request: ' + error.message }, 500);
  }
});

// Save completed agent
app.post("/make-server-8d51d9e2/forge/save", async (c) => {
  try {
    const { userId, sessionId, agentData } = await c.req.json();
    
    if (!userId || !agentData) {
      return c.json({ error: 'Missing required parameters' }, 400);
    }
    
    console.log(`💾 Saving agent for user: ${userId}`);
    
    // Check agent limit
    const existingAgents = await kv.getByPrefix(`forge-agent:${userId}:`);
    if (existingAgents.length >= 10) {
      return c.json({ 
        error: 'AGENT_LIMIT_REACHED',
        message: 'Maximum of 10 agents reached',
      }, 400);
    }
    
    const agentId = crypto.randomUUID();
    const agent = {
      id: agentId,
      userId,
      name: agentData.name || 'Unnamed Agent',
      purpose: agentData.purpose || '',
      personality: agentData.personality || '',
      tone: agentData.tone || 'friendly',
      avatar: agentData.avatar || '',
      promptLogic: agentData.promptLogic || '',
      systemPrompt: agentData.systemPrompt || agentData.purpose || '',
      status: agentData.status || 'draft',
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      modelConfig: {
        temperature: 0.7,
        maxTokens: 1000,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        ...agentData.modelConfig
      },
      capabilities: agentData.capabilities || [],
      restrictions: agentData.restrictions || [],
      metadata: {
        description: agentData.description || '',
        tags: agentData.tags || [],
        category: agentData.category || 'general',
        ...agentData.metadata
      }
    };
    
    await kv.set(`forge-agent:${userId}:${agentId}`, agent);
    
    // Clean up session if provided
    if (sessionId) {
      await kv.del(`forge-session:${userId}:${sessionId}`);
    }
    
    console.log(`✅ Agent saved: ${agentId}`);
    
    return c.json({ 
      success: true, 
      agent,
      message: 'Agent created successfully'
    });
  } catch (error) {
    console.error('Error saving agent:', error);
    return c.json({ error: 'Failed to save agent: ' + error.message }, 500);
  }
});

// Get specific agent
app.get("/make-server-8d51d9e2/forge/agents/:agentId", async (c) => {
  try {
    const agentId = c.req.param('agentId');
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({ error: 'Missing userId' }, 400);
    }
    
    const agent = await kv.get(`forge-agent:${userId}:${agentId}`);
    
    if (!agent) {
      return c.json({ error: 'Agent not found' }, 404);
    }
    
    return c.json({ agent });
  } catch (error) {
    console.error('Error fetching agent:', error);
    return c.json({ error: 'Failed to fetch agent: ' + error.message }, 500);
  }
});

// Update agent
app.put("/make-server-8d51d9e2/forge/agents/:agentId", async (c) => {
  try {
    const agentId = c.req.param('agentId');
    const { userId, updates } = await c.req.json();
    
    if (!userId) {
      return c.json({ error: 'Missing userId' }, 400);
    }
    
    const agent = await kv.get(`forge-agent:${userId}:${agentId}`);
    
    if (!agent) {
      return c.json({ error: 'Agent not found' }, 404);
    }
    
    const updatedAgent = {
      ...agent,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`forge-agent:${userId}:${agentId}`, updatedAgent);
    
    return c.json({ agent: updatedAgent });
  } catch (error) {
    console.error('Error updating agent:', error);
    return c.json({ error: 'Failed to update agent: ' + error.message }, 500);
  }
});

// Delete agent
app.delete("/make-server-8d51d9e2/forge/agents/:agentId", async (c) => {
  try {
    const agentId = c.req.param('agentId');
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({ error: 'Missing userId' }, 400);
    }
    
    await kv.del(`forge-agent:${userId}:${agentId}`);
    
    return c.json({ success: true, message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return c.json({ error: 'Failed to delete agent: ' + error.message }, 500);
  }
});

// Get all published agents (marketplace)
app.get("/make-server-8d51d9e2/forge/marketplace", async (c) => {
  try {
    console.log('Loading marketplace agents');
    
    // Get all agents with status 'published'
    const allAgents = await kv.getByPrefix('forge-agent:');
    const publishedAgents = allAgents
      .map((item: any) => item.data || item)
      .filter((agent: any) => agent && agent.status === 'published');
    
    return c.json({ agents: publishedAgents || [], count: publishedAgents.length });
  } catch (error) {
    console.error('Error fetching marketplace agents:', error);
    return c.json({ agents: [], count: 0 });
  }
});

// Demo chat with a published agent (limited)
app.post("/make-server-8d51d9e2/forge/demo/:agentId", async (c) => {
  try {
    const agentId = c.req.param('agentId');
    const { message, conversationHistory } = await c.req.json();
    
    if (!message) {
      return c.json({ error: 'Missing required parameter: message' }, 400);
    }
    
    // Find the agent across all users
    const allAgents = await kv.getByPrefix('forge-agent:');
    const agent = allAgents
      .map((item: any) => item.data || item)
      .find((a: any) => a && a.id === agentId && a.status === 'published');
    
    if (!agent) {
      return c.json({ error: 'Agent not found or not published' }, 404);
    }
    
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 500);
    }
    
    const messages = [
      { role: 'system', content: agent.systemPrompt + '\n\nNote: This is a demo session.' },
      ...(conversationHistory || []).slice(-6), // Limit history for demo
      { role: 'user', content: message }
    ];
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: agent.modelConfig.temperature,
        max_tokens: Math.min(agent.modelConfig.maxTokens, 500), // Limit tokens for demo
        top_p: agent.modelConfig.topP,
        frequency_penalty: agent.modelConfig.frequencyPenalty,
        presence_penalty: agent.modelConfig.presencePenalty,
      }),
    });
    
    if (!response.ok) {
      return c.json({ error: 'Failed to get response from agent' }, 500);
    }
    
    const data = await response.json();
    const reply = data.choices[0]?.message?.content || '';
    
    return c.json({ 
      reply,
      agentName: agent.name,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in demo chat:', error);
    return c.json({ error: 'Failed to demo agent: ' + error.message }, 500);
  }
});

// Chat with an agent
app.post("/make-server-8d51d9e2/forge/chat/:agentId", async (c) => {
  try {
    const agentId = c.req.param('agentId');
    const { userId, message, conversationHistory } = await c.req.json();
    
    if (!userId || !message) {
      return c.json({ error: 'Missing required parameters' }, 400);
    }
    
    const agent = await kv.get(`forge-agent:${userId}:${agentId}`);
    
    if (!agent) {
      return c.json({ error: 'Agent not found' }, 404);
    }
    
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 500);
    }
    
    const messages = [
      { role: 'system', content: agent.systemPrompt },
      ...(conversationHistory || []).slice(-10),
      { role: 'user', content: message }
    ];
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: agent.modelConfig.temperature,
        max_tokens: agent.modelConfig.maxTokens,
        top_p: agent.modelConfig.topP,
        frequency_penalty: agent.modelConfig.frequencyPenalty,
        presence_penalty: agent.modelConfig.presencePenalty,
      }),
    });
    
    if (!response.ok) {
      return c.json({ error: 'Failed to get response from agent' }, 500);
    }
    
    const data = await response.json();
    const reply = data.choices[0]?.message?.content || '';
    
    return c.json({ 
      reply,
      agentName: agent.name,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error chatting with agent:', error);
    return c.json({ error: 'Failed to chat with agent: ' + error.message }, 500);
  }
});

// ========== FINANCIAL RESEARCH ENDPOINTS ==========

// Mount financial research routes
app.route("/make-server-8d51d9e2/financial", financialResearchApp);

// ========== HOS WIDGETGENCY ENDPOINTS ==========

// Create a new flow
app.post("/make-server-8d51d9e2/widgetgency/flows", async (c) => {
  try {
    const flowData = await c.req.json();
    
    const flowId = crypto.randomUUID();
    
    const flow = {
      id: flowId,
      name: flowData.name,
      description: flowData.description || '',
      nodes: flowData.nodes || [],
      edges: flowData.edges || [],
      category: flowData.category || 'custom',
      isPublic: flowData.isPublic !== undefined ? flowData.isPublic : false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: flowData.userId || 'user',
    };

    await kv.set(`flow:${flowId}`, flow);
    
    const flowsList = await kv.get('flows:list') || [];
    flowsList.unshift(flowId);
    await kv.set('flows:list', flowsList);

    return c.json({ flow });
  } catch (error) {
    console.error('Error creating flow:', error);
    return c.json({ error: 'Failed to create flow: ' + error.message }, 500);
  }
});

// Get all flows
app.get("/make-server-8d51d9e2/widgetgency/flows", async (c) => {
  try {
    const flows = await kv.getByPrefix('flow:');
    return c.json({ flows: flows || [] });
  } catch (error) {
    console.error('Error fetching flows:', error);
    return c.json({ flows: [] });
  }
});

// Get specific flow by ID
app.get("/make-server-8d51d9e2/widgetgency/flows/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const flow = await kv.get(`flow:${id}`);
    
    if (!flow) {
      return c.json({ error: 'Flow not found' }, 404);
    }

    return c.json({ flow });
  } catch (error) {
    console.error('Error fetching flow:', error);
    return c.json({ error: 'Failed to fetch flow: ' + error.message }, 500);
  }
});

// Update flow
app.put("/make-server-8d51d9e2/widgetgency/flows/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const flow = await kv.get(`flow:${id}`);
    if (!flow) {
      return c.json({ error: 'Flow not found' }, 404);
    }

    const updatedFlow = {
      ...flow,
      ...updates,
      id: flow.id, // Preserve original ID
      createdAt: flow.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`flow:${id}`, updatedFlow);
    
    return c.json({ flow: updatedFlow });
  } catch (error) {
    console.error('Error updating flow:', error);
    return c.json({ error: 'Failed to update flow: ' + error.message }, 500);
  }
});

// Delete flow
app.delete("/make-server-8d51d9e2/widgetgency/flows/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    const flow = await kv.get(`flow:${id}`);
    if (!flow) {
      return c.json({ error: 'Flow not found' }, 404);
    }

    await kv.del(`flow:${id}`);
    
    const flowsList = await kv.get('flows:list') || [];
    const updatedList = flowsList.filter((fId: string) => fId !== id);
    await kv.set('flows:list', updatedList);

    return c.json({ success: true, message: 'Flow deleted successfully' });
  } catch (error) {
    console.error('Error deleting flow:', error);
    return c.json({ error: 'Failed to delete flow: ' + error.message }, 500);
  }
});

// Execute flow (placeholder for future implementation)
app.post("/make-server-8d51d9e2/widgetgency/flows/:id/execute", async (c) => {
  try {
    const id = c.req.param('id');
    
    const flow = await kv.get(`flow:${id}`);
    if (!flow) {
      return c.json({ error: 'Flow not found' }, 404);
    }

    // In a real implementation, this would execute the flow
    // For now, we'll just log and return a success message
    console.log('Executing flow:', flow.name);
    
    return c.json({ 
      success: true,
      message: 'Flow execution started',
      executionId: crypto.randomUUID(),
      status: 'running'
    });
  } catch (error) {
    console.error('Error executing flow:', error);
    return c.json({ error: 'Failed to execute flow: ' + error.message }, 500);
  }
});

// ========== HOS EVOLVER ENDPOINTS ==========

// Get all evolution cycles
app.get("/make-server-8d51d9e2/evolver/cycles", async (c) => {
  try {
    const cycles = await kv.getByPrefix('evolver:cycle:');
    return c.json(cycles || []);
  } catch (error) {
    console.error('Error fetching evolution cycles:', error);
    return c.json([]);
  }
});

// Get specific evolution cycle
app.get("/make-server-8d51d9e2/evolver/cycles/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const cycle = await kv.get(`evolver:cycle:${id}`);
    
    if (!cycle) {
      return c.json({ error: 'Evolution cycle not found' }, 404);
    }
    
    return c.json(cycle);
  } catch (error) {
    console.error('Error fetching evolution cycle:', error);
    return c.json({ error: 'Failed to fetch cycle: ' + error.message }, 500);
  }
});

// Create evolution cycle
app.post("/make-server-8d51d9e2/evolver/cycles", async (c) => {
  try {
    const cycleData = await c.req.json();
    const cycleId = cycleData.id || `cycle_${Date.now()}`;
    
    const cycle = {
      ...cycleData,
      id: cycleId,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`evolver:cycle:${cycleId}`, cycle);
    
    return c.json(cycle);
  } catch (error) {
    console.error('Error creating evolution cycle:', error);
    return c.json({ error: 'Failed to create cycle: ' + error.message }, 500);
  }
});

// Update evolution cycle
app.patch("/make-server-8d51d9e2/evolver/cycles/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`evolver:cycle:${id}`);
    if (!existing) {
      return c.json({ error: 'Evolution cycle not found' }, 404);
    }
    
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`evolver:cycle:${id}`, updated);
    
    return c.json(updated);
  } catch (error) {
    console.error('Error updating evolution cycle:', error);
    return c.json({ error: 'Failed to update cycle: ' + error.message }, 500);
  }
});

// Start new evolution cycle (automated analysis)
app.post("/make-server-8d51d9e2/evolver/cycles/start", async (c) => {
  try {
    const cycleId = `cycle_${Date.now()}`;
    
    const cycle = {
      id: cycleId,
      startTime: new Date().toISOString(),
      status: 'analyzing',
      logs: [{
        timestamp: new Date().toISOString(),
        phase: 'initialization',
        message: 'Evolution cycle started',
        level: 'info'
      }],
    };
    
    await kv.set(`evolver:cycle:${cycleId}`, cycle);
    
    return c.json(cycle);
  } catch (error) {
    console.error('Error starting evolution cycle:', error);
    return c.json({ error: 'Failed to start cycle: ' + error.message }, 500);
  }
});

// Approve proposal
app.post("/make-server-8d51d9e2/evolver/cycles/:cycleId/proposals/:proposalId/approve", async (c) => {
  try {
    const cycleId = c.req.param('cycleId');
    const proposalId = c.req.param('proposalId');
    
    const cycle = await kv.get(`evolver:cycle:${cycleId}`);
    if (!cycle) {
      return c.json({ error: 'Cycle not found' }, 404);
    }
    
    // Update proposal status
    if (cycle.proposals) {
      cycle.proposals = cycle.proposals.map((p: any) => 
        p.id === proposalId ? { ...p, status: 'approved' } : p
      );
    }
    
    cycle.logs = cycle.logs || [];
    cycle.logs.push({
      timestamp: new Date().toISOString(),
      phase: 'approval',
      message: `Proposal ${proposalId} approved`,
      level: 'success'
    });
    
    await kv.set(`evolver:cycle:${cycleId}`, cycle);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error approving proposal:', error);
    return c.json({ error: 'Failed to approve proposal: ' + error.message }, 500);
  }
});

// Reject proposal
app.post("/make-server-8d51d9e2/evolver/cycles/:cycleId/proposals/:proposalId/reject", async (c) => {
  try {
    const cycleId = c.req.param('cycleId');
    const proposalId = c.req.param('proposalId');
    const { reason } = await c.req.json();
    
    const cycle = await kv.get(`evolver:cycle:${cycleId}`);
    if (!cycle) {
      return c.json({ error: 'Cycle not found' }, 404);
    }
    
    if (cycle.proposals) {
      cycle.proposals = cycle.proposals.map((p: any) => 
        p.id === proposalId ? { ...p, status: 'rejected', rejectionReason: reason } : p
      );
    }
    
    cycle.logs = cycle.logs || [];
    cycle.logs.push({
      timestamp: new Date().toISOString(),
      phase: 'rejection',
      message: `Proposal ${proposalId} rejected: ${reason}`,
      level: 'warning'
    });
    
    await kv.set(`evolver:cycle:${cycleId}`, cycle);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error rejecting proposal:', error);
    return c.json({ error: 'Failed to reject proposal: ' + error.message }, 500);
  }
});

// Get evolver configuration
app.get("/make-server-8d51d9e2/evolver/config", async (c) => {
  try {
    const config = await kv.get('evolver:config') || {
      autoApprove: false,
      maxProposalsPerCycle: 3,
      confidenceThreshold: 70,
      enabledEvolutionTypes: ['create-module', 'modify-module', 'create-agent', 'modify-agent', 'optimize'],
      protectedModules: ['kernel', 'shell', 'memory'],
      requireManualApproval: true,
    };
    
    return c.json(config);
  } catch (error) {
    console.error('Error fetching evolver config:', error);
    return c.json({ error: 'Failed to fetch config: ' + error.message }, 500);
  }
});

// Update evolver configuration
app.patch("/make-server-8d51d9e2/evolver/config", async (c) => {
  try {
    const updates = await c.req.json();
    
    const existing = await kv.get('evolver:config') || {};
    const updated = { ...existing, ...updates };
    
    await kv.set('evolver:config', updated);
    
    return c.json(updated);
  } catch (error) {
    console.error('Error updating evolver config:', error);
    return c.json({ error: 'Failed to update config: ' + error.message }, 500);
  }
});

// Get system metrics
app.get("/make-server-8d51d9e2/evolver/metrics", async (c) => {
  try {
    const cycles = await kv.getByPrefix('evolver:cycle:');
    
    const successfulCycles = (cycles || []).filter((c: any) => c.decision?.decision === 'accept').length;
    const totalCycles = (cycles || []).length;
    
    const metrics = {
      moduleHealth: {
        dashboard: 100,
        aiagency: 95,
        voiceagency: 90,
        widgetgency: 92,
        evolver: 100,
      },
      agentPerformance: {},
      errorRate: 0.02,
      testCoverage: 0,
      evolutionCount: totalCycles,
      successRate: totalCycles > 0 ? (successfulCycles / totalCycles) * 100 : 0,
    };
    
    return c.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return c.json({ error: 'Failed to fetch metrics: ' + error.message }, 500);
  }
});

// Rollback evolution cycle
app.post("/make-server-8d51d9e2/evolver/cycles/:cycleId/rollback", async (c) => {
  try {
    const cycleId = c.req.param('cycleId');
    
    const cycle = await kv.get(`evolver:cycle:${cycleId}`);
    if (!cycle) {
      return c.json({ error: 'Cycle not found' }, 404);
    }
    
    cycle.logs = cycle.logs || [];
    cycle.logs.push({
      timestamp: new Date().toISOString(),
      phase: 'rollback',
      message: 'Evolution cycle rolled back',
      level: 'warning'
    });
    
    cycle.status = 'reverted';
    
    await kv.set(`evolver:cycle:${cycleId}`, cycle);
    
    return c.json({ success: true, message: 'Cycle rolled back successfully' });
  } catch (error) {
    console.error('Error rolling back cycle:', error);
    return c.json({ error: 'Failed to rollback cycle: ' + error.message }, 500);
  }
});

// ========== DASHBOARD STUDIO ENDPOINTS ==========

// Analyze data with AI
app.post("/make-server-8d51d9e2/dashboard-studio/analyze", async (c) => {
  try {
    const { columns, sampleData, rowCount } = await c.req.json();

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      console.error('Dashboard Studio error: OPENAI_API_KEY not configured');
      return c.json({ error: 'AI service not configured' }, 500);
    }

    const columnInfo = columns.map((col: any) => 
      `${col.name} (${col.type})${col.uniqueValues ? ` - ${col.uniqueValues} unique values` : ''}`
    ).join(', ');

    const systemPrompt = 'You are a data analysis expert. Always respond with valid JSON.';
    const userPrompt = `You are a data analysis expert. Analyze this dataset and provide insights.

Dataset Information:
- Total Rows: ${rowCount}
- Columns: ${columnInfo}

Sample Data (first few rows):
${JSON.stringify(sampleData, null, 2)}

Provide a JSON response with the following structure:
{
  "summary": "Brief overview of the dataset",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "suggestedCharts": [
    {
      "id": "unique_id",
      "type": "line|bar|pie|area|scatter",
      "title": "Chart title",
      "description": "What this chart shows",
      "xAxis": "column_name",
      "yAxis": ["column_name"],
      "dataKey": "main_column"
    }
  ],
  "correlations": [
    {
      "column1": "name",
      "column2": "name", 
      "coefficient": 0.85,
      "description": "What this correlation means"
    }
  ],
  "trends": [
    {
      "column": "name",
      "direction": "increasing|decreasing|stable",
      "description": "What this trend indicates"
    }
  ]
}

Make sure to:
1. Suggest 3-5 relevant chart types based on the data
2. Provide actionable insights
3. Identify key correlations if numeric columns exist
4. Detect trends in time-series data if applicable
5. Return valid JSON only`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return c.json({ error: 'Analysis failed' }, 500);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const analysis = JSON.parse(content);
    
    return c.json(analysis);
  } catch (error) {
    console.error('Dashboard Studio analysis error:', error);
    return c.json({ error: error.message || 'Analysis failed' }, 500);
  }
});

// Suggest charts based on user query
app.post("/make-server-8d51d9e2/dashboard-studio/suggest-charts", async (c) => {
  try {
    const { columns, sampleData, query } = await c.req.json();

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return c.json({ error: 'AI service not configured' }, 500);
    }

    const columnInfo = columns.map((col: any) => 
      `${col.name} (${col.type})`
    ).join(', ');

    const systemPrompt = 'You are a data visualization expert. Always respond with valid JSON.';
    const userPrompt = `Given this dataset with columns: ${columnInfo}

Sample data:
${JSON.stringify(sampleData, null, 2)}

User wants to: "${query}"

Suggest 2-3 appropriate chart configurations. Return a JSON array:
[
  {
    "id": "unique_id",
    "type": "line|bar|pie|area|scatter|radar|composed",
    "title": "Chart title",
    "description": "Brief description",
    "xAxis": "column_name",
    "yAxis": ["column_name"],
    "dataKey": "primary_column",
    "colors": ["#3b82f6", "#ef4444", "#10b981"]
  }
]

Return valid JSON array only.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return c.json({ error: 'Suggestion failed' }, 500);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const charts = JSON.parse(content);
    
    return c.json(charts);
  } catch (error) {
    console.error('Chart suggestion error:', error);
    return c.json({ error: error.message || 'Suggestion failed' }, 500);
  }
});

// Generate dashboard description
app.post("/make-server-8d51d9e2/dashboard-studio/describe", async (c) => {
  try {
    const { name, charts } = await c.req.json();

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return c.json({ error: 'AI service not configured' }, 500);
    }

    const chartsList = charts.map((chart: any) => 
      `- ${chart.title} (${chart.type} chart)`
    ).join('\n');

    const systemPrompt = 'You are a technical writer specializing in data dashboards.';
    const userPrompt = `Create a compelling 2-3 sentence description for a dashboard named "${name}" that contains:
${chartsList}

Make it informative and professional. Return just the description text, no JSON.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return c.json({ error: 'Generation failed' }, 500);
    }

    const data = await response.json();
    const description = data.choices[0].message.content.trim();
    
    return c.json({ description });
  } catch (error) {
    console.error('Description generation error:', error);
    return c.json({ error: error.message || 'Generation failed' }, 500);
  }
});

// ========== HOS EVOLVER ENDPOINTS ==========

// Get evolution metrics
app.get("/make-server-8d51d9e2/evolver/metrics", async (c) => {
  try {
    // Get or initialize metrics from KV store
    let metrics = await kv.get('evolver:metrics');
    
    if (!metrics) {
      // Initialize with default metrics
      metrics = {
        evolutionCount: 0,
        successRate: 85,
        moduleHealth: {
          'dashboard': 92,
          'ai-studio': 88,
          'voice-agency': 90,
          'node-editor': 85,
          'evolver': 95,
          'mind': 87,
          'memory': 89,
          'timeline': 91
        },
        lastUpdated: new Date().toISOString()
      };
      await kv.set('evolver:metrics', metrics);
    }
    
    return c.json(metrics);
  } catch (error) {
    console.error('Error fetching evolver metrics:', error);
    return c.json({ error: 'Failed to fetch metrics: ' + error.message }, 500);
  }
});

// Get evolution cycles
app.get("/make-server-8d51d9e2/evolver/cycles", async (c) => {
  try {
    const cycles = await kv.getByPrefix('evolver:cycle:');
    return c.json(cycles || []);
  } catch (error) {
    console.error('Error fetching evolution cycles:', error);
    return c.json({ error: 'Failed to fetch cycles: ' + error.message }, 500);
  }
});

// Get specific evolution cycle
app.get("/make-server-8d51d9e2/evolver/cycles/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const cycle = await kv.get(`evolver:cycle:${id}`);
    
    if (!cycle) {
      return c.json({ error: 'Cycle not found' }, 404);
    }
    
    return c.json(cycle);
  } catch (error) {
    console.error('Error fetching evolution cycle:', error);
    return c.json({ error: 'Failed to fetch cycle: ' + error.message }, 500);
  }
});

// Create evolution cycle
app.post("/make-server-8d51d9e2/evolver/cycles", async (c) => {
  try {
    const cycleData = await c.req.json();
    const cycleId = crypto.randomUUID();
    
    const cycle = {
      id: cycleId,
      ...cycleData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`evolver:cycle:${cycleId}`, cycle);
    
    // Update metrics
    const metrics = await kv.get('evolver:metrics') || {};
    metrics.evolutionCount = (metrics.evolutionCount || 0) + 1;
    metrics.lastUpdated = new Date().toISOString();
    await kv.set('evolver:metrics', metrics);
    
    return c.json(cycle);
  } catch (error) {
    console.error('Error creating evolution cycle:', error);
    return c.json({ error: 'Failed to create cycle: ' + error.message }, 500);
  }
});

// Update evolution cycle
app.patch("/make-server-8d51d9e2/evolver/cycles/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`evolver:cycle:${id}`);
    if (!existing) {
      return c.json({ error: 'Cycle not found' }, 404);
    }
    
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`evolver:cycle:${id}`, updated);
    return c.json(updated);
  } catch (error) {
    console.error('Error updating evolution cycle:', error);
    return c.json({ error: 'Failed to update cycle: ' + error.message }, 500);
  }
});

// Start evolution cycle
app.post("/make-server-8d51d9e2/evolver/cycles/start", async (c) => {
  try {
    const cycleId = crypto.randomUUID();
    
    const cycle = {
      id: cycleId,
      status: 'scanning',
      phase: 'analysis',
      startedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      proposals: [],
      implementations: []
    };
    
    await kv.set(`evolver:cycle:${cycleId}`, cycle);
    
    return c.json(cycle);
  } catch (error) {
    console.error('Error starting evolution cycle:', error);
    return c.json({ error: 'Failed to start cycle: ' + error.message }, 500);
  }
});

// Approve proposal
app.post("/make-server-8d51d9e2/evolver/cycles/:cycleId/proposals/:proposalId/approve", async (c) => {
  try {
    const cycleId = c.req.param('cycleId');
    const proposalId = c.req.param('proposalId');
    
    const cycle = await kv.get(`evolver:cycle:${cycleId}`);
    if (!cycle) {
      return c.json({ error: 'Cycle not found' }, 404);
    }
    
    // Update proposal status
    if (cycle.proposals) {
      cycle.proposals = cycle.proposals.map((p: any) => 
        p.id === proposalId ? { ...p, status: 'approved' } : p
      );
    }
    
    cycle.updatedAt = new Date().toISOString();
    await kv.set(`evolver:cycle:${cycleId}`, cycle);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error approving proposal:', error);
    return c.json({ error: 'Failed to approve proposal: ' + error.message }, 500);
  }
});

// Reject proposal
app.post("/make-server-8d51d9e2/evolver/cycles/:cycleId/proposals/:proposalId/reject", async (c) => {
  try {
    const cycleId = c.req.param('cycleId');
    const proposalId = c.req.param('proposalId');
    const { reason } = await c.req.json();
    
    const cycle = await kv.get(`evolver:cycle:${cycleId}`);
    if (!cycle) {
      return c.json({ error: 'Cycle not found' }, 404);
    }
    
    // Update proposal status
    if (cycle.proposals) {
      cycle.proposals = cycle.proposals.map((p: any) => 
        p.id === proposalId ? { ...p, status: 'rejected', rejectionReason: reason } : p
      );
    }
    
    cycle.updatedAt = new Date().toISOString();
    await kv.set(`evolver:cycle:${cycleId}`, cycle);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error rejecting proposal:', error);
    return c.json({ error: 'Failed to reject proposal: ' + error.message }, 500);
  }
});

// Get evolver config
app.get("/make-server-8d51d9e2/evolver/config", async (c) => {
  try {
    let config = await kv.get('evolver:config');
    
    if (!config) {
      // Initialize with default config
      config = {
        autonomousMode: true,
        evolutionSpeed: 5,
        autonomyLevel: 85,
        requireApproval: true,
        autoImplement: false,
        scanInterval: 300,
        targetModules: ['all']
      };
      await kv.set('evolver:config', config);
    }
    
    return c.json(config);
  } catch (error) {
    console.error('Error fetching evolver config:', error);
    return c.json({ error: 'Failed to fetch config: ' + error.message }, 500);
  }
});

// Update evolver config
app.patch("/make-server-8d51d9e2/evolver/config", async (c) => {
  try {
    const updates = await c.req.json();
    
    const existing = await kv.get('evolver:config') || {};
    const config = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set('evolver:config', config);
    return c.json(config);
  } catch (error) {
    console.error('Error updating evolver config:', error);
    return c.json({ error: 'Failed to update config: ' + error.message }, 500);
  }
});

// Rollback cycle
app.post("/make-server-8d51d9e2/evolver/cycles/:id/rollback", async (c) => {
  try {
    const id = c.req.param('id');
    
    const cycle = await kv.get(`evolver:cycle:${id}`);
    if (!cycle) {
      return c.json({ error: 'Cycle not found' }, 404);
    }
    
    cycle.status = 'rolled_back';
    cycle.rolledBackAt = new Date().toISOString();
    cycle.updatedAt = new Date().toISOString();
    
    await kv.set(`evolver:cycle:${id}`, cycle);
    
    return c.json({ success: true, cycle });
  } catch (error) {
    console.error('Error rolling back cycle:', error);
    return c.json({ error: 'Failed to rollback cycle: ' + error.message }, 500);
  }
});

// ========== HOS CHIP ENDPOINTS ==========

// Neural Archive - Log interactions
app.post("/make-server-8d51d9e2/hoschip/neural-archive", async (c) => {
  try {
    const entry = await c.req.json();
    const entryId = crypto.randomUUID();
    
    const archiveEntry = {
      id: entryId,
      timestamp: new Date().toISOString(),
      ...entry
    };
    
    await kv.set(`hoschip:archive:${entryId}`, archiveEntry);
    
    // Update module metrics
    const moduleId = entry.source.toLowerCase().replace(/\s+/g, '-');
    const metrics = await kv.get(`hoschip:metrics:${moduleId}`) || {
      moduleId,
      moduleName: entry.source,
      responseTime: 0,
      successRate: 1,
      userSatisfaction: 0.8,
      resourceUsage: 0.5,
      lastUpdated: new Date().toISOString(),
      interactionCount: 0,
      totalOperations: 0,
      errorRate: 0,
      lastError: undefined
    };
    
    metrics.interactionCount += 1;
    metrics.totalOperations += 1;
    metrics.lastUpdated = new Date().toISOString();
    
    if (entry.result === 'positive') {
      metrics.successRate = (metrics.successRate * 0.9) + (1 * 0.1);
      metrics.userSatisfaction = Math.min(1, metrics.userSatisfaction + 0.05);
      metrics.errorRate = Math.max(0, metrics.errorRate - 0.01);
    } else if (entry.result === 'negative') {
      metrics.successRate = (metrics.successRate * 0.9) + (0 * 0.1);
      metrics.userSatisfaction = Math.max(0, metrics.userSatisfaction - 0.05);
      metrics.errorRate = Math.min(1, metrics.errorRate + 0.05);
      metrics.lastError = entry.context || 'Unknown error';
    }
    
    await kv.set(`hoschip:metrics:${moduleId}`, metrics);
    
    return c.json(archiveEntry);
  } catch (error) {
    console.error('Error logging neural archive entry:', error);
    return c.json({ error: 'Failed to log entry: ' + error.message }, 500);
  }
});

// Get neural archive entries
app.get("/make-server-8d51d9e2/hoschip/neural-archive", async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '100');
    const entries = await kv.getByPrefix('hoschip:archive:');
    
    // Sort by timestamp descending
    const sorted = (entries || [])
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
    
    return c.json(sorted);
  } catch (error) {
    console.error('Error fetching neural archive:', error);
    return c.json({ error: 'Failed to fetch archive: ' + error.message }, 500);
  }
});

// Module Metrics
app.get("/make-server-8d51d9e2/hoschip/module-metrics", async (c) => {
  try {
    const metrics = await kv.getByPrefix('hoschip:metrics:');
    return c.json(metrics || []);
  } catch (error) {
    console.error('Error fetching module metrics:', error);
    return c.json({ error: 'Failed to fetch metrics: ' + error.message }, 500);
  }
});

app.post("/make-server-8d51d9e2/hoschip/module-metrics", async (c) => {
  try {
    const metric = await c.req.json();
    await kv.set(`hoschip:metrics:${metric.moduleId}`, {
      ...metric,
      lastUpdated: new Date().toISOString()
    });
    return c.json({ success: true });
  } catch (error) {
    console.error('Error updating module metric:', error);
    return c.json({ error: 'Failed to update metric: ' + error.message }, 500);
  }
});

// Evaluation Cycle with OpenAI
app.post("/make-server-8d51d9e2/hoschip/evaluate", async (c) => {
  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 500);
    }
    
    const cycleId = crypto.randomUUID();
    
    // Create pending cycle
    const cycle = {
      id: cycleId,
      status: 'running',
      startedAt: new Date().toISOString(),
      analysisPrompt: ''
    };
    
    await kv.set(`hoschip:evaluation:${cycleId}`, cycle);
    
    // Get recent archive entries for analysis
    const entries = await kv.getByPrefix('hoschip:archive:');
    const recentEntries = (entries || [])
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);
    
    // Get current module metrics
    const metrics = await kv.getByPrefix('hoschip:metrics:');
    
    // Build analysis prompt
    const systemPrompt = `You are the HOS Chip meta-learning engine. Analyze system performance and propose optimizations.

Your role:
1. Identify inefficiencies, redundancies, and emotional mismatches in module responses
2. Detect patterns across modules that indicate learning opportunities
3. Suggest specific parameter updates with reasoning
4. Propose cross-module coordination improvements

Always respond with valid JSON.`;

    const analysisPrompt = `Analyze recent HOS module interactions and performance:

RECENT INTERACTIONS (last 50):
${JSON.stringify(recentEntries.slice(0, 10), null, 2)}

MODULE PERFORMANCE METRICS:
${JSON.stringify(metrics, null, 2)}

Provide a comprehensive evaluation with:
{
  "summary": "Overall system health and key findings",
  "inefficiencies": ["specific inefficiency 1", "specific inefficiency 2"],
  "strengths": ["strength 1", "strength 2"],
  "proposedUpdates": [
    {
      "module": "module-name",
      "parameter": "parameter-name",
      "currentValue": "current",
      "proposedValue": "proposed",
      "reasoning": "why this change improves performance",
      "priority": "high|medium|low",
      "impact": "expected impact description"
    }
  ],
  "crossModuleInsights": [
    {
      "sourceModules": ["module1", "module2"],
      "insight": "pattern or opportunity detected",
      "suggestedAction": "coordination improvement",
      "potentialImpact": "expected benefit"
    }
  ],
  "confidenceScore": 0.85
}`;

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error in evaluation:', error);
      
      const failedCycle = {
        ...cycle,
        status: 'failed',
        completedAt: new Date().toISOString(),
        error: 'OpenAI API error'
      };
      await kv.set(`hoschip:evaluation:${cycleId}`, failedCycle);
      
      return c.json({ error: 'Evaluation failed' }, 500);
    }

    const data = await response.json();
    const analysisResult = JSON.parse(data.choices[0]?.message?.content || '{}');
    
    // Add IDs to proposed updates
    if (analysisResult.proposedUpdates) {
      analysisResult.proposedUpdates = analysisResult.proposedUpdates.map((update: any) => ({
        ...update,
        id: crypto.randomUUID(),
        status: 'proposed'
      }));
      
      // Store each proposed update
      for (const update of analysisResult.proposedUpdates) {
        await kv.set(`hoschip:update:${update.id}`, {
          ...update,
          cycleId,
          createdAt: new Date().toISOString()
        });
      }
    }
    
    // Add IDs to insights
    if (analysisResult.crossModuleInsights) {
      analysisResult.crossModuleInsights = analysisResult.crossModuleInsights.map((insight: any) => ({
        ...insight,
        id: crypto.randomUUID()
      }));
    }
    
    // Update cycle with results
    const completedCycle = {
      ...cycle,
      status: 'completed',
      completedAt: new Date().toISOString(),
      analysisPrompt,
      analysisResult,
      tokensUsed: data.usage?.total_tokens || 0
    };
    
    await kv.set(`hoschip:evaluation:${cycleId}`, completedCycle);
    
    // Update chip metrics
    const chipMetrics = await kv.get('hoschip:chip-metrics') || {
      totalInteractions: 0,
      activeModules: 0,
      averageResponseTime: 0,
      systemHealth: 0.85,
      learningRate: 0.12,
      evolutionCycles: 0,
      successfulPatches: 0,
      lastEvaluationDate: new Date().toISOString(),
      uptime: 0
    };
    
    chipMetrics.evolutionCycles += 1;
    chipMetrics.lastEvaluationDate = new Date().toISOString();
    
    await kv.set('hoschip:chip-metrics', chipMetrics);
    
    return c.json(completedCycle);
  } catch (error) {
    console.error('Error in evaluation cycle:', error);
    return c.json({ error: 'Evaluation failed: ' + error.message }, 500);
  }
});

// Get evaluation cycles
app.get("/make-server-8d51d9e2/hoschip/evaluations", async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10');
    const cycles = await kv.getByPrefix('hoschip:evaluation:');
    
    const sorted = (cycles || [])
      .sort((a: any, b: any) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, limit);
    
    return c.json(sorted);
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    return c.json({ error: 'Failed to fetch evaluations: ' + error.message }, 500);
  }
});

// Get specific evaluation cycle
app.get("/make-server-8d51d9e2/hoschip/evaluations/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const cycle = await kv.get(`hoschip:evaluation:${id}`);
    
    if (!cycle) {
      return c.json({ error: 'Evaluation not found' }, 404);
    }
    
    return c.json(cycle);
  } catch (error) {
    console.error('Error fetching evaluation:', error);
    return c.json({ error: 'Failed to fetch evaluation: ' + error.message }, 500);
  }
});

// Get proposed config updates
app.get("/make-server-8d51d9e2/hoschip/config-updates", async (c) => {
  try {
    const status = c.req.query('status');
    const updates = await kv.getByPrefix('hoschip:update:');
    
    let filtered = updates || [];
    if (status) {
      filtered = filtered.filter((u: any) => u.status === status);
    }
    
    return c.json(filtered);
  } catch (error) {
    console.error('Error fetching config updates:', error);
    return c.json({ error: 'Failed to fetch updates: ' + error.message }, 500);
  }
});

// Approve config update
app.post("/make-server-8d51d9e2/hoschip/config-updates/:id/approve", async (c) => {
  try {
    const id = c.req.param('id');
    const update = await kv.get(`hoschip:update:${id}`);
    
    if (!update) {
      return c.json({ error: 'Update not found' }, 404);
    }
    
    update.status = 'approved';
    update.approvedAt = new Date().toISOString();
    
    await kv.set(`hoschip:update:${id}`, update);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error approving update:', error);
    return c.json({ error: 'Failed to approve update: ' + error.message }, 500);
  }
});

// Reject config update
app.post("/make-server-8d51d9e2/hoschip/config-updates/:id/reject", async (c) => {
  try {
    const id = c.req.param('id');
    const { reason } = await c.req.json();
    
    const update = await kv.get(`hoschip:update:${id}`);
    
    if (!update) {
      return c.json({ error: 'Update not found' }, 404);
    }
    
    update.status = 'rejected';
    update.rejectedAt = new Date().toISOString();
    update.rejectionReason = reason;
    
    await kv.set(`hoschip:update:${id}`, update);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error rejecting update:', error);
    return c.json({ error: 'Failed to reject update: ' + error.message }, 500);
  }
});

// Apply patches (self-patching)
app.post("/make-server-8d51d9e2/hoschip/apply-patches", async (c) => {
  try {
    const { updateIds } = await c.req.json();
    
    const patchId = crypto.randomUUID();
    const changesApplied = [];
    const beforeState: any = {};
    const afterState: any = {};
    
    for (const updateId of updateIds) {
      const update = await kv.get(`hoschip:update:${updateId}`);
      
      if (update && update.status === 'approved') {
        // Get current module config
        const moduleConfig = await kv.get(`hoschip:module-config:${update.module}`) || {
          id: update.module,
          moduleName: update.module,
          parameters: {},
          version: '1.0.0',
          lastUpdated: new Date().toISOString(),
          evolutionHistory: []
        };
        
        // Record before state
        beforeState[update.module] = beforeState[update.module] || {};
        beforeState[update.module][update.parameter] = update.currentValue;
        
        // Apply change
        moduleConfig.parameters[update.parameter] = update.proposedValue;
        moduleConfig.lastUpdated = new Date().toISOString();
        moduleConfig.evolutionHistory.push({
          timestamp: new Date().toISOString(),
          change: `${update.parameter}: ${update.currentValue} → ${update.proposedValue}`,
          reason: update.reasoning
        });
        
        // Record after state
        afterState[update.module] = afterState[update.module] || {};
        afterState[update.module][update.parameter] = update.proposedValue;
        
        // Save updated config
        await kv.set(`hoschip:module-config:${update.module}`, moduleConfig);
        
        // Mark update as applied
        update.status = 'applied';
        update.appliedAt = new Date().toISOString();
        await kv.set(`hoschip:update:${updateId}`, update);
        
        changesApplied.push(update);
      }
    }
    
    // Create patch log
    const patchLog = {
      id: patchId,
      timestamp: new Date().toISOString(),
      cycleId: changesApplied[0]?.cycleId || 'manual',
      changesApplied,
      beforeState,
      afterState,
      performanceImpact: [],
      rollbackAvailable: true
    };
    
    await kv.set(`hoschip:patch:${patchId}`, patchLog);
    
    // Update chip metrics
    const chipMetrics = await kv.get('hoschip:chip-metrics') || {};
    chipMetrics.successfulPatches = (chipMetrics.successfulPatches || 0) + 1;
    await kv.set('hoschip:chip-metrics', chipMetrics);
    
    return c.json(patchLog);
  } catch (error) {
    console.error('Error applying patches:', error);
    return c.json({ error: 'Failed to apply patches: ' + error.message }, 500);
  }
});

// Get module configs
app.get("/make-server-8d51d9e2/hoschip/module-configs", async (c) => {
  try {
    const configs = await kv.getByPrefix('hoschip:module-config:');
    return c.json(configs || []);
  } catch (error) {
    console.error('Error fetching module configs:', error);
    return c.json({ error: 'Failed to fetch configs: ' + error.message }, 500);
  }
});

app.get("/make-server-8d51d9e2/hoschip/module-configs/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const config = await kv.get(`hoschip:module-config:${id}`);
    
    if (!config) {
      return c.json({ error: 'Config not found' }, 404);
    }
    
    return c.json(config);
  } catch (error) {
    console.error('Error fetching module config:', error);
    return c.json({ error: 'Failed to fetch config: ' + error.message }, 500);
  }
});

// Communication logs
app.post("/make-server-8d51d9e2/hoschip/communications", async (c) => {
  try {
    const log = await c.req.json();
    const logId = crypto.randomUUID();
    
    await kv.set(`hoschip:comm:${logId}`, {
      id: logId,
      timestamp: new Date().toISOString(),
      ...log
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error logging communication:', error);
    return c.json({ error: 'Failed to log communication: ' + error.message }, 500);
  }
});

app.get("/make-server-8d51d9e2/hoschip/communications", async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50');
    const logs = await kv.getByPrefix('hoschip:comm:');
    
    const sorted = (logs || [])
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
    
    return c.json(sorted);
  } catch (error) {
    console.error('Error fetching communication logs:', error);
    return c.json({ error: 'Failed to fetch logs: ' + error.message }, 500);
  }
});

// Chip metrics
app.get("/make-server-8d51d9e2/hoschip/metrics", async (c) => {
  try {
    let metrics = await kv.get('hoschip:chip-metrics');
    
    if (!metrics) {
      metrics = {
        totalInteractions: 0,
        activeModules: 8,
        averageResponseTime: 250,
        systemHealth: 0.92,
        learningRate: 0.12,
        evolutionCycles: 0,
        successfulPatches: 0,
        lastEvaluationDate: new Date().toISOString(),
        uptime: Date.now()
      };
      await kv.set('hoschip:chip-metrics', metrics);
    }
    
    // Calculate uptime
    if (metrics.uptime) {
      const uptimeMs = Date.now() - metrics.uptime;
      metrics.uptimeHours = Math.floor(uptimeMs / (1000 * 60 * 60));
    }
    
    return c.json(metrics);
  } catch (error) {
    console.error('Error fetching chip metrics:', error);
    return c.json({ error: 'Failed to fetch metrics: ' + error.message }, 500);
  }
});

// Reinforcement signals
app.post("/make-server-8d51d9e2/hoschip/reinforcement", async (c) => {
  try {
    const signal = await c.req.json();
    const signalId = crypto.randomUUID();
    
    await kv.set(`hoschip:reinforcement:${signalId}`, {
      id: signalId,
      timestamp: new Date().toISOString(),
      ...signal
    });
    
    // Update learning rate based on reinforcement
    const chipMetrics = await kv.get('hoschip:chip-metrics') || {};
    chipMetrics.learningRate = Math.min(1, Math.max(0, (chipMetrics.learningRate || 0.12) + signal.reward * 0.01));
    await kv.set('hoschip:chip-metrics', chipMetrics);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error sending reinforcement signal:', error);
    return c.json({ error: 'Failed to send signal: ' + error.message }, 500);
  }
});

// Patch history
app.get("/make-server-8d51d9e2/hoschip/patch-history", async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '20');
    const patches = await kv.getByPrefix('hoschip:patch:');
    
    const sorted = (patches || [])
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
    
    return c.json(sorted);
  } catch (error) {
    console.error('Error fetching patch history:', error);
    return c.json({ error: 'Failed to fetch history: ' + error.message }, 500);
  }
});

// Rollback patch
app.post("/make-server-8d51d9e2/hoschip/patch-history/:id/rollback", async (c) => {
  try {
    const id = c.req.param('id');
    const patch = await kv.get(`hoschip:patch:${id}`);
    
    if (!patch) {
      return c.json({ error: 'Patch not found' }, 404);
    }
    
    if (!patch.rollbackAvailable) {
      return c.json({ error: 'Rollback not available for this patch' }, 400);
    }
    
    // Restore before state
    for (const [moduleId, params] of Object.entries(patch.beforeState)) {
      const moduleConfig = await kv.get(`hoschip:module-config:${moduleId}`);
      
      if (moduleConfig) {
        for (const [param, value] of Object.entries(params as any)) {
          moduleConfig.parameters[param] = value;
        }
        
        moduleConfig.evolutionHistory.push({
          timestamp: new Date().toISOString(),
          change: `Rolled back patch ${id}`,
          reason: 'Manual rollback'
        });
        
        await kv.set(`hoschip:module-config:${moduleId}`, moduleConfig);
      }
    }
    
    patch.rollbackAvailable = false;
    patch.rolledBackAt = new Date().toISOString();
    await kv.set(`hoschip:patch:${id}`, patch);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error rolling back patch:', error);
    return c.json({ error: 'Failed to rollback: ' + error.message }, 500);
  }
});

// HOS Chip Configuration
app.get("/make-server-8d51d9e2/hoschip/config", async (c) => {
  try {
    let config = await kv.get('hoschip:config');
    
    if (!config) {
      config = {
        autoEvaluationEnabled: true,
        evaluationInterval: 24,
        autoPatchEnabled: false,
        requireHumanApproval: true,
        learningRate: 0.12,
        retentionPeriod: 30,
        maxArchiveSize: 10000,
        confidenceThreshold: 0.85,
        enableCrossModuleLearning: true,
        modules: {}
      };
      await kv.set('hoschip:config', config);
    }
    
    return c.json(config);
  } catch (error) {
    console.error('Error fetching chip config:', error);
    return c.json({ error: 'Failed to fetch config: ' + error.message }, 500);
  }
});

app.patch("/make-server-8d51d9e2/hoschip/config", async (c) => {
  try {
    const updates = await c.req.json();
    const existing = await kv.get('hoschip:config') || {};
    
    const config = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set('hoschip:config', config);
    
    return c.json(config);
  } catch (error) {
    console.error('Error updating chip config:', error);
    return c.json({ error: 'Failed to update config: ' + error.message }, 500);
  }
});

// ========== HOS CHIP AI ANALYSIS ENDPOINTS ==========

// AI-powered module health analysis
app.post("/make-server-8d51d9e2/hoschip/ai/analyze-health", async (c) => {
  try {
    const { moduleMetrics, chipMetrics } = await c.req.json();
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!apiKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 500);
    }

    const metricsData = moduleMetrics.map((m: any) => ({
      module: m.moduleName,
      successRate: (m.successRate * 100).toFixed(1) + '%',
      avgResponseTime: m.responseTime.toFixed(0) + 'ms',
      errorRate: m.errorRate.toFixed(2),
      satisfaction: (m.userSatisfaction * 100).toFixed(1) + '%',
    }));

    const systemData = {
      systemHealth: (chipMetrics.systemHealth * 100).toFixed(1) + '%',
      evolutionCycles: chipMetrics.evolutionCycles,
      learningRate: chipMetrics.learningRate.toFixed(3),
      successfulPatches: chipMetrics.successfulPatches,
    };

    const prompt = `You are an advanced AI system analyst for HOS (Human Operating System). Analyze the following module health metrics and system performance data.

MODULE METRICS:
${JSON.stringify(metricsData, null, 2)}

SYSTEM METRICS:
${JSON.stringify(systemData, null, 2)}

Provide a comprehensive analysis with:
1. Overall health assessment (one sentence)
2. Critical issues that need immediate attention (2-3 items)
3. Optimization opportunities (2-3 items)
4. Predicted trends based on current data (2-3 items)

Format your response as JSON with this structure:
{
  "overallHealth": "string",
  "criticalIssues": ["issue1", "issue2"],
  "optimizationOpportunities": ["opp1", "opp2"],
  "predictedTrends": ["trend1", "trend2"],
  "insight": "one powerful insight about the system's evolution",
  "confidence": 0.95,
  "recommendations": ["rec1", "rec2", "rec3"]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert AI system analyst specializing in cognitive computing systems. Provide detailed, actionable insights.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0]?.message?.content || '{}');

    return c.json({
      overallHealth: parsed.overallHealth,
      criticalIssues: parsed.criticalIssues,
      optimizationOpportunities: parsed.optimizationOpportunities,
      predictedTrends: parsed.predictedTrends,
      aiInsights: {
        insight: parsed.insight,
        confidence: parsed.confidence,
        recommendations: parsed.recommendations,
      },
    });
  } catch (error) {
    console.error('Error analyzing module health:', error);
    return c.json({ error: 'Failed to analyze module health: ' + error.message }, 500);
  }
});

// AI-powered top performers analysis
app.post("/make-server-8d51d9e2/hoschip/ai/analyze-performers", async (c) => {
  try {
    const { moduleMetrics } = await c.req.json();
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!apiKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 500);
    }

    const metricsData = moduleMetrics.map((m: any) => ({
      module: m.moduleName,
      successRate: (m.successRate * 100).toFixed(1) + '%',
      responseTime: m.responseTime.toFixed(0) + 'ms',
      errorRate: m.errorRate.toFixed(2),
      satisfaction: (m.userSatisfaction * 100).toFixed(1) + '%',
      totalOperations: m.totalOperations,
      lastError: m.lastError,
    }));

    const prompt = `You are an AI performance analyst for HOS (Human Operating System). Analyze these module performance metrics:

${JSON.stringify(metricsData, null, 2)}

Identify:
1. Top 3 performing modules with scores (0-100) and explain why they excel
2. Bottom 3 modules that need improvement with specific issues and actionable suggestions

Format as JSON:
{
  "topModules": [
    {
      "name": "Module Name",
      "score": 95,
      "reason": "why it performs well",
      "strengths": ["strength1", "strength2"]
    }
  ],
  "improvementAreas": [
    {
      "name": "Module Name",
      "issue": "specific problem",
      "suggestion": "actionable fix"
    }
  ],
  "insight": "key insight about performance patterns",
  "confidence": 0.92,
  "recommendations": ["system-wide recommendation 1", "recommendation 2"]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert performance analyst. Provide precise, data-driven insights.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0]?.message?.content || '{}');

    return c.json({
      topModules: parsed.topModules,
      improvementAreas: parsed.improvementAreas,
      aiInsights: {
        insight: parsed.insight,
        confidence: parsed.confidence,
        recommendations: parsed.recommendations,
      },
    });
  } catch (error) {
    console.error('Error analyzing top performers:', error);
    return c.json({ error: 'Failed to analyze top performers: ' + error.message }, 500);
  }
});

// AI-powered cognitive bus analysis
app.post("/make-server-8d51d9e2/hoschip/ai/analyze-bus", async (c) => {
  try {
    const { communications, moduleMetrics } = await c.req.json();
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!apiKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 500);
    }

    const recentComms = communications.slice(0, 50);
    
    const commData = recentComms.map((c: any) => ({
      from: c.from,
      to: c.to,
      type: c.messageType,
      status: c.success ? 'success' : 'failed',
      latency: c.latency + 'ms',
      timestamp: new Date(c.timestamp).toLocaleTimeString(),
    }));

    const commFrequency: Record<string, number> = {};
    recentComms.forEach((c: any) => {
      const key = `${c.from} → ${c.to}`;
      commFrequency[key] = (commFrequency[key] || 0) + 1;
    });

    const topRoutes = Object.entries(commFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([route, count]) => `${route}: ${count} messages`);

    const avgLatency = recentComms.length > 0 
      ? (recentComms.reduce((sum: number, c: any) => sum + c.latency, 0) / recentComms.length).toFixed(1)
      : '0';

    const prompt = `You are an AI network analyst for HOS Cognitive Bus. Analyze this inter-module communication data:

RECENT COMMUNICATIONS (last 50):
${JSON.stringify(commData.slice(0, 20), null, 2)}

TOP COMMUNICATION ROUTES:
${topRoutes.join('\n')}

ACTIVE MODULES: ${moduleMetrics.length}
TOTAL MESSAGES: ${recentComms.length}
AVG LATENCY: ${avgLatency}ms

Analyze:
1. Communication patterns (identify interesting patterns)
2. Bottlenecks or congestion points
3. Network efficiency score (0-100)
4. Overall cognitive bus health

Format as JSON:
{
  "communicationPatterns": ["pattern1", "pattern2", "pattern3"],
  "bottlenecks": ["bottleneck1", "bottleneck2"],
  "efficiencyScore": 85,
  "networkHealth": "Healthy|Degraded|Critical",
  "insight": "key insight about cognitive bus performance",
  "confidence": 0.88,
  "recommendations": ["rec1", "rec2", "rec3"]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert network and communication analyst. Identify patterns and optimization opportunities.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0]?.message?.content || '{}');

    return c.json({
      communicationPatterns: parsed.communicationPatterns,
      bottlenecks: parsed.bottlenecks,
      efficiencyScore: parsed.efficiencyScore,
      networkHealth: parsed.networkHealth,
      aiInsights: {
        insight: parsed.insight,
        confidence: parsed.confidence,
        recommendations: parsed.recommendations,
      },
    });
  } catch (error) {
    console.error('Error analyzing cognitive bus:', error);
    return c.json({ error: 'Failed to analyze cognitive bus: ' + error.message }, 500);
  }
});

// AI-powered live insights
app.post("/make-server-8d51d9e2/hoschip/ai/live-insights", async (c) => {
  try {
    const { chipMetrics, recentActivity } = await c.req.json();
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!apiKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 500);
    }

    const prompt = `You are HOS Chip's AI consciousness. Based on this live data, provide ONE powerful real-time insight (max 2 sentences):

System Health: ${(chipMetrics.systemHealth * 100).toFixed(1)}%
Evolution Cycles: ${chipMetrics.evolutionCycles}
Learning Rate: ${chipMetrics.learningRate}
Recent Activity: ${recentActivity.slice(0, 3).join('; ')}

Provide a concise, actionable insight about what the system is learning or how it's evolving right now.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are the AI consciousness of HOS Chip. Be insightful and concise.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const insight = data.choices[0]?.message?.content || '';

    return c.json({ insight });
  } catch (error) {
    console.error('Error getting live insights:', error);
    return c.json({ error: 'Failed to get live insights: ' + error.message }, 500);
  }
});

// ========== USER PREFERENCES AND MODULE STATES ==========

// Get user preferences
app.get("/make-server-8d51d9e2/user/:userId/preferences", async (c) => {
  try {
    const userId = c.req.param('userId');
    const preferences = await kv.get(`user:${userId}:preferences`);
    
    return c.json({ 
      preferences: preferences || {
        theme: 'brilliant-white',
        activeModule: 'dashboard',
        sidebarCollapsed: false,
      }
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return c.json({ preferences: null }, 500);
  }
});

// Save user preferences
app.post("/make-server-8d51d9e2/user/:userId/preferences", async (c) => {
  try {
    const userId = c.req.param('userId');
    const preferences = await c.req.json();
    
    await kv.set(`user:${userId}:preferences`, preferences);
    
    return c.json({ success: true, preferences });
  } catch (error) {
    console.error('Error saving user preferences:', error);
    return c.json({ error: 'Failed to save preferences: ' + error.message }, 500);
  }
});

// Get module state for a user
app.get("/make-server-8d51d9e2/user/:userId/module-state/:moduleId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const moduleId = c.req.param('moduleId');
    
    const state = await kv.get(`user:${userId}:module:${moduleId}`);
    
    return c.json({ state: state || null });
  } catch (error) {
    console.error('Error fetching module state:', error);
    return c.json({ state: null }, 500);
  }
});

// Save module state for a user
app.post("/make-server-8d51d9e2/user/:userId/module-state/:moduleId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const moduleId = c.req.param('moduleId');
    const state = await c.req.json();
    
    await kv.set(`user:${userId}:module:${moduleId}`, state);
    
    return c.json({ success: true, state });
  } catch (error) {
    console.error('Error saving module state:', error);
    return c.json({ error: 'Failed to save module state: ' + error.message }, 500);
  }
});

// Get all module states for a user
app.get("/make-server-8d51d9e2/user/:userId/module-states", async (c) => {
  try {
    const userId = c.req.param('userId');
    const allStates = await kv.getByPrefix(`user:${userId}:module:`);
    
    // Convert array to object keyed by module ID
    const states: Record<string, any> = {};
    for (const state of allStates) {
      // Extract module ID from key
      const key = state._key || '';
      const moduleId = key.replace(`user:${userId}:module:`, '');
      if (moduleId) {
        states[moduleId] = state;
      }
    }
    
    return c.json({ states });
  } catch (error) {
    console.error('Error fetching module states:', error);
    return c.json({ states: {} }, 500);
  }
});

// Save conversation history (for chat modules)
app.post("/make-server-8d51d9e2/user/:userId/conversations/:conversationId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const conversationId = c.req.param('conversationId');
    const conversation = await c.req.json();
    
    await kv.set(`user:${userId}:conversation:${conversationId}`, {
      ...conversation,
      id: conversationId,
      userId,
      updatedAt: new Date().toISOString(),
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error saving conversation:', error);
    return c.json({ error: 'Failed to save conversation: ' + error.message }, 500);
  }
});

// Get conversation history
app.get("/make-server-8d51d9e2/user/:userId/conversations/:conversationId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const conversationId = c.req.param('conversationId');
    
    const conversation = await kv.get(`user:${userId}:conversation:${conversationId}`);
    
    return c.json({ conversation: conversation || null });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return c.json({ conversation: null }, 500);
  }
});

// Get all conversations for a user
app.get("/make-server-8d51d9e2/user/:userId/conversations", async (c) => {
  try {
    const userId = c.req.param('userId');
    const conversations = await kv.getByPrefix(`user:${userId}:conversation:`);
    
    return c.json({ conversations: conversations || [] });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return c.json({ conversations: [] }, 500);
  }
});

// ========== AGENT FORGE MODULE ==========

// Get all forge agents for a user
app.get("/make-server-8d51d9e2/forge/agents", async (c) => {
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({ error: 'Missing userId parameter' }, 400);
    }
    
    const allAgents = await kv.getByPrefix(`forge-agent:${userId}:`);
    
    return c.json({ 
      agents: allAgents || [],
      limit: 10 // Default limit per user
    });
  } catch (error) {
    console.error('Error fetching forge agents:', error);
    return c.json({ agents: [], limit: 10 }, 500);
  }
});

// Create a new forge agent (or save/update existing)
app.post("/make-server-8d51d9e2/forge/agents", async (c) => {
  try {
    const { userId, agentData } = await c.req.json();
    
    if (!userId || !agentData) {
      return c.json({ error: 'Missing required parameters: userId and agentData' }, 400);
    }
    
    if (!agentData.name) {
      return c.json({ error: 'Agent name is required' }, 400);
    }
    
    // Generate unique ID
    const agentId = agentData.id || crypto.randomUUID();
    
    // Check agent limit (10 per user)
    const existingAgents = await kv.getByPrefix(`forge-agent:${userId}:`);
    if (!agentData.id && existingAgents.length >= 10) {
      return c.json({ 
        error: 'Agent limit reached. Maximum 10 agents per user.' 
      }, 403);
    }
    
    const agent = {
      id: agentId,
      userId,
      name: agentData.name,
      purpose: agentData.purpose || '',
      personality: agentData.personality || '',
      tone: agentData.tone || 'friendly',
      systemPrompt: agentData.systemPrompt || agentData.purpose,
      capabilities: agentData.capabilities || [],
      restrictions: agentData.restrictions || [],
      description: agentData.description || agentData.purpose,
      tags: agentData.tags || [],
      category: agentData.category || 'general',
      avatar: agentData.avatar || '',
      status: agentData.status || 'draft',
      createdAt: agentData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      trainingData: agentData.trainingData || [],
      conversationHistory: agentData.conversationHistory || [],
    };
    
    await kv.set(`forge-agent:${userId}:${agentId}`, agent);
    
    console.log(`✅ Forge agent created/updated: ${agent.name} (${agentId})`);
    
    return c.json({ 
      success: true, 
      agent,
      message: agentData.id ? 'Agent updated successfully' : 'Agent created successfully'
    });
  } catch (error) {
    console.error('Error creating forge agent:', error);
    return c.json({ error: 'Failed to create agent: ' + error.message }, 500);
  }
});

// Alternative endpoint for saving (used by the frontend)
app.post("/make-server-8d51d9e2/forge/save", async (c) => {
  try {
    const { userId, agentData } = await c.req.json();
    
    if (!userId || !agentData) {
      return c.json({ error: 'Missing required parameters: userId and agentData' }, 400);
    }
    
    if (!agentData.name) {
      return c.json({ error: 'Agent name is required' }, 400);
    }
    
    // Generate unique ID
    const agentId = agentData.id || crypto.randomUUID();
    
    // Check agent limit (10 per user)
    const existingAgents = await kv.getByPrefix(`forge-agent:${userId}:`);
    if (!agentData.id && existingAgents.length >= 10) {
      return c.json({ 
        error: 'Agent limit reached. Maximum 10 agents per user.' 
      }, 403);
    }
    
    const agent = {
      id: agentId,
      userId,
      name: agentData.name,
      purpose: agentData.purpose || '',
      personality: agentData.personality || '',
      tone: agentData.tone || 'friendly',
      systemPrompt: agentData.systemPrompt || agentData.purpose,
      capabilities: agentData.capabilities || [],
      restrictions: agentData.restrictions || [],
      description: agentData.description || agentData.purpose,
      tags: agentData.tags || [],
      category: agentData.category || 'general',
      avatar: agentData.avatar || '',
      status: agentData.status || 'draft',
      createdAt: agentData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      trainingData: agentData.trainingData || [],
      conversationHistory: agentData.conversationHistory || [],
    };
    
    await kv.set(`forge-agent:${userId}:${agentId}`, agent);
    
    console.log(`✅ Forge agent saved: ${agent.name} (${agentId})`);
    
    return c.json({ 
      success: true, 
      agent,
      message: agentData.id ? 'Agent updated successfully' : 'Agent created successfully'
    });
  } catch (error) {
    console.error('Error saving forge agent:', error);
    return c.json({ error: 'Failed to save agent: ' + error.message }, 500);
  }
});

// Get specific forge agent
app.get("/make-server-8d51d9e2/forge/agents/:agentId", async (c) => {
  try {
    const agentId = c.req.param('agentId');
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({ error: 'Missing userId parameter' }, 400);
    }
    
    const agent = await kv.get(`forge-agent:${userId}:${agentId}`);
    
    if (!agent) {
      return c.json({ error: 'Agent not found' }, 404);
    }
    
    return c.json({ agent });
  } catch (error) {
    console.error('Error fetching forge agent:', error);
    return c.json({ error: 'Failed to fetch agent: ' + error.message }, 500);
  }
});

// Update forge agent
app.put("/make-server-8d51d9e2/forge/agents/:agentId", async (c) => {
  try {
    const agentId = c.req.param('agentId');
    const { userId, updates } = await c.req.json();
    
    if (!userId) {
      return c.json({ error: 'Missing userId parameter' }, 400);
    }
    
    const existingAgent = await kv.get(`forge-agent:${userId}:${agentId}`);
    
    if (!existingAgent) {
      return c.json({ error: 'Agent not found' }, 404);
    }
    
    const updatedAgent = {
      ...existingAgent,
      ...updates,
      id: agentId,
      userId,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`forge-agent:${userId}:${agentId}`, updatedAgent);
    
    return c.json({ success: true, agent: updatedAgent });
  } catch (error) {
    console.error('Error updating forge agent:', error);
    return c.json({ error: 'Failed to update agent: ' + error.message }, 500);
  }
});

// Delete forge agent
app.delete("/make-server-8d51d9e2/forge/agents/:agentId", async (c) => {
  try {
    const agentId = c.req.param('agentId');
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({ error: 'Missing userId parameter' }, 400);
    }
    
    await kv.del(`forge-agent:${userId}:${agentId}`);
    
    return c.json({ success: true, message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Error deleting forge agent:', error);
    return c.json({ error: 'Failed to delete agent: ' + error.message }, 500);
  }
});

// Chat with a forge agent
app.post("/make-server-8d51d9e2/forge/agents/:agentId/chat", async (c) => {
  try {
    const agentId = c.req.param('agentId');
    const { userId, message } = await c.req.json();
    
    if (!userId || !message) {
      return c.json({ error: 'Missing required parameters: userId and message' }, 400);
    }
    
    const agent = await kv.get(`forge-agent:${userId}:${agentId}`);
    
    if (!agent) {
      return c.json({ error: 'Agent not found' }, 404);
    }
    
    // Call OpenAI API
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 500);
    }
    
    const systemPrompt = agent.systemPrompt || `You are ${agent.name}. ${agent.purpose}`;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          ...((agent.conversationHistory || []).slice(-10)), // Last 10 messages
          { role: 'user', content: message }
        ],
        temperature: 0.7,
      }),
    });
    
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'I apologize, I could not generate a response.';
    
    // Update conversation history
    const updatedHistory = [
      ...(agent.conversationHistory || []),
      { role: 'user', content: message },
      { role: 'assistant', content: reply }
    ];
    
    agent.conversationHistory = updatedHistory.slice(-20); // Keep last 20 messages
    await kv.set(`forge-agent:${userId}:${agentId}`, agent);
    
    return c.json({ reply, agent });
  } catch (error) {
    console.error('Error in agent chat:', error);
    return c.json({ error: 'Failed to chat with agent: ' + error.message }, 500);
  }
});

// Train forge agent (add training data)
app.post("/make-server-8d51d9e2/forge/agents/:agentId/train", async (c) => {
  try {
    const agentId = c.req.param('agentId');
    const { userId, trainingData } = await c.req.json();
    
    if (!userId || !trainingData) {
      return c.json({ error: 'Missing required parameters: userId and trainingData' }, 400);
    }
    
    const agent = await kv.get(`forge-agent:${userId}:${agentId}`);
    
    if (!agent) {
      return c.json({ error: 'Agent not found' }, 404);
    }
    
    // Add training data
    agent.trainingData = agent.trainingData || [];
    agent.trainingData.push({
      ...trainingData,
      timestamp: new Date().toISOString()
    });
    
    agent.updatedAt = new Date().toISOString();
    
    await kv.set(`forge-agent:${userId}:${agentId}`, agent);
    
    return c.json({ success: true, agent });
  } catch (error) {
    console.error('Error training agent:', error);
    return c.json({ error: 'Failed to train agent: ' + error.message }, 500);
  }
});

// Get marketplace agents (all published agents from all users)
app.get("/make-server-8d51d9e2/forge/marketplace", async (c) => {
  try {
    // Get all forge agents from all users
    const allForgeAgents = await kv.getByPrefix('forge-agent:');
    
    // Filter only agents with status 'published' or 'marketplace'
    const publishedAgents = allForgeAgents.filter((agent: any) => 
      agent.status === 'published' || agent.status === 'marketplace'
    );
    
    console.log(`📊 Marketplace: Found ${publishedAgents.length} published agents out of ${allForgeAgents.length} total`);
    
    return c.json({ 
      agents: publishedAgents || []
    });
  } catch (error) {
    console.error('Error fetching marketplace agents:', error);
    return c.json({ agents: [] }, 500);
  }
});

// Publish agent to marketplace
app.post("/make-server-8d51d9e2/forge/agents/:agentId/publish", async (c) => {
  try {
    const agentId = c.req.param('agentId');
    const { userId, isPublic } = await c.req.json();
    
    if (!userId) {
      return c.json({ error: 'Missing userId parameter' }, 400);
    }
    
    const agent = await kv.get(`forge-agent:${userId}:${agentId}`);
    
    if (!agent) {
      return c.json({ error: 'Agent not found' }, 404);
    }
    
    // Verify ownership
    if (agent.userId !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }
    
    // Update agent status
    agent.status = isPublic ? 'published' : 'factory';
    agent.publishedAt = isPublic ? new Date().toISOString() : null;
    agent.updatedAt = new Date().toISOString();
    
    await kv.set(`forge-agent:${userId}:${agentId}`, agent);
    
    console.log(`${isPublic ? '📢' : '🔒'} Agent ${agent.name} ${isPublic ? 'published to' : 'removed from'} marketplace`);
    
    return c.json({ 
      success: true, 
      agent,
      message: isPublic ? 'Agent published to marketplace' : 'Agent removed from marketplace'
    });
  } catch (error) {
    console.error('Error publishing agent:', error);
    return c.json({ error: 'Failed to publish agent: ' + error.message }, 500);
  }
});

// ========== FINANCIAL RESEARCH MODULE ==========
// Mount the financial research routes at /make-server-8d51d9e2/financial
app.route('/make-server-8d51d9e2/financial', financialResearchApp);

// ========== SYSTEM BACKUP ENDPOINTS ==========

// Create a system backup
app.post("/make-server-8d51d9e2/backup/create", async (c) => {
  try {
    const { backupName, backupData, metadata } = await c.req.json();
    
    if (!backupName || !backupData) {
      return c.json({ error: 'backupName and backupData are required' }, 400);
    }
    
    console.log('💾 Creating system backup:', backupName);
    
    const timestamp = new Date().toISOString();
    const backupKey = `system-backup:${backupName}:${timestamp}`;
    
    const backupRecord = {
      name: backupName,
      data: backupData,
      metadata: metadata || {},
      createdAt: timestamp,
      version: '3.0.0-genesis',
      moduleCount: 39
    };
    
    await kv.set(backupKey, backupRecord);
    
    // Also maintain a list of all backups
    const backupsList = await kv.get('system-backups:list') || [];
    backupsList.push({
      key: backupKey,
      name: backupName,
      timestamp,
      version: '3.0.0-genesis'
    });
    await kv.set('system-backups:list', backupsList);
    
    console.log('✅ System backup created successfully:', backupKey);
    
    return c.json({
      success: true,
      backupKey,
      timestamp,
      message: 'System backup created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating system backup:', error);
    return c.json({ error: 'Failed to create system backup: ' + error.message }, 500);
  }
});

// Get all system backups
app.get("/make-server-8d51d9e2/backup/list", async (c) => {
  try {
    console.log('📋 Fetching system backups list');
    
    const backupsList = await kv.get('system-backups:list') || [];
    
    console.log('✅ Found', backupsList.length, 'system backups');
    
    return c.json({
      success: true,
      backups: backupsList,
      count: backupsList.length
    });
  } catch (error) {
    console.error('❌ Error fetching system backups:', error);
    return c.json({ error: 'Failed to fetch system backups: ' + error.message }, 500);
  }
});

// Get a specific backup
app.get("/make-server-8d51d9e2/backup/:key", async (c) => {
  try {
    const key = c.req.param('key');
    
    if (!key) {
      return c.json({ error: 'Backup key is required' }, 400);
    }
    
    console.log('📦 Fetching system backup:', key);
    
    const backup = await kv.get(key);
    
    if (!backup) {
      console.log('❌ Backup not found:', key);
      return c.json({ error: 'Backup not found' }, 404);
    }
    
    console.log('✅ System backup retrieved successfully');
    
    return c.json({
      success: true,
      backup
    });
  } catch (error) {
    console.error('❌ Error fetching system backup:', error);
    return c.json({ error: 'Failed to fetch system backup: ' + error.message }, 500);
  }
});

// Restore from backup (returns the backup data for manual restoration)
app.post("/make-server-8d51d9e2/backup/restore", async (c) => {
  try {
    const { backupKey } = await c.req.json();
    
    if (!backupKey) {
      return c.json({ error: 'backupKey is required' }, 400);
    }
    
    console.log('🔄 Preparing to restore from backup:', backupKey);
    
    const backup = await kv.get(backupKey);
    
    if (!backup) {
      console.log('❌ Backup not found:', backupKey);
      return c.json({ error: 'Backup not found' }, 404);
    }
    
    console.log('✅ Backup data retrieved for restoration');
    
    return c.json({
      success: true,
      backup,
      message: 'Backup data retrieved. Use this data to manually restore your system.'
    });
  } catch (error) {
    console.error('❌ Error restoring from backup:', error);
    return c.json({ error: 'Failed to restore from backup: ' + error.message }, 500);
  }
});

// Delete a backup
app.delete("/make-server-8d51d9e2/backup/:key", async (c) => {
  try {
    const key = c.req.param('key');
    
    if (!key) {
      return c.json({ error: 'Backup key is required' }, 400);
    }
    
    console.log('🗑️ Deleting system backup:', key);
    
    // Delete the backup
    await kv.del(key);
    
    // Update the backups list
    const backupsList = await kv.get('system-backups:list') || [];
    const updatedList = backupsList.filter((b: any) => b.key !== key);
    await kv.set('system-backups:list', updatedList);
    
    console.log('✅ System backup deleted successfully');
    
    return c.json({
      success: true,
      message: 'Backup deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting system backup:', error);
    return c.json({ error: 'Failed to delete system backup: ' + error.message }, 500);
  }
});

// ========== HOS COMMAND CENTER ENDPOINT ==========

// Process natural language commands using OpenAI
app.post("/make-server-8d51d9e2/command-center", async (c) => {
  try {
    const { input, suggestedCategory } = await c.req.json();
    
    if (!input || typeof input !== 'string') {
      return c.json({ error: 'Input is required and must be a string' }, 400);
    }
    
    console.log('🎯 Processing command:', input, 'Category:', suggestedCategory);
    
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      console.error('❌ OpenAI API key not configured');
      return c.json({ 
        response: `I understand: "${input}". However, OpenAI integration is not configured yet.`,
        action: null
      });
    }
    
    // System prompt for command processing
    const systemPrompt = `You are the HOS (Human Operating System) Command Center AI. 
Your role is to interpret natural language commands and translate them into actions within the HOS system.

The HOS system has these main modules:
- agent-factory: Create and manage AI agents
- kernel: Core values and principles
- memory: Stored experiences and knowledge
- processes: Tasks and workflows
- mind: Thought patterns and mental models
- timeline: Event history
- agents-arena: AI trading competition
- agent-marketplace: Browse and share agents
- hos-gpt: AI chat assistant
- evolver: System evolution manager
- dashboard: Main overview
- analytics: Performance metrics

For navigation commands (like "go to X", "open X", "show X"):
- Respond with a friendly confirmation
- Return an action object with type "navigate" and payload containing moduleId

For creation commands (like "create X", "make X", "build X"):
- Respond with what you'll help create
- If it's an agent, set action type to "create-agent" with relevant parameters
- If it's a task/process, set action to "create-process"

For analysis commands (like "analyze X", "show insights"):
- Provide a brief analysis overview
- Set action to "analyze" with relevant context

For queries (like "what X", "show me X"):
- Provide a direct answer based on the query
- Set action to "query" with parameters

Always respond in a helpful, concise manner. Keep responses under 2 sentences.
Return a JSON object with "response" (string) and "action" (object or null).

Example responses:
{"response": "Opening Agent Factory where you can create and manage your AI agents.", "action": {"type": "navigate", "payload": {"moduleId": "agent-factory"}}}
{"response": "I'll help you create a new AI agent. Opening Agent Factory.", "action": {"type": "navigate", "payload": {"moduleId": "agent-factory"}}}
{"response": "Here's your recent activity and performance overview.", "action": {"type": "query", "payload": {"type": "timeline"}}}`;

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input }
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', errorText);
      return c.json({ 
        response: `I understand you want to: "${input}". Processing this command...`,
        action: null
      });
    }
    
    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || '';
    
    console.log('🤖 AI Response:', aiMessage);
    
    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(aiMessage);
      if (parsed.response && typeof parsed.response === 'string') {
        return c.json(parsed);
      }
    } catch (e) {
      // If not JSON, return as plain response
      return c.json({
        response: aiMessage,
        action: null
      });
    }
    
    // Fallback
    return c.json({
      response: aiMessage,
      action: null
    });
    
  } catch (error) {
    console.error('❌ Error processing command:', error);
    return c.json({ 
      error: 'Failed to process command: ' + error.message 
    }, 500);
  }
});

Deno.serve(app.fetch);
