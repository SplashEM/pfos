import type { ConfiguredRuleVersion } from './configured-rule-version';
import type { TerminatingRuleVersion } from './terminating-rule-version';

/**
 * One version of an authored rule (Decision 085; Decision 086).
 *
 * A rule version is conceptually `CONFIGURED` or `TERMINATING`, and Decision 086
 * records that no third variant is established by any accepted source. A
 * configured version contributes its configuration from its period onward; a
 * terminating version means the rule contributes nothing from its
 * `effectiveFrom` onward.
 *
 * `kind` is the discriminant Decision 085 fixed for the terminating arm and
 * Decision 086 fixed for the configured one. No separate `RuleVersionKind` type
 * is declared: Decision 086 records that a named closed vocabulary is
 * unnecessary beside the union itself, and Decision 081 refused an equivalent
 * second name for the precedence levels because a duplicate vocabulary invites
 * storing a field that can disagree with the one it duplicates. A caller that
 * needs the type can write `RuleVersion['kind']`.
 *
 * Both arms satisfy `RuleVersionEffectivePeriodLike` structurally, so a
 * collection of these flows through `selectRuleVersionEffectiveOn` with no
 * change to Decision 079 and none to its implementation.
 *
 * This is the union and nothing more. It pairs no version with its `Rule`:
 * Decision 086 records that no accepted contract does so, and that the
 * retirement invariant and the slot-kind cross-object invariant both wait on
 * one. Ordering, selection, resolution and validation all live elsewhere.
 */
export type RuleVersion = ConfiguredRuleVersion | TerminatingRuleVersion;
