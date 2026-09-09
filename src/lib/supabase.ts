import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { safeStorage } from '../utils/safeStorage';

const DEFAULT_SUPABASE_URL = 'https://ubdulhtzwfynlbskjhti.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZHVsaHR6d2Z5bmxic2tqaHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NzM5ODgsImV4cCI6MjEwMDU0OTk4OH0.cgVnqdXuWLSGQa9SMKd5Cs7Qt9oYstTHTwFdrFiNnkU';

// Get credentials from either Vite Env, LocalStorage or Default Cloud Instance
export function getSupabaseCredentials(): { url: string; anonKey: string } {
  let localUrl = (safeStorage.getItem('elbahdja_supabase_url') || '').trim();
  let localKey = (safeStorage.getItem('elbahdja_supabase_anon_key') || '').trim();

  // If localStorage contains placeholder values, clean them out
  if (localUrl.includes('your-project-id')) {
    safeStorage.removeItem('elbahdja_supabase_url');
    localUrl = '';
  }
  if (localKey.includes('your-anon-public-key')) {
    safeStorage.removeItem('elbahdja_supabase_anon_key');
    localKey = '';
  }

  const envUrl = (import.meta.env?.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env?.VITE_SUPABASE_ANON_KEY || '').trim();

  const validEnvUrl = (!envUrl || envUrl.includes('your-project-id')) ? '' : envUrl;
  const validEnvKey = (!envKey || envKey.includes('your-anon-public-key')) ? '' : envKey;

  const url = localUrl || validEnvUrl || DEFAULT_SUPABASE_URL;
  const anonKey = localKey || validEnvKey || DEFAULT_SUPABASE_ANON_KEY;

  return { url, anonKey };
}

let currentClient: SupabaseClient | null = null;
let currentUrl = '';
let currentKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();

  if (!url || !anonKey || url.includes('your-project-id') || anonKey.includes('your-anon-public-key')) {
    return null;
  }

  if (!currentClient || currentUrl !== url || currentKey !== anonKey) {
    try {
      currentClient = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      currentUrl = url;
      currentKey = anonKey;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return currentClient;
}

// Bootstrap credentials from server /api/config if needed
if (typeof window !== 'undefined') {
  fetch('/api/config')
    .then((r) => r.json())
    .then((cfg) => {
      if (cfg?.supabase?.url && cfg?.supabase?.anonKey && !cfg.supabase.url.includes('your-project-id')) {
        const current = getSupabaseCredentials();
        if (!current.url || current.url.includes('your-project-id')) {
          saveSupabaseCredentials(cfg.supabase.url, cfg.supabase.anonKey);
        }
      }
    })
    .catch(() => {
      // Offline or dev server starting
    });
}

export function saveSupabaseCredentials(url: string, anonKey: string): boolean {
  safeStorage.setItem('elbahdja_supabase_url', url.trim());
  safeStorage.setItem('elbahdja_supabase_anon_key', anonKey.trim());
  currentClient = null;
  currentUrl = '';
  currentKey = '';
  return true;
}

export function clearSupabaseCredentials(): void {
  safeStorage.removeItem('elbahdja_supabase_url');
  safeStorage.removeItem('elbahdja_supabase_anon_key');
  currentClient = null;
  currentUrl = '';
  currentKey = '';
}

export const isSupabaseConfigured = (): boolean => {
  return getSupabaseClient() !== null;
};

// Export active client proxy
export const supabase = {
  get client(): SupabaseClient | null {
    return getSupabaseClient();
  }
};
