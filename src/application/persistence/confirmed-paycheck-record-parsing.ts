import { ALLOCATION_EXPLANATION_CODES } from '@domain/allocation/contracts/allocation-explanation';
import type { AllocationStage } from '@domain/rules/contracts/allocation-stage';
import {
  RESOLVED_RULE_SET_SCHEMA_VERSION,
  type ResolvedRuleSet,
} from '@domain/rules/contracts/resolved-rule-set';
import { domainError, type DomainError } from '@domain/shared/errors/domain-error';
import { ERROR_CATEGORIES } from '@domain/shared/errors/error-category';
import { err, ok, type Result } from '@domain/shared/errors/result';

import { APPLICATION_ERROR_CODES } from '../errors/application-error-codes';
import {
  ALLOCATION_RECORD_SCHEMA_VERSION,
  PLAN_SNAPSHOT_SCHEMA_VERSION,
  type AllocationComponentRecord,
  type AllocationRecord,
  type PersistedAllocationExplanation,
  type PersistedTimestamp,
  type PlanSnapshotRecord,
} from './confirmed-paycheck-records';
import { isStoredResolvedRuleSet } from './stored-resolved-rule-set';

/**
 * Reading stored confirmed records back as records (Decision 098 holding 8).
 *
 * Stored data is untrusted (PFOS-ENG-00 §29.1). Every member a record declares
 * is checked here before the record is handed to anything that would show a
 * person a number, and a record that fails any check is refused whole. A
 * partially accepted financial record would put figures a person never
 * confirmed beside figures they did, with no way to tell them apart.
 *
 * Nothing is repaired. There is no defaulting, no coercion, no dropping of bad
 * members and no rewriting of the stored value: a failure is reported and the
 * bytes stay exactly as they were, which is what §26 requires of user financial
 * data and what separates these records from the disposable preview settings.
 *
 * The same parsers run on the way in. A value that could not be read back is
 * never written, so the store cannot acquire a record it would later refuse.
 *
 * Both records are checked all the way down. The allocation envelope is read
 * member by member, down to each component and each explanation fact, because
 * every figure a person will be shown for a confirmed paycheck comes from
 * there. The embedded resolved rule set is read the same way, arm by arm, in
 * `stored-resolved-rule-set.ts`: a snapshot whose outer members look right
 * while a funding rule carries a string where an amount belongs is not a valid
 * record of its declared version, and holding 8 makes that a failure rather
 * than something to accept and hope nothing reads.
 */

/** Reads a stored value as a Plan Snapshot record. */
export function parsePlanSnapshotRecord(
  value: unknown,
): Result<PlanSnapshotRecord, DomainError<string>> {
  const record = asRecord(value);
  if (record === undefined) {
    return malformed('A stored Plan Snapshot was not a record.');
  }

  const version = record['schemaVersion'];
  if (version !== PLAN_SNAPSHOT_SCHEMA_VERSION) {
    return unsupportedVersion('Plan Snapshot', version, PLAN_SNAPSHOT_SCHEMA_VERSION);
  }

  const id = asNonEmptyString(record['id']);
  const eventId = asNonEmptyString(record['eventId']);
  const createdAt = asTimestamp(record['createdAt']);

  if (id === undefined || eventId === undefined || createdAt === undefined) {
    return malformed('A stored Plan Snapshot was missing its identity or creation time.');
  }

  if (record['eventType'] !== 'PAYCHECK') {
    return malformed(`A stored Plan Snapshot carried event type ${String(record['eventType'])}.`);
  }

  const resolvedRuleSet = asResolvedRuleSet(record['resolvedRuleSet']);
  if (!resolvedRuleSet.ok) {
    return resolvedRuleSet;
  }

  return ok({
    id,
    schemaVersion: PLAN_SNAPSHOT_SCHEMA_VERSION,
    createdAt,
    eventType: 'PAYCHECK',
    eventId,
    resolvedRuleSet: resolvedRuleSet.value,
  });
}

