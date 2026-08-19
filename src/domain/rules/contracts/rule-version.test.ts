import { describe, expect, it } from 'vitest';

import { financialDate, type FinancialDate } from '@domain/shared/dates/financial-date';
import { asEntityId } from '@domain/shared/ids/entity-id';
import { basisPoints, type BasisPoints } from '@domain/shared/percentages/basis-points';

import { selectRuleVersionEffectiveOn } from '../services/rule-version-selection';
import type { RuleVersion } from './rule-version';

/** Builds a date, failing loudly if the test supplied an invalid one. */
function date(year: number, month: number, day: number): FinancialDate {
  const result = financialDate(year, month, day);
  if (!result.ok) {
    throw new Error(`Invalid date in test setup: ${result.error.code}`);
  }
  return result.value;
}

/** Builds a rate, failing loudly if the test supplied an invalid one. */
function rate(value: number): BasisPoints {
  const result = basisPoints(value);
  if (!result.ok) {
    throw new Error(`Invalid rate in test setup: ${result.error.code}`);
  }
  return result.value;
}

/* Decision 085's worked timeline: a rule configured in January, stopped in June. */
const CONFIGURED: RuleVersion = {
  kind: 'CONFIGURED',
  ruleVersionId: asEntityId('rule-version-1'),
  ruleId: asEntityId('rule-giving'),
  period: { effectiveFrom: date(2026, 1, 1) },
  configuration: {
    slotKind: 'GLOBAL_OBLIGATION',
    destinationBucketId: asEntityId('bucket-giving'),
    rateBasisPoints: rate(1_000),
    incomeBasis: 'NET_DEPOSITED',
    applicability: { scope: 'ALL_SOURCES' },
  },
};

const TERMINATING: RuleVersion = {
  kind: 'TERMINATING',
  ruleVersionId: asEntityId('rule-version-2'),
  ruleId: asEntityId('rule-giving'),
  period: { effectiveFrom: date(2026, 6, 1) },
};

describe('RuleVersion', () => {
  /*
   * Decision 086: a rule version is conceptually CONFIGURED or TERMINATING, and
   * no accepted source establishes a third variant. The Record is exhaustive in
   * both directions.
   */
  it('has exactly the two variants Decision 086 recognises', () => {
    const variants: Record<RuleVersion['kind'], RuleVersion> = {
      CONFIGURED,
      TERMINATING,
    };

    expect(Object.keys(variants).sort()).toEqual(['CONFIGURED', 'TERMINATING']);
  });

  /*
   * A terminating version carries no configuration field at all, so a stop
   * holding financial configuration is unrepresentable rather than invalid
   * (Decision 085).
   */
  it('gives the terminating arm no configuration to carry', () => {
    expect(Object.keys(TERMINATING)).toEqual(['kind', 'ruleVersionId', 'ruleId', 'period']);
    expect(Object.keys(TERMINATING)).not.toContain('configuration');
  });

  it('discriminates the two arms on kind', () => {
    const configuration = CONFIGURED.kind === 'CONFIGURED' ? CONFIGURED.configuration : undefined;
    const stopped = TERMINATING.kind === 'TERMINATING';

    expect(configuration?.slotKind).toBe('GLOBAL_OBLIGATION');
    expect(stopped).toBe(true);
  });

  /*
   * Decision 079 is unchanged by the union: before the stop the configured
   * version is the only effective candidate, and from the stop date onward both
   * are effective and the later start wins. A mixed collection therefore
   * selects without either type changing.
   */
  it('selects the configured version before the stop date', () => {
    const result = selectRuleVersionEffectiveOn([CONFIGURED, TERMINATING], date(2026, 5, 31));

    if (!result.ok) {
      throw new Error(`Expected a selection, but it failed with ${result.error.code}.`);
    }

    expect(result.value?.kind).toBe('CONFIGURED');
  });

  it('selects the stop from its effective date onward', () => {
    const result = selectRuleVersionEffectiveOn([CONFIGURED, TERMINATING], date(2026, 6, 1));

    if (!result.ok) {
      throw new Error(`Expected a selection, but it failed with ${result.error.code}.`);
    }

    expect(result.value?.kind).toBe('TERMINATING');
  });
});
