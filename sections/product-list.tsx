import * as z from 'zod';
import { defineSection } from '@/lib/sdui/registry/define-section';
import { usePressTrigger } from '@/lib/sdui/actions/triggers';
import { CtaSchema, TriggersSchema } from '@/lib/sdui/contract/action';
import { semanticEnum } from '@/lib/sdui/contract/screen';
import { CtaLink } from './shared/cta-button';

/* Props contract (v1) ------------------------------------------------------ */

const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  /** Already formatted by the backend ("S/ 54.90"): the client never formats money. */
  priceLabel: z.string().min(1),
  originalPriceLabel: z.string().optional(),
  badge: z.string().optional(),
  imageUrl: z.url().optional(),
  actions: TriggersSchema.optional(),
});
type Product = z.infer<typeof productSchema>;

const productListSchema = z.object({
  title: z.string().min(1),
  layout: semanticEnum(['grid', 'carousel'], 'grid'),
  items: z.array(productSchema).min(1),
  /** Secondary link next to the title ("Ver todo"). */
  cta: CtaSchema.optional(),
});
type ProductListProps = z.infer<typeof productListSchema>;

/* View --------------------------------------------------------------------- */

const LAYOUTS = {
  grid: 'grid grid-cols-2 gap-x-3 gap-y-4.5',
  carousel:
    '-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1.5 [scrollbar-width:none] *:shrink-0 *:basis-[46%] *:snap-start',
} as const;

function ProductList({ title, layout, items, cta }: ProductListProps) {
  return (
    <section className="px-4 pt-6.5 pb-1.5">
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <h2 className="text-[22px] leading-tight font-extrabold font-stretch-80%">{title}</h2>
        {cta && <CtaLink cta={cta} />}
      </div>
      <ul className={LAYOUTS[layout]}>
        {items.map(item => (
          <li key={item.id}>
            <ProductCard item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProductCard({ item }: { item: Product }) {
  // Each item carries its own actions: the backend decides what a tap does.
  const press = usePressTrigger(item.actions);
  return (
    <button
      type="button"
      disabled={!press.isPressable}
      onClick={press.onPress}
      className="flex w-full cursor-pointer flex-col gap-1 text-left disabled:cursor-default"
    >
      {item.imageUrl && (
        <span className="relative mb-1.5 block aspect-square overflow-hidden rounded-2xl bg-surface">
          <img src={item.imageUrl} alt="" loading="lazy" className="size-full object-cover" />
          {item.badge && (
            <span className="absolute top-2 left-2 rounded-md bg-highlight px-2 py-0.5 text-[13px] font-extrabold text-on-highlight">
              {item.badge}
            </span>
          )}
        </span>
      )}
      <span className="text-[15px] leading-snug font-semibold">{item.name}</span>
      {item.description && <span className="line-clamp-2 text-[13px] leading-snug text-muted">{item.description}</span>}
      <span className="flex items-baseline gap-2 font-extrabold text-brand">
        {item.priceLabel}
        {item.originalPriceLabel && <s className="text-[13px] font-medium text-muted">{item.originalPriceLabel}</s>}
      </span>
    </button>
  );
}

/* Registration ------------------------------------------------------------- */

export const productList = defineSection({
  type: 'product_list',
  version: 1,
  schema: productListSchema,
  view: ProductList,
});
