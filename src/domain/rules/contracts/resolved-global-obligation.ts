import type { EntityId } from '@domain/shared/ids/entity-id';
import type { Money } from '@domain/shared/money/money';
import type { BasisPoints } from '@domain/shared/percentages/basis-points';

import type { IncomeBasis } from './income-basis';

/**
 * A global obligation as resolved for execution (Decision 074).
 *
 * Separately authored obligations remain independent. They are not collapsed
 * into one N-way percentage split.
 *
 * `incomeBasis` is the selector describing the authored income basis of the
 * obligation.
 *
 * `sequence` is financially meaningful where separately authored obligations
 * must be evaluated in a defined order.
 *
 * Decision 071 supplies the uniform monetary-division and rounding rules. No
 * per-rule rounding field exists.
 */
export interface ResolvedGlobalObligation {
  readonly obligationId: EntityId;
  readonly ruleVersionId: EntityId;
  readonly destinationBucketId: EntityId;
  readonly rateBasisPoints: BasisPoints;
  readonly incomeBasis: IncomeBasis;
  readonly maximumAmount?: Money;
  readonly sequence: number;
}
