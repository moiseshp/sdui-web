/**
 * Actions and triggers: what the payload says should HAPPEN.
 *
 *   trigger  a named moment (onMount, onView, onPress)
 *   action   `{ type, payload? }`, run in order when its trigger fires
 *
 * Actions are validated one by one when they are dispatched (see
 * actions/run-actions.ts), never together with the screen: one bad action
 * must not hide the section that holds it.
 */

import * as z from 'zod';

/** Minimum shape of any action. Unknown types are valid here; the runtime decides what to do with them. */
export const ActionSchema = z.object({
  type: z.string().min(1),
  payload: z.record(z.string(), z.unknown()).optional(),
});
export type Action = z.infer<typeof ActionSchema>;

/**
 * Core actions: every platform must implement these. Their payloads are
 * strictly validated; a core action with a bad payload never reaches its handler.
 *
 * NAVIGATE uses a platform-agnostic `route` id, never a web path: web and
 * Flutter each resolve it to their own navigation.
 */
export const coreActionSchemas = {
  NAVIGATE: z.object({
    route: z.string().min(1),
    params: z.record(z.string(), z.string()).optional(),
  }),
  TRACK_EVENT: z.object({
    name: z.string().min(1),
    params: z.record(z.string(), z.unknown()).optional(),
  }),
  OPEN_URL: z.object({
    // Only http(s): blocks `javascript:` and friends coming from a payload.
    url: z.url({ protocol: /^https?$/ }),
  }),
};

export type CoreActionType = keyof typeof coreActionSchemas;
export type CorePayload<K extends CoreActionType> = z.infer<(typeof coreActionSchemas)[K]>;

export function isCoreActionType(type: string): type is CoreActionType {
  return Object.hasOwn(coreActionSchemas, type);
}

/**
 * Triggers: named moments bound to a list of actions.
 *   onMount (screen) · onView (section) · onPress (any pressable element)
 * Items stay `unknown` so one malformed action never invalidates the props around it.
 */
export const TriggersSchema = z.record(z.string(), z.array(z.unknown()));
export type Triggers = z.infer<typeof TriggersSchema>;

/** Reusable call-to-action shape, shared by many sections. */
export const CtaSchema = z.object({
  label: z.string().min(1),
  actions: TriggersSchema.optional(),
});
export type Cta = z.infer<typeof CtaSchema>;
