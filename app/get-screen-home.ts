/**
 * Gets the home screen, already built by the backend, and validates it.
 * Runs on the server (see page.tsx): the browser receives a validated Screen.
 *
 * Source:
 *   Supabase  always in production. Reads the `sdui_screens` view, one row per
 *             screen: `screen_id` (text) and `payload` (jsonb, the Screen JSON).
 *             How that JSON is built is the backend's job; this only reads it.
 *   mocks     only in local development (`npm run dev` + SCREEN_SOURCE=mocks):
 *             the mock server, which works offline.
 */

import { getSupabase } from '@/lib/supabase';
import { reportIssue } from '@/lib/sdui/contract/issues';
import { parseScreen, type Screen } from '@/lib/sdui/contract/screen';

const SCREEN_ID = 'home';
const USE_MOCKS = process.env.NODE_ENV === 'development' && process.env.SCREEN_SOURCE === 'mocks';

export async function getScreenHome(): Promise<Screen> {
  const body = USE_MOCKS ? await fromMocks() : await fromSupabase();

  const parsed = parseScreen(body);
  if (!parsed.ok) {
    reportIssue({ code: 'invalid_screen', message: parsed.message });
    throw new Error('La pantalla llegó con un formato que esta versión no entiende.');
  }
  return parsed.screen;
}

async function fromSupabase(): Promise<unknown> {
  const { data, error } = await getSupabase()
    .from('sdui_screens')
    .select('payload')
    .eq('screen_id', SCREEN_ID)
    .maybeSingle();

  if (error) {
    console.error('[supabase]', error); // `hint` usually says how to fix it.
    throw new Error(`Supabase respondió con un error: ${error.message}`);
  }
  if (!data) throw new Error(`La vista sdui_screens no tiene la pantalla "${SCREEN_ID}".`);
  return data.payload;
}

async function fromMocks(): Promise<unknown> {
  const url = process.env.SDUI_MOCKS_URL ?? 'http://localhost:4000';
  let response: Response;
  try {
    response = await fetch(`${url}/screens/${SCREEN_ID}`, { cache: 'no-store' });
  } catch {
    throw new Error('No se pudo conectar con el servidor de mocks. ¿Está corriendo (node mocks/server.mjs)?');
  }
  if (!response.ok) throw new Error(`El servidor de mocks respondió con un error (HTTP ${response.status}).`);
  return response.json();
}
