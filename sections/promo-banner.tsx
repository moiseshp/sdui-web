import * as z from 'zod';
import { defineSection } from '@/lib/sdui/registry/define-section';
import { CtaSchema } from '@/lib/sdui/contract/action';
import { semanticEnum } from '@/lib/sdui/contract/screen';
import { CtaButton } from './shared/cta-button';
import { cn } from '@/lib/cn';

/* Props contract (v1) ------------------------------------------------------ */

const promoBannerSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  /** Semantic intent, never a hex color: each platform maps it to its tokens. */
  variant: semanticEnum(['brand', 'dark', 'highlight'], 'brand'),
  /** Decorative product image, shown on the right side. */
  imageUrl: z.url().optional(),
  /** Short tag above the title ("SOLO HOY"). */
  badge: z.string().optional(),
  cta: CtaSchema.optional(),
});
type PromoBannerProps = z.infer<typeof promoBannerSchema>;

/* View --------------------------------------------------------------------- */

const VARIANTS = {
  brand: 'bg-brand text-on-brand',
  dark: 'bg-ink text-white',
  highlight: 'bg-highlight text-on-highlight',
} as const;

function PromoBanner({ title, description, variant, imageUrl, badge, cta }: PromoBannerProps) {
  return (
    <section className={cn('relative mx-4 mt-5 overflow-hidden rounded-[20px] px-5 py-5.5', VARIANTS[variant])}>
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          className="absolute inset-y-0 right-0 h-full w-2/5 object-cover mask-l-from-50% mask-l-to-100%"
        />
      )}
      <div className={cn('relative', imageUrl && 'max-w-[62%]')}>
        {badge && (
          <span className="mb-2.5 inline-block rounded-full border border-current px-2.5 py-0.5 text-xs font-extrabold tracking-wider uppercase">
            {badge}
          </span>
        )}
        <h2 className="text-[26px] leading-none font-black font-stretch-75%">{title}</h2>
        {description && <p className="mt-2 leading-relaxed">{description}</p>}
        {cta && (
          <div className="mt-4">
            <CtaButton cta={cta} tone={variant === 'highlight' ? 'solid' : 'inverse'} />
          </div>
        )}
      </div>
    </section>
  );
}

/* Registration ------------------------------------------------------------- */

export const promoBanner = defineSection({
  type: 'promo_banner',
  version: 1,
  schema: promoBannerSchema,
  view: PromoBanner,
});
