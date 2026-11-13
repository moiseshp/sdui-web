// Extra: not registered in any screen. To use it, add it to a screen registry (e.g. app/home-registry.ts).

import { useState } from 'react';
import { X } from 'lucide-react';
import * as z from 'zod';
import { defineSection } from '@/lib/sdui/registry/define-section';
import { semanticEnum } from '@/lib/sdui/contract/screen';
import { cn } from '@/lib/cn';

/* Props contract (v1) ------------------------------------------------------ */

const announcementBarSchema = z.object({
  /** Plain text: no HTML, no markdown. */
  message: z.string().min(1),
  variant: semanticEnum(['dark', 'light'], 'dark'),
  isDismissible: z.boolean().default(false),
});
type AnnouncementBarProps = z.infer<typeof announcementBarSchema>;

/* View --------------------------------------------------------------------- */

const VARIANTS = {
  dark: 'bg-ink text-white',
  light: 'bg-surface text-ink',
} as const;

/** If it is in the payload, it shows. Dismissing it is local state: it comes back on the next load. */
function AnnouncementBar({ message, variant, isDismissible }: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true);
  if (!isVisible) return null;

  return (
    <div role="status" className={cn('flex min-h-11 items-center justify-between gap-2 px-4 py-2 text-sm font-medium', VARIANTS[variant])}>
      <p>{message}</p>
      {isDismissible && (
        <button
          type="button"
          aria-label="Cerrar anuncio"
          onClick={() => setIsVisible(false)}
          className="-mr-2 grid size-9 shrink-0 cursor-pointer place-items-center rounded-full hover:bg-current/10"
        >
          <X aria-hidden className="shrink-0 size-4.5" />
        </button>
      )}
    </div>
  );
}

/* Registration ------------------------------------------------------------- */

export const announcementBar = defineSection({
  type: 'announcement_bar',
  version: 1,
  schema: announcementBarSchema,
  view: AnnouncementBar,
});
