import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// CONFIGURACIÓN DE SUPABASE
// ------------------------------------------------------------------

// URL del proyecto
const MANUAL_URL = "https://huvgpizfwvdfjehzeydw.supabase.co";

// Clave Pública (anon / publishable)
// IMPORTANTE: Ve a Project Settings > API > Project API keys > anon public
// Debe empezar por "ey..." (Es un token JWT largo).
// Si lo dejas vacío, la app usará datos de prueba (Mock Mode).
const MANUAL_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1dmdwaXpmd3ZkZmplaHpleWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzU0ODMsImV4cCI6MjA4MjUxMTQ4M30.Xl0UpVqPY6yU-grQ3ZnBoyUeXAEGT360sWj2fI8SjqM";

// ------------------------------------------------------------------

// Helper to find env variable across different bundlers (Vite vs Webpack/CRA)
const getEnv = (key: string) => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    return import.meta.env[`VITE_${key}`] || import.meta.env[key];
  }
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env) {
    // @ts-ignore
    return process.env[`REACT_APP_${key}`] || process.env[key];
  }
  return '';
};

export const SUPABASE_URL = MANUAL_URL || getEnv('SUPABASE_URL');
export const SUPABASE_ANON_KEY = MANUAL_ANON_KEY || getEnv('SUPABASE_ANON_KEY');

// Initialize client
// If no keys are provided, we create a client pointing to a placeholder to avoid crashes,
// but isSupabaseConfigured() will return false so we don't actually use it.
export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-key',
  {
    auth: {
      detectSessionInUrl: false,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

export const isSupabaseConfigured = () => {
  return !!(
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    !SUPABASE_URL.includes('placeholder') &&
    SUPABASE_ANON_KEY.startsWith('ey') // Standard Supabase JWT check
  );
};

// --- DEBUG LOGGING ---
console.log('%c SUPABASE CONFIGURATION STATUS ', 'background: #222; color: #bada55; font-size: 14px; padding: 4px;');
console.log('URL Configured:', !!SUPABASE_URL, SUPABASE_URL ? `(${SUPABASE_URL})` : '');
console.log('Key Configured:', !!SUPABASE_ANON_KEY, SUPABASE_ANON_KEY ? '(Masked: ' + SUPABASE_ANON_KEY.substring(0, 10) + '...)' : '');
console.log('Is Configured Check:', isSupabaseConfigured());

if (isSupabaseConfigured()) {
  console.log('%c Attempting connection test... ', 'color: #007bff');
  supabase.from('products').select('count', { count: 'exact', head: true })
    .then(({ count, error }) => {
      if (error) {
        console.error('%c CONNECTION FAILED ', 'background: red; color: white; padding: 4px;', error.message);
      } else {
        console.log('%c CONNECTION SUCCESSFUL ', 'background: green; color: white; padding: 4px;', `Found ${count} products.`);
      }
    });
} else {
  console.warn('Supabase is NOT fully configured. App is running in Mock Mode.');
}