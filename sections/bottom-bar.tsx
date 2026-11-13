import { useState } from 'react';
import { X } from 'lucide-react';
import * as z from 'zod';
import { defineSection } from '@/lib/sdui/registry/define-section';
import { CtaSchema } from '@/lib/sdui/contract/action';
import { semanticEnum } from '@/lib/sdui/contract/screen';
import { CtaButton, type CtaTone } from './shared/cta-button';
import { contractIcon } from './shared/icons';
import { cn } from '@/lib/cn';

/* Props contract (v1) ------------------------------------------------------ */

const bottomBarSchema = z.object({
  /** Plain text. May arrive personalized by the backend. */
  title: z.string().min(1),
  message: z.string().optional(),
  cta: CtaSchema.optional(),
  /** `brand` follows the screen theme; `warning` is for operational notices. */
  variant: semanticEnum(['brand', 'dark', 'warning'], 'brand'),
  /** Semantic name (`gift`, `map_pin`, `warning`, `bell`). An unknown one is not drawn. */
  icon: z.string().optional(),
  isDismissible: z.boolean().default(true),
});
type BottomBarProps = z.infer<typeof bottomBarSchema>;

/* View --------------------------------------------------------------------- */

const VARIANTS = {
  brand: { surface: 'bg-brand text-on-brand', cta: 'inverse' },
  dark: { surface: 'bg-ink text-white', cta: 'highlight' },
  warning: { surface: 'bg-amber-100 text-amber-950 ring-1 ring-amber-400', cta: 'ink' },
} as const satisfies Record<string, { surface: string; cta: CtaTone }>;

/**
 * Meant for the `bottomBar` slot, which pins it. The client does not know
 * which initiative it shows (sign up, address, incident): the backend picks it.
 * Dismissing it is local state: it comes back on the next load.
 */
function BottomBar({ title, message, cta, variant, icon, isDismissible }: BottomBarProps) {
  const [isVisible, setIsVisible] = useState(true);
  if (!isVisible) return null;

  const { surface, cta: ctaTone } = VARIANTS[variant];
  // Unknown icon name → no icon.
  const Icon = contractIcon(icon);

  return (
    <aside aria-label={title} className="p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className={cn('flex items-center gap-3 rounded-2xl p-3 shadow-xl', surface)}>
        {Icon && <Icon aria-hidden className="size-7 shrink-0" />}
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-tight font-bold">{title}</p>
          {message && <p className="mt-0.5 text-xs leading-snug opacity-90">{message}</p>}
        </div>
        {cta && <CtaButton cta={cta} tone={ctaTone} size="sm" />}
        {isDismissible && (
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => setIsVisible(false)}
            className="-mr-1 grid size-9 shrink-0 cursor-pointer place-items-center rounded-full hover:bg-black/10"
          >
            <X aria-hidden className="shrink-0 size-4.5" />
          </button>
        )}
      </div>
    </aside>
  );
}

/* Registration ------------------------------------------------------------- */

export const bottomBar = defineSection({
  type: 'bottom_bar',
  version: 1,
  schema: bottomBarSchema,
  view: BottomBar,
});
