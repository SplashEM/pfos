import { describe, expect, it } from 'vitest';

import { APPLICATION_ERROR_CODES } from '../errors/application-error-codes';
import {
  DEFAULT_PAYCHECK_PLAN,
  type EditablePaycheckPlan,
  type EditablePriority,
} from './paycheck-plan';
import {
  previewPaycheckAllocation,
  type PaycheckPreviewRequest,
} from './preview-paycheck-allocation';

/* A fixed moment, so nothing here reads a clock either. */
const REQUESTED_AT = 1_767_225_600_000;

function request(overrides: Partial<PaycheckPreviewRequest> = {}): PaycheckPreviewRequest {
  return {
    plan: DEFAULT_PAYCHECK_PLAN,
    amount: '2000',
    eventDate: '2026-01-15',
    requestedAt: REQUESTED_AT,
    timeZone: 'America/Los_Angeles',
    ...overrides,
  };
}

/** The default plan with one value replaced. */
function planWith(overrides: Partial<EditablePaycheckPlan>): EditablePaycheckPlan {
  return { ...DEFAULT_PAYCHECK_PLAN, ...overrides };
}

/** A priority, spelled out so each test says what it is funding. */
function priority(
  id: string,
  label: string,
  amountPerPaycheck: string,
  rank: number,
): EditablePriority {
  return { id, label, amountPerPaycheck, rank };
}

/** The Emergency Fund priority at rank 1, asking for a given amount. */
function emergencyFund(amountPerPaycheck: string): EditablePriority {
  return priority('bucket-emergency-fund', 'Emergency Fund', amountPerPaycheck, 1);
}

/** The default plan with its priorities replaced. */
function planWithPriorities(...priorities: readonly EditablePriority[]): EditablePaycheckPlan {
  return planWith({ priorities });
}

/** Unwraps a successful preview, failing loudly if it was rejected. */
function preview(input: PaycheckPreviewRequest = request()) {
  const result = previewPaycheckAllocation(input);
  if (!result.ok) {
    throw new Error(`Preview failed: ${result.error.code} — ${result.error.summary}`);
  }
  return result.value;
}

/** Unwraps a rejected preview, failing loudly if it succeeded. */
function rejected(input: PaycheckPreviewRequest) {
  const result = previewPaycheckAllocation(input);
  if (result.ok) {
    throw new Error('Expected the preview to be rejected.');
  }
  return result.error;
}

describe('previewing a paycheck against the sample plan', () => {
  /*
   * The product target, end to end through the application layer: a typed
   * amount and date become authored rules, a resolved rule set, an allocation,
   * and finally three labelled lines.
   */
  it('answers where a $2,000 paycheck should go', () => {
    const result = preview();

    expect(result.lines.map((line) => [line.label, line.amount])).toEqual([
      ['Giving', '$200.00'],
      ['Emergency Fund', '$500.00'],
      ['Spending', '$1,300.00'],
    ]);

    expect(result.totalAllocated).toBe('$2,000.00');
    expect(result.unallocated).toBe('$0.00');
  });

  /*
   * The amounts must come from the domain rather than from anything this layer
   * does, so a different paycheck must produce a different split without a line
   * of arithmetic changing. Halving the paycheck halves the 10% obligation and
   * leaves the fixed $500 requirement untouched.
   */
  it('recomputes the whole split through the domain when the amount changes', () => {
    const result = preview(request({ amount: '1000' }));

    expect(result.lines.map((line) => [line.label, line.amount])).toEqual([
      ['Giving', '$100.00'],
      ['Emergency Fund', '$500.00'],
      ['Spending', '$400.00'],
    ]);

    expect(result.totalAllocated).toBe('$1,000.00');
    expect(result.unallocated).toBe('$0.00');
  });

  it('accepts a formatted amount with grouping and cents', () => {
    expect(preview(request({ amount: '$2,000.00' })).totalAllocated).toBe('$2,000.00');
  });

  it('labels every line rather than showing a bucket identifier', () => {
    for (const line of preview().lines) {
      expect(line.label).not.toBe(line.bucketId);
    }
  });
});

