import { money } from '@test/builders/money';
import { describe, expect, it } from 'vitest';

import { financialDate, type FinancialDate } from '@domain/shared/dates/financial-date';
import { timestamp, type Timestamp } from '@domain/shared/dates/timestamp';
import { asEntityId, type EntityId } from '@domain/shared/ids/entity-id';
import { basisPoints, type BasisPoints } from '@domain/shared/percentages/basis-points';

import { RESOLVED_RULE_SET_SCHEMA_VERSION } from '../contracts/resolved-rule-set';
import type { Rule } from '../contracts/rule';
import type { RuleConfiguration } from '../contracts/rule-configuration';
import type { RuleVersion } from '../contracts/rule-version';
import { RULE_ERROR_CODES } from '../errors/rule-error-codes';
import {
  resolveRuleSet,
  type AuthoredRuleVersions,
  type RuleResolutionInput,
} from './resolve-rule-set';

/** Builds a date, failing loudly if the test supplied an invalid one. */
function date(year: number, month: number, day: number): FinancialDate {
  const result = financialDate(year, month, day);
  if (!result.ok) {
    throw new Error(`Invalid date in test setup: ${result.error.code}`);
  }
  return result.value;
}

/** Builds a timestamp, failing loudly if the test supplied an invalid one. */
function instant(): Timestamp {
  const result = timestamp(1_767_225_600_000, 'America/Los_Angeles');
  if (!result.ok) {
    throw new Error(`Invalid timestamp in test setup: ${result.error.code}`);
  }
  return result.value;
}

/** Builds a rate, failing loudly if the test supplied an invalid one. */
function rate(value: number): BasisPoints {
  const result = basisPoints(value);
  if (!result.ok) {
    throw new Error(`Invalid rate in test setup: ${result.error.code}`);
  }
  return result.value;
}

const GIVING = asEntityId('bucket-giving');
const EMERGENCY_FUND = asEntityId('bucket-emergency-fund');
const SPENDING = asEntityId('bucket-spending');
const PRIMARY_JOB = asEntityId('income-source-primary-job');
const SIDE_GIG = asEntityId('income-source-side-gig');

const JANUARY_FIRST = date(2026, 1, 1);

function globalRule(ruleId: string, slotKind: Rule['slotKind']): Rule {
  return {
    ruleId: asEntityId(ruleId),
    owner: { ownerType: 'GLOBAL' },
    slotKind,
    status: 'ACTIVE',
  };
}

function bucketRule(ruleId: string, bucketId: EntityId): Rule {
  return {
    ruleId: asEntityId(ruleId),
    owner: { ownerType: 'BUCKET', ownerId: bucketId },
    slotKind: 'REQUIRED_FUNDING',
    status: 'ACTIVE',
  };
}

function configured(
  ruleId: string,
  versionId: string,
  configuration: RuleConfiguration,
  effectiveFrom: FinancialDate = JANUARY_FIRST,
): RuleVersion {
  return {
    kind: 'CONFIGURED',
    ruleVersionId: asEntityId(versionId),
    ruleId: asEntityId(ruleId),
    period: { effectiveFrom },
    configuration,
  };
}

const TITHE_CONFIGURATION: RuleConfiguration = {
  slotKind: 'GLOBAL_OBLIGATION',
  destinationBucketId: GIVING,
  rateBasisPoints: rate(1_000),
  incomeBasis: 'NET_DEPOSITED',
  applicability: { scope: 'ALL_SOURCES' },
};

const TOP_PRIORITY_CONFIGURATION: RuleConfiguration = {
  slotKind: 'TOP_PRIORITIES',
  strategy: 'SEQUENTIAL',
  entries: [{ bucketId: EMERGENCY_FUND, rank: 1 }],
};

const FUNDING_CONFIGURATION: RuleConfiguration = {
  slotKind: 'REQUIRED_FUNDING',
  sequence: 1,
  isProtected: false,
  allowExcessAboveCapacity: false,
  funding: { type: 'FIXED_PER_PAYCHECK', amount: money(50_000) },
};

