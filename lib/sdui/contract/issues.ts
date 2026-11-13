/**
 * Everything that did not go as the contract says. Nothing fails silently:
 * each case is reported with one of these codes, so monitoring (and the
 * backend team) can see when a payload was rejected by a client.
 */

export type IssueCode =
  | 'invalid_screen' //   envelope unusable → nothing to render
  | 'invalid_section' //  section without id/type
  | 'unknown_type' //     type not in the client registry
  | 'version_mismatch' // section newer than the client supports
  | 'invalid_props' //    props do not match the section schema
  | 'render_error' //     the section view crashed
  | 'invalid_action' //   malformed action or invalid core payload
  | 'unhandled_action' // no handler for that action type
  | 'action_failed'; //   handler threw → remaining actions skipped

export interface SduiIssue {
  code: IssueCode;
  message: string;
  sectionId?: string;
  sectionType?: string;
  actionType?: string;
}

export type IssueReporter = (issue: SduiIssue) => void;

/**
 * Default reporter: the console. `SduiProvider` uses it unless the app passes
 * `onIssue`, and the app can call it directly (e.g. for `invalid_screen` while
 * fetching). To send issues to Sentry, Datadog..., pass your own `onIssue`.
 */
export const reportIssue: IssueReporter = issue => {
  console.warn(`[sdui] ${issue.code}`, issue);
};