describe('editing the plan changes the authored rules', () => {
  /** The preview as [label, amount] pairs, in display order. */
  function split(plan: EditablePaycheckPlan): readonly (readonly string[])[] {
    return preview(request({ plan })).lines.map((line) => [line.label, line.amount]);
  }

  /*
   * Raising the giving rate raises the obligation and shrinks what is left. The
   * fixed requirement does not move, because it is a fixed amount rather than a
   * share — which is only true if the rate reached the authored rule rather
   * than being applied to an already-computed answer.
   */
  it('raises the obligation when the giving percentage rises', () => {
    expect(split(planWith({ givingPercent: '12' }))).toEqual([
      ['Giving', '$240.00'],
      ['Emergency Fund', '$500.00'],
      ['Spending', '$1,260.00'],
    ]);
  });

  it('changes the requirement when the emergency-fund amount changes', () => {
    expect(split(planWith({ givingPercent: '12', priorities: [emergencyFund('600')] }))).toEqual([
      ['Giving', '$240.00'],
      ['Emergency Fund', '$600.00'],
      ['Spending', '$1,160.00'],
    ]);
  });

  it('accepts a fractional percentage down to one basis point', () => {
    expect(split(planWith({ givingPercent: '12.5' }))).toEqual([
      ['Giving', '$250.00'],
      ['Emergency Fund', '$500.00'],
      ['Spending', '$1,250.00'],
    ]);
  });

  /* Renaming a destination renames what is shown and nothing else. */
  it('shows the leftover destination under its new name', () => {
    const result = preview(request({ plan: planWith({ leftoverLabel: 'Everyday spending' }) }));

    expect(result.lines.map((line) => line.label)).toEqual([
      'Giving',
      'Emergency Fund',
      'Everyday spending',
    ]);
    expect(result.lines.map((line) => line.amount)).toEqual(['$200.00', '$500.00', '$1,300.00']);
  });

  it('keeps the bucket identity when the label changes', () => {
    const before = preview(request({ plan: DEFAULT_PAYCHECK_PLAN }));
    const after = preview(request({ plan: planWith({ leftoverLabel: 'Fun money' }) }));

    expect(after.lines.map((line) => line.bucketId)).toEqual(
      before.lines.map((line) => line.bucketId),
    );
  });

  /*
   * A whole paycheck given away leaves nothing for the stages behind it. The
   * two remaining stages differ, and both behaviours are the executor's own: a
   * top priority reports that it received nothing, while the leftover policy
   * emits no line at all rather than a $0.00 movement of money that did not
   * occur.
   */
  it('lets the plan reach the boundaries the domain allows', () => {
    expect(split(planWith({ givingPercent: '100' }))).toEqual([
      ['Giving', '$2,000.00'],
      ['Emergency Fund', '$0.00'],
    ]);
  });
});

