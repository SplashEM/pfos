import type { AllocationStage } from '@domain/rules/contracts/allocation-stage';
import type { ResolvedRuleSet } from '@domain/rules/contracts/resolved-rule-set';
import type { DomainError } from '@domain/shared/errors/domain-error';
import { ERROR_CATEGORIES } from '@domain/shared/errors/error-category';
import { err, ok, type Result } from '@domain/shared/errors/result';
import { sum } from '@domain/shared/money/money-arithmetic';
import type { Money } from '@domain/shared/money/money';

import type { AllocationIncomeEvent } from '../contracts/allocation-income-event';
import type { AllocationLine, AllocationResult } from '../contracts/allocation-result';
import { ALLOCATION_ERROR_CODES } from '../errors/allocation-error-codes';
import { allocationError } from '../errors/allocation-error';
import { executeGlobalObligations, type StageOutcome } from './execute-global-obligations';
import { executeLeftover } from './execute-leftover';
import { executeTopPriority } from './execute-top-priority';

/**
 * Allocates one income event against one resolved rule set.
 *
 * This is the Milestone 3 entry point and the answer to "where should my next
 * paycheck go?". It consumes the Milestone 2 output and executes it.
 *
 * It resolves nothing. Decision 074 fixes the boundary in both directions: the
 * Rule Engine must not calculate final allocation amounts, and the Allocation
 * Engine must not independently re-resolve rule precedence. Nothing here reads
 * an authored rule, compares precedence levels, selects a rule version, or
 * reinterprets a resolved value. Every strategy, policy, rate and requirement
 * is taken as already decided.
 *
 * The stage order is `ResolvedRuleSet.stageSequence`, not a constant in this
 * file. The Rule Engine owns the order and the Allocation Engine executes it,
 * so a plan that sequences its stages differently is honoured rather than
 * overridden.
 *
 * An unsupported stage fails the allocation. Skipping it would silently drop
 * money the plan intended to allocate and return a confidently wrong total,
 * which Constitution Principle 4 forbids and which the conservation invariant
 * in §2 would not catch, because the money would simply appear as unallocated.
 *
 * The starting pool is the amount `allocationBasis` names (§10). `NET_AMOUNT`
 * is Decision 093's product default and the only basis this slice executes;
 * `ELIGIBLE_AMOUNT` needs no new arithmetic but is not exercised here, so it is
 * not yet wired.
 */
export function executeAllocation(
  plan: ResolvedRuleSet,
  event: AllocationIncomeEvent,
): Result<AllocationResult, DomainError> {
  const initialPool = startingPool(plan, event);
  if (!initialPool.ok) {
    return initialPool;
  }

  const lines: AllocationLine[] = [];
  let pool = initialPool.value;

  for (const stage of plan.stageSequence) {
    const outcome = executeStage(stage, plan, event, pool);
    if (!outcome.ok) {
      return outcome;
    }

    lines.push(...outcome.value.lines);
    pool = outcome.value.remainingPool;
  }

  const totalAllocated = sum(
    lines.map((line) => line.amount),
    initialPool.value.currency,
  );
  if (!totalAllocated.ok) {
    return totalAllocated;
  }

  return ok({
    incomeEventId: event.incomeEventId,
    resolvedRuleSetId: plan.resolvedRuleSetId,
    lines,
    totalAllocated: totalAllocated.value,
    unallocated: pool,
  });
}

/** Dispatches one stage of the resolved sequence. */
function executeStage(
  stage: AllocationStage,
  plan: ResolvedRuleSet,
  event: AllocationIncomeEvent,
  pool: Money,
): Result<StageOutcome, DomainError> {
  switch (stage) {
    case 'GLOBAL_OBLIGATION':
      return executeGlobalObligations(plan.globalObligations, event, pool);

    case 'TOP_PRIORITY':
      return executeTopPriority(plan.topPriorities, plan.requiredFundingRules, pool);

    case 'LEFTOVER_POLICY':
      return executeLeftover(plan.leftoverPolicy, pool);

    case 'REQUIRED_RECURRING':
    case 'GOAL_FUNDING':
    case 'LOWER_PRIORITY':
    case 'EVERYDAY_SPENDING':
    case 'EVENT_OVERRIDE':
      return err(
        allocationError({
          code: ALLOCATION_ERROR_CODES.ALLOCATION_STAGE_NOT_SUPPORTED,
          category: ERROR_CATEGORIES.UNSUPPORTED_STATE,
          summary: 'That allocation stage cannot be executed yet.',
          details: `The resolved rule set sequences ${stage}, which this executor does not implement.`,
        }),
      );
  }
}

/**
 * The amount the allocation begins with (PFOS-ENG-02 §10).
 *
 * The resolved rule set identifies the starting amount through
 * `allocationBasis`, and the income event supplies both candidates, so this
 * selects between two given values and computes neither.
 */
function startingPool(
  plan: ResolvedRuleSet,
  event: AllocationIncomeEvent,
): Result<Money, DomainError> {
  switch (plan.allocationBasis) {
    case 'NET_AMOUNT':
      return ok(event.netAmount);

    case 'ELIGIBLE_AMOUNT':
      return err(
        allocationError({
          code: ALLOCATION_ERROR_CODES.ALLOCATION_STRATEGY_NOT_SUPPORTED,
          category: ERROR_CATEGORIES.UNSUPPORTED_STATE,
          summary: 'That allocation basis cannot be executed yet.',
          details: 'This executor implements the NET_AMOUNT basis only.',
        }),
      );
  }
}
