import * as z from 'zod';
import { TriggersSchema } from '@/lib/sdui/contract/action';
import { semanticEnum } from '@/lib/sdui/contract/screen';
import { usePressTrigger } from '@/lib/sdui/actions/triggers';
import { defineSection } from '@/lib/sdui/registry/define-section';
import { contractIcon } from './shared/icons';
import { cn } from '@/lib/cn';

/* Props contract (v1) ------------------------------------------------------ */
/* Shared with header_greeting, which adds a greeting under the same top bar.  */

export const headerVariantSchema = semanticEnum(['brand', 'dark'], 'brand');

/** The logo comes in the payload: the backend can swap it per theme or campaign. */
export const headerLogoSchema = z.object({
  imageUrl: z.url(),
  alt: z.string().min(1),
});

/**
 * A button of the top bar. The backend decides which buttons appear, in which
 * order and what each one does; the client only maps `icon` to its icon set.
 * `label` is the accessible name, and what is shown if the icon is unknown.
 */
export const headerButtonSchema = z.object({
  icon: z.string().min(1),
  label: z.string().min(1),
  actions: TriggersSchema.optional(),
});
type HeaderButton = z.infer<typeof headerButtonSchema>;

const headerDefaultSchema = z.object({
  logo: headerLogoSchema,
  variant: headerVariantSchema,
  buttons: z.array(headerButtonSchema).default([]),
});
type HeaderDefaultProps = z.infer<typeof headerDefaultSchema>;

/* View --------------------------------------------------------------------- */

/** Semantic variant → this platform's styles. */
export const HEADER_VARIANTS = {
  brand: 'bg-brand text-on-brand',
  dark: 'bg-ink text-white',
} as const;

/** Logo and buttons. Being pinned is the `header` slot's job, not this section's. */
function HeaderDefault({ logo, variant, buttons }: HeaderDefaultProps) {
  return (
    <header className={cn('px-4', HEADER_VARIANTS[variant])}>
      <HeaderBar logo={logo} buttons={buttons} />
    </header>
  );
}

/** Top bar shared by both headers. */
export function HeaderBar({ logo, buttons }: Pick<HeaderDefaultProps, 'logo' | 'buttons'>) {
  return (
    <div className="flex h-14 items-center justify-between gap-2">
      <img src={logo.imageUrl} alt={logo.alt} className="h-9 w-auto" />
      {buttons.length > 0 && (
        <nav className="-mr-2 flex items-center gap-1">
          {buttons.map((button, index) => (
            <HeaderBarButton key={`${button.icon}-${index}`} button={button} />
          ))}
        </nav>
      )}
    </div>
  );
}

function HeaderBarButton({ button }: { button: HeaderButton }) {
  const press = usePressTrigger(button.actions);
  const Icon = contractIcon(button.icon);
  return (
    <button
      type="button"
      aria-label={Icon ? button.label : undefined}
      disabled={!press.isPressable}
      onClick={press.onPress}
      className="inline-flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-full px-2 text-sm font-bold hover:bg-white/10 disabled:cursor-default disabled:hover:bg-transparent"
    >
      {/* An icon this client does not know degrades to its label. */}
      {Icon ? <Icon aria-hidden className="size-6" /> : button.label}
    </button>
  );
}

/* Registration ------------------------------------------------------------- */

export const headerDefault = defineSection({
  type: 'header_default',
  version: 1,
  schema: headerDefaultSchema,
  view: HeaderDefault,
});
