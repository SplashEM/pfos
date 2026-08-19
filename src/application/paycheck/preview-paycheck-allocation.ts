import type { AllocationExplanation } from '@domain/allocation/contracts/allocation-explanation';
import { ALLOCATION_EXPLANATION_CODES } from '@domain/allocation/contracts/allocation-explanation';
import type { AllocationIncomeEvent } from '@domain/allocation/contracts/allocation-income-event';
import { executeAllocation } from '@domain/allocation/services/execute-allocation';
import { resolveRuleSet } from '@domain/rules/services/resolve-rule-set';
import { financialDate, type FinancialDate } from '@domain/shared/dates/financial-date';
import { timestamp } from '@domain/shared/dates/timestamp';
import { domainError, type DomainError } from '@domain/shared/errors/domain-error';
import { ERROR_CATEGORIES } from '@domain/shared/errors/error-category';
import { err, ok, type Result } from '@domain/shared/errors/result';
import { asEntityId, type EntityId } from '@domain/shared/ids/entity-id';
import { formatUsd } from '@domain/shared/money/money-format';
import type { Money } from '@domain/shared/money/money';
import { parseUsd } from '@domain/shared/money/money-parse';

import { APPLICATION_ERROR_CODES } from '../errors/application-error-codes';
import {
  buildAuthoredPaycheckPlan,
  SAMPLE_INCOME_SOURCE,
  type AuthoredPaycheckPlan,
  type EditablePaycheckPlan,
} from './paycheck-plan';

/** What a person typed, plus the two values the domain may not read for itself. */
export interface PaycheckPreviewRequest {
  /** The plan to preview against, as edited on screen. */
  readonly plan: EditablePaycheckPlan;
  /** The amount as typed, unparsed. `parseUsd` owns the format. */
  readonly amount: string;
  /** The paycheck date as `YYYY-MM-DD`, the shape a date input produces. */
  readonly eventDate: string;
  /**
   * The moment the preview was requested, in epoch milliseconds.
   *
   * PFOS-ENG-00 §13.4 forbids a deterministic engine function from calling for
   * the current time, so the clock is read outside the domain and the moment
   * arrives here as an argument. It becomes `ResolvedRuleSet.resolvedAt`.
   */
  readonly requestedAt: number;
  /** The viewer's IANA time zone, paired with `requestedAt` by `Timestamp`. */
  readonly timeZone: string;
}

/** One allocated line, ready to render. */
export interface PaycheckPreviewLine {
  readonly bucketId: string;
  readonly label: string;
  readonly amount: string;
  /** Why this line received this amount, in words a screen can show as-is. */
  readonly explanation: string;
}

/** The answer to "where should this paycheck go?", formatted for display. */
export interface PaycheckPreview {
  readonly lines: readonly PaycheckPreviewLine[];
  readonly totalAllocated: string;
  readonly unallocated: string;
}

/**
 * Previews where one paycheck would go under the sample authored plan.
 *
 * This is the whole product path in one function:
 *
 *   typed input -> authored rule versions -> resolveRuleSet -> ResolvedRuleSet
 *   -> executeAllocation -> formatted preview
 *
 * It calculates nothing. Every amount shown is produced by the Allocation
 * Engine and formatted by the shared Money formatter; no arithmetic of any kind
 * happens in this file or above it, so a rate change in the authored plan
 * changes the screen and nothing here needs to know.
 *
 * It resolves nothing either. The Rule Engine decides which rules apply, which
 * versions are effective, and in what order the stages run.
 *
 * Nothing is confirmed or persisted. Constitution Principle 8 keeps physical
 * money and virtual planning apart, and a preview is a proposal: it moves no
 * money, records no transaction, and leaves no trace when the page closes.
 * `resolutionMode` is `PREVIEW` for that reason.
 *
 * Failures are returned rather than thrown, and every one carries a `summary`
 * the presentation layer can show unchanged. Input problems are reported by
 * this layer; a plan that cannot be resolved or executed is reported by the
 * engine that refused it, unmodified.
 */
export function previewPaycheckAllocation(
  request: PaycheckPreviewRequest,
): Result<PaycheckPreview, DomainError> {
  const authored = buildAuthoredPaycheckPlan(request.plan);
  if (!authored.ok) {
    return authored;
  }

  const event = buildIncomeEvent(request);
  if (!event.ok) {
    return event;
  }

  const resolvedAt = timestamp(request.requestedAt, request.timeZone);
  if (!resolvedAt.ok) {
    return resolvedAt;
  }

  const plan = resolveRuleSet({
    rules: authored.value.rules,
    evaluationDate: event.value.eventDate,
    incomeSourceId: event.value.incomeSourceId,
    resolvedRuleSetId: asEntityId('resolved-rule-set-preview'),
    planVersionId: asEntityId('plan-version-sample'),
    resolvedAt: resolvedAt.value,
    resolutionMode: 'PREVIEW',
  });
  if (!plan.ok) {
    return plan;
  }

  const allocation = executeAllocation(plan.value, event.value);
  if (!allocation.ok) {
    return allocation;
  }

  return ok({
    lines: allocation.value.lines.map((line) => ({
      bucketId: line.bucketId,
      label: labelFor(authored.value, line.bucketId),
      amount: formatUsd(line.amount),
      explanation: explain(line.explanation, line.amount),
    })),
    totalAllocated: formatUsd(allocation.value.totalAllocated),
    unallocated: formatUsd(allocation.value.unallocated),
  });
}