const LEFTOVER_CONFIGURATION: RuleConfiguration = {
  slotKind: 'LEFTOVER_POLICY',
  policyType: 'SINGLE_DESTINATION',
  destinationBucketId: SPENDING,
};

const GIVING_RULE: AuthoredRuleVersions = {
  rule: globalRule('rule-giving', 'GLOBAL_OBLIGATION'),
  versions: [configured('rule-giving', 'rule-version-giving-1', TITHE_CONFIGURATION)],
};

const TOP_PRIORITY_RULE: AuthoredRuleVersions = {
  rule: globalRule('rule-top-priorities', 'TOP_PRIORITIES'),
  versions: [
    configured('rule-top-priorities', 'rule-version-top-priorities-1', TOP_PRIORITY_CONFIGURATION),
  ],
};

const FUNDING_RULE: AuthoredRuleVersions = {
  rule: bucketRule('rule-emergency-fund', EMERGENCY_FUND),
  versions: [
    configured('rule-emergency-fund', 'rule-version-emergency-fund-1', FUNDING_CONFIGURATION),
  ],
};

const LEFTOVER_RULE: AuthoredRuleVersions = {
  rule: globalRule('rule-leftover', 'LEFTOVER_POLICY'),
  versions: [configured('rule-leftover', 'rule-version-leftover-1', LEFTOVER_CONFIGURATION)],
};

function request(overrides: Partial<RuleResolutionInput> = {}): RuleResolutionInput {
  return {
    rules: [GIVING_RULE, TOP_PRIORITY_RULE, FUNDING_RULE, LEFTOVER_RULE],
    evaluationDate: date(2026, 1, 15),
    incomeSourceId: PRIMARY_JOB,
    resolvedRuleSetId: asEntityId('resolved-rule-set-1'),
    planVersionId: asEntityId('plan-version-1'),
    resolvedAt: instant(),
    resolutionMode: 'PREVIEW',
    ...overrides,
  };
}

/** Unwraps a successful resolution, failing loudly if it was rejected. */
function resolved(input: RuleResolutionInput = request()) {
  const result = resolveRuleSet(input);
  if (!result.ok) {
    throw new Error(`Resolution failed: ${result.error.code} — ${result.error.summary}`);
  }
  return result.value;
}

/** Unwraps a rejected resolution, failing loudly if it succeeded. */
function rejected(input: RuleResolutionInput) {
  const result = resolveRuleSet(input);
  if (result.ok) {
    throw new Error('Expected resolution to be rejected.');
  }
  return result.error;
}

