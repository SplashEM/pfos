import { money } from '@test/builders/money';
import { describe, expect, it } from 'vitest';

import { asEntityId } from '@domain/shared/ids/entity-id';
import { basisPoints, type BasisPoints } from '@domain/shared/percentages/basis-points';

import type { ResolvedSlotKind } from './resolved-slot-kind';
import type {
  AuthorableSlotKind,
  GlobalObligationConfiguration,
  IncomeSourceApplicability,
  LeftoverPolicyConfiguration,
  RequiredFundingConfiguration,
  RuleConfiguration,
  TopPrioritiesConfiguration,
} from './rule-configuration';

/** Builds a rate, failing loudly if the test supplied an invalid one. */
function rate(value: number): BasisPoints {
  const result = basisPoints(value);
  if (!result.ok) {
    throw new Error(`Invalid rate in test setup: ${result.error.code}`);
  }
  return result.value;
}

const GIVING = asEntityId('bucket-giving');
const SPENDING = asEntityId('bucket-spending');
const EMERGENCY_FUND = asEntityId('bucket-emergency-fund');

const TITHE: GlobalObligationConfiguration = {
  slotKind: 'GLOBAL_OBLIGATION',
  destinationBucketId: GIVING,
  rateBasisPoints: rate(1_000),
  incomeBasis: 'NET_DEPOSITED',
  applicability: { scope: 'ALL_SOURCES' },
};

const TOP_PRIORITIES: TopPrioritiesConfiguration = {
  slotKind: 'TOP_PRIORITIES',
  strategy: 'SEQUENTIAL',
  entries: [{ bucketId: EMERGENCY_FUND, rank: 1 }],
};

const EMERGENCY_FUND_REQUIREMENT: RequiredFundingConfiguration = {
  slotKind: 'REQUIRED_FUNDING',
  sequence: 1,
  isProtected: false,
  allowExcessAboveCapacity: false,
  funding: { type: 'FIXED_PER_PAYCHECK', amount: money(50_000) },
};

const LEFTOVER: LeftoverPolicyConfiguration = {
  slotKind: 'LEFTOVER_POLICY',
  policyType: 'SINGLE_DESTINATION',
  destinationBucketId: SPENDING,
};

describe('the authorable subset', () => {
  /*
   * Decision 096 bounded the union and Decision 097 added the fourth family.
   * The check is exhaustive in both directions: a fifth arm would break the
   * Record, and a removed arm would leave a key with no value.
   */
  it('covers exactly the four families Decisions 096 and 097 authorise', () => {
    const arms: Record<AuthorableSlotKind, RuleConfiguration> = {
      GLOBAL_OBLIGATION: TITHE,
      TOP_PRIORITIES: TOP_PRIORITIES,
      REQUIRED_FUNDING: EMERGENCY_FUND_REQUIREMENT,
      LEFTOVER_POLICY: LEFTOVER,
    };

    expect(Object.keys(arms).sort()).toEqual([
      'GLOBAL_OBLIGATION',
      'LEFTOVER_POLICY',
      'REQUIRED_FUNDING',
      'TOP_PRIORITIES',
    ]);
  });

  /*
   * Decision 096 keeps ResolvedSlotKind at eight families while the authorable
   * subset is four, so a rule of an unsupported family stays addressable and
   * only its configuration cannot exist. This asserts the gap is real: every
   * authorable kind is a slot kind, and four slot kinds have no arm.
   */
  it('draws every tag from ResolvedSlotKind without covering all eight', () => {
    const authorable: readonly ResolvedSlotKind[] = [
      TITHE.slotKind,
      TOP_PRIORITIES.slotKind,
      EMERGENCY_FUND_REQUIREMENT.slotKind,
      LEFTOVER.slotKind,
    ];

    const notAuthorable: readonly ResolvedSlotKind[] = [
      'LOWER_PRIORITY_POOL',
      'ALLOCATION_BASIS',
      'GOAL_POLICY',
      'ROLLOVER_POLICY',
    ];

    expect(authorable).toHaveLength(4);
    expect(notAuthorable).toHaveLength(4);
    expect(authorable.filter((kind) => notAuthorable.includes(kind))).toEqual([]);
  });
});

describe('GLOBAL_OBLIGATION configuration', () => {
  it('carries no authored cap, per Decision 096', () => {
    expect(Object.keys(TITHE)).not.toContain('maximumAmount');
    expect(Object.keys(TITHE)).toEqual([
      'slotKind',
      'destinationBucketId',
      'rateBasisPoints',
      'incomeBasis',
      'applicability',
    ]);
  });

  it('carries no authored provenance', () => {
    expect(Object.keys(TITHE)).not.toContain('ruleId');
    expect(Object.keys(TITHE)).not.toContain('ruleVersionId');
  });

  /*
   * Decision 088 fixes exactly three semantics with exactly one active, and
   * Decision 096 fixes their spellings. Two listed semantics carry a set; the
   * universal one carries none, so "missing data means everyone" is
   * unrepresentable rather than merely invalid.
   */
  it('offers Decision 088 three applicability semantics and no fourth', () => {
    const universal: IncomeSourceApplicability = { scope: 'ALL_SOURCES' };
    const onlyListed: IncomeSourceApplicability = {
      scope: 'ONLY_LISTED_SOURCES',
      incomeSourceIds: [asEntityId('income-source-primary-job')],
    };
    const allExcept: IncomeSourceApplicability = {
      scope: 'ALL_EXCEPT_LISTED_SOURCES',
      incomeSourceIds: [asEntityId('income-source-side-gig')],
    };

    expect(Object.keys(universal)).toEqual(['scope']);
    expect(Object.keys(onlyListed)).toEqual(['scope', 'incomeSourceIds']);
    expect(Object.keys(allExcept)).toEqual(['scope', 'incomeSourceIds']);
  });
});

