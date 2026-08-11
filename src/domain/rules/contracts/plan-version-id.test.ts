import { describe, expect, it } from 'vitest';

import { asEntityId, type EntityId } from '@domain/shared/ids/entity-id';

import type { PlanVersionId } from './plan-version-id';

const PLAN_VERSION: PlanVersionId = asEntityId('plan-version-1');

describe('PlanVersionId', () => {
  it('carries an entity identifier', () => {
    expect(PLAN_VERSION).toBe('plan-version-1');
  });

  /*
   * Decision 074: PlanVersionId is a semantic provenance alias, semantically
   * distinct but not type-distinct from another EntityId. No second brand is
   * introduced, so assignment runs both ways. The distinction is preserved
   * through field names, construction paths, documentation and tests instead.
   */
  it('is mutually assignable with EntityId', () => {
    const entityId: EntityId = PLAN_VERSION;
    const planVersionId: PlanVersionId = entityId;

    expect(planVersionId).toBe(PLAN_VERSION);
  });
});

/**
 * Never executed; see the equivalent block in ./skipped-rule.test.ts. tsc fails
 * if a directive below is unused, which is what asserts that the line it guards
 * does not compile. Nothing invalid is constructed at run time.
 */
function acceptsPlanVersionId(planVersionId: PlanVersionId): PlanVersionId {
  return planVersionId;
}

const COMPILE_TIME_ONLY: boolean = false;

if (COMPILE_TIME_ONLY) {
  acceptsPlanVersionId(
    // @ts-expect-error - PFOS-ENG-00 §14: an identifier is opaque and branded, never a bare string.
    'plan-version-1',
  );
}
