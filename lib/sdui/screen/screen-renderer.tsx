'use client';

/**
 * Renders a parsed Screen: exposes its theme, fires `onMount`, lays out the
 * three slots (header, sections, bottomBar) and hands each raw section to a
 * SectionSlot. It knows nothing about specific sections.
 */

import { useMemo } from 'react';
import type { Screen } from '../contract/screen';
import type { ReactSectionRegistry } from '../registry/define-section';
import { ActionScope } from '../actions/sdui-provider';
import { SectionSlot } from './section-slot';
import { useMountTrigger } from '../actions/triggers';

export interface ScreenRendererProps {
  screen: Screen;
  registry: ReactSectionRegistry;
}

export function ScreenRenderer({ screen, registry }: ScreenRendererProps) {
  const scope = useMemo(
    () => ({ screenId: screen.screenId, experiment: screen.meta?.experiment }),
    [screen.screenId, screen.meta?.experiment],
  );

  return (
    <ActionScope value={scope}>
      <ScreenBody screen={screen} registry={registry} />
    </ActionScope>
  );
}

function ScreenBody({ screen, registry }: ScreenRendererProps) {
  useMountTrigger(screen.actions?.onMount, screen.screenId);

  return (
    // The theme is exposed once (the app's theme.css); sections never read it.
    <div data-theme={screen.theme} data-screen-id={screen.screenId} className="flex min-h-dvh flex-col">
      {/* Slots pin themselves with `sticky`, so they stay as wide as the screen column. */}
      {screen.header != null && (
        <div data-slot="header" className="sticky top-0 z-20">
          <SectionSlot raw={screen.header} registry={registry} />
        </div>
      )}

      <div data-slot="sections" className="flex-1 pb-8">
        {screen.sections.map((raw, index) => (
          <SectionSlot key={keyOf(raw, index)} raw={raw} registry={registry} />
        ))}
      </div>

      {screen.bottomBar != null && (
        <div data-slot="bottom-bar" className="sticky bottom-0 z-20">
          <SectionSlot raw={screen.bottomBar} registry={registry} />
        </div>
      )}
    </div>
  );
}

function keyOf(raw: unknown, index: number): string {
  const id = (raw as { id?: unknown } | null)?.id;
  return typeof id === 'string' ? id : `__invalid_${index}`;
}