/** Reads a stored value as a confirmed Allocation record. */
export function parseAllocationRecord(
  value: unknown,
): Result<AllocationRecord, DomainError<string>> {
  const record = asRecord(value);
  if (record === undefined) {
    return malformed('A stored allocation was not a record.');
  }

  const version = record['schemaVersion'];
  if (version !== ALLOCATION_RECORD_SCHEMA_VERSION) {
    return unsupportedVersion('allocation', version, ALLOCATION_RECORD_SCHEMA_VERSION);
  }

  const id = asNonEmptyString(record['id']);
  const incomeEventId = asNonEmptyString(record['incomeEventId']);
  const planSnapshotId = asNonEmptyString(record['planSnapshotId']);
  const confirmedAt = asTimestamp(record['confirmedAt']);

  if (
    id === undefined ||
    incomeEventId === undefined ||
    planSnapshotId === undefined ||
    confirmedAt === undefined
  ) {
    return malformed('A stored allocation was missing its identity or confirmation time.');
  }

  if (record['status'] !== 'CONFIRMED') {
    return malformed(`A stored allocation carried status ${String(record['status'])}.`);
  }

  if (record['currency'] !== 'USD') {
    return malformed(`A stored allocation carried currency ${String(record['currency'])}.`);
  }

  const totalInputCents = asCents(record['totalInputCents']);
  const totalAllocatedCents = asCents(record['totalAllocatedCents']);
  const totalUnallocatedCents = asCents(record['totalUnallocatedCents']);

  if (
    totalInputCents === undefined ||
    totalAllocatedCents === undefined ||
    totalUnallocatedCents === undefined
  ) {
    return malformed('A stored allocation carried a total that was not an exact number of cents.');
  }

  const components = parseComponents(record['components']);
  if (!components.ok) {
    return components;
  }

  /*
   * PFOS-ENG-00 §32 Invariant 1, checked on the stored value rather than
   * assumed from the engine that produced it. A record that does not conserve
   * the paycheck is not a record of any allocation that happened.
   */
  if (totalInputCents !== totalAllocatedCents + totalUnallocatedCents) {
    return err(
      domainError({
        code: APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_CONSERVATION_VIOLATED,
        category: ERROR_CATEGORIES.INVARIANT_VIOLATION,
        summary: 'A saved paycheck did not add up and was not used.',
        details:
          `Input ${String(totalInputCents)} cents, allocated ${String(totalAllocatedCents)}, ` +
          `unallocated ${String(totalUnallocatedCents)}.`,
        affectedEntityIds: [id],
      }),
    );
  }

  return ok({
    id,
    schemaVersion: ALLOCATION_RECORD_SCHEMA_VERSION,
    incomeEventId,
    planSnapshotId,
    status: 'CONFIRMED',
    confirmedAt,
    currency: 'USD',
    totalInputCents,
    totalAllocatedCents,
    totalUnallocatedCents,
    components: components.value,
  });
}

/** Reads the stored allocation lines, in the order they were written. */
function parseComponents(
  value: unknown,
): Result<readonly AllocationComponentRecord[], DomainError<string>> {
  if (!Array.isArray(value)) {
    return malformed('A stored allocation carried no component list.');
  }

  const components: AllocationComponentRecord[] = [];

  for (const entry of value as readonly unknown[]) {
    const component = asRecord(entry);
    if (component === undefined) {
      return malformed('A stored allocation component was not a record.');
    }

    const destinationBucketId = asNonEmptyString(component['destinationBucketId']);
    const amountCents = asCents(component['amountCents']);
    const stableOrder = asCents(component['stableOrder']);
    const stage = asStage(component['stage']);

    if (
      destinationBucketId === undefined ||
      amountCents === undefined ||
      stableOrder === undefined ||
      stage === undefined
    ) {
      return malformed('A stored allocation component was missing a required member.');
    }

    const explanation = asExplanation(component['explanation']);
    if (explanation === undefined) {
      return malformed('A stored allocation component carried no readable explanation.');
    }

    components.push({ destinationBucketId, stage, amountCents, stableOrder, explanation });
  }

  return ok(components);
}

/**
 * Reads the embedded resolved rule set.
 *
 * The version is checked first and exactly. A resolved set stored under a
 * version this build does not read is refused rather than interpreted, because
 * no compatibility reader exists (Decisions 092 and 095 left both directions
 * undefined) and guessing would produce a historical answer nobody confirmed.
 *
 * Then every arm is checked, in `stored-resolved-rule-set.ts`. A snapshot whose
 * outer members look right but whose funding rule carries a string where an
 * amount belongs is not a valid record of its declared version, and Decision
 * 098 holding 8 requires it to fail rather than be accepted.
 */
function asResolvedRuleSet(value: unknown): Result<ResolvedRuleSet, DomainError<string>> {
  const record = asRecord(value);
  if (record === undefined) {
    return malformed('A stored Plan Snapshot held no resolved rule set.');
  }

  const version = record['schemaVersion'];
  if (version !== RESOLVED_RULE_SET_SCHEMA_VERSION) {
    return unsupportedVersion('resolved rule set', version, RESOLVED_RULE_SET_SCHEMA_VERSION);
  }

  if (!isStoredResolvedRuleSet(record)) {
    return malformed('A stored resolved rule set did not read as the contract it declares.');
  }

  return ok(record);
}

