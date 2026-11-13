import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Joins Tailwind classes: `clsx` drops falsy values and handles conditionals,
 * `twMerge` resolves conflicts so the last class wins (`px-4` + `px-2` → `px-2`).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
