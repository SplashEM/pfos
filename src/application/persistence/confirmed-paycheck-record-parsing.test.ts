import { describe, expect, it } from 'vitest';

import { allocationRecord, planSnapshotRecord } from '@test/builders/confirmed-paycheck';

import { APPLICATION_ERROR_CODES } from '../errors/application-error-codes';
import {
  parseAllocationRecord,
  parsePlanSnapshotRecord,
} from './confirmed-paycheck-record-parsing';
import {
  ALLOCATION_RECORD_SCHEMA_VERSION,
  PLAN_SNAPSHOT_SCHEMA_VERSION,
} from './confirmed-paycheck-records';

/** Unwraps a parse that must succeed. */
function parsedSnapshot(value: unknown) {
  const result = parsePlanSnapshotRecord(value);
  if (!result.ok) {
    throw new Error(`Expected a readable snapshot: ${result.error.code} — ${result.error.details}`);
  }
  return result.value;
}

/** Unwraps a parse that must succeed. */
function parsedAllocation(value: unknown) {
  const result = parseAllocationRecord(value);
  if (!result.ok) {
    throw new Error(
      `Expected a readable allocation: ${result.error.code} — ${result.error.details}`,
    );
  }
  return result.value;
}

/** The code a rejected parse reported. */
function snapshotFailure(value: unknown): string {
  const result = parsePlanSnapshotRecord(value);
  if (result.ok) {
    throw new Error('Expected the snapshot to be refused.');
  }
  return result.error.code;
}

/**
 * The same record with one member missing, as a half-written one would be.
 *
 * Typed loosely on purpose: the point of each check below is that a value which
 * is not a valid record is refused, and a fixture that still satisfied the
 * contract would not be testing anything.
 */
function without(record: object, member: string): Record<string, unknown> {
  const copy: Record<string, unknown> = { ...record };
  delete copy[member];
  return copy;
}

/** The code a rejected parse reported. */
function allocationFailure(value: unknown): string {
  const result = parseAllocationRecord(value);
  if (result.ok) {
    throw new Error('Expected the allocation to be refused.');
  }
  return result.error.code;
}

describe('reading a stored Plan Snapshot', () => {
  it('reads a valid record', () => {
    expect(parsedSnapshot(planSnapshotRecord()).id).toBe('plan-snapshot-1');
  });

  /*
   * Decision 098 holding 5: the snapshot stores the complete resolved rule set
   * by value. What comes back must be the plan that was confirmed, not a
   * reference to whatever the current plan resolves to now.
   */
  it('keeps the embedded resolved rule set by value', () => {
    const record = planSnapshotRecord();

    expect(parsedSnapshot(record).resolvedRuleSet).toEqual(record.resolvedRuleSet);
  });

  it('keeps the rounding policy and evaluation date the snapshot was taken under', () => {
    const resolved = parsedSnapshot(planSnapshotRecord()).resolvedRuleSet;

    expect(resolved.roundingPolicyId).toBe('PFOS-ROUND-071-V1');
    expect(resolved.evaluationDate).toEqual({ year: 2026, month: 1, day: 15 });
  });

  it('refuses a snapshot written under a different envelope version', () => {
    expect(snapshotFailure(planSnapshotRecord({ schemaVersion: 2 }))).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_UNSUPPORTED_SCHEMA_VERSION,
    );
  });

  /*
   * The embedded contract carries its own version, and Decisions 092 and 095
   * left both compatibility directions undefined. An unrecognised one is
   * refused rather than interpreted.
   */
  it('refuses a snapshot holding a resolved rule set of another version', () => {
    const record = planSnapshotRecord();
    const stale = {
      ...record,
      resolvedRuleSet: { ...record.resolvedRuleSet, schemaVersion: 2 },
    };

    expect(snapshotFailure(stale)).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_UNSUPPORTED_SCHEMA_VERSION,
    );
  });

  it('refuses a snapshot with no resolved rule set at all', () => {
    const withoutPlan = without(planSnapshotRecord(), 'resolvedRuleSet');

    expect(snapshotFailure(withoutPlan)).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
    );
  });

  it('refuses a resolved rule set missing a member the contract fixes', () => {
    const record = planSnapshotRecord();
    const damaged = without(record.resolvedRuleSet, 'globalObligations');

    expect(snapshotFailure({ ...record, resolvedRuleSet: damaged })).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
    );
  });

  it('refuses a snapshot without an identity', () => {
    expect(snapshotFailure(planSnapshotRecord({ id: '' }))).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
    );
  });

  it('refuses a snapshot for an event kind this build does not store', () => {
    expect(snapshotFailure({ ...planSnapshotRecord(), eventType: 'RECONCILIATION' })).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
    );
  });

  it('refuses anything that is not a record', () => {
    for (const value of [undefined, null, 7, 'snapshot', []]) {
      expect(snapshotFailure(value)).toBe(
        APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
      );
    }
  });
});

