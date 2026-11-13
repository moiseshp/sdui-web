/**
 * Screen and Section: what the backend SENDS, as seen by a client.
 *
 * Validation is layered on purpose, so a problem stays as small as possible:
 *   Screen  → only the envelope; a broken one means there is nothing to render.
 *   Section → validated one by one (registry/resolve-section.ts); a broken one is skipped.
 *   Props   → validated by each section's own schema (see /sections).
 *   Action  → validated one by one when it is dispatched (see action.ts).
 */

import * as z from 'zod';
import { TriggersSchema } from './action';

/** Major version of the envelope this client understands. Minor/patch bumps are always compatible. */
export const SUPPORTED_SCHEMA_MAJOR = 1;

/**
 * Enum that DEGRADES instead of failing.
 *
 * The backend will add values (a new theme, a new variant) long before every
 * installed app knows them. An unknown value falls back to `fallback` instead
 * of invalidating the section or the whole screen.
 */
export function semanticEnum<const T extends readonly [string, ...string[]]>(values: T, fallback: T[number]) {
  return z.enum(values).catch(fallback);
}

/* -------------------------------------------------------------------------- */
/* Section                                                                     */
/* -------------------------------------------------------------------------- */

export const SectionSchema = z.object({
  /** Stable id: React key, analytics, debugging. */
  id: z.string().min(1),
  /** Which component renders it. */
  type: z.string().min(1),
  /** Shape version of `props`. Bumps only on breaking changes. */
  version: z.number().int().positive().default(1),
  /** Validated later by the section's own schema. */
  props: z.unknown().optional(),
  actions: TriggersSchema.optional(),
});
export type Section = z.infer<typeof SectionSchema>;

/* -------------------------------------------------------------------------- */
/* Screen                                                                      */
/* -------------------------------------------------------------------------- */

/** Screen-level visual intent. Each platform maps it to its own tokens. */
export const ThemeSchema = semanticEnum(['default', 'loyalty', 'christmas', 'valentine', 'rush'], 'default');

/**
 * Named slots (v1.1). The screen has three regions, each one rendered with the
 * same Section envelope and the same registry:
 *
 *   header     one section, pinned to the top     (Flutter: Scaffold.appBar)
 *   sections   the scrollable body, in order      (Flutter: Scaffold.body)
 *   bottomBar  one section, pinned to the bottom  (Flutter: Scaffold.bottomNavigationBar)
 *
 * The SLOT decides the behavior (pinned, safe areas); the section only decides
 * how it looks. Both slots are optional: an absent one is simply not rendered.
 */
export const ScreenSchema = z.object({
  schemaVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
  screenId: z.string().min(1),
  theme: ThemeSchema,
  /** Kept as `unknown`: validated like any other section, so a broken header only hides the header. */
  header: z.unknown().optional(),
  /** Kept as `unknown[]`: each section is validated on its own by the renderer. */
  sections: z.array(z.unknown()),
  /** Kept as `unknown`, same as `header`. */
  bottomBar: z.unknown().optional(),
  actions: TriggersSchema.optional(),
  meta: z
    .object({
      title: z.string().optional(),
      experiment: z.object({ id: z.string(), variant: z.string() }).optional(),
    })
    .optional(),
});
export type Screen = z.infer<typeof ScreenSchema>;

export type ParseScreenResult = { ok: true; screen: Screen } | { ok: false; message: string };

/**
 * Never throws: the caller decides what to show when the envelope is unusable.
 * This is the one function a fetch needs from the library, whatever does the
 * fetching (plain fetch, TanStack Query, a Flutter repository).
 */
export function parseScreen(input: unknown): ParseScreenResult {
  const parsed = ScreenSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, message: `${issue?.path.join('.') || '(root)'}: ${issue?.message ?? 'invalid screen'}` };
  }

  const major = Number(parsed.data.schemaVersion.split('.')[0]);
  if (major > SUPPORTED_SCHEMA_MAJOR) {
    return { ok: false, message: `schemaVersion ${parsed.data.schemaVersion} is newer than ${SUPPORTED_SCHEMA_MAJOR}.x` };
  }

  return { ok: true, screen: parsed.data };
}
