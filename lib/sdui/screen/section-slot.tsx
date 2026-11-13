'use client';

/**
 * One section of the screen. Asks the registry whether it can be rendered
 * (`resolveSection`), then renders it inside its own error boundary.
 * Any failure stays inside this slot and is reported; the rest of the screen
 * is unaffected.
 */

import { Component, useEffect, useMemo, useRef, type ErrorInfo, type ReactNode, type RefObject } from 'react';
import type { Section } from '../contract/screen';
import type { SduiIssue } from '../contract/issues';
import { resolveSection } from '../registry/resolve-section';
import type { ReactSectionRegistry, SectionView } from '../registry/define-section';
import { ActionScope, useIssueReporter } from '../actions/sdui-provider';
import { useViewTrigger } from '../actions/triggers';

export function SectionSlot({ raw, registry }: { raw: unknown; registry: ReactSectionRegistry }) {
  const resolution = useMemo(() => resolveSection(raw, registry), [raw, registry]);
  const report = useIssueReporter();
  const reported = useRef(false);

  useEffect(() => {
    if (resolution.ok || reported.current) return;
    reported.current = true;
    report(resolution.issue);
  }, [resolution, report]);

  if (!resolution.ok) return <SectionFallback issue={resolution.issue} />;

  return <RenderedSection section={resolution.section} View={resolution.view} props={resolution.props} />;
}

function RenderedSection({ section, View, props }: { section: Section; View: SectionView; props: unknown }) {
  const ref = useRef<HTMLDivElement>(null);
  const report = useIssueReporter();
  const scope = useMemo(() => ({ sectionId: section.id }), [section.id]);
  const where = { sectionId: section.id, sectionType: section.type };

  return (
    <ActionScope value={scope}>
      <ViewTrigger targetRef={ref} actions={section.actions?.onView} />
      <div ref={ref} data-section-id={section.id} data-section-type={section.type}>
        <SectionErrorBoundary
          onError={error => report({ code: 'render_error', message: error.message, ...where })}
          fallback={<SectionFallback issue={{ code: 'render_error', message: 'The section view crashed', ...where }} />}
        >
          <View {...(props as object)} />
        </SectionErrorBoundary>
      </div>
    </ActionScope>
  );
}

/** Lives inside the section's scope, so its actions carry the sectionId. */
function ViewTrigger({ targetRef, actions }: { targetRef: RefObject<HTMLDivElement | null>; actions?: unknown[] }) {
  useViewTrigger(targetRef, actions);
  return null;
}

/**
 * Development: the failure is visible, so whoever writes the payload sees it.
 * Production: the section simply does not appear (the issue is still reported).
 */
function SectionFallback({ issue }: { issue: SduiIssue }) {
  if (process.env.NODE_ENV === 'production') return null;
  return (
    <div
      role="note"
      className="m-4 grid gap-0.5 rounded-xl border-2 border-dashed border-amber-500 bg-amber-50 px-3.5 py-3 text-[13px] leading-snug text-amber-900"
    >
      <strong>Sección no renderizada · {issue.code}</strong>
      <span>
        {issue.sectionType ?? 'sin tipo'} / {issue.sectionId ?? 'sin id'}
      </span>
      <span className="font-mono text-xs">{issue.message}</span>
    </div>
  );
}

class SectionErrorBoundary extends Component<
  { onError: (error: Error) => void; fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    this.props.onError(error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
