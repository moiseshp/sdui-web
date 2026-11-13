/**
 * Section registry: `type` → { version, props schema, view }.
 *
 * `View` is whatever the platform renders with (a React component, a Flutter
 * widget builder). This file does not care: it only needs type, version and
 * schema to decide IF a section can be rendered.
 */

import type * as z from 'zod';

export interface SectionDefinition<P, View> {
  /** Must match `section.type` in the contract. */
  type: string;
  /** Highest props version this client can render. */
  version: number;
  /** Contract of the props. Validated before the view ever runs. */
  schema: z.ZodType<P>;
  view: View;
}

export type SectionRegistry<View> = Readonly<Record<string, SectionDefinition<unknown, View>>>;

/**
 * One registry per screen (home, plp, checkout...): each screen lists the
 * sections it renders, picked from the shared catalog. A section the screen
 * does not list is skipped and reported as `unknown_type`.
 */
export function createRegistry<View>(definitions: SectionDefinition<unknown, View>[]): SectionRegistry<View> {
  return Object.freeze(Object.fromEntries(definitions.map(definition => [definition.type, definition])));
}