describe('TOP_PRIORITIES configuration', () => {
  it('requires a rank under SEQUENTIAL', () => {
    expect(TOP_PRIORITIES.entries[0]?.rank).toBe(1);
  });

  /* Decision 087: rank is authored under PERCENTAGE_SPLIT too, beside a share. */
  it('requires a rank and a share under PERCENTAGE_SPLIT', () => {
    const split: TopPrioritiesConfiguration = {
      slotKind: 'TOP_PRIORITIES',
      strategy: 'PERCENTAGE_SPLIT',
      entries: [
        { bucketId: EMERGENCY_FUND, rank: 1, shareBasisPoints: rate(6_000) },
        { bucketId: SPENDING, rank: 2, shareBasisPoints: rate(4_000) },
      ],
    };

    expect(split.entries.map((entry) => entry.rank)).toEqual([1, 2]);
    expect(split.entries.map((entry) => entry.shareBasisPoints)).toEqual([6_000, 4_000]);
  });

  it('carries no ordering field beside rank', () => {
    expect(Object.keys(TOP_PRIORITIES.entries[0] ?? {})).toEqual(['bucketId', 'rank']);
  });
});

describe('REQUIRED_FUNDING configuration', () => {
  /*
   * Decision 097's three envelope members are authored, and Decision 082 keeps
   * the bucket as the rule's owner rather than versioned configuration, so no
   * bucketId is duplicated here.
   */
  it('carries the three authored envelope members and no bucket identity', () => {
    expect(Object.keys(EMERGENCY_FUND_REQUIREMENT)).toEqual([
      'slotKind',
      'sequence',
      'isProtected',
      'allowExcessAboveCapacity',
      'funding',
    ]);
    expect(Object.keys(EMERGENCY_FUND_REQUIREMENT)).not.toContain('bucketId');
    expect(Object.keys(EMERGENCY_FUND_REQUIREMENT)).not.toContain('ruleVersionId');
  });

  it('reuses Decision 074 FundingRuleConfig unchanged', () => {
    expect(EMERGENCY_FUND_REQUIREMENT.funding.type).toBe('FIXED_PER_PAYCHECK');
  });
});

describe('LEFTOVER_POLICY configuration', () => {
  it('offers the five Decision 074 policy types', () => {
    const policies: readonly LeftoverPolicyConfiguration[] = [
      { slotKind: 'LEFTOVER_POLICY', policyType: 'LEAVE_UNALLOCATED' },
      {
        slotKind: 'LEFTOVER_POLICY',
        policyType: 'SINGLE_DESTINATION',
        destinationBucketId: SPENDING,
      },
      {
        slotKind: 'LEFTOVER_POLICY',
        policyType: 'PERCENTAGE_SPLIT',
        destinations: [
          { bucketId: SPENDING, shareBasisPoints: rate(7_000) },
          { bucketId: EMERGENCY_FUND, shareBasisPoints: rate(3_000) },
        ],
      },
      { slotKind: 'LEFTOVER_POLICY', policyType: 'HIGHEST_PRIORITY_UNFINISHED_GOAL' },
      {
        slotKind: 'LEFTOVER_POLICY',
        policyType: 'MAINTAIN_BUFFER_THEN_REDIRECT',
        bufferAmount: money(100_000),
        destinationBucketId: SPENDING,
      },
    ];

    expect(policies.map((policy) => policy.policyType)).toEqual([
      'LEAVE_UNALLOCATED',
      'SINGLE_DESTINATION',
      'PERCENTAGE_SPLIT',
      'HIGHEST_PRIORITY_UNFINISHED_GOAL',
      'MAINTAIN_BUFFER_THEN_REDIRECT',
    ]);
  });

  /* Decision 074: no leftover variant carries a fallback. */
  it('carries no fallback on any arm', () => {
    expect(Object.keys(LEFTOVER)).toEqual(['slotKind', 'policyType', 'destinationBucketId']);
  });

  /*
   * Decision 093 makes LEAVE_UNALLOCATED the product default, and Decision 081
   * holds that a product default is not a rule, so authored configuration
   * carries no default-sourced provenance.
   */
  it('carries no default-sourced provenance on the default arm', () => {
    const leaveUnallocated: LeftoverPolicyConfiguration = {
      slotKind: 'LEFTOVER_POLICY',
      policyType: 'LEAVE_UNALLOCATED',
    };

    expect(Object.keys(leaveUnallocated)).toEqual(['slotKind', 'policyType']);
  });
});
