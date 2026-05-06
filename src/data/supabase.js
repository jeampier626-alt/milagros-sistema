import { createClient } from "@supabase/supabase-js";

// These will be set via environment variables in Vercel
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

export const hasSupabase = () => !!supabase;

// ── LocalStorage fallback ─────────────────────────────────────────────────
// Used when Supabase is not configured yet (offline / local dev)
const LS_KEY = "milagros_data";

export const saveLocal = (data) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("localStorage save failed", e);
  }
};

export const loadLocal = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const clearLocal = () => localStorage.removeItem(LS_KEY);
