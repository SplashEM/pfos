import { ERROR_CATEGORIES } from '@domain/shared/errors/error-category';
import { err, ok, type Result } from '@domain/shared/errors/result';

import type { ResolvedFundingRule } from '../contracts/resolved-funding-rule';
import { RULE_ERROR_CODES } from '../errors/rule-error-codes';
import { ruleError, type RuleDomainError } from '../errors/rule-error';

/**
 * Rejects a set of funding rules whose `sequence` values are not distinct
 * (Decision 097).
 *
 * `sequence` orders distinct buckets competing for the same money, and
 * Decision 074 classifies it as a financially meaningful ordering that
 * Decision 090 expressly preserved. Decision 097 supplies its authored source —
 * an explicit integer on the bucket-owned `REQUIRED_FUNDING` configuration —
 * and requires the values to be distinct across the rules resolved into one
 * `ResolvedRuleSet`.
 *
 * Uniqueness is forced rather than chosen. Two rules sharing a sequence leave
 * the order between their buckets undetermined, and nothing is permitted to
 * break the tie: an identifier is opaque under PFOS-ENG-00 §14, and Decision 080
 * forbids array position, repository order and storage order. Sorting a
 * duplicate pair would therefore decide which bucket is funded first from
 * whichever arrangement happened to arrive, which Constitution Principle 18 and
 * PFOS-ENG-01 §26 forbid and Constitution Principle 4 makes a silent financial
 * decision. Decision 076 reached the identical conclusion for top-priority rank,
 * and this mirrors its validator deliberately.
 *
 * Uniqueness is the only constraint applied. Sequences need not be positive,
 * contiguous or start at one, gaps carry no meaning and are not defects, and no
 * relationship between sequence order and any other authored value is checked.
 *
 * The error names no bucket. A plan containing two separate duplicate groups
 * would otherwise report whichever group the loop reached first, making the
 * message depend on input order, and canonical ordering of authored funding
 * rules is unresolved. The text is fixed and order-independent for that reason,
 * so every rejected set yields byte-identical error text.
 *
 * The input is read, never sorted or mutated, so no caller's array is disturbed.
 */
export function validateDistinctFundingSequences(
  fundingRules: readonly ResolvedFundingRule[],
): Result<void, RuleDomainError> {
  const seen = new Set<number>();

  for (const fundingRule of fundingRules) {
    if (seen.has(fundingRule.sequence)) {
      return err(
        ruleError({
          code: RULE_ERROR_CODES.RULE_FUNDING_DUPLICATE_SEQUENCE,
          category: ERROR_CATEGORIES.VALIDATION,
          summary: 'Funding requirements must each have their own order.',
          details: 'Two or more funding rules use the same sequence.',
          suggestedResolution: 'Give each funding requirement a unique sequence.',
        }),
      );
    }

    seen.add(fundingRule.sequence);
  }

  return ok(undefined);
}
