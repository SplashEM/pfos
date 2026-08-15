import type { FinancialDate } from '@domain/shared/dates/financial-date';

import type { RuleId, RuleVersionId } from './rule-identifiers';

/**
 * The version that stops a rule's contribution from a date onward
 * (Decision 085; Decision 083; PFOS-ENG-01 §18, §28, §47.8).
 *
 * Decision 083 fixed that a stop must be a prospective, dated, append-only,
 * non-mutating event in the rule's own version timeline, and deferred only how
 * it is represented. This is that representation. From `effectiveFrom` onward,
 * a selected version of this shape means the rule contributes nothing.
 *
 * An intentional stop must be explicit and impossible to confuse with
 * incomplete or corrupt data, so it is an explicit discriminated variant rather
 * than an absence. §29.1 treats imported content as untrusted, and reading a
 * missing or nullable configuration as a stop would let a truncated record
 * become a deliberate financial instruction. A `configuration.enabled` flag and
 * an independent `terminatesRule` boolean were rejected too: each permits a
 * version that carries a live configuration alongside its own stop, the
 * two-fields-that-can-disagree hazard Decision 081 rejected for a stored
 * precedence level and Decision 083 rejected for a dated status.
 *
 * This variant carries no configuration field at all, so a terminating version
 * holding financial configuration is unrepresentable rather than merely invalid.
 *
 * `kind` is the discriminant of a future `RuleVersion` union whose other arm
 * carries the rule's configuration. Only this arm and its literal are fixed
 * here. The configured arm, the union itself and any closed kind vocabulary
 * belong to the `RuleVersion` payload decision: nothing today requires a closed
 * kind type, and declaring one would close a variant vocabulary Decision 085
 * has no authority to close. No `RuleVersionKind` is declared for that reason.
 *
 * The period field is named `period`, not `effectivePeriod`, because shipped
 * code fixes it: `RuleVersionEffectivePeriodLike` records that a future
 * `RuleVersion` will satisfy it structurally without either type changing, and
 * this does. `selectRuleVersionEffectiveOn` is generic over that shape and
 * returns the caller's own object, so a terminating version flows through
 * Decision 079 selection with no change to Decision 079 and none to its
 * implementation.
 *
 * The period is narrowed to `effectiveFrom` alone, so a bounded stop is
 * unrepresentable rather than invalid, and the narrowing is what removes a
 * validator and an error code. A bounded stop is a concrete hazard, not a
 * disfavoured style: when its bound elapsed it would drop out of `isEffectiveOn`
 * and leave an older open-ended configured version the only effective
 * candidate, so under Decision 079 that older version would be selected again
 * and terms the user stopped would resume with no authored act at any point —
 * a silent financial decision under Constitution Principle 4 and an unauthored
 * change under Decision 022. Resumption is always an explicit later configured
 * version.
 *
 * `ruleId` is carried because a stop is an event in one rule's timeline and
 * says which rule it stops. It is stable identity, so it is the same `RuleId`
 * every other version of that rule carries.
 *
 * What this contract does not do:
 *
 * - it does not select. Decision 079 is unchanged: before the stop date the
 *   previous version is the only effective candidate, and from the stop date
 *   onward both are effective and the later start wins, which Decision 079
 *   records as the ordinary shape. The starts differ, so the duplicate-start
 *   validator is satisfied without change;
 * - it does not resolve or materialise. That a selected terminating version
 *   means the rule contributes nothing is post-selection meaning, and no
 *   resolver behavior is authorised here;
 * - it does not validate. Decision 085 authorises no validator and no error
 *   code. Prospectivity is checked when a stop is authored, against a supplied
 *   authoring date, and never against stored history: the domain may not read a
 *   clock (PFOS-ENG-00 §13.4), and a stored-history check comparing old stops
 *   against "now" would reject every historical stop a day after it was
 *   authored. No authoring layer exists, so that check is deferred with it. The
 *   retirement invariant — a `RETIRED` rule's greatest-start version must be
 *   terminating — spans a rule together with its versions, and no accepted
 *   contract pairs them;
 * - it does not carry a status. A stop and a `Rule.status` are different
 *   questions: several terminating versions may occur over one rule's lifetime,
 *   and a rule that is merely stopped stays `ACTIVE` and stays inside
 *   Decision 084's authored-scope uniqueness domain, which is correct because
 *   the user has stopped the rule without removing it from the plan;
 * - it does not decide provenance. Whether a selected stop's identifier belongs
 *   in `sourceRuleVersionIds` is unsettled and Decision 074 is not amended.
 *
 * A rule with no effective version and a rule whose effective version
 * terminates it both contribute nothing, and they are not the same state. Only
 * the second records an authored, dated act; the first says only that the
 * timeline covers nothing on that date. They must not be merged, which is why
 * `RULE_SKIP_NOT_EFFECTIVE_ON_EVALUATION_DATE` must not describe a selected
 * terminating version — its registered meaning is that no version was in
 * effect, and here one is effective and is selected.
 */
export interface TerminatingRuleVersion {
  readonly kind: 'TERMINATING';
  readonly ruleVersionId: RuleVersionId;
  readonly ruleId: RuleId;
  readonly period: {
    readonly effectiveFrom: FinancialDate;
  };
}
