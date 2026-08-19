import {
  buildAuthoredPaycheckPlan,
  DEFAULT_PAYCHECK_PLAN,
  SAMPLE_INCOME_SOURCE,
  type EditablePaycheckPlan,
} from '@application/paycheck/paycheck-plan';
import {
  ALLOCATION_RECORD_SCHEMA_VERSION,
  PLAN_SNAPSHOT_SCHEMA_VERSION,
  type AllocationComponentRecord,
  type AllocationRecord,
  type PlanSnapshotRecord,
} from '@application/persistence/confirmed-paycheck-records';
import type { ResolvedRuleSet } from '@domain/rules/contracts/resolved-rule-set';
import { resolveRuleSet } from '@domain/rules/services/resolve-rule-set';
import { financialDate } from '@domain/shared/dates/financial-date';
import { timestamp } from '@domain/shared/dates/timestamp';
import { asEntityId } from '@domain/shared/ids/entity-id';

/**
 * Fixtures for the persisted confirmed-paycheck records (PFOS-ENG-00 §33).
 *
 * The resolved rule set is produced by the real resolver rather than typed out
 * by hand. A hand-written literal would drift from the contract the moment a
 * member changed, and the tests that matter here — that a stored snapshot keeps
 * the plan it was confirmed against — are only meaningful against a resolved
 * set PFOS would actually have produced.
 */

/* A fixed moment, so no fixture reads a clock. */
const FIXED_MOMENT = 1_767_225_600_000;

/** Unwraps a fixture step that cannot fail, loudly if it ever does. */
function must<T>(result: { ok: true; value: T } | { ok: false; error: { code: string } }): T {
  if (!result.ok) {
    throw new Error(`Fixture could not be built: ${result.error.code}`);
  }
  return result.value;
}

/** A genuine resolved rule set for a plan, as the Rule Engine would resolve it. */
export function resolvedRuleSetFor(
  plan: EditablePaycheckPlan = DEFAULT_PAYCHECK_PLAN,
): ResolvedRuleSet {
  const authored = must(buildAuthoredPaycheckPlan(plan));
  const evaluationDate = must(financialDate(2026, 1, 15));
  const resolvedAt = must(timestamp(FIXED_MOMENT, 'America/Los_Angeles'));

  return must(
    resolveRuleSet({
      rules: authored.rules,
      evaluationDate,
      incomeSourceId: SAMPLE_INCOME_SOURCE,
      resolvedRuleSetId: asEntityId('resolved-rule-set-fixture'),
      planVersionId: asEntityId('plan-version-fixture'),
      resolvedAt,
      resolutionMode: 'PREVIEW',
    }),
  );
}

/** A valid stored Plan Snapshot. */
export function planSnapshotRecord(
  overrides: Partial<PlanSnapshotRecord> = {},
): PlanSnapshotRecord {
  return {
    id: 'plan-snapshot-1',
    schemaVersion: PLAN_SNAPSHOT_SCHEMA_VERSION,
    createdAt: { epochMilliseconds: FIXED_MOMENT, timeZone: 'America/Los_Angeles' },
    eventType: 'PAYCHECK',
    eventId: 'income-event-1',
    resolvedRuleSet: resolvedRuleSetFor(),
    ...overrides,
  };
}

/**
 * The three lines a $2,000 paycheck produces under the default plan.
 *
 * Giving takes 10%, the Emergency Fund takes its fixed $500, and Spending
 * receives the remainder — the same split the preview screen shows.
 */
export function allocationComponentRecords(): readonly AllocationComponentRecord[] {
  return [
    {
      destinationBucketId: 'bucket-giving',
      stage: 'GLOBAL_OBLIGATION',
      amountCents: 20_000,
      stableOrder: 0,
      explanation: { code: 'ALLOCATION_EXPLAIN_OBLIGATION_RATE', rateBasisPoints: 1_000 },
    },
    {
      destinationBucketId: 'bucket-emergency-fund',
      stage: 'TOP_PRIORITY',
      amountCents: 50_000,
      stableOrder: 1,
      explanation: {
        code: 'ALLOCATION_EXPLAIN_PRIORITY_FUNDED_IN_FULL',
        rank: 1,
        requestedAmountCents: 50_000,
      },
    },
    {
      destinationBucketId: 'bucket-leftover',
      stage: 'LEFTOVER_POLICY',
      amountCents: 130_000,
      stableOrder: 2,
      explanation: { code: 'ALLOCATION_EXPLAIN_LEFTOVER_REMAINDER' },
    },
  ];
}

/** A valid stored confirmed Allocation, conserving a $2,000 paycheck exactly. */
export function allocationRecord(overrides: Partial<AllocationRecord> = {}): AllocationRecord {
  return {
    id: 'allocation-1',
    schemaVersion: ALLOCATION_RECORD_SCHEMA_VERSION,
    incomeEventId: 'income-event-1',
    planSnapshotId: 'plan-snapshot-1',
    status: 'CONFIRMED',
    confirmedAt: { epochMilliseconds: FIXED_MOMENT, timeZone: 'America/Los_Angeles' },
    currency: 'USD',
    totalInputCents: 200_000,
    totalAllocatedCents: 200_000,
    totalUnallocatedCents: 0,
    components: allocationComponentRecords(),
    ...overrides,
  };
}
