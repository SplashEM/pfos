import type { Explanation } from '@domain/shared/explanations/explanation';

import type { RuleExplanationCode } from './rule-explanation-codes';

/**
 * An explanation produced by the Rule Engine (Decision 074).
 *
 * The shared envelope carries the code as a type parameter, so the Rule Engine
 * keeps its own closed vocabulary — the RULE_EXPLAIN_* registry in
 * ./rule-explanation-codes — without the shared layer importing anything from
 * here. This mirrors RuleDomainError in ../errors/rule-error, which narrows the
 * shared error envelope the same way under Decision 073.
 *
 * The detail parameter is deliberately left at its `never` default. Decision
 * 074 records that no Rule Engine explanation-detail vocabulary is defined for
 * V1, and that the default makes structured details unavailable rather than
 * merely unused. A V1 explanation therefore carries its stable code, title,
 * summary, affected entity identifiers and the optional rule-version
 * provenance and severity. Introducing details requires an accepted decision
 * defining what they contain.
 *
 * Explanations accompany a successful resolution. A failure is a
 * RuleDomainError, and the machine-readable reason a rule did not apply is a
 * RULE_SKIP_* code on the corresponding SkippedRule. Decision 074 keeps the
 * three registries separate because they serve different consumers.
 */
export type RuleExplanation = Explanation<RuleExplanationCode>;
