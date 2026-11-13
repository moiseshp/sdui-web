/**
 * What every platform MUST implement to run a screen.
 *
 * The four core handlers are required: if a platform forgets one, it does
 * not compile (TypeScript here, an abstract class in Dart). App-specific
 * actions go in `custom`, so the shared surface stays small and explicit.
 */

import type { CorePayload } from '../contract/action';

/** Where an action was fired from. Handlers use it, e.g. to tag analytics. */
export interface ActionContext {
  screenId?: string;
  sectionId?: string;
  experiment?: { id: string; variant: string };
}

export type ActionHandler<P> = (payload: P, context: ActionContext) => void | Promise<void>;

export interface ActionHandlers {
  NAVIGATE: ActionHandler<CorePayload<'NAVIGATE'>>;
  TRACK_EVENT: ActionHandler<CorePayload<'TRACK_EVENT'>>;
  OPEN_URL: ActionHandler<CorePayload<'OPEN_URL'>>;
  SHOW_MESSAGE: ActionHandler<CorePayload<'SHOW_MESSAGE'>>;
  custom?: Record<string, ActionHandler<Record<string, unknown> | undefined>>;
}
