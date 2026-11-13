import * as z from 'zod';
import { defineSection } from '@/lib/sdui/registry/define-section';
import { HEADER_VARIANTS, HeaderBar, headerButtonSchema, headerLogoSchema, headerVariantSchema } from './header-default';
import { cn } from '@/lib/cn';

/* Props contract (v1) ------------------------------------------------------ */

const headerGreetingSchema = z.object({
  /** Already personalized by the backend ("¡Hola, Ana!"): the client never builds it. */
  title: z.string().min(1),
  subtitle: z.string().optional(),
  logo: headerLogoSchema,
  variant: headerVariantSchema,
  buttons: z.array(headerButtonSchema).default([]),
});
type HeaderGreetingProps = z.infer<typeof headerGreetingSchema>;

/* View --------------------------------------------------------------------- */

function HeaderGreeting({ title, subtitle, logo, variant, buttons }: HeaderGreetingProps) {
  return (
    <header className={cn('px-4 pb-5', HEADER_VARIANTS[variant])}>
      <HeaderBar logo={logo} buttons={buttons} />
      <p className="mt-2 text-[32px] leading-none font-black tracking-tight text-balance font-stretch-75%">{title}</p>
      {subtitle && <p className="mt-1.5 text-sm font-medium opacity-90">{subtitle}</p>}
    </header>
  );
}

/* Registration ------------------------------------------------------------- */

export const headerGreeting = defineSection({
  type: 'header_greeting',
  version: 1,
  schema: headerGreetingSchema,
  view: HeaderGreeting,
});
