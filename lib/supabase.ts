/**
 * Supabase client for this project. It only knows how to connect (URL and
 * publishable key from the environment); what to read is decided by whoever
 * uses it (e.g. app/get-screen-home.ts).
 *
 * Server only: the variables are not NEXT_PUBLIC_, so they never reach the
 * browser bundle. Not part of SDUI: it is just the backend this demo uses.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

/** Created on first use, so local development on mocks needs no Supabase config. */
export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Faltan SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY (ver web/.env.example).');

  // No user sessions on the server: nothing to persist or refresh.
  client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}
