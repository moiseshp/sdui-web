/**
 * What the HOME can render: its sections, picked from the shared catalog
 * (/sections). Each screen has its own registry (plp-registry.ts,
 * checkout-registry.ts...), so a screen only bundles what it uses.
 *
 * Adding a section to the home = one line here. A type that is not listed is
 * skipped and reported as `unknown_type`.
 */

import { createSectionRegistry } from '@/lib/sdui/registry/define-section';
import { bottomBar } from '@/sections/bottom-bar';
import { headerDefault } from '@/sections/header-default';
import { headerGreeting } from '@/sections/header-greeting';
import { heroCarousel } from '@/sections/hero-carousel';
import { productList } from '@/sections/product-list';
import { promoBanner } from '@/sections/promo-banner';

export const homeRegistry = createSectionRegistry([
  // header slot
  headerDefault,
  headerGreeting,
  // body
  heroCarousel,
  productList,
  promoBanner,
  // bottomBar slot
  bottomBar,
]);