describe('resolving the authored paycheck plan', () => {
  it('resolves one obligation from the authored global rule', () => {
    const plan = resolved();

    expect(plan.globalObligations).toEqual([
      {
        ruleId: 'rule-giving',
        ruleVersionId: 'rule-version-giving-1',
        destinationBucketId: GIVING,
        rateBasisPoints: 1_000,
        incomeBasis: 'NET_DEPOSITED',
      },
    ]);
  });

  /* Decision 096: V1 obligations carry no authored cap, so none is populated. */
  it('leaves maximumAmount absent on the resolved obligation', () => {
    const [obligation] = resolved().globalObligations;

    expect(obligation).toBeDefined();
    expect(Object.keys(obligation ?? {})).not.toContain('maximumAmount');
  });

  it('resolves the top-priority plan with its authored rank and provenance', () => {
    const plan = resolved();

    expect(plan.topPriorities).toEqual({
      strategy: 'SEQUENTIAL',
      entries: [
        {
          bucketId: EMERGENCY_FUND,
          rank: 1,
          ruleVersionIds: ['rule-version-top-priorities-1'],
        },
      ],
    });
  });

  /*
   * Decision 082 makes the bucket the rule's owner, so the resolved bucketId
   * comes from Rule.owner and never from versioned configuration.
   */
  it('takes a funding rule bucket from the rule owner', () => {
    const plan = resolved();

    expect(plan.requiredFundingRules).toEqual([
      {
        bucketId: EMERGENCY_FUND,
        ruleVersionId: 'rule-version-emergency-fund-1',
        sequence: 1,
        isProtected: false,
        allowExcessAboveCapacity: false,
        funding: { type: 'FIXED_PER_PAYCHECK', amount: money(50_000) },
      },
    ]);
  });

  it('resolves the authored leftover policy', () => {
    expect(resolved().leftoverPolicy).toEqual({
      policyType: 'SINGLE_DESTINATION',
      destinationBucketId: SPENDING,
    });
  });

  /* PFOS-ENG-02 §9's order, restricted to the stages this resolution populates. */
  it('sequences the stages it populates in specification order', () => {
    expect(resolved().stageSequence).toEqual([
      'GLOBAL_OBLIGATION',
      'TOP_PRIORITY',
      'LEFTOVER_POLICY',
    ]);
  });

  it('records the versions that produced the resolution', () => {
    expect(resolved().sourceRuleVersionIds).toEqual([
      'rule-version-giving-1',
      'rule-version-top-priorities-1',
      'rule-version-emergency-fund-1',
      'rule-version-leftover-1',
    ]);
  });

  it('carries the provenance the caller supplied', () => {
    const plan = resolved();

    expect(plan.resolvedRuleSetId).toBe('resolved-rule-set-1');
    expect(plan.planVersionId).toBe('plan-version-1');
    expect(plan.resolutionMode).toBe('PREVIEW');
    expect(plan.evaluationDate).toEqual(date(2026, 1, 15));
    expect(plan.schemaVersion).toBe(RESOLVED_RULE_SET_SCHEMA_VERSION);
  });

  /*
   * Decision 074: identical inputs must produce a deep-equal ResolvedRuleSet.
   * The function reads a clock for nothing and derives no identifier.
   */
  it('produces a deep-equal result from identical input', () => {
    expect(resolved()).toEqual(resolved());
  });

  /* Skip and explanation emission are deferred, so both channels stay empty. */
  it('emits no skipped rules or explanations', () => {
    const plan = resolved();

    expect(plan.skippedRules).toEqual([]);
    expect(plan.explanations).toEqual([]);
    expect(plan.warnings).toEqual([]);
  });
});

describe('members no authored rule addresses', () => {
  it('uses Decision 093 product defaults for the leftover policy and basis', () => {
    const plan = resolved(request({ rules: [] }));

    expect(plan.leftoverPolicy).toEqual({ policyType: 'LEAVE_UNALLOCATED' });
    expect(plan.allocationBasis).toBe('NET_AMOUNT');
  });

  /*
   * The pool is empty because Decision 096 makes LOWER_PRIORITY_POOL
   * unauthorable, so no authored destination can exist. The strategy tag is
   * inert rather than a designated product default: ResolvedPoolPlan has no
   * tag-free arm, and across zero destinations every arm allocates nothing.
   */
  it('resolves an empty lower-priority pool, which no authored rule can fill', () => {
    expect(resolved(request({ rules: [] })).lowerPriorityPool).toEqual({
      strategy: 'EVEN_SPLIT',
      destinations: [],
    });
  });

  it('leaves the unauthorable rollover and goal collections empty', () => {
    const plan = resolved(request({ rules: [] }));

    expect(plan.rolloverPolicies).toEqual([]);
    expect(plan.goalPolicies).toEqual([]);
  });

  /* Decision 075: zero sequential top priorities is valid, and warns. */
  it('warns rather than fails when no top priorities are configured', () => {
    const plan = resolved(request({ rules: [] }));

    expect(plan.topPriorities).toEqual({ strategy: 'SEQUENTIAL', entries: [] });
    expect(plan.warnings.map((warning) => warning.code)).toEqual([
      'RULE_WARN_NO_TOP_PRIORITIES_CONFIGURED',
    ]);
  });

  it('sequences only the leftover stage when nothing else is populated', () => {
    expect(resolved(request({ rules: [] })).stageSequence).toEqual(['LEFTOVER_POLICY']);
  });
});

