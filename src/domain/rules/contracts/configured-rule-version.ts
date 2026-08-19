import type { RuleEffectivePeriod } from './rule-effective-period';
import type { RuleConfiguration } from './rule-configuration';
import type { RuleId, RuleVersionId } from './rule-identifiers';

/**
 * The version that carries a rule's authored configuration (Decision 086).
 *
 * Decision 086 fixed this envelope: a `CONFIGURED` discriminant, the version's
 * own identity, the stable rule whose timeline it belongs to, Decision 078's
 * `RuleEffectivePeriod` in full, and a required non-nullable configuration.
 * Those five elements are a minimum rather than a closed field list — whether
 * further fields join them is unresolved, and the PFOS-ENG-01 §41 metadata
 * questions (`createdAt`, `versionNumber`, `supersedesVersionId`,
 * `changeReason`) are neither included nor excluded here.
 *
 * `configuration` is never absent and never nullable. Decision 085 rejected an
 * absent or nullable configuration as a way of expressing a stop, because
 * PFOS-ENG-00 §29.1 treats imported content as untrusted and a truncated record
 * would become a deliberate financial instruction; the same reasoning makes the
 * element required here, so that silence is never read as an instruction under
 * Constitution Principle 4. A stop is the separate `TerminatingRuleVersion`
 * variant, which carries no configuration field at all.
 *
 * The period is the full `RuleEffectivePeriod`, including its optional
 * `effectiveTo`. A configured version may be bounded or open-ended and both are
 * valid. Decision 085's narrowing of the period to `effectiveFrom` alone stays
 * specific to a terminating version, where an elapsed bound would silently
 * resume terms the user stopped; a configured version carries no equivalent
 * hazard, because an elapsed configured version leaves either an older
 * configured version or a stop, and both are authored.
 *
 * The field is named `period`, not `effectivePeriod`, matching
 * `RuleVersionEffectivePeriodLike` and `TerminatingRuleVersion`. That is what
 * lets this satisfy Decision 079's selector structurally: the period is
 * `RuleEffectivePeriod` itself, so `selectRuleVersionEffectiveOn` accepts a
 * collection of these and returns the caller's own object with its discriminant
 * and configuration intact, with no change to Decision 079.
 *
 * A cross-object invariant exists and is deliberately unenforced here:
 *
 *   configuration.slotKind === Rule.slotKind
 *
 * Decision 086 accepted the redundancy on the ground that a configuration's
 * family is not derivable from the configuration value itself and must be
 * available at run time for safe discrimination and for validating untrusted
 * persisted input. It authorised no validator for the invariant and registered
 * no error code, and no accepted contract pairs a `Rule` with its versions, so
 * nothing here checks it.
 */
export interface ConfiguredRuleVersion {
  readonly kind: 'CONFIGURED';
  readonly ruleVersionId: RuleVersionId;
  readonly ruleId: RuleId;
  readonly period: RuleEffectivePeriod;
  readonly configuration: RuleConfiguration;
}
