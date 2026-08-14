import type { EntityId } from '@domain/shared/ids/entity-id';

/**
 * The stable identity of an authored rule (Decision 078; PFOS-ENG-01 §41).
 *
 * A Rule persists across edits. Editing it creates a new version rather than
 * mutating the historical meaning of the previous one (§18), so a RuleId
 * outlives every version it has had.
 *
 * This is a semantic alias of EntityId, following the treatment Decision 074
 * established for PlanVersionId. No second brand is introduced, so it is
 * semantically distinct but not type-distinct from another EntityId, and the
 * distinction is preserved through field names, construction paths,
 * documentation and tests rather than through the compiler.
 *
 * PFOS-ENG-00 §14 keeps an identifier opaque: domain logic must never parse
 * one, derive information from its shape, or infer ordering from it. No
 * constructor, validator or parser is declared here for that reason —
 * `asEntityId` remains the only construction path.
 */
export type RuleId = EntityId;

/**
 * The identity of one version of an authored rule (Decision 078;
 * PFOS-ENG-01 §41).
 *
 * Decision 078 places a rule's effective period on the version rather than on
 * the stable Rule, so this identifies the thing that period will belong to. It
 * is also what `ResolvedRuleSet.sourceRuleVersionIds` records as provenance
 * (Decision 074), and §19.1 requires a version used in a confirmed allocation
 * to remain reconstructable.
 *
 * It is an alias of EntityId on the same terms as RuleId above.
 *
 * It is not a PlanVersionId. That identifies the plan configuration a resolved
 * rule set was produced from, and Decision 078 records that an authored rule
 * must not depend on resolution.
 */
export type RuleVersionId = EntityId;