describe('version selection', () => {
  /* Decision 079: among effective versions, the greatest start applies. */
  it('applies the later version once its effective date arrives', () => {
    const raised: RuleConfiguration = { ...TITHE_CONFIGURATION, rateBasisPoints: rate(1_200) };

    const givingWithRaise: AuthoredRuleVersions = {
      rule: globalRule('rule-giving', 'GLOBAL_OBLIGATION'),
      versions: [
        configured('rule-giving', 'rule-version-giving-1', TITHE_CONFIGURATION),
        configured('rule-giving', 'rule-version-giving-2', raised, date(2026, 4, 1)),
      ],
    };

    const before = resolved(
      request({ rules: [givingWithRaise], evaluationDate: date(2026, 3, 31) }),
    );
    const after = resolved(request({ rules: [givingWithRaise], evaluationDate: date(2026, 4, 1) }));

    expect(before.globalObligations[0]?.rateBasisPoints).toBe(1_000);
    expect(after.globalObligations[0]?.rateBasisPoints).toBe(1_200);
  });

  /* Decision 085: a selected stop means the rule contributes nothing. */
  it('drops a rule whose effective version is a stop', () => {
    const stopped: AuthoredRuleVersions = {
      rule: globalRule('rule-giving', 'GLOBAL_OBLIGATION'),
      versions: [
        configured('rule-giving', 'rule-version-giving-1', TITHE_CONFIGURATION),
        {
          kind: 'TERMINATING',
          ruleVersionId: asEntityId('rule-version-giving-2'),
          ruleId: asEntityId('rule-giving'),
          period: { effectiveFrom: date(2026, 6, 1) },
        },
      ],
    };

    const plan = resolved(request({ rules: [stopped], evaluationDate: date(2026, 6, 1) }));

    expect(plan.globalObligations).toEqual([]);
    expect(plan.sourceRuleVersionIds).toEqual([]);
  });

  it('drops a rule with no version effective on the evaluation date', () => {
    const future: AuthoredRuleVersions = {
      rule: globalRule('rule-giving', 'GLOBAL_OBLIGATION'),
      versions: [
        configured('rule-giving', 'rule-version-giving-1', TITHE_CONFIGURATION, date(2027, 1, 1)),
      ],
    };

    expect(resolved(request({ rules: [future] })).globalObligations).toEqual([]);
  });
});

describe('income-source applicability', () => {
  function givingWith(applicability: RuleConfiguration): AuthoredRuleVersions {
    return {
      rule: globalRule('rule-giving', 'GLOBAL_OBLIGATION'),
      versions: [configured('rule-giving', 'rule-version-giving-1', applicability)],
    };
  }

  it('applies a universal obligation to any source', () => {
    const plan = resolved(request({ rules: [GIVING_RULE], incomeSourceId: SIDE_GIG }));

    expect(plan.globalObligations).toHaveLength(1);
  });

  it('applies an only-listed obligation to a listed source and no other', () => {
    const rules = [
      givingWith({
        ...TITHE_CONFIGURATION,
        slotKind: 'GLOBAL_OBLIGATION',
        applicability: { scope: 'ONLY_LISTED_SOURCES', incomeSourceIds: [PRIMARY_JOB] },
      }),
    ];

    expect(
      resolved(request({ rules, incomeSourceId: PRIMARY_JOB })).globalObligations,
    ).toHaveLength(1);
    expect(resolved(request({ rules, incomeSourceId: SIDE_GIG })).globalObligations).toEqual([]);
  });

  it('excludes a listed source under the all-except semantic', () => {
    const rules = [
      givingWith({
        ...TITHE_CONFIGURATION,
        slotKind: 'GLOBAL_OBLIGATION',
        applicability: { scope: 'ALL_EXCEPT_LISTED_SOURCES', incomeSourceIds: [SIDE_GIG] },
      }),
    ];

    expect(
      resolved(request({ rules, incomeSourceId: PRIMARY_JOB })).globalObligations,
    ).toHaveLength(1);
    expect(resolved(request({ rules, incomeSourceId: SIDE_GIG })).globalObligations).toEqual([]);
  });

  /*
   * Decision 088 authorises no skip-emission behaviour, so a non-applicable
   * obligation is absent rather than reported.
   */
  it('records no skip for an obligation that does not apply', () => {
    const rules = [
      givingWith({
        ...TITHE_CONFIGURATION,
        slotKind: 'GLOBAL_OBLIGATION',
        applicability: { scope: 'ONLY_LISTED_SOURCES', incomeSourceIds: [PRIMARY_JOB] },
      }),
    ];

    expect(resolved(request({ rules, incomeSourceId: SIDE_GIG })).skippedRules).toEqual([]);
  });
});

