import { asEntityId } from '@domain/shared/ids/entity-id';
import type { IdGenerator } from '@domain/shared/ids/id-generator';

/**
 * Opaque identifiers from the platform's cryptographic source (PFOS-ENG-00 §14,
 * §4.5).
 *
 * §14 asks for stable opaque identifiers and names UUIDs first. Generating one
 * needs entropy, which is a side effect, so the domain declares the contract and
 * infrastructure supplies it — this is that supplier, and the only place in
 * PFOS that produces an identifier.
 *
 * Nothing about a record can be read from its identifier: no date, no amount, no
 * sequence, no bucket. §14 forbids deriving meaning from one, and a v4 UUID has
 * none to derive.
 */
export function createCryptoIdGenerator(): IdGenerator {
  return {
    next: () => asEntityId(crypto.randomUUID()),
  };
}