/**
 * Turns typed input into the event the Allocation Engine expects.
 *
 * `eligibleAmount` is set to the same amount as `netAmount`, and that is a
 * property of this sample slice rather than an eligibility determination. The
 * plan resolves to the `NET_AMOUNT` basis, which PFOS-ENG-02 §10 makes the
 * starting pool, so the executor never reads `eligibleAmount` on this path.
 * Who computes an eligible amount, how it aggregates across income sources and
 * how double counting is prevented are the open Blocker F questions, and
 * nothing here answers, narrows or anticipates any of them. When an income
 * source supplies a real eligible amount, it arrives on the request instead.
 */
function buildIncomeEvent(
  request: PaycheckPreviewRequest,
): Result<AllocationIncomeEvent, DomainError> {
  const amount = parseUsd(request.amount);
  if (!amount.ok) {
    return amount;
  }

  if (amount.value.cents <= 0) {
    return err(
      domainError({
        code: APPLICATION_ERROR_CODES.APPLICATION_PAYCHECK_AMOUNT_NOT_POSITIVE,
        category: ERROR_CATEGORIES.VALIDATION,
        summary: 'Enter a paycheck amount greater than zero.',
        details: `Received ${formatUsd(amount.value)}.`,
      }),
    );
  }

  const eventDate = parseIsoDate(request.eventDate);
  if (!eventDate.ok) {
    return eventDate;
  }

  return ok({
    incomeEventId: asEntityId('income-event-preview'),
    incomeSourceId: SAMPLE_INCOME_SOURCE,
    eventDate: eventDate.value,
    netAmount: amount.value,
    eligibleAmount: amount.value,
    eventType: 'PAYCHECK',
  });
}

/**
 * The name to show for a bucket, falling back to its identifier.
 *
 * The fallback is unreachable for the plan built above, which names every
 * bucket it funds. It exists so that a future destination without a label
 * degrades to something inspectable rather than to an empty cell.
 */
function labelFor(authored: AuthoredPaycheckPlan, bucketId: EntityId): string {
  return authored.labels[bucketId] ?? bucketId;
}

/**
 * Turns the engine's structured explanation facts into a sentence.
 *
 * PFOS-ENG-02 §52 keeps explanations as structured facts and records that "the
 * presentation layer may convert these facts into natural-language text". This
 * is that conversion, done once here rather than in a component, so a screen
 * never reconstructs financial reasoning and every surface says the same thing.
 *
 * Nothing is recomputed. Every figure below is either a value the engine
 * carried on the explanation or the amount already on the line, so the words
 * cannot drift from the arithmetic they describe.
 *
 * Nothing is promised, either. No sentence says what a later paycheck will do,
 * what is still owed, or what a person should change: the shortfall, advisor and
 * coaching behaviours those would imply do not exist.
 */
function explain(explanation: AllocationExplanation, allocated: Money): string {
  switch (explanation.code) {
    case ALLOCATION_EXPLANATION_CODES.ALLOCATION_EXPLAIN_OBLIGATION_RATE:
      return `${formatPercent(explanation.rateBasisPoints)} of this paycheck.`;

    case ALLOCATION_EXPLANATION_CODES.ALLOCATION_EXPLAIN_PRIORITY_FUNDED_IN_FULL:
      return (
        `Priority ${String(explanation.rank)} · ` +
        `Requested ${formatUsd(explanation.requestedAmount)} · Funded in full.`
      );

    case ALLOCATION_EXPLANATION_CODES.ALLOCATION_EXPLAIN_PRIORITY_POOL_EXHAUSTED:
      return (
        `Priority ${String(explanation.rank)} · ` +
        `Requested ${formatUsd(explanation.requestedAmount)} · ` +
        `Only ${formatUsd(allocated)} remained when this priority was reached.`
      );

    case ALLOCATION_EXPLANATION_CODES.ALLOCATION_EXPLAIN_LEFTOVER_REMAINDER:
      return 'Receives whatever remains after everything above.';
  }
}

/**
 * A rate as a percentage, for reading.
 *
 * The arithmetic is on integers: basis points split into whole percent and
 * hundredths, so no binary fraction reaches the text. Trailing zeros are
 * dropped, which is why 1,000 basis points reads as 10% rather than 10.00%.
 */
function formatPercent(rateBasisPoints: number): string {
  const whole = Math.trunc(rateBasisPoints / 100);
  const hundredths = rateBasisPoints % 100;

  if (hundredths === 0) {
    return `${String(whole)}%`;
  }

  const padded = String(hundredths).padStart(2, '0');
  const trimmed = padded.endsWith('0') ? padded.slice(0, 1) : padded;

  return `${String(whole)}.${trimmed}%`;
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Reads `YYYY-MM-DD` into a calendar date.
 *
 * Only the shape is checked here. Whether the date exists is `financialDate`'s
 * question, and its answer is returned unchanged, so 31 February is reported as
 * an invalid calendar date rather than as a malformed one.
 */
function parseIsoDate(input: string): Result<FinancialDate, DomainError> {
  const match = ISO_DATE.exec(input.trim());

  if (match === null) {
    return err(
      domainError({
        code: APPLICATION_ERROR_CODES.APPLICATION_PAYCHECK_DATE_INVALID_FORMAT,
        category: ERROR_CATEGORIES.VALIDATION,
        summary: 'Enter the date this paycheck arrives.',
        details: `Received ${JSON.stringify(input)}, which is not a YYYY-MM-DD date.`,
      }),
    );
  }

  return financialDate(Number(match[1]), Number(match[2]), Number(match[3]));
}