describe('ordering the required stage', () => {
  function fundingFor(bucket: EntityId, sequence: number, suffix: string): AuthoredRuleVersions {
    return {
      rule: bucketRule(`rule-funding-${suffix}`, bucket),
      versions: [
        configured(`rule-funding-${suffix}`, `rule-version-funding-${suffix}`, {
          slotKind: 'REQUIRED_FUNDING',
          sequence,
          isProtected: false,
          allowExcessAboveCapacity: false,
          funding: { type: 'FIXED_PER_PAYCHECK', amount: money(10_000) },
        }),
      ],
    };
  }

  const bothPriorities: AuthoredRuleVersions = {
    rule: globalRule('rule-top-priorities', 'TOP_PRIORITIES'),
    versions: [
      configured('rule-top-priorities', 'rule-version-top-priorities-1', {
        slotKind: 'TOP_PRIORITIES',
        strategy: 'SEQUENTIAL',
        entries: [
          { bucketId: EMERGENCY_FUND, rank: 1 },
          { bucketId: SPENDING, rank: 2 },
        ],
      }),
    ],
  };

  /* Decision 074 orders required funding rules by financially meaningful sequence. */
  it('orders funding rules by ascending sequence, not by input order', () => {
    const plan = resolved(
      request({
        rules: [
          bothPriorities,
          fundingFor(SPENDING, 9, 'spending'),
          fundingFor(EMERGENCY_FUND, 2, 'emergency'),
        ],
      }),
    );

    expect(plan.requiredFundingRules.map((fundingRule) => fundingRule.sequence)).toEqual([2, 9]);
  });

  /* Decision 097's uniqueness invariant, checked where it becomes executable. */
  it('rejects two funding rules sharing a sequence', () => {
    const error = rejected(
      request({
        rules: [
          bothPriorities,
          fundingFor(SPENDING, 1, 'spending'),
          fundingFor(EMERGENCY_FUND, 1, 'emergency'),
        ],
      }),
    );

    expect(error.code).toBe(RULE_ERROR_CODES.RULE_FUNDING_DUPLICATE_SEQUENCE);
  });
});

