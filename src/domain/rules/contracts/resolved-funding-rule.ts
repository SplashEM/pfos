import type { FinancialDate } from '@domain/shared/dates/financial-date';
import type { EntityId } from '@domain/shared/ids/entity-id';
import type { Money } from '@domain/shared/money/money';
import type { BasisPoints } from '@domain/shared/percentages/basis-points';

import type { IncomeBasis } from './income-basis';
import type { Recurrence } from './recurrence';

/**
 * A required funding rule as resolved for execution (Decision 074).
 *
 * `isProtected` records whether the requirement receives protected treatment
 * under the Allocation Engine specification.
 *
 * `allowExcessAboveCapacity` records resolved policy. Capacity itself is
 * calculated by M3 from bucket state.
 */
export interface ResolvedFundingRule {
  readonly bucketId: EntityId;
  readonly ruleVersionId: EntityId;
  readonly sequence: number;
  readonly isProtected: boolean;
  readonly allowExcessAboveCapacity: boolean;
  readonly funding: FundingRuleConfig;
}

/**
 * The authored funding requirement carried by a resolved funding rule
 * (Decision 074).
 *
 * Every variant is a discriminated union.
 *
 * The Rule Engine emits authored monetary requirements where the rule itself
 * stores money. It does not calculate the amount that will actually be
 * allocated.
 */
export type FundingRuleConfig =
  | {
      readonly type: 'PERCENTAGE_OF_INCOME';
      readonly rateBasisPoints: BasisPoints;
      readonly incomeBasis: IncomeBasis;
      readonly maximumAmount?: Money;
    }
  | {
      readonly type: 'FIXED_PER_PAYCHECK';
      readonly amount: Money;
      readonly startDate?: FinancialDate;
      readonly endDate?: FinancialDate;
      readonly maximumAmount?: Money;
    }
  | {
      readonly type: 'FIXED_MONTHLY';
      readonly monthlyTarget: Money;
      readonly allowExtraContributions: boolean;
    }
  | {
      readonly type: 'RECURRING_BILL';
      readonly targetAmount: Money;
      readonly dueDate: FinancialDate;
      readonly recurrence: Recurrence;
    }
  | {
      readonly type: 'GOAL_UNTIL_TARGET';
      readonly targetAmount: Money;
      readonly deadline?: FinancialDate;
      readonly stopAtTarget: boolean;
      readonly allowManualExcess: boolean;
    }
  | {
      readonly type: 'MONTHLY_MINIMUM_PLUS_EXTRA';
      readonly monthlyMinimum: Money;
      readonly extraEligible: boolean;
    }
  | {
      readonly type: 'UNLIMITED';
      readonly minimumAmount?: Money;
    }
  | {
      readonly type: 'DEBT_PAYOFF';
      readonly minimumPayment: Money;
      readonly dueDate?: FinancialDate;
      readonly extraPaymentEligible: boolean;
      readonly targetPayoffAmount?: Money;
    };
