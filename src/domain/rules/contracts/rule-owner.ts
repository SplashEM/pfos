import type { EntityId } from '@domain/shared/ids/entity-id';

/**
 * The entity an authored rule is attached to (Decision 081; PFOS-ENG-01 §5, §6).
 *
 * The four variants are the four authored levels of §6. §5 describes each
 * category as "Rules attached to" an income source (§5.2), an individual bucket
 * (§5.3) or a bucket group (§5.4); attachment is the corpus's own word for the
 * relationship, and §8.2's global user rule is attached to nothing.
 *
 * `GLOBAL` carries no `ownerId`, and the other three each carry one. Ownership
 * is a discriminated shape rather than an `ownerType` paired with an optional
 * `ownerId`: §47.8 requires discriminated unions rather than loosely structured
 * objects, and an always-present-except-once identifier is exactly the shape it
 * names.
 *
 * There is no product-default variant. §6 level 9 is a resolver fallback step
 * rather than a fifth owner — §8.1 calls it "a predefined fallback used only
 * when the user has not made a choice", and Decision 081 records that it has
 * none of the authored-rule fields §18 requires.
 *
 * An `ownerId` is opaque (PFOS-ENG-00 §14). Nothing here parses one, derives
 * information from its shape, or infers ordering from it.
 */
export type RuleOwner =
  | { readonly ownerType: 'GLOBAL' }
  | { readonly ownerType: 'INCOME_SOURCE'; readonly ownerId: EntityId }
  | { readonly ownerType: 'BUCKET'; readonly ownerId: EntityId }
  | { readonly ownerType: 'GROUP'; readonly ownerId: EntityId };

/**
 * A §6 authored precedence level, deliberately not exported.
 *
 * Decision 081 introduces no independent stored `RulePrecedenceLevel`
 * vocabulary: levels 5 through 8 relabel the owner variants, so a second
 * exported name for them would be a duplicate vocabulary and an invitation to
 * store a field that can disagree with `ownerType`. This alias exists only so
 * the table below and the projection's signature cannot drift apart. A caller
 * that needs the type can write `ReturnType<typeof precedenceLevelOf>`.
 *
 * Levels 1 through 4 — system invariants, historical snapshot rules, simulator
 * overrides and event-level overrides — are not authored rules, and level 9 is
 * the product default, so neither is representable here.
 */
type AuthoredPrecedenceLevel = 5 | 6 | 7 | 8;

/**
 * The §6 level of each owner type, held as a Record so the compiler requires an
 * entry for every variant. It is not exported: the projection below is the only
 * way to reach a level, which is what keeps the level derived rather than
 * addressable as data.
 */
const PRECEDENCE_LEVEL_BY_OWNER_TYPE: Record<RuleOwner['ownerType'], AuthoredPrecedenceLevel> = {
  INCOME_SOURCE: 5,
  BUCKET: 6,
  GROUP: 7,
  GLOBAL: 8,
};

/**
 * The §6 precedence level an authored rule competes at, derived from its owner
 * (Decision 081; PFOS-ENG-01 §6).
 *
 * A `Rule` stores no precedence level. The level is a total function of the
 * owner, and storing it as well would create two fields that can disagree. This
 * is that function:
 *
 *   INCOME_SOURCE -> 5
 *   BUCKET        -> 6
 *   GROUP         -> 7
 *   GLOBAL        -> 8
 *
 * A lower-numbered level has higher precedence (§6). The number is the §6
 * ordinal itself rather than a rank invented here, so it stays legible against
 * the specification and against Decision 080's classification, which speaks in
 * the same numbers.
 *
 * It reads `ownerType` and nothing else. An `ownerId` cannot change the answer,
 * which is what PFOS-ENG-00 §14's opacity requires: two rules attached to
 * different buckets compete at the same level.
 *
 * This projects; it does not resolve. It compares no rules, selects no winner,
 * reads no evaluation date, and never returns level 9 — a product default is
 * not an authored rule, and the fallback step that reaches it belongs to the
 * resolver, which is not implemented here.
 */
export function precedenceLevelOf(owner: RuleOwner): AuthoredPrecedenceLevel {
  return PRECEDENCE_LEVEL_BY_OWNER_TYPE[owner.ownerType];
}
