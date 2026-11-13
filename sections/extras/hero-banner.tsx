// Extra: not registered in any screen. To use it, add it to a screen registry (e.g. app/home-registry.ts).

import * as z from 'zod';
import { defineSection } from '@/lib/sdui/registry/define-section';
import { CtaSchema } from '@/lib/sdui/contract/action';
import { semanticEnum } from '@/lib/sdui/contract/screen';
import { CtaButton } from '../shared/cta-button';
import { cn } from '@/lib/cn';

/* Props contract (v1) ------------------------------------------------------ */

const heroBannerSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  imageUrl: z.url().optional(),
  variant: semanticEnum(['brand', 'dark'], 'brand'),
  cta: CtaSchema.optional(),
});
type HeroBannerProps = z.infer<typeof heroBannerSchema>;

/* View --------------------------------------------------------------------- */

/** Semantic variant → this platform's styles. */
const VARIANTS = {
  brand: 'bg-brand text-on-brand',
  dark: 'bg-ink text-white',
} as const;

function HeroBanner({ title, subtitle, imageUrl, variant, cta }: HeroBannerProps) {
  return (
    <section>
      {imageUrl && <img src={imageUrl} alt="" className="aspect-16/10 w-full bg-surface object-cover" />}
      <div className={cn('px-5 pt-5.5 pb-6.5', VARIANTS[variant])}>
        <h1 className="text-[38px] leading-[0.95] font-black tracking-tight text-balance font-stretch-75%">{title}</h1>
        {subtitle && <p className="mt-2.5 mb-4.5 leading-relaxed opacity-90">{subtitle}</p>}
        {cta && <CtaButton cta={cta} tone="inverse" />}
      </div>
    </section>
  );
}

/* Registration ------------------------------------------------------------- */

export const heroBanner = defineSection({
  type: 'hero_banner',
  version: 1,
  schema: heroBannerSchema,
  view: HeroBanner,
});
