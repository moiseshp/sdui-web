/**
 * Decides whether a raw section from the payload can be rendered.
 *
 * Same checks, same order, on every platform:
 *   1. envelope valid?          → otherwise `invalid_section`
 *   2. type in the registry?    → otherwise `unknown_type`
 *   3. version supported?       → otherwise `version_mismatch`
 *   4. props match the schema?  → otherwise `invalid_props`
 * The platform then renders the view (and turns a crash into `render_error`).
 */

import { SectionSchema, type Section } from '../contract/screen';
import type { SduiIssue } from '../contract/issues';
import type { SectionRegistry } from './registry';

export type SectionResolution<View> =
  | { ok: true; section: Section; view: View; props: unknown }
  | { ok: false; issue: SduiIssue };

export function resolveSection<View>(raw: unknown, registry: SectionRegistry<View>): SectionResolution<View> {
  const envelope = SectionSchema.safeParse(raw);
  if (!envelope.success) {
    const issue = envelope.error.issues[0];
    return {
      ok: false,
      issue: { code: 'invalid_section', message: `${issue?.path.join('.') || '(root)'}: ${issue?.message}` },
    };
  }

  const section = envelope.data;
  const where = { sectionId: section.id, sectionType: section.type };
  const definition = registry[section.type];

  if (!definition) {
    return { ok: false, issue: { code: 'unknown_type', message: 'Type not in the client registry', ...where } };
  }

  // A newer props shape cannot be trusted with an older schema.
  if (section.version > definition.version) {
    return {
      ok: false,
      issue: {
        code: 'version_mismatch',
        message: `Got v${section.version}, client supports up to v${definition.version}`,
        ...where,
      },
    };
  }

  const props = definition.schema.safeParse(section.props ?? {});
  if (!props.success) {
    const issue = props.error.issues[0];
    return {
      ok: false,
      issue: { code: 'invalid_props', message: `${issue?.path.join('.') || '(root)'}: ${issue?.message}`, ...where },
    };
  }

  return { ok: true, section, view: definition.view, props: props.data };
}