describe('managing more than one priority', () => {
  /** The preview as [label, amount] pairs, in display order. */
  function split(plan: EditablePaycheckPlan): readonly (readonly string[])[] {
    return preview(request({ plan })).lines.map((line) => [line.label, line.amount]);
  }

  const laptop = (amount: string, rank: number): EditablePriority =>
    priority('bucket-laptop', 'Laptop', amount, rank);

  it('funds two priorities and leaves the rest', () => {
    expect(split(planWithPriorities(emergencyFund('500'), laptop('300', 2)))).toEqual([
      ['Giving', '$200.00'],
      ['Emergency Fund', '$500.00'],
      ['Laptop', '$300.00'],
      ['Spending', '$1,000.00'],
    ]);
  });

  /*
   * A fully funded paycheck hides the ordering, because everything is paid
   * whatever the order. This one cannot pay both: after $120 of giving, $1,080
   * remains against $1,300 of requirements, so the second priority is the one
   * that goes short. That is the shipped SEQUENTIAL behaviour — fund rank 1,
   * then rank 2, stop when the money runs out — and nothing new is invented for
   * it here.
   */
  it('funds the higher rank first when the paycheck cannot cover both', () => {
    const plan = planWithPriorities(emergencyFund('1000'), laptop('300', 2));

    expect(
      preview(request({ plan, amount: '1200' })).lines.map((line) => [line.label, line.amount]),
    ).toEqual([
      ['Giving', '$120.00'],
      ['Emergency Fund', '$1,000.00'],
      ['Laptop', '$80.00'],
    ]);
  });

  /* Reordering the same two priorities changes who goes short. */
  it('funds the other one first once the order is reversed', () => {
    const plan = planWithPriorities(
      priority('bucket-emergency-fund', 'Emergency Fund', '1000', 2),
      laptop('300', 1),
    );

    expect(
      preview(request({ plan, amount: '1200' })).lines.map((line) => [line.label, line.amount]),
    ).toEqual([
      ['Giving', '$120.00'],
      ['Laptop', '$300.00'],
      ['Emergency Fund', '$780.00'],
    ]);
  });

  it('funds three priorities', () => {
    const plan = planWithPriorities(
      emergencyFund('500'),
      laptop('300', 2),
      priority('bucket-travel', 'Travel', '200', 3),
    );

    expect(split(plan)).toEqual([
      ['Giving', '$200.00'],
      ['Emergency Fund', '$500.00'],
      ['Laptop', '$300.00'],
      ['Travel', '$200.00'],
      ['Spending', '$800.00'],
    ]);
  });

  /* Decision 076's limit is the domain's, and its answer reaches the caller. */
  it('refuses a fourth priority with the domain limit', () => {
    const plan = planWithPriorities(
      emergencyFund('100'),
      laptop('100', 2),
      priority('bucket-travel', 'Travel', '100', 3),
      priority('bucket-gifts', 'Gifts', '100', 4),
    );

    expect(rejected(request({ plan })).code).toBe('RULE_TOP_PRIORITY_COUNT_ABOVE_MAXIMUM');
  });

  /* Decision 076 again: two priorities must not share a rank. */
  it('refuses two priorities sharing a rank', () => {
    const plan = planWithPriorities(emergencyFund('500'), laptop('300', 1));

    expect(rejected(request({ plan })).code).toBe('RULE_TOP_PRIORITY_DUPLICATE_RANK');
  });

  /* Decision 075: a plan with no top priorities resolves rather than failing. */
  it('allows a plan with no priorities at all', () => {
    expect(split(planWithPriorities())).toEqual([
      ['Giving', '$200.00'],
      ['Spending', '$1,800.00'],
    ]);
  });

  /* Identity is the id, so a rename moves no money and mints no bucket. */
  it('keeps the same bucket when a priority is renamed', () => {
    const before = preview(request({ plan: planWithPriorities(emergencyFund('500')) }));
    const after = preview(
      request({
        plan: planWithPriorities(priority('bucket-emergency-fund', 'Rainy day', '500', 1)),
      }),
    );

    expect(after.lines.map((line) => line.bucketId)).toEqual(
      before.lines.map((line) => line.bucketId),
    );
    expect(after.lines.map((line) => line.label)).toContain('Rainy day');
  });
});

