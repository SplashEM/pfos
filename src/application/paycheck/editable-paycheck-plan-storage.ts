import type { EditablePaycheckPlan } from './paycheck-plan';

/**
 * Somewhere to keep the three preview plan settings between visits.
 *
 * The application owns this contract because the application consumes the
 * capability; PFOS-ENG-00 §3 puts the implementation in the infrastructure
 * layer, and the adapter that talks to browser storage lives there.
 *
 * It is deliberately not a generic store. There is no `Storage<T>`, no
 * repository base class and no unit of work: this names one capability for one
 * value, and a second kind of stored data should get its own narrow contract
 * rather than a shared abstraction invented before there is a second caller.
 *
 * What travels through here is the text a person typed into three fields —
 * nothing resolved, allocated or confirmed. No `ResolvedRuleSet`,
 * `AllocationResult`, `PlanSnapshot`, rule version, paycheck or audit record
 * may pass through this contract. When a financial record needs to survive a
 * reload it gets its own contract, with the snapshot and migration semantics
 * that decision brings.
 *
 * Losing this data costs a person thirty seconds of retyping. That is the whole
 * risk model, and it is why every method returns nothing to check: a failure to
 * save is not worth interrupting someone over.
 */
export interface EditablePaycheckPlanStorage {
  /**
   * The saved plan, or the default plan when nothing usable is stored.
   *
   * An implementation never reports a failure. Missing, unreadable, malformed
   * and stale all answer the only question being asked — is there a usable
   * saved plan? — and the answer is the same default either way.
   */
  load(): EditablePaycheckPlan;

  /** Keeps these settings, replacing whatever was there. */
  save(plan: EditablePaycheckPlan): void;

  /** Forgets the settings, so the next load starts from the defaults. */
  clear(): void;
}
