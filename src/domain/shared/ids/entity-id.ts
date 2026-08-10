/**
 * An opaque entity identifier (PFOS-ENG-00 §14).
 *
 * Identifiers are stable and meaningless. Domain logic must never parse one,
 * derive information from its shape, or infer ordering from it — §14 requires
 * opacity, and §27 of the Rule Engine specification allows a stable ID only as
 * a final technical tie-breaker, never as a visible financial rule. Display
 * names must never be used as identifiers.
 *
 * The brand exists so a bare string cannot be passed where an identifier is
 * expected. It carries no runtime representation: an EntityId is exactly its
 * underlying string at runtime, which is what lets it round-trip through
 * storage and backups unchanged.
 */
export type EntityId = string & { readonly __brand: 'EntityId' };

/**
 * Marks an already-valid identifier as an EntityId.
 *
 * This is a trusted-boundary cast, not a validator. It accepts an identifier
 * that has already been generated or validated elsewhere — by the IdGenerator
 * at M4, or by the import and restore validation that treats backup content as
 * untrusted (§29.1) — and performs no checking of its own.
 *
 * It therefore never fails and never throws. Milestone 1 deliberately defines
 * no format for an identifier: §14 permits UUIDs, ULIDs or any other
 * collision-resistant scheme, and choosing one here would constrain M4 without
 * cause.
 */
export function asEntityId(value: string): EntityId {
  return value as EntityId;
}
