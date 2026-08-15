import { describe, expect, it } from 'vitest';

import type { RuleStatus } from './rule-status';

/**
 * The exhaustive list is declared here rather than in the production module.
 * RuleStatus is not a Rule Engine code registry, so it stays a bare union,
 * matching ResolutionMode in ./resolution-mode.ts.
 */
const STATUSES: readonly RuleStatus[] = ['ACTIVE', 'RETIRED'];

/**
 * A Record over the union, which the compiler requires to hold exactly one key
 * per member. A third member would leave a key missing here and a removed member
 * would leave one excess, so comparing its keys to the list above turns that
 * list into a statement about the type rather than about itself.
 */
const EVERY_STATUS: Record<RuleStatus, true> = {
  ACTIVE: true,
  RETIRED: true,
};

describe('RuleStatus', () => {
  it('holds exactly the two members fixed by Decision 083', () => {
    expect(STATUSES).toEqual(['ACTIVE', 'RETIRED']);
    expect([...STATUSES].sort()).toEqual(Object.keys(EVERY_STATUS).sort());
  });

  it('accepts every member', () => {
    for (const member of STATUSES) {
      const status: RuleStatus = member;
      expect(status).toBe(member);
    }
  });
});

/**
 * Never executed; see the equivalent block in ./skipped-rule.test.ts. tsc fails
 * if a directive below is unused, which is what asserts that the line it guards
 * does not compile. Nothing invalid is constructed at run time.
 */
function acceptsStatus(status: RuleStatus): RuleStatus {
  return status;
}

const COMPILE_TIME_ONLY: boolean = false;

if (COMPILE_TIME_ONLY) {
  acceptsStatus(
    /*
     * Decision 083: an undated flag cannot express a stop dated in the future,
     * which §28 and Decision 022 require. Temporary stopping is a dated
     * timeline concept, not a status.
     */
    // @ts-expect-error - not a rule status.
    'DISABLED',
  );

  acceptsStatus(
    // @ts-expect-error - Decision 083: the retained state is RETIRED, and it is terminal.
    'INACTIVE',
  );

  acceptsStatus(
    /*
     * Decision 083: bucket, group and goal archival already carry allocation
     * meaning (Invariant 7; §21.1; RULE_SKIP_DESTINATION_ARCHIVED).
     */
    // @ts-expect-error - not a rule status.
    'ARCHIVED',
  );

  acceptsStatus(
    /*
     * Decision 083: §21 describes validation before activation, not a persisted
     * pre-active rule, so no draft state is introduced.
     */
    // @ts-expect-error - not a rule status.
    'DRAFT',
  );

  acceptsStatus(
    // @ts-expect-error - Decision 083: a member is spelled exactly as fixed.
    'active',
  );
}
