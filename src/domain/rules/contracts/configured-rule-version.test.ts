import { describe, expect, it } from 'vitest';

import { financialDate, type FinancialDate } from '@domain/shared/dates/financial-date';
import { asEntityId } from '@domain/shared/ids/entity-id';
import { basisPoints, type BasisPoints } from '@domain/shared/percentages/basis-points';

import { selectRuleVersionEffectiveOn } from '../services/rule-version-selection';
import type { ConfiguredRuleVersion } from './configured-rule-version';
import type { RuleConfiguration } from './rule-configuration';

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

function tithe(rateValue: number): RuleConfiguration {
  return {
    slotKind: 'GLOBAL_OBLIGATION',
    destinationBucketId: asEntityId('bucket-giving'),
    rateBasisPoints: rate(rateValue),
    incomeBasis: 'NET_DEPOSITED',
    applicability: { scope: 'ALL_SOURCES' },
  };
}

/* Decision 079's worked timeline: a January rule changed prospectively in April. */
const JANUARY: ConfiguredRuleVersion = {
  kind: 'CONFIGURED',
  ruleVersionId: asEntityId('rule-version-1'),
  ruleId: asEntityId('rule-giving'),
  period: { effectiveFrom: date(2026, 1, 1) },
  configuration: tithe(1_000),
};

const APRIL: ConfiguredRuleVersion = {
  kind: 'CONFIGURED',
  ruleVersionId: asEntityId('rule-version-2'),
  ruleId: asEntityId('rule-giving'),
  period: { effectiveFrom: date(2026, 4, 1) },
  configuration: tithe(1_200),
};

describe('ConfiguredRuleVersion', () => {
  it('carries exactly the five elements fixed by Decision 086', () => {
    expect(Object.keys(JANUARY)).toEqual([
      'kind',
      'ruleVersionId',
      'ruleId',
      'period',
      'configuration',
    ]);
  });

  it('uses the CONFIGURED discriminant Decision 086 fixed', () => {
    expect(JANUARY.kind).toBe('CONFIGURED');
  });

  /*
   * Decision 086 keeps the full RuleEffectivePeriod here rather than
   * Decision 085's narrowed terminating period, so a configured version may be
   * bounded or open-ended and both are valid.
   */
  it('accepts a bounded period as well as an open-ended one', () => {
    const bounded: ConfiguredRuleVersion = {
      ...JANUARY,
      period: { effectiveFrom: date(2026, 1, 1), effectiveTo: date(2026, 3, 31) },
    };

    expect(bounded.period.effectiveTo).toBeDefined();
    expect(JANUARY.period.effectiveTo).toBeUndefined();
  });

  /*
   * Decision 086 promised the configured arm would satisfy Decision 079's
   * selector structurally, with no change to either type. The selector returns
   * the caller's own object, so the configuration survives selection.
   */
  it('flows through Decision 079 selection carrying its configuration', () => {
    const result = selectRuleVersionEffectiveOn([JANUARY, APRIL], date(2026, 5, 1));

    if (!result.ok) {
      throw new Error(`Expected a selection, but it failed with ${result.error.code}.`);
    }

    expect(result.value?.ruleVersionId).toBe('rule-version-2');
    expect(result.value?.configuration).toBe(APRIL.configuration);
  });

  it('selects the January version before the April change takes effect', () => {
    const result = selectRuleVersionEffectiveOn([JANUARY, APRIL], date(2026, 3, 31));

    if (!result.ok) {
      throw new Error(`Expected a selection, but it failed with ${result.error.code}.`);
    }

    expect(result.value?.ruleVersionId).toBe('rule-version-1');
  });
});
