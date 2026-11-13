import { ArrowRight } from 'lucide-react';
import type { Cta } from '@/lib/sdui/contract/action';
import { usePressTrigger } from '@/lib/sdui/actions/triggers';
import { cn } from '@/lib/cn';

const TONES = {
  solid: 'bg-brand text-on-brand',
  inverse: 'bg-white text-ink',
  highlight: 'bg-highlight text-on-highlight',
  ink: 'bg-ink text-white',
} as const;

const SIZES = {
  md: 'min-h-11.5 px-5.5 text-[15px]',
  sm: 'min-h-10 px-4 text-sm',
} as const;

export type CtaTone = keyof typeof TONES;

/** Shared CTA. Knows nothing about what its actions do: it only fires `onPress`. */
export function CtaButton({ cta, tone = 'solid', size = 'md' }: { cta: Cta; tone?: CtaTone; size?: keyof typeof SIZES }) {
  const press = usePressTrigger(cta.actions);
  return (
    <button
      type="button"
      disabled={!press.isPressable}
      onClick={press.onPress}
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full font-bold disabled:cursor-default disabled:opacity-60',
        SIZES[size],
        TONES[tone],
      )}
    >
      {cta.label}
    </button>
  );
}

/** Text-only CTA, for secondary links like "Ver todo". */
export function CtaLink({ cta }: { cta: Cta }) {
  const press = usePressTrigger(cta.actions);
  return (
    <button
      type="button"
      disabled={!press.isPressable}
      onClick={press.onPress}
      className="inline-flex shrink-0 cursor-pointer items-center gap-1 py-2 text-sm font-bold text-brand disabled:cursor-default disabled:opacity-60"
    >
      {cta.label}
      <ArrowRight aria-hidden className="size-4" />
    </button>
  );
}
