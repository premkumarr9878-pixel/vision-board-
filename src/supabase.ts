/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '').replace(/\/rest\/v1$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Stricter check: only consider Supabase configured if both URL and key are valid (not placeholders)
const hasValidSupabaseUrl = supabaseUrl && 
  !supabaseUrl.includes('example.supabase.co') && 
  !supabaseUrl.includes('your-project.supabase.co') &&
  !supabaseUrl.includes('xdlzkcitimwwjrylanid.supabase.co'); // The example URL from .env.example

const hasValidSupabaseKey = supabaseAnonKey && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
  !supabaseAnonKey.includes('YOUR_');

export const isSupabaseConfigured = hasValidSupabaseUrl && hasValidSupabaseKey;

if (!isSupabaseConfigured) {
   console.debug('Supabase credentials missing or invalid! The app will run in local-only mode. Please check your .env file.');
 }

// Create a dummy client if not configured to avoid any network calls or 403 errors.
// This is a minimal mock that matches the methods used in the application.
const createDummyClient = () => {
  const mockResponse = { data: null, error: null };
  const mockPromise = Promise.resolve(mockResponse);
  
  const client: any = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInAnonymously: () => mockPromise,
      signInWithPassword: () => mockPromise,
      signUp: () => mockPromise,
      signOut: () => mockPromise,
    },
    from: () => client,
    select: () => client,
    eq: () => client,
    match: () => client,
    order: () => client,
    limit: () => client,
    single: () => mockPromise,
    maybeSingle: () => mockPromise,
    insert: () => client,
    update: () => client,
    delete: () => client,
    rpc: () => mockPromise,
    channel: () => ({
      on: () => ({
        subscribe: () => ({ unsubscribe: () => {} })
      }),
      subscribe: () => ({ unsubscribe: () => {} })
    }),
    removeChannel: () => {},
  };
  return client;
};

export const supabase = (() => {
  if (!isSupabaseConfigured) {
    return createDummyClient();
  }
  
  try {
    // Try to create real client, but if it fails, use dummy client
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.debug('Failed to create Supabase client, falling back to local-only mode:', err);
    return createDummyClient();
  }
})();
