/**
 * Runs a list of declared actions, in order.
 *
 *  - Malformed action, invalid core payload or no handler → reported, skipped;
 *    the rest of the list still runs.
 *  - A handler that throws → reported and the list STOPS, because later
 *    actions may depend on it (e.g. "save, then navigate").
 */

import type { ActionContext, ActionHandler, ActionHandlers } from './action-handlers';
import { ActionSchema, coreActionSchemas, isCoreActionType } from '../contract/action';
import type { IssueReporter } from '../contract/issues';

export async function runActions(
  list: unknown[],
  handlers: ActionHandlers,
  report: IssueReporter,
  context: ActionContext,
): Promise<void> {
  for (const raw of list) {
    const parsed = ActionSchema.safeParse(raw);
    if (!parsed.success) {
      report({ code: 'invalid_action', message: 'Action without a valid "type"', sectionId: context.sectionId });
      continue;
    }

    const action = parsed.data;
    let handler: ActionHandler<unknown> | undefined;
    let payload: unknown = action.payload;

    if (isCoreActionType(action.type)) {
      // Core payloads are strict: a bad one never reaches its handler.
      const strict = coreActionSchemas[action.type].safeParse(action.payload ?? {});
      if (!strict.success) {
        const issue = strict.error.issues[0];
        report({
          code: 'invalid_action',
          actionType: action.type,
          sectionId: context.sectionId,
          message: `${issue?.path.join('.') || 'payload'}: ${issue?.message ?? 'invalid payload'}`,
        });
        continue;
      }
      payload = strict.data;
      handler = handlers[action.type] as ActionHandler<unknown>;
    } else {
      handler = handlers.custom?.[action.type] as ActionHandler<unknown> | undefined;
    }

    if (!handler) {
      report({ code: 'unhandled_action', actionType: action.type, sectionId: context.sectionId, message: 'No handler registered' });
      continue;
    }

    try {
      await handler(payload, context);
    } catch (error) {
      report({
        code: 'action_failed',
        actionType: action.type,
        sectionId: context.sectionId,
        message: `${error instanceof Error ? error.message : String(error)} (remaining actions skipped)`,
      });
      break;
    }
  }
}
