// Extra: not registered in any screen. To use it, add it to a screen registry (e.g. app/home-registry.ts).

import { Star } from 'lucide-react';
import * as z from 'zod';
import { defineSection } from '@/lib/sdui/registry/define-section';

/* Props contract (v1) ------------------------------------------------------ */

const loyaltyCardSchema = z.object({
  /** "Club Gold". */
  tierLabel: z.string().min(1),
  /** Already formatted by the backend ("2,450 pts"). */
  pointsLabel: z.string().min(1),
  /** Progress to the next tier, 0–100. Computed by the backend, never by the client. */
  progress: z.number().min(0).max(100),
  /** "Te faltan 550 puntos para subir a Platinum." */
  progressLabel: z.string().optional(),
});
type LoyaltyCardProps = z.infer<typeof loyaltyCardSchema>;

/* View --------------------------------------------------------------------- */

/** Uses the `highlight` token, which each theme redefines (gold in `loyalty`). */
function LoyaltyCard({ tierLabel, pointsLabel, progress, progressLabel }: LoyaltyCardProps) {
  return (
    <section className="mx-4 mt-5 rounded-[20px] bg-ink p-4 text-white">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-highlight px-3 py-1 text-xs font-bold text-highlight">
          <Star aria-hidden fill="currentColor" className="shrink-0 size-3.5" />
          {tierLabel}
        </span>
        <span className="text-[26px] leading-none font-black text-highlight font-stretch-75%">{pointsLabel}</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={progressLabel ?? tierLabel}
        className="mt-4 h-2 overflow-hidden rounded-full bg-white/15"
      >
        <div className="h-full rounded-full bg-highlight" style={{ width: `${progress}%` }} />
      </div>
      {progressLabel && <p className="mt-2 text-sm opacity-80">{progressLabel}</p>}
    </section>
  );
}

/* Registration ------------------------------------------------------------- */

export const loyaltyCard = defineSection({
  type: 'loyalty_card',
  version: 1,
  schema: loyaltyCardSchema,
  view: LoyaltyCard,
});