describe('inputs this slice refuses rather than guesses at', () => {
  /*
   * A funding requirement for a bucket no emitted stage funds would need the
   * REQUIRED_RECURRING stage, and PFOS-ENG-02 §48 leaves the duplicate
   * destination question open. Dropping it silently would lose money.
   */
  it('refuses a funding requirement that belongs to no emitted stage', () => {
    const orphan: AuthoredRuleVersions = {
      rule: bucketRule('rule-spending-funding', SPENDING),
      versions: [
        configured('rule-spending-funding', 'rule-version-spending-funding', {
          slotKind: 'REQUIRED_FUNDING',
          sequence: 2,
          isProtected: false,
          allowExcessAboveCapacity: false,
          funding: { type: 'FIXED_PER_PAYCHECK', amount: money(10_000) },
        }),
      ],
    };

    const error = rejected(
      request({ rules: [GIVING_RULE, TOP_PRIORITY_RULE, FUNDING_RULE, orphan, LEFTOVER_RULE] }),
    );

    expect(error.code).toBe(RULE_ERROR_CODES.RULE_RESOLUTION_NOT_SUPPORTED);
  });

  /* Two owners competing for one replacing slot kind is unresolved precedence. */
  it('refuses two effective configurations for one replacing slot kind', () => {
    const bucketLeftover: AuthoredRuleVersions = {
      rule: {
        ruleId: asEntityId('rule-leftover-bucket'),
        owner: { ownerType: 'BUCKET', ownerId: SPENDING },
        slotKind: 'LEFTOVER_POLICY',
        status: 'ACTIVE',
      },
      versions: [
        configured('rule-leftover-bucket', 'rule-version-leftover-2', LEFTOVER_CONFIGURATION),
      ],
    };

    const error = rejected(request({ rules: [LEFTOVER_RULE, bucketLeftover] }));

    expect(error.code).toBe(RULE_ERROR_CODES.RULE_RESOLUTION_NOT_SUPPORTED);
  });

  /* Decision 082 confines REQUIRED_FUNDING to bucket owners. */
  it('refuses a funding rule owned by something other than a bucket', () => {
    const globalFunding: AuthoredRuleVersions = {
      rule: globalRule('rule-global-funding', 'REQUIRED_FUNDING'),
      versions: [
        configured('rule-global-funding', 'rule-version-global-funding', FUNDING_CONFIGURATION),
      ],
    };

    expect(rejected(request({ rules: [globalFunding] })).code).toBe(
      RULE_ERROR_CODES.RULE_RESOLUTION_NOT_SUPPORTED,
    );
  });

  /* Decision 084: two active rules must not claim one authored scope. */
  it('refuses two active rules claiming the same authored scope', () => {
    const duplicate: AuthoredRuleVersions = {
      rule: globalRule('rule-leftover-again', 'LEFTOVER_POLICY'),
      versions: [
        configured('rule-leftover-again', 'rule-version-leftover-3', LEFTOVER_CONFIGURATION),
      ],
    };

    expect(rejected(request({ rules: [LEFTOVER_RULE, duplicate] })).code).toBe(
      RULE_ERROR_CODES.RULE_DUPLICATE_AUTHORED_SCOPE,
    );
  });

  /* Decision 076's count limit still applies to an authored set. */
  it('refuses more than three top priorities', () => {
    const tooMany: AuthoredRuleVersions = {
      rule: globalRule('rule-top-priorities', 'TOP_PRIORITIES'),
      versions: [
        configured('rule-top-priorities', 'rule-version-top-priorities-1', {
          slotKind: 'TOP_PRIORITIES',
          strategy: 'SEQUENTIAL',
          entries: [
            { bucketId: GIVING, rank: 1 },
            { bucketId: EMERGENCY_FUND, rank: 2 },
            { bucketId: SPENDING, rank: 3 },
            { bucketId: asEntityId('bucket-travel'), rank: 4 },
          ],
        }),
      ],
    };

    expect(rejected(request({ rules: [tooMany] })).code).toBe(
      RULE_ERROR_CODES.RULE_TOP_PRIORITY_COUNT_ABOVE_MAXIMUM,
    );
  });

  /* §13.3 and §16.4: an authored percentage pool totals exactly 10,000. */
  it('refuses a leftover percentage split that does not total 100%', () => {
    const short: AuthoredRuleVersions = {
      rule: globalRule('rule-leftover', 'LEFTOVER_POLICY'),
      versions: [
        configured('rule-leftover', 'rule-version-leftover-1', {
          slotKind: 'LEFTOVER_POLICY',
          policyType: 'PERCENTAGE_SPLIT',
          destinations: [{ bucketId: SPENDING, shareBasisPoints: rate(7_000) }],
        }),
      ],
    };

    expect(rejected(request({ rules: [short] })).code).toBe(
      RULE_ERROR_CODES.RULE_POOL_NOT_EXACTLY_100_PERCENT,
    );
  });
});