describe('a stored plan whose outer members look right', () => {
  /**
   * Damages one member deep inside the resolved rule set, leaving everything a
   * shallow reader would look at intact: the envelope, both schema versions and
   * every top-level member of the plan itself.
   */
  function withDamagedPlan(damage: (plan: Record<string, unknown>) => void): unknown {
    const record = planSnapshotRecord();
    const plan = structuredClone(record.resolvedRuleSet) as unknown as Record<string, unknown>;

    damage(plan);

    return { ...record, resolvedRuleSet: plan };
  }

  /** One of the plan's resolved collections, as plain records. */
  function entriesOf(plan: Record<string, unknown>, member: string): Record<string, unknown>[] {
    return plan[member] as Record<string, unknown>[];
  }

  /*
   * The adversarial case Decision 098 holding 8 exists for: a snapshot that
   * passes every surface check while carrying a funding amount that is not
   * money. It must not read back as a valid record.
   */
  it('refuses a funding rule whose amount is not money', () => {
    const damaged = withDamagedPlan((plan) => {
      const funding = entriesOf(plan, 'requiredFundingRules')[0]?.['funding'] as Record<
        string,
        unknown
      >;
      funding['amount'] = '500.00';
    });

    expect(snapshotFailure(damaged)).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
    );
  });

  it('refuses a funding amount that lost its currency', () => {
    const damaged = withDamagedPlan((plan) => {
      const funding = entriesOf(plan, 'requiredFundingRules')[0]?.['funding'] as Record<
        string,
        unknown
      >;
      funding['amount'] = { cents: 50_000 };
    });

    expect(snapshotFailure(damaged)).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
    );
  });

  it('refuses a funding amount in fractional cents', () => {
    const damaged = withDamagedPlan((plan) => {
      const funding = entriesOf(plan, 'requiredFundingRules')[0]?.['funding'] as Record<
        string,
        unknown
      >;
      funding['amount'] = { cents: 50_000.5, currency: 'USD' };
    });

    expect(snapshotFailure(damaged)).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
    );
  });

  it('refuses a funding type that names no arm of the contract', () => {
    const damaged = withDamagedPlan((plan) => {
      const funding = entriesOf(plan, 'requiredFundingRules')[0]?.['funding'] as Record<
        string,
        unknown
      >;
      funding['type'] = 'INVENTED_FUNDING';
    });

    expect(snapshotFailure(damaged)).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
    );
  });

  /* A rate outside 0 to 10,000 basis points is not a rate (PFOS-ENG-00 §11). */
  it('refuses an obligation rate outside the basis-point range', () => {
    const damaged = withDamagedPlan((plan) => {
      const obligation = entriesOf(plan, 'globalObligations')[0];
      if (obligation !== undefined) {
        obligation['rateBasisPoints'] = 20_000;
      }
    });

    expect(snapshotFailure(damaged)).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
    );
  });

  it('refuses an obligation rate that is not a number', () => {
    const damaged = withDamagedPlan((plan) => {
      const obligation = entriesOf(plan, 'globalObligations')[0];
      if (obligation !== undefined) {
        obligation['rateBasisPoints'] = '10%';
      }
    });

    expect(snapshotFailure(damaged)).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
    );
  });

  it('refuses a top priority whose rank is not a number', () => {
    const damaged = withDamagedPlan((plan) => {
      const priorities = plan['topPriorities'] as Record<string, unknown>;
      const entry = (priorities['entries'] as Record<string, unknown>[])[0];
      if (entry !== undefined) {
        entry['rank'] = 'first';
      }
    });

    expect(snapshotFailure(damaged)).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
    );
  });

  it('refuses a leftover policy naming a strategy the contract does not have', () => {
    const damaged = withDamagedPlan((plan) => {
      plan['leftoverPolicy'] = { policyType: 'SEND_IT_ALL_SOMEWHERE' };
    });

    expect(snapshotFailure(damaged)).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
    );
  });

  it('refuses a leftover destination that lost its bucket', () => {
    const damaged = withDamagedPlan((plan) => {
      plan['leftoverPolicy'] = { policyType: 'SINGLE_DESTINATION' };
    });

    expect(snapshotFailure(damaged)).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
    );
  });

  /* Decision 094: a product-default rollover arm carries no rule version. */
  it('refuses a product-default rollover policy carrying an authored version', () => {
    const damaged = withDamagedPlan((plan) => {
      plan['rolloverPolicies'] = [
        {
          bucketId: 'bucket-emergency-fund',
          provenance: { kind: 'PRODUCT_DEFAULT', ruleVersionId: 'rule-version-1' },
          policy: { policyType: 'CARRY_ALL' },
        },
      ];
    });

    expect(snapshotFailure(damaged)).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
    );
  });

  it('reads an authored rollover policy that is well formed', () => {
    const intact = withDamagedPlan((plan) => {
      plan['rolloverPolicies'] = [
        {
          bucketId: 'bucket-emergency-fund',
          provenance: { kind: 'AUTHORED', ruleVersionId: 'rule-version-1' },
          policy: { policyType: 'CARRY_TO_CAP', capAmount: { cents: 100_000, currency: 'USD' } },
        },
      ];
    });

    expect(parsedSnapshot(intact).resolvedRuleSet.rolloverPolicies).toHaveLength(1);
  });

  it('refuses a rollover cap that is not money', () => {
    const damaged = withDamagedPlan((plan) => {
      plan['rolloverPolicies'] = [
        {
          bucketId: 'bucket-emergency-fund',
          provenance: { kind: 'AUTHORED', ruleVersionId: 'rule-version-1' },
          policy: { policyType: 'CARRY_TO_CAP', capAmount: 1_000 },
        },
      ];
    });

    expect(snapshotFailure(damaged)).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
    );
  });

  it('refuses a stage the Rule Engine does not name', () => {
    const damaged = withDamagedPlan((plan) => {
      plan['stageSequence'] = ['GLOBAL_OBLIGATION', 'IMPROVISED_STAGE'];
    });

    expect(snapshotFailure(damaged)).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
    );
  });

  it('refuses a resolution mode the contract does not have', () => {
    const damaged = withDamagedPlan((plan) => {
      plan['resolutionMode'] = 'GUESSED';
    });

    expect(snapshotFailure(damaged)).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
    );
  });

  it('refuses an evaluation date that is not a calendar date', () => {
    const damaged = withDamagedPlan((plan) => {
      plan['evaluationDate'] = '2026-01-15';
    });

    expect(snapshotFailure(damaged)).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
    );
  });

  /*
   * Decision 077 defers narrowing the persisted warning field so a snapshot can
   * preserve a code that was later retired. A stored warning this build no
   * longer issues must still read, or the snapshot would lose the history it
   * exists to keep.
   */
  it('reads a warning whose code this build no longer issues', () => {
    const historical = withDamagedPlan((plan) => {
      plan['warnings'] = [
        { code: 'RULE_WARNING_RETIRED_IN_A_LATER_BUILD', message: 'Kept.', affectedEntityIds: [] },
      ];
    });

    expect(parsedSnapshot(historical).resolvedRuleSet.warnings).toHaveLength(1);
  });

  it('refuses a warning that carries no message', () => {
    const damaged = withDamagedPlan((plan) => {
      plan['warnings'] = [{ code: 'RULE_WARNING_SOMETHING', affectedEntityIds: [] }];
    });

    expect(snapshotFailure(damaged)).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
    );
  });

  /* The checks above would pass vacuously against a plan with nothing in it. */
  it('reads the plan the resolver actually produced', () => {
    const plan = parsedSnapshot(planSnapshotRecord()).resolvedRuleSet;

    expect(plan.requiredFundingRules.length).toBeGreaterThan(0);
    expect(plan.globalObligations.length).toBeGreaterThan(0);
  });
});

