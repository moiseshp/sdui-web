/**
 * Registers a section for React: here a section's view is a component.
 * (In Flutter, it is a widget builder.)
 */

import type { ComponentType } from 'react';
import { createRegistry, type SectionDefinition, type SectionRegistry } from './registry';

// `any` lets one registry hold sections with different props. Type safety
// lives in `defineSection`, where a schema and its component meet.
export type SectionView = ComponentType<any>;
export type ReactSectionRegistry = SectionRegistry<SectionView>;

/** Binds a component to its schema: TypeScript fails if their props disagree. */
export function defineSection<P>(definition: SectionDefinition<P, ComponentType<P>>): SectionDefinition<unknown, SectionView> {
  return definition as SectionDefinition<unknown, SectionView>;
}

export function createSectionRegistry(definitions: SectionDefinition<unknown, SectionView>[]): ReactSectionRegistry {
  return createRegistry(definitions);
}
