import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as z from 'zod';
import { defineSection } from '@/lib/sdui/registry/define-section';
import { usePressTrigger } from '@/lib/sdui/actions/triggers';
import { TriggersSchema } from '@/lib/sdui/contract/action';
import { semanticEnum } from '@/lib/sdui/contract/screen';
import { cn } from '@/lib/cn';

/* Props contract (v1) ------------------------------------------------------ */

const slideSchema = z.object({
  imageUrl: z.url(),
  /** Describes the banner: the image usually carries the text. */
  alt: z.string().min(1),
  actions: TriggersSchema.optional(),
});
type Slide = z.infer<typeof slideSchema>;

const heroCarouselSchema = z.object({
  items: z.array(slideSchema).min(1),
  /** `full`: one banner per view. `peek`: the next banner shows at the edge. */
  layout: semanticEnum(['full', 'peek'], 'full'),
  autoplay: z.boolean().default(true),
});
type HeroCarouselProps = z.infer<typeof heroCarouselSchema>;

/* View --------------------------------------------------------------------- */

/** How long each banner stays. Timing is a platform decision, not the payload's. */
const AUTOPLAY_MS = 5000;

const LAYOUTS = {
  full: '*:basis-full',
  peek: 'scroll-px-4 gap-3 px-4 *:basis-[85%] *:overflow-hidden *:rounded-2xl',
} as const;

function HeroCarousel({ items, layout, autoplay }: HeroCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const hasMany = items.length > 1;

  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    const slides = track?.children;
    if (!track || !slides?.length) return;
    const target = slides[(index + slides.length) % slides.length] as HTMLElement;
    track.scrollTo({ left: target.offsetLeft - scrollPadding(track), behavior: 'smooth' });
  }, []);

  // The current slide follows the scroll, so swiping and autoplay stay in sync.
  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const left = track.scrollLeft + scrollPadding(track);
    let nearest = 0;
    Array.from(track.children).forEach((slide, index) => {
      const distance = Math.abs((slide as HTMLElement).offsetLeft - left);
      if (distance < Math.abs((track.children[nearest] as HTMLElement).offsetLeft - left)) nearest = index;
    });
    setCurrent(nearest);
  };

  useEffect(() => {
    if (!autoplay || !hasMany || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Restarts on every slide change, so a manual swipe also resets the timer.
    const timer = window.setTimeout(() => goTo(current + 1), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [autoplay, hasMany, paused, current, goTo]);

  return (
    <section
      aria-roledescription="carrusel"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={cn(layout === 'peek' && 'pt-4')}
    >
      <div className="relative">
        <ul
          ref={trackRef}
          onScroll={onScroll}
          className={cn(
            'relative flex snap-x snap-mandatory overflow-x-auto scrollbar-none *:shrink-0 *:snap-start [&::-webkit-scrollbar]:hidden',
            LAYOUTS[layout],
          )}
        >
          {items.map((item, index) => (
            <li key={`${item.imageUrl}-${index}`} aria-roledescription="banner" aria-label={`${index + 1} de ${items.length}`}>
              <SlideView item={item} />
            </li>
          ))}
        </ul>

        {hasMany && layout === 'full' && (
          <>
            <ArrowButton direction="previous" onClick={() => goTo(current - 1)} />
            <ArrowButton direction="next" onClick={() => goTo(current + 1)} />
          </>
        )}
      </div>

      {hasMany && (
        <div aria-hidden="true" className="flex justify-center gap-2 py-3.5">
          {items.map((item, index) => (
            <span
              key={`${item.imageUrl}-${index}`}
              className={cn('block h-2 rounded-full transition-all', index === current ? 'w-5 bg-brand' : 'w-2 bg-ink/20')}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function SlideView({ item }: { item: Slide }) {
  const press = usePressTrigger(item.actions);
  const image = <img src={item.imageUrl} alt={item.alt} className="block h-auto w-full bg-surface" />;

  if (!press.isPressable) return image;
  return (
    <button type="button" onClick={press.onPress} className="block w-full cursor-pointer">
      {image}
    </button>
  );
}

function ArrowButton({ direction, onClick }: { direction: 'previous' | 'next'; onClick: () => void }) {
  const isNext = direction === 'next';
  return (
    <button
      type="button"
      aria-label={isNext ? 'Banner siguiente' : 'Banner anterior'}
      onClick={onClick}
      className={cn(
        'absolute top-1/2 grid h-12 w-8 -translate-y-1/2 cursor-pointer place-items-center rounded-md bg-brand text-on-brand shadow-md',
        isNext ? 'right-3' : 'left-3',
      )}
    >
      {isNext ? <ChevronRight aria-hidden className="size-5" /> : <ChevronLeft aria-hidden className="size-5" />}
    </button>
  );
}

function scrollPadding(element: HTMLElement): number {
  return Number.parseFloat(getComputedStyle(element).scrollPaddingLeft) || 0;
}

/* Registration ------------------------------------------------------------- */

export const heroCarousel = defineSection({
  type: 'hero_carousel',
  version: 1,
  schema: heroCarouselSchema,
  view: HeroCarousel,
});
