import type { EntityId } from './entity-id';

/**
 * Injectable identifier generation (PFOS-ENG-00 §14, §4.5).
 *
 * Generating an identifier is a side effect: it requires entropy, which is
 * nondeterministic by definition. PFOS-00 Principle 18 requires financial
 * engines to be deterministic, and the domain lint rules block `Math.random()`
 * from this layer outright, so the domain declares the contract and never
 * implements it.
 *
 * A generator is supplied by infrastructure (§4.5 lists ID generation among
 * its responsibilities) and arrives with Milestone 4. Tests and previews may
 * supply a deterministic sequence instead: PFOS-ENG-02 §67 explicitly allows
 * preview component IDs to be deterministic or supplied by the application
 * layer.
 *
 * This interface is a contract only.
 */
export interface IdGenerator {
  readonly next: () => EntityId;
}
