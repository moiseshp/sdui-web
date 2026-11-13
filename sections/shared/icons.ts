/**
 * Icons named BY THE CONTRACT (header buttons, bottom bar).
 *
 * The payload sends a semantic name (`cart`), never a library name
 * (`ShoppingCart`): the contract stays the same if the icon library changes,
 * and only the icons listed here end up in the bundle.
 * Flutter keeps the same table with the Lucide package for Flutter.
 *
 * Icons that are just part of a section's look (a close "x", an arrow) are
 * imported from lucide-react directly by that section.
 */

import { Bell, Gift, MapPin, ShoppingCart, SlidersHorizontal, TriangleAlert, User, type LucideIcon } from 'lucide-react';

const CONTRACT_ICONS: Record<string, LucideIcon> = {
  user: User,
  settings: SlidersHorizontal,
  cart: ShoppingCart,
  gift: Gift,
  map_pin: MapPin,
  warning: TriangleAlert,
  bell: Bell,
};

/** `undefined` for a name this client does not know: each section decides how to degrade. */
export function contractIcon(name: string | undefined): LucideIcon | undefined {
  return name && Object.hasOwn(CONTRACT_ICONS, name) ? CONTRACT_ICONS[name] : undefined;
}