describe('plan values a person can correct', () => {
  it('rejects a percentage that is not a number', () => {
    expect(rejected(request({ plan: planWith({ givingPercent: 'ten' }) })).code).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_PLAN_GIVING_PERCENT_INVALID,
    );
  });

  it('rejects a negative percentage', () => {
    expect(rejected(request({ plan: planWith({ givingPercent: '-5' }) })).code).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_PLAN_GIVING_PERCENT_INVALID,
    );
  });

  /* The 0%-to-100% bound is the domain's, and its answer is returned unchanged. */
  it('surfaces the domain bound for a percentage above 100', () => {
    expect(rejected(request({ plan: planWith({ givingPercent: '150' }) })).code).toBe(
      'BASIS_POINTS_OUT_OF_RANGE',
    );
  });

  /* So is the limit on precision finer than one basis point. */
  it('surfaces the domain answer for a percentage finer than a basis point', () => {
    expect(rejected(request({ plan: planWith({ givingPercent: '10.125' }) })).code).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_PLAN_GIVING_PERCENT_INVALID,
    );
  });

  it('rejects a priority amount that is not money', () => {
    expect(
      rejected(request({ plan: planWithPriorities(emergencyFund('five hundred')) })).code,
    ).toBe('MONEY_PARSE_INVALID_FORMAT');
  });

  it('rejects a negative priority amount', () => {
    expect(rejected(request({ plan: planWithPriorities(emergencyFund('-100')) })).code).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_PLAN_FUNDING_AMOUNT_NEGATIVE,
    );
  });

  it('rejects a priority with no name', () => {
    expect(
      rejected(request({ plan: planWithPriorities(priority('bucket-a', '  ', '500', 1)) })).code,
    ).toBe(APPLICATION_ERROR_CODES.APPLICATION_PLAN_PRIORITY_LABEL_EMPTY);
  });

  /* Zero funds nothing, which is representable rather than invalid. */
  it('accepts a priority amount of zero', () => {
    const result = preview(request({ plan: planWithPriorities(emergencyFund('0')) }));

    expect(result.lines.map((line) => [line.label, line.amount])).toEqual([
      ['Giving', '$200.00'],
      ['Emergency Fund', '$0.00'],
      ['Spending', '$1,800.00'],
    ]);
  });

  it('rejects a blank leftover destination name', () => {
    expect(rejected(request({ plan: planWith({ leftoverLabel: '   ' }) })).code).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_PLAN_LEFTOVER_LABEL_EMPTY,
    );
  });
});

describe('input a person can correct', () => {
  it('rejects an amount that is not a dollar figure', () => {
    expect(rejected(request({ amount: 'two thousand' })).code).toBe('MONEY_PARSE_INVALID_FORMAT');
  });

  it('rejects a zero paycheck', () => {
    expect(rejected(request({ amount: '0' })).code).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_PAYCHECK_AMOUNT_NOT_POSITIVE,
    );
  });

  it('rejects a negative paycheck', () => {
    expect(rejected(request({ amount: '-500' })).code).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_PAYCHECK_AMOUNT_NOT_POSITIVE,
    );
  });

  it('rejects a date that is not YYYY-MM-DD', () => {
    expect(rejected(request({ eventDate: '15/01/2026' })).code).toBe(
      APPLICATION_ERROR_CODES.APPLICATION_PAYCHECK_DATE_INVALID_FORMAT,
    );
  });

  /* A well-formed date that does not exist is the domain's answer, not this layer's. */
  it('surfaces the domain answer for a date that does not exist', () => {
    expect(rejected(request({ eventDate: '2026-02-31' })).code).toBe('DATE_INVALID_CALENDAR_DATE');
  });

  it('rejects a missing time zone', () => {
    expect(rejected(request({ timeZone: '   ' })).code).toBe('DATE_INVALID_TIME_ZONE');
  });

  /* Every failure carries text the screen can show unchanged. */
  it('carries a displayable summary on every failure', () => {
    const failures = [
      rejected(request({ amount: 'nonsense' })),
      rejected(request({ amount: '0' })),
      rejected(request({ eventDate: 'today' })),
    ];

    for (const failure of failures) {
      expect(failure.summary.length).toBeGreaterThan(0);
      expect(failure.summary).not.toContain('undefined');
    }
  });
});

describe('what a preview is not', () => {
  /*
   * A paycheck dated before the sample plan was authored has no effective
   * version of any rule. Resolution still succeeds — the leftover slot falls to
   * Decision 093's LEAVE_UNALLOCATED product default — but the executor does not
   * implement that policy yet and refuses the allocation.
   *
   * The refusal is the point. It travels up unchanged, with the engine's own
   * code and its own displayable summary, rather than being swallowed into an
   * empty preview that would tell a person their paycheck goes nowhere.
   */
  it('surfaces an executor refusal instead of showing an empty answer', () => {
    const error = rejected(request({ eventDate: '2025-12-31' }));

    expect(error.code).toBe('ALLOCATION_STRATEGY_NOT_SUPPORTED');
    expect(error.summary.length).toBeGreaterThan(0);
  });

  /* Two identical requests produce an identical answer. */
  it('is deterministic for identical input', () => {
    expect(preview()).toEqual(preview());
  });
});
