import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { parseScreen, type Screen } from '@/lib/sdui/contract/screen';

export async function getScreen(screenId: string): Promise<Screen> {
  const payload = await fromSupabase(screenId);

  // Development without a backend: use the mock instead of the line above
  // (and uncomment `fromMock` at the end of this file). Never commit it.
  // const payload = await fromMock();

  const parsed = parseScreen(payload);
  if (!parsed.ok) throw new Error(`invalid_screen: ${parsed.message}`);
  return parsed.screen;
}

/** The `sdui_screens` view has one row per screen: `screen_id` and `payload` (the Screen JSON). */
async function fromSupabase(screenId: string): Promise<unknown> {
  const { data, error } = await supabase()
    .from('sdui_screens')
    .select('payload')
    .eq('screen_id', screenId)
    .single();
  if (error) throw error;
  return data.payload;
}

let client: SupabaseClient | undefined;

/** Created on first use, so the mock works without any Supabase variable. */
function supabase(): SupabaseClient {
  return (client ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  ));
}

// async function fromMock(): Promise<unknown> {
//   return (await import('@/mocks/home.json')).default;
// }
