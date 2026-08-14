import type { ResolvedTopPriorityPlan } from '../contracts/resolved-top-priority-plan';
import { RULE_WARNING_CODES } from '../contracts/rule-warning-codes';

import type { RuleDomainWarning } from '../contracts/rule-warning';

/**
 * The fixed text of the unconfigured-top-priorities warning (Decision 077).
 *
 * Deliberately unexported, and deliberately free of interpolation. Decision 077
 * fixes the message and the recommended action as literals carrying no
 * interpolated value, so every plan that produces this warning produces
 * byte-identical text. Both existing top-priority validators fix their text for
 * the same reason.
 *
 * Neither string names the strategy, a bucket, a count or a limit. The message
 * restates the resolved plan's state and claims nothing about what happens to
 * the money next: a TOP_PRIORITY stage with zero entries is Allocation Engine
 * behavior under PFOS-ENG-02 §62 and §78, and the Rule Engine does not duplicate
 * it. The recommended action records that leaving the list empty is a valid
 * choice, which is the holding of Decision 075 and of Decision 053 on optional
 * setup gaps.
 */
const MESSAGE = 'No top priorities are configured.';
const RECOMMENDED_ACTION = 'Add a top priority if desired, or leave top priorities empty.';

/**
 * Produces the warnings carried by a resolved top-priority plan (Decision 075;
 * Decision 077).
 *
 * This is not a validator. Decision 075 makes a SEQUENTIAL plan with zero
 * entries a valid resolution result rather than a failure, so the outcome is
 * reported on the warning channel and never on the Result error channel. The
 * function cannot fail and returns no Result.
 *
 * A SEQUENTIAL plan with zero entries yields exactly one warning, carrying
 * RULE_WARN_NO_TOP_PRIORITIES_CONFIGURED. A SEQUENTIAL plan with any entry
 * yields none.
 *
 * A PERCENTAGE_SPLIT plan yields none under any entry count, including zero. An
 * empty pool is a hard validation error reporting
 * RULE_POOL_NOT_EXACTLY_100_PERCENT (Decision 075), and its invalidity stays
 * owned by percentage-pool validation. Producing a warning for it here would
 * report one condition on two channels.
 *
 * `affectedEntityIds` is empty. The shared contract requires the field and a
 * plan with no entries names no entity.
 *
 * The result holds zero or one warning. Decision 077 introduces no aggregation,
 * ordering or deduplication contract, so this producer answers one question
 * about one plan and combines nothing. The array is returned as-is: Decision 077
 * establishes no immutability behavior for warning objects, and freezing depth
 * and ownership is a separate unresolved question that must not be settled here.
 */
export function produceTopPriorityWarnings(
  plan: ResolvedTopPriorityPlan,
): readonly RuleDomainWarning[] {
  if (plan.strategy === 'SEQUENTIAL' && plan.entries.length === 0) {
    return [
      {
        code: RULE_WARNING_CODES.RULE_WARN_NO_TOP_PRIORITIES_CONFIGURED,
        message: MESSAGE,
        affectedEntityIds: [],
        recommendedAction: RECOMMENDED_ACTION,
      },
    ];
  }

  return [];
}
