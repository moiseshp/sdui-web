'use client';

/**
 * The client half of the home: the app's action handlers, the SDUI renderer
 * and the home's registry. The screen arrives already validated from page.tsx.
 */

import { SduiProvider } from '@/lib/sdui/actions/sdui-provider';
import type { Screen } from '@/lib/sdui/contract/screen';
import { ScreenRenderer } from '@/lib/sdui/screen/screen-renderer';
import { useAppActionHandlers } from './action-handlers';
import { homeRegistry } from './home-registry';

export function HomeScreen({ screen }: { screen: Screen }) {
  const handlers = useAppActionHandlers();
  return (
    <SduiProvider handlers={handlers}>
      <ScreenRenderer screen={screen} registry={homeRegistry} />
    </SduiProvider>
  );
}
