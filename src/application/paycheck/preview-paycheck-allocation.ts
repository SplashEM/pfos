import { ALLOCATION_EXPLANATION_CODES } from '@domain/allocation/contracts/allocation-explanation';
import type { AllocationIncomeEvent } from '@domain/allocation/contracts/allocation-income-event';
import type {
  AllocationLine,
  AllocationResult,
} from '@domain/allocation/contracts/allocation-result';
import { executeAllocation } from '@domain/allocation/services/execute-allocation';
import type { ResolvedRuleSet } from '@domain/rules/contracts/resolved-rule-set';
import { resolveRuleSet } from '@domain/rules/services/resolve-rule-set';
import { financialDate, type FinancialDate } from '@domain/shared/dates/financial-date';
import { timestamp } from '@domain/shared/dates/timestamp';
import { domainError, type DomainError } from '@domain/shared/errors/domain-error';
import { ERROR_CATEGORIES } from '@domain/shared/errors/error-category';
import { err, ok, type Result } from '@domain/shared/errors/result';
import { asEntityId, type EntityId } from '@domain/shared/ids/entity-id';
import { sum } from '@domain/shared/money/money-arithmetic';
import { formatUsd } from '@domain/shared/money/money-format';
import type { Money } from '@domain/shared/money/money';
import { parseUsd } from '@domain/shared/money/money-parse';

import { APPLICATION_ERROR_CODES } from '../errors/application-error-codes';
import { explanationText, toPersistedExplanation } from './allocation-explanation-text';
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

/**
 * The exact proposal a person is looking at, kept so it can be confirmed.
 *
 * A confirmed paycheck must record what was actually proposed, so confirmation
 * stores these values rather than resolving the plan a second time. Between the
 * preview and the click, the plan on screen may have changed; re-resolving then
 * would record an allocation nobody saw.
 *
 * It is opaque to the screen holding it. The presentation layer keeps it and
 * hands it back, and performs no calculation on it (CLAUDE.md).
 */
export interface ConfirmablePaycheck {
  readonly resolvedRuleSet: ResolvedRuleSet;
  readonly allocation: AllocationResult;
  readonly incomeEvent: AllocationIncomeEvent;
}

/** The answer to "where should this paycheck go?", formatted for display. */
export interface PaycheckPreview {
  readonly lines: readonly PaycheckPreviewLine[];
  readonly totalAllocated: string;
  readonly unallocated: string;
  /**
   * How the top priorities as a whole fared, when they did not all fit.
   *
   * Absent when every priority received what it asked for, and absent when a
   * plan has no priorities at all: a person reading a plan that fit needs no
   * sentence telling them so.
   */
  readonly priorityFundingSummary?: string | undefined;
  /** What confirming this preview would record. Handed back to `confirmPaycheck`. */
  readonly confirmable: ConfirmablePaycheck;
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

  const priorityFundingSummary = summarizePriorityFunding(allocation.value.lines);
  if (!priorityFundingSummary.ok) {
    return priorityFundingSummary;
  }

  return ok({
    lines: allocation.value.lines.map((line) => ({
      bucketId: line.bucketId,
      label: labelFor(authored.value, line.bucketId),
      amount: formatUsd(line.amount),
      explanation: explanationText(toPersistedExplanation(line.explanation), line.amount.cents),
    })),
    totalAllocated: formatUsd(allocation.value.totalAllocated),
    unallocated: formatUsd(allocation.value.unallocated),
    priorityFundingSummary: priorityFundingSummary.value,
    confirmable: {
      resolvedRuleSet: plan.value,
      allocation: allocation.value,
      incomeEvent: event.value,
    },
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
 * Says whether the priorities as a group asked for more than this paycheck gave
 * them.
 *
 * A person reading a preview sees the plan-level answer before the per-line
 * ones, so the shape of the paycheck is legible without adding up rows. It is a
 * different question from the per-line explanations rather than a repetition of
 * them: each line says why one destination got its amount, and this says
 * whether the plan as a whole fit.
 *
 * Nothing new is computed about the allocation. Both totals are sums of facts
 * the engine already emitted â€” the requested amounts it carried on the
 * explanations and the amounts it allocated â€” added with the shared Money
 * arithmetic, so no dollars are handled as JavaScript numbers and neither total
 * can disagree with the rows beneath it.
 *
 * Only the two sums are stated. What the difference between them means is a
 * shortfall question, and PFOS-ENG-02 Â§41's shortfall behaviour is not
 * implemented: nothing here records an unmet amount, carries anything into a
 * later paycheck, grades the plan or suggests a change. It describes one
 * execution, in the past tense, and stops.
 *
 * A fully funded plan returns nothing rather than a reassurance. So does a plan
 * with no priorities, which cannot have gone short.
 */
function summarizePriorityFunding(
  lines: readonly AllocationLine[],
): Result<string | undefined, DomainError> {
  const requested: Money[] = [];
  const received: Money[] = [];
  let anyPartial = false;

  for (const line of lines) {
    const { explanation } = line;

    if (
      explanation.code !==
        ALLOCATION_EXPLANATION_CODES.ALLOCATION_EXPLAIN_PRIORITY_FUNDED_IN_FULL &&
      explanation.code !== ALLOCATION_EXPLANATION_CODES.ALLOCATION_EXPLAIN_PRIORITY_POOL_EXHAUSTED
    ) {
      continue;
    }

    anyPartial =
      anyPartial ||
      explanation.code === ALLOCATION_EXPLANATION_CODES.ALLOCATION_EXPLAIN_PRIORITY_POOL_EXHAUSTED;
    requested.push(explanation.requestedAmount);
    received.push(line.amount);
  }

  /*
   * The currency is taken from the amounts being added rather than assumed, and
   * `sum` refuses a list that mixes currencies. With no priorities there is
   * nothing to sum and nothing to say.
   */
  const currency = requested[0]?.currency;
  if (!anyPartial || currency === undefined) {
    return ok(undefined);
  }

  const requestedTotal = sum(requested, currency);
  if (!requestedTotal.ok) {
    return requestedTotal;
  }

  const receivedTotal = sum(received, currency);
  if (!receivedTotal.ok) {
    return receivedTotal;
  }

  return ok(
    'Not every top priority could be fully funded from this paycheck: they requested ' +
      `${formatUsd(requestedTotal.value)} in total and received ` +
      `${formatUsd(receivedTotal.value)}.`,
  );
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
