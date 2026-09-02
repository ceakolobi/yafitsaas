/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? '') as string;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '') as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Yafit] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não configurados. Usando modo localStorage.');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;

// Helper: Verifica se o Supabase está disponível
export function isSupabaseAvailable(): boolean {
  return !!supabase;
}
