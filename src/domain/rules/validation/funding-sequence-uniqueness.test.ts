import { money } from '@test/builders/money';
import { describe, expect, it } from 'vitest';

import { asEntityId } from '@domain/shared/ids/entity-id';

import type { ResolvedFundingRule } from '../contracts/resolved-funding-rule';
import { RULE_ERROR_CODES } from '../errors/rule-error-codes';
import { validateDistinctFundingSequences } from './funding-sequence-uniqueness';

function fundingRule(bucket: string, sequence: number): ResolvedFundingRule {
  return {
    bucketId: asEntityId(bucket),
    ruleVersionId: asEntityId(`rule-version-${bucket}`),
    sequence,
    isProtected: false,
    allowExcessAboveCapacity: false,
    funding: { type: 'FIXED_PER_PAYCHECK', amount: money(10_000) },
  };
}

describe('distinct funding sequences', () => {
  it('accepts an empty set', () => {
    expect(validateDistinctFundingSequences([]).ok).toBe(true);
  });

  it('accepts one funding rule', () => {
    expect(validateDistinctFundingSequences([fundingRule('a', 1)]).ok).toBe(true);
  });

  it('accepts distinct sequences', () => {
    const result = validateDistinctFundingSequences([
      fundingRule('a', 1),
      fundingRule('b', 2),
      fundingRule('c', 3),
    ]);

    expect(result.ok).toBe(true);
  });

  it('rejects two rules sharing a sequence', () => {
    const result = validateDistinctFundingSequences([fundingRule('a', 1), fundingRule('b', 1)]);

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error('Expected a duplicate sequence to be rejected.');
    }
    expect(result.error.code).toBe(RULE_ERROR_CODES.RULE_FUNDING_DUPLICATE_SEQUENCE);
  });

  /*
   * Decision 097 constrains sequences only by uniqueness, following
   * Decision 076's holding for rank: values need not be positive, contiguous or
   * start at one, and gaps are not defects.
   */
  it('accepts negative, non-contiguous sequences that do not start at one', () => {
    const result = validateDistinctFundingSequences([
      fundingRule('a', -4),
      fundingRule('b', 0),
      fundingRule('c', 97),
    ]);

    expect(result.ok).toBe(true);
  });

  /*
   * The message must not depend on input order: canonical ordering of authored
   * funding rules is unresolved, so every rejected set yields identical text.
   */
  it('reports byte-identical text whatever arrangement produced the duplicate', () => {
    const first = validateDistinctFundingSequences([
      fundingRule('a', 1),
      fundingRule('b', 1),
      fundingRule('c', 2),
    ]);
    const second = validateDistinctFundingSequences([
      fundingRule('c', 2),
      fundingRule('b', 1),
      fundingRule('a', 1),
    ]);

    if (first.ok || second.ok) {
      throw new Error('Expected both arrangements to be rejected.');
    }

    expect(first.error.summary).toBe(second.error.summary);
    expect(first.error.details).toBe(second.error.details);
  });

  it('does not mutate or reorder the caller array', () => {
    const rules = [fundingRule('b', 2), fundingRule('a', 1)];
    const snapshot = [...rules];

    validateDistinctFundingSequences(rules);

    expect(rules).toEqual(snapshot);
  });
});
