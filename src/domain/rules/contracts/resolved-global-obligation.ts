import type { EntityId } from '@domain/shared/ids/entity-id';
import type { Money } from '@domain/shared/money/money';
import type { BasisPoints } from '@domain/shared/percentages/basis-points';

import type { IncomeBasis } from './income-basis';
import type { RuleId, RuleVersionId } from './rule-identifiers';

/**
 * A global obligation as resolved for execution (Decision 074).
 *
 * Separately authored obligations remain independent. They are not collapsed
 * into one N-way percentage split.
 *
 * Two distinct provenance identities are carried (Decision 091). `ruleId` is the
 * stable authored `Rule`, which outlives every version it has had, so two
 * snapshots taken either side of a rate edit name the same logical obligation.
 * `ruleVersionId` is the exact version selected for the evaluation date, which
 * is what supplied this obligation's rate, basis, destination and cap. Neither
 * derives from the other inside the resolved contract.
 *
 * One selected `GLOBAL_OBLIGATION` rule version contributes at most one resolved
 * obligation, and exactly one where it contributes (Decision 091). Multiplicity
 * in `globalObligations` comes from several coexisting rules, never from one
 * version. Neither identifier acquires financial meaning here: Decision 089
 * settles that applicable obligations are independent with none financially
 * prior to another.
 *
 * `incomeBasis` is the selector describing the authored income basis of the
 * obligation.
 *
 * There is no ordering member. Decision 089 established that a resolved global
 * obligation carries no financial execution order in V1, and Decision 090
 * removed the field rather than retain an ordinal duplicating array position.
 * The reproducibility-only canonical ordering of `globalObligations` is still
 * required and still unresolved; it belongs to the array, not to a member here.
 *
 * Decision 071 supplies the uniform monetary-division and rounding rules. No
 * per-rule rounding field exists.
 */
export interface ResolvedGlobalObligation {
  readonly ruleId: RuleId;
  readonly ruleVersionId: RuleVersionId;
  readonly destinationBucketId: EntityId;
  readonly rateBasisPoints: BasisPoints;
  readonly incomeBasis: IncomeBasis;
  readonly maximumAmount?: Money;
}
