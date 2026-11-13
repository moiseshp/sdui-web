'use client';

/**
 * How THIS app runs each action of the contract. It implements the library's
 * `ActionHandlers` interface: leave a core action out and it does not compile.
 * (Flutter: AppActionHandlers, with go_router and its own analytics.)
 */

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import type { ActionHandlers } from '@/lib/sdui/actions/action-handlers';

/**
 * The contract speaks in route ids ("product_detail"); this table is the web
 * translation. Flutter keeps its own table with the same ids.
 * Returns `null` for an unknown route or missing params.
 */
const ROUTES: Record<string, (params: Record<string, string>) => string | null> = {
  home: () => '/',
  product_detail: ({ id }) => (id ? `/product/${encodeURIComponent(id)}` : null),
};

export function useAppActionHandlers(): ActionHandlers {
  const router = useRouter();

  return useMemo<ActionHandlers>(
    () => ({
      NAVIGATE: ({ route, params = {} }) => {
        const path = Object.hasOwn(ROUTES, route) ? ROUTES[route](params) : null;
        // Throwing stops the rest of the chain and reports `action_failed`.
        if (!path) throw new Error(`Unknown route "${route}" on web`);
        router.push(path);
      },

      TRACK_EVENT: ({ name, params }, context) => {
        // Replace the console with your analytics SDK. Every event carries the
        // experiment variant: that is what makes an A/B measurable.
        console.info(`[analytics] ${name}`, {
          ...params,
          screen_id: context.screenId,
          section_id: context.sectionId,
          experiment_id: context.experiment?.id,
          variant: context.experiment?.variant,
        });
      },

      OPEN_URL: ({ url }) => {
        window.open(url, '_blank', 'noopener,noreferrer');
      },
    }),
    [router],
  );
}
