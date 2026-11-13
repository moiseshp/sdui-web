'use client';

/**
 * Makes the platform's action handlers and issue reporter available to every
 * section, and keeps track of WHERE an action is fired from (screen, section).
 */

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import type { ActionContext, ActionHandlers } from './action-handlers';
import { reportIssue, type IssueReporter } from '../contract/issues';
import { runActions } from './run-actions';

interface Runtime {
  handlers: ActionHandlers;
  report: IssueReporter;
}

const RuntimeContext = createContext<Runtime | null>(null);
const ScopeContext = createContext<ActionContext>({});

export interface SduiProviderProps {
  handlers: ActionHandlers;
  /** Called for every issue. Default: `reportIssue` (the console). Plug Sentry, Datadog... here. */
  onIssue?: IssueReporter;
  children: ReactNode;
}

export function SduiProvider({ handlers, onIssue, children }: SduiProviderProps) {
  const runtime = useMemo<Runtime>(
    () => ({ handlers, report: onIssue ?? reportIssue }),
    [handlers, onIssue],
  );
  return <RuntimeContext.Provider value={runtime}>{children}</RuntimeContext.Provider>;
}

function useRuntime(): Runtime {
  const runtime = useContext(RuntimeContext);
  if (!runtime) throw new Error('SDUI components must be rendered inside <SduiProvider>.');
  return runtime;
}

export function useIssueReporter(): IssueReporter {
  return useRuntime().report;
}

/** Adds screen/section info to every action fired inside it. Used by the renderer. */
export function ActionScope({ value, children }: { value: ActionContext; children: ReactNode }) {
  const parent = useContext(ScopeContext);
  const merged = useMemo(() => ({ ...parent, ...value }), [parent, value]);
  return <ScopeContext.Provider value={merged}>{children}</ScopeContext.Provider>;
}

/** `dispatch(actions)` bound to the current scope. Triggers use it. */
export function useDispatch() {
  const { handlers, report } = useRuntime();
  const scope = useContext(ScopeContext);
  return useCallback(
    (actions: unknown[] | undefined) => runActions(actions ?? [], handlers, report, scope),
    [handlers, report, scope],
  );
}
