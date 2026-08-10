import type { FinancialDate } from './financial-date';
import type { Timestamp } from './timestamp';

/**
 * Injectable access to the current moment (PFOS-ENG-00 §13.4, §49.12).
 *
 * Deterministic engines must never read the clock themselves: PFOS-ENG-02 §67
 * forbids it outright, and the domain lint rules block `new Date()` and
 * `Date.now()` from this layer. Anything needing "now" receives a Clock, or —
 * more usually — receives the evaluation date already resolved, as the
 * Allocation Engine does through `AllocationContext.evaluationDate`.
 *
 * `today` takes the zone explicitly rather than defaulting to the host's.
 * Which calendar day an instant falls on depends entirely on the zone, and
 * §13.3 forbids assuming one; a zoneless `today()` would silently inherit
 * whatever the machine happened to be set to.
 *
 * This interface is a contract only. Implementing it requires reading the
 * host clock and converting an instant to a civil date through Intl, both of
 * which belong to infrastructure (§4.5) and arrive with Milestone 4.
 */
export interface Clock {
  readonly now: () => Timestamp;
  readonly today: (timeZone: string) => FinancialDate;
}
