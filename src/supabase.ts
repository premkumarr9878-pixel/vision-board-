/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
  !supabaseAnonKey.includes('YOUR_');

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

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createDummyClient();
