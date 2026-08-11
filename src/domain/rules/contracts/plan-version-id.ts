import type { EntityId } from '@domain/shared/ids/entity-id';

/**
 * The version of the user's plan configuration from which a resolved rule set
 * was produced (Decision 074).
 *
 * `PlanVersionId` is a semantic provenance alias for V1. No second branded
 * identifier type is introduced, so it is semantically distinct but not
 * type-distinct from another EntityId. Decision 074 requires the distinction to
 * be preserved through field names, construction paths, documentation and
 * tests rather than through a second identifier brand.
 *
 * It is not `resolvedRuleSetId`, a Plan Snapshot identifier, or
 * `historicalSnapshotId`.
 */
export type PlanVersionId = EntityId;