/** The stored explanation facts, or `undefined` if they cannot be read. */
function asExplanation(value: unknown): PersistedAllocationExplanation | undefined {
  const record = asRecord(value);
  if (record === undefined) {
    return undefined;
  }

  const code = record['code'];

  if (code === ALLOCATION_EXPLANATION_CODES.ALLOCATION_EXPLAIN_OBLIGATION_RATE) {
    const rateBasisPoints = asCents(record['rateBasisPoints']);
    return rateBasisPoints === undefined ? undefined : { code, rateBasisPoints };
  }

  if (
    code === ALLOCATION_EXPLANATION_CODES.ALLOCATION_EXPLAIN_PRIORITY_FUNDED_IN_FULL ||
    code === ALLOCATION_EXPLANATION_CODES.ALLOCATION_EXPLAIN_PRIORITY_POOL_EXHAUSTED
  ) {
    const rank = asCents(record['rank']);
    const requestedAmountCents = asCents(record['requestedAmountCents']);

    return rank === undefined || requestedAmountCents === undefined
      ? undefined
      : { code, rank, requestedAmountCents };
  }

  if (code === ALLOCATION_EXPLANATION_CODES.ALLOCATION_EXPLAIN_LEFTOVER_REMAINDER) {
    return { code };
  }

  return undefined;
}

/**
 * The stages this build will read from storage.
 *
 * Typed as a total record of the Rule Engine's own union, so a stage added
 * there fails to compile here rather than being silently rejected at runtime.
 * The Rule Engine owns the vocabulary (Decision 074); this is a reader for it,
 * not a second copy of it.
 */
const READABLE_STAGES: Readonly<Record<AllocationStage, true>> = {
  GLOBAL_OBLIGATION: true,
  TOP_PRIORITY: true,
  REQUIRED_RECURRING: true,
  GOAL_FUNDING: true,
  LOWER_PRIORITY: true,
  EVERYDAY_SPENDING: true,
  LEFTOVER_POLICY: true,
  EVENT_OVERRIDE: true,
};

/** The stored stage, or `undefined` if it is not one the Rule Engine names. */
function asStage(value: unknown): AllocationStage | undefined {
  return typeof value === 'string' && Object.hasOwn(READABLE_STAGES, value)
    ? (value as AllocationStage)
    : undefined;
}

/** A stored moment, or `undefined`. */
function asTimestamp(value: unknown): PersistedTimestamp | undefined {
  const record = asRecord(value);
  if (record === undefined) {
    return undefined;
  }

  const epochMilliseconds = record['epochMilliseconds'];
  const timeZone = asNonEmptyString(record['timeZone']);

  if (typeof epochMilliseconds !== 'number' || !Number.isSafeInteger(epochMilliseconds)) {
    return undefined;
  }

  return timeZone === undefined ? undefined : { epochMilliseconds, timeZone };
}

/** An untrusted value as a plain record, or `undefined`. */
function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

/** A non-empty string, or `undefined`. */
function asNonEmptyString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/**
 * An exact integer, or `undefined`.
 *
 * PFOS-ENG-00 §10.1 stores money as integer cents and §10.2 bounds it to the
 * safe integer range, so a stored amount that is fractional, infinite or beyond
 * that range is not a money value this build will read. The same check serves
 * the counts and ranks stored beside the amounts.
 */
function asCents(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isSafeInteger(value) ? value : undefined;
}

/** The record could not be read. The stored value is left alone. */
function malformed(details: string): Result<never, DomainError<string>> {
  return err(
    domainError({
      code: APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
      category: ERROR_CATEGORIES.PERSISTENCE,
      summary: 'A saved paycheck could not be read and was left untouched.',
      details,
      suggestedResolution: 'The stored record is unchanged and can be inspected or exported.',
    }),
  );
}

/** The record declares a version this build does not read. */
function unsupportedVersion(
  what: string,
  found: unknown,
  expected: number,
): Result<never, DomainError<string>> {
  return err(
    domainError({
      code: APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_UNSUPPORTED_SCHEMA_VERSION,
      category: ERROR_CATEGORIES.UNSUPPORTED_STATE,
      summary: 'A saved paycheck was written by a different version of PFOS and was not read.',
      details: `Stored ${what} schema version ${String(found)}; this build reads ${String(expected)}.`,
      suggestedResolution: 'The stored record is unchanged and can be inspected or exported.',
    }),
  );
}