describe('reading a stored allocation', () => {
  it('reads a valid record', () => {
    expect(parsedAllocation(allocationRecord()).id).toBe('allocation-1');
  });

  it('keeps every cent exactly as stored', () => {
    const allocation = parsedAllocation(allocationRecord());

    expect(allocation.totalInputCents).toBe(200_000);
    expect(allocation.totalAllocatedCents).toBe(200_000);
    expect(allocation.totalUnallocatedCents).toBe(0);
    expect(allocation.components.map((component) => component.amountCents)).toEqual([
      20_000, 50_000, 130_000,
    ]);
  });

  /* Decision 098 holding 6: the facts, not the sentence built from them. */
  it('keeps the structured explanation facts', () => {
    const allocation = parsedAllocation(allocationRecord());

    expect(allocation.components.map((component) => component.explanation)).toEqual([
      { code: 'ALLOCATION_EXPLAIN_OBLIGATION_RATE', rateBasisPoints: 1_000 },
      {
        code: 'ALLOCATION_EXPLAIN_PRIORITY_FUNDED_IN_FULL',
        rank: 1,
        requestedAmountCents: 50_000,
      },
      { code: 'ALLOCATION_EXPLAIN_LEFTOVER_REMAINDER' },
    ]);
  });

  it('keeps the order the lines were confirmed in', () => {
    expect(
      parsedAllocation(allocationRecord()).components.map((component) => component.stableOrder),
    ).toEqual([0, 1, 2]);
  });

  it('refuses an allocation written under a different envelope version', () => {
    expect(allocationFailure(allocationRecord({ schemaVersion: 99 }))).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_UNSUPPORTED_SCHEMA_VERSION,
    );
  });

  /* PFOS-ENG-00 §32 Invariant 1, checked on the stored value. */
  it('refuses an allocation whose totals do not conserve the paycheck', () => {
    expect(allocationFailure(allocationRecord({ totalAllocatedCents: 199_999 }))).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_CONSERVATION_VIOLATED,
    );
  });

  it('refuses a fractional amount', () => {
    expect(allocationFailure(allocationRecord({ totalInputCents: 200_000.5 }))).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
    );
  });

  it('refuses an amount outside the safe integer range', () => {
    expect(allocationFailure(allocationRecord({ totalInputCents: Number.MAX_VALUE }))).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
    );
  });

  it('refuses a currency this build does not store', () => {
    expect(allocationFailure({ ...allocationRecord(), currency: 'EUR' })).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
    );
  });

  it('refuses a status other than confirmed', () => {
    expect(allocationFailure({ ...allocationRecord(), status: 'PREVIEW' })).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
    );
  });

  it('refuses an allocation that names no snapshot', () => {
    expect(allocationFailure(allocationRecord({ planSnapshotId: '' }))).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
    );
  });

  it('refuses a component at a stage the Rule Engine does not name', () => {
    const record = allocationRecord();
    const components = [
      { ...record.components[0], stage: 'IMPROVISED_STAGE' },
      ...record.components.slice(1),
    ];

    expect(allocationFailure({ ...record, components })).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
    );
  });

  it('refuses a component whose explanation code is unknown', () => {
    const record = allocationRecord();
    const components = [
      { ...record.components[0], explanation: { code: 'ALLOCATION_EXPLAIN_INVENTED' } },
      ...record.components.slice(1),
    ];

    expect(allocationFailure({ ...record, components })).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
    );
  });

  it('refuses a component missing the amount it recorded', () => {
    const record = allocationRecord();
    const damaged = without(record.components[0] ?? {}, 'amountCents');

    expect(
      allocationFailure({ ...record, components: [damaged, ...record.components.slice(1)] }),
    ).toBe(APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED);
  });

  it('refuses an allocation with no component list', () => {
    const withoutComponents = without(allocationRecord(), 'components');

    expect(allocationFailure(withoutComponents)).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
    );
  });

  it('refuses a confirmation time that is not a moment', () => {
    expect(allocationFailure({ ...allocationRecord(), confirmedAt: 1_767_225_600_000 })).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
    );
  });
});

describe('what a refusal says', () => {
  /* Nothing shown to a person names a store, a key or a stack. */
  it('reports a summary that is safe to show', () => {
    const result = parseAllocationRecord({ schemaVersion: 4 });
    if (result.ok) {
      throw new Error('Expected a refusal.');
    }

    expect(result.error.summary).toBe(
      'A saved paycheck was written by a different version of PFOS and was not read.',
    );
    expect(result.error.summary).not.toMatch(/indexeddb|object store|undefined|null/i);
  });

  it('says the stored record was left alone', () => {
    const result = parsePlanSnapshotRecord({ schemaVersion: PLAN_SNAPSHOT_SCHEMA_VERSION });
    if (result.ok) {
      throw new Error('Expected a refusal.');
    }

    expect(result.error.suggestedResolution).toContain('unchanged');
  });

  it('names the versions this build reads', () => {
    const result = parseAllocationRecord(allocationRecord({ schemaVersion: 7 }));
    if (result.ok) {
      throw new Error('Expected a refusal.');
    }

    expect(result.error.details).toContain(String(ALLOCATION_RECORD_SCHEMA_VERSION));
  });
});
