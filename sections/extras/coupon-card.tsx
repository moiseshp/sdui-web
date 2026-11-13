// Extra: not registered in any screen. To use it, add it to a screen registry (e.g. app/home-registry.ts).

import { useEffect, useState } from 'react';
import { Check, Clock, Copy, Ticket } from 'lucide-react';
import * as z from 'zod';
import { defineSection } from '@/lib/sdui/registry/define-section';
import { CtaSchema } from '@/lib/sdui/contract/action';
import { CtaButton } from '../shared/cta-button';

/* Props contract (v1) ------------------------------------------------------ */

const couponCardSchema = z.object({
  title: z.string().min(1),
  /** May arrive personalized by the backend. */
  description: z.string().optional(),
  code: z.string().min(1),
  /** Already formatted by the backend ("Válido hasta hoy 11:59 pm"). */
  validUntilLabel: z.string().min(1),
  badge: z.string().optional(),
  cta: CtaSchema.optional(),
});
type CouponCardProps = z.infer<typeof couponCardSchema>;

/* View --------------------------------------------------------------------- */

function CouponCard({ title, description, code, validUntilLabel, badge, cta }: CouponCardProps) {
  return (
    <section className="mx-4 mt-5 rounded-[20px] border-2 border-dashed border-brand bg-brand/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2 text-brand">
          <Ticket aria-hidden className="shrink-0 mt-0.5 size-6" />
          <h2 className="text-[22px] leading-tight font-black text-balance font-stretch-80%">{title}</h2>
        </div>
        {badge && (
          <span className="shrink-0 rounded-full bg-brand px-3 py-1 text-xs font-extrabold tracking-wider text-on-brand">{badge}</span>
        )}
      </div>

      {description && <p className="mt-2 leading-relaxed">{description}</p>}

      <div className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2">
        <span className="font-mono text-xl font-black tracking-widest text-brand">{code}</span>
        <CopyButton text={code} />
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-[13px] text-muted">
        <Clock aria-hidden className="shrink-0 size-4" />
        {validUntilLabel}
      </p>

      {cta && (
        <div className="mt-4 grid">
          <CtaButton cta={cta} />
        </div>
      )}
    </section>
  );
}

/** Copying is local behavior of the component, not a contract action. */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // No clipboard permission: nothing to do.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-ink/15 px-3 text-sm font-bold"
    >
      {copied ? <Check aria-hidden className="size-4" /> : <Copy aria-hidden className="size-4" />}
      <span aria-live="polite">{copied ? '¡Copiado!' : 'Copiar'}</span>
    </button>
  );
}

/* Registration ------------------------------------------------------------- */

export const couponCard = defineSection({
  type: 'coupon_card',
  version: 1,
  schema: couponCardSchema,
  view: CouponCard,
});
