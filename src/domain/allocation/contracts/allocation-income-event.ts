import type { FinancialDate } from '@domain/shared/dates/financial-date';
import type { EntityId } from '@domain/shared/ids/entity-id';
import type { Money } from '@domain/shared/money/money';

/**
 * One income event presented to the Allocation Engine (PFOS-ENG-02 §6).
 *
 * Both amounts are supplied rather than derived. §6 places `netAmount` and
 * `eligibleAmount` on the event itself, and §10 makes the resolved rule set
 * responsible for identifying which of them starts the pool through
 * `ResolvedRuleSet.allocationBasis`. The engine therefore selects between two
 * given amounts and never computes eligibility: §6 states directly that the
 * Allocation Engine must not infer whether an income event is tithing-eligible,
 * and Decision 093 records that the resolved contract names the basis rather
 * than carrying a computed amount.
 *
 * That separation is what keeps the open eligible-income question (Blocker F)
 * outside this contract. Who computes `eligibleAmount`, how it aggregates
 * across income sources and how double counting is prevented are all upstream
 * questions, unresolved and deliberately untouched here.
 *
 * `eventType` admits only `PAYCHECK` today. §6 lists seven event types, and the
 * remaining six arrive with the behaviour that distinguishes them; declaring
 * them before anything treats them differently would publish a vocabulary no
 * accepted source yet gives meaning to.
 *
 * There is no `currency` member. Money carries its own currency, and the
 * arithmetic primitives reject a mismatch rather than assuming one globally.
 */
export interface AllocationIncomeEvent {
  readonly incomeEventId: EntityId;
  readonly incomeSourceId: EntityId;
  readonly eventDate: FinancialDate;
  readonly netAmount: Money;
  readonly eligibleAmount: Money;
  readonly eventType: 'PAYCHECK';
}
