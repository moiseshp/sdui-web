// Extra: not registered in any screen. To use it, add it to a screen registry (e.g. app/home-registry.ts).

import { Clock, Store } from 'lucide-react';
import * as z from 'zod';
import { defineSection } from '@/lib/sdui/registry/define-section';
import { usePressTrigger } from '@/lib/sdui/actions/triggers';
import { TriggersSchema } from '@/lib/sdui/contract/action';

/* Props contract (v1) ------------------------------------------------------ */

const menuItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  imageUrl: z.url().optional(),
  /** Already formatted by the backend ("S/ 18.90"). */
  priceLabel: z.string().optional(),
  actions: TriggersSchema.optional(),
});
type MenuItem = z.infer<typeof menuItemSchema>;

const daypartMenuSchema = z.object({
  title: z.string().min(1),
  /** The backend picks the time slot ("Almuerzo · 12:00–16:00"); the client only shows it. */
  daypartLabel: z.string().min(1),
  storeLabel: z.string().optional(),
  items: z.array(menuItemSchema).min(1),
});
type DaypartMenuProps = z.infer<typeof daypartMenuSchema>;

/* View --------------------------------------------------------------------- */

/** The grid grows with the width it is given (container queries): 2 columns on a phone, more on a kiosk. */
function DaypartMenu({ title, daypartLabel, storeLabel, items }: DaypartMenuProps) {
  return (
    <section className="@container px-4 pt-6.5 pb-1.5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-xs font-bold text-on-brand">
          <Clock aria-hidden className="shrink-0 size-3.5" />
          {daypartLabel}
        </span>
        {storeLabel && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted">
            <Store aria-hidden className="shrink-0 size-3.5" />
            {storeLabel}
          </span>
        )}
      </div>

      <h2 className="mb-3.5 text-[22px] leading-tight font-extrabold font-stretch-80%">{title}</h2>

      <ul className="grid grid-cols-2 gap-3 @2xl:grid-cols-3 @4xl:grid-cols-4">
        {items.map(item => (
          <li key={item.id}>
            <MenuCard item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function MenuCard({ item }: { item: MenuItem }) {
  const press = usePressTrigger(item.actions);
  return (
    <button
      type="button"
      disabled={!press.isPressable}
      onClick={press.onPress}
      className="block w-full cursor-pointer overflow-hidden rounded-2xl border border-surface text-left disabled:cursor-default"
    >
      {item.imageUrl && <img src={item.imageUrl} alt="" loading="lazy" className="aspect-square w-full bg-surface object-cover" />}
      <span className="block p-3">
        <span className="line-clamp-2 text-[15px] leading-snug font-semibold">{item.name}</span>
        {item.priceLabel && <span className="mt-1 block font-extrabold text-brand">{item.priceLabel}</span>}
      </span>
    </button>
  );
}

/* Registration ------------------------------------------------------------- */

export const daypartMenu = defineSection({
  type: 'daypart_menu',
  version: 1,
  schema: daypartMenuSchema,
  view: DaypartMenu,
});
