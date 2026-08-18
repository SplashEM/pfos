import type { EntityId } from '@domain/shared/ids/entity-id';
import type { Money } from '@domain/shared/money/money';

import type { RuleVersionId } from './rule-identifiers';

/**
 * Where a resolved rollover policy's value came from (Decision 094).
 *
 * Decision 093 established the general semantic: whenever a resolved entry can
 * legitimately be produced either by an authored `RuleVersion` or by a product
 * default, its provenance is expressed through two explicit, mutually exclusive
 * states rather than through an absent identifier. Rollover is the one family
 * whose antecedent is satisfied today, because Decision 028 and PFOS-ENG-01
 * §17.1 make `CARRY_ALL` the product default and Decision 081 records that most
 * buckets author no rollover rule at all.
 *
 * The two states are what makes that representable. `AUTHORED` carries the
 * exact version that produced the value, which §19.1 requires to remain
 * reconstructable for a version used in a confirmed allocation.
 * `PRODUCT_DEFAULT` carries its discriminant and nothing else: Decision 093
 * forbids a sentinel, a fabricated identifier, or a manufactured implicit
 * `Rule` or `RuleVersion` standing in for a default, and absence alone is never
 * overloaded to mean product-default provenance.
 *
 * No `ruleId` joins the authored arm, and Decision 094 closes that question
 * rather than deferring it. Decision 091 gave `ResolvedGlobalObligation` a
 * second identity because it is the only executable resolved family with no
 * natural key; rollover is keyed by `bucketId`, so the condition that justified
 * the redundancy is absent here.
 *
 * The type is rollover-local by decision, not by accident. Decision 093 applies
 * the persisted consequence to this family alone — required funding receives no
 * product default, and a default-sourced goal policy is not established to
 * exist — so no shared `ResolvedRuleProvenance` is introduced for one adopter.
 * If a second family legitimately adopts the semantic, this type can move and
 * be renamed with no change to persisted JSON, provided `kind` and the two
 * literals are preserved.
 */
export type RolloverPolicyProvenance =
  | {
      readonly kind: 'AUTHORED';
      readonly ruleVersionId: RuleVersionId;
    }
  | {
      readonly kind: 'PRODUCT_DEFAULT';
    };

/**
 * A bucket's rollover policy as resolved for execution (Decision 074;
 * Decision 094).
 *
 * The entry answers three questions and each member answers exactly one:
 * `bucketId` which bucket, `policy` what rollover behaviour applies, and
 * `provenance` where that resolved value came from.
 *
 * `policy` and `provenance` are independent dimensions, which is why they are
 * composed rather than multiplied. Nothing in accepted authority ties a
 * provenance state to a policy variant, so multiplying five policy arms by two
 * provenance states would restate `bucketId` and every policy field ten times
 * and dissolve `RolloverPolicyConfig` into the envelope.
 *
 * `provenance` replaced a required top-level `ruleVersionId` at
 * `schemaVersion` 3 (Decision 095). The old member could not truthfully
 * describe an entry the product default supplied, because no genuine
 * `RuleVersion` exists for such a value — a defect in the accepted contract for
 * what Decision 081 describes as most buckets.
 */
export interface ResolvedRolloverPolicy {
  readonly bucketId: EntityId;
  readonly provenance: RolloverPolicyProvenance;
  readonly policy: RolloverPolicyConfig;
}

/**
 * The authored rollover configuration carried by a resolved rollover policy
 * (Decision 074).
 *
 * `capAmount` is the authored cap the rule itself stores. Decision 074 permits
 * only authored monetary requirements in the resolved rule set: the carried,
 * reset and excess amounts are calculated by M3, not represented here.
 */
export type RolloverPolicyConfig =
  | {
      readonly policyType: 'CARRY_ALL';
    }
  | {
      readonly policyType: 'RESET';
    }
  | {
      readonly policyType: 'CARRY_TO_CAP';
      readonly capAmount: Money;
    }
  | {
      readonly policyType: 'REDIRECT_EXCESS';
      readonly capAmount: Money;
      readonly destinationBucketId: EntityId;
    }
  | {
      readonly policyType: 'APPLY_LEFTOVER_POLICY';
      readonly capAmount: Money;
    };
