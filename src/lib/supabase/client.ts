import { createBrowserClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_URL.includes('placeholder')) {
    const errorMsg = 'CRITICAL: Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing. ' +
      'Please ensure they are set in your .env.local file and restart your development server.';
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error(errorMsg);
    }
    
    console.error(errorMsg);
    // Still return the client to prevent crash, but it will fail clearly
    return createBrowserClient(
      SUPABASE_URL || 'https://missing-url.supabase.co',
      SUPABASE_KEY || 'missing-key'
    );
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
}

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && url.startsWith('https://') && !url.includes('placeholder');
}
