import type { DomainWarning } from '@domain/shared/explanations/warning';

import type { RuleWarningCode } from './rule-warning-codes';

/**
 * A warning produced by the Rule Engine (Decision 077).
 *
 * The shared DomainWarning (PFOS-ENG-00 §21) is unchanged and does not become
 * generic. Decision 077 narrows it locally instead: RuleWarningCode extends
 * string, so the intersection narrows `code` and changes nothing else, and a
 * RuleDomainWarning stays assignable to DomainWarning — it can be placed in
 * ResolvedRuleSet.warnings without a cast.
 *
 * That is a deliberate difference from the sibling channels. RuleDomainError
 * and RuleExplanation narrow a generic envelope by type parameter, because
 * those envelopes were made generic when their registries were introduced. The
 * warning envelope was already accepted, and Decision 077 records that
 * obtaining the same narrowing locally was worth more than editing an accepted
 * shared contract.
 *
 * The dependency runs one way only: rules may read shared, and shared must
 * never import a Rule Engine warning type (PFOS-ENG-00 §44; Decision 073).
 *
 * ResolvedRuleSet.warnings stays `readonly DomainWarning[]`. Decision 077
 * defers narrowing the persisted field, so a historical snapshot can preserve a
 * code that was later retired.
 */
export type RuleDomainWarning = DomainWarning & {
  readonly code: RuleWarningCode;
};
