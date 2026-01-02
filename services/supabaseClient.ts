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
const MANUAL_ANON_KEY = ""; 

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

const SUPABASE_URL = MANUAL_URL || getEnv('SUPABASE_URL');
const SUPABASE_ANON_KEY = MANUAL_ANON_KEY || getEnv('SUPABASE_ANON_KEY');

// Initialize client
// If no keys are provided, we create a client pointing to a placeholder to avoid crashes,
// but isSupabaseConfigured() will return false so we don't actually use it.
export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co', 
  SUPABASE_ANON_KEY || 'placeholder-key'
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