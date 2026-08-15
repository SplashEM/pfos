import { ERROR_CATEGORIES } from '@domain/shared/errors/error-category';
import { ok, err, type Result } from '@domain/shared/errors/result';
import type { EntityId } from '@domain/shared/ids/entity-id';

import type { ResolvedSlotKind } from '../contracts/resolved-slot-kind';
import type { RuleOwner } from '../contracts/rule-owner';
import type { Rule } from '../contracts/rule';
import { RULE_ERROR_CODES } from '../errors/rule-error-codes';
import { ruleError, type RuleDomainError } from '../errors/rule-error';

/** The three owner types that carry an identifier; GLOBAL is attached to nothing. */
type AttachedOwnerType = Exclude<RuleOwner['ownerType'], 'GLOBAL'>;

/**
 * Validates that no two active rules claim the same authored scope
 * (Decision 084; Decision 082; Decision 083; PFOS-ENG-01 §21.1).
 *
 * An authored scope is a rule's owner together with its slot kind. Decision 082
 * establishes that this pair completely identifies an authored rule's V1 scope,
 * and that for the seven replacing slot kinds a given owner has at most one such
 * setting: §15 states it literally for funding, §13 gives the plan one
 * top-priority plan, §14.3 one authored pool, §16.1 one leftover policy, §17.1
 * one rollover policy per bucket, group and plan, and §5.7 one goal policy. Two
 * rules at one owner and kind therefore claim one setting rather than addressing
 * different subjects.
 *
 * Owner equality is the discriminated comparison Decision 084 fixes. Two owners
 * match when both are `GLOBAL`, neither carrying an `ownerId` because the
 * variant has no such field, or when both carry the same `ownerType` among
 * `INCOME_SOURCE`, `BUCKET` and `GROUP` and the same `ownerId`. Owner types are
 * never compared across each other, so a bucket and a group holding one
 * identifier value are two different scopes.
 *
 * The domain is the ACTIVE rules of the current authored plan (Decision 083).
 * The filter is applied here rather than being required of the caller, so a
 * caller may pass the plan's retained rules and the domain cannot be widened by
 * forgetting to pre-filter. A RETIRED rule is retained history: it never blocks
 * a replacement, and it may legitimately share a scope with the ACTIVE rule that
 * replaced it. Two retired rules at one scope are equally valid, since neither
 * is part of the current plan. This is the one place Decision 083 permits
 * `status` to be read — current authored-plan structure, never date-based
 * resolution.
 *
 * `GLOBAL_OBLIGATION` is exempt at every owner. Decision 080 accepts that
 * separately authored obligations accumulate, and Decision 084 records that the
 * exemption belongs to the kind rather than to the owner.
 *
 * The invariant is structural. It reads no `RuleVersion`, no `effectiveFrom` or
 * `effectiveTo`, no evaluation date, no evaluation context, no precedence and no
 * resolution mode, and it accepts none of them. Decision 082 records why: two
 * rules claiming one authored scope are meaningless whether or not their
 * versions overlap, so effectiveness can neither rescue nor excuse the
 * collision. It is deliberately not the version-history validator beside it,
 * which answers a different question about one rule's versions.
 *
 * `ruleId` is not part of the key and is never read. Two rules carrying
 * different identities collide whenever their scopes match, and no identifier
 * breaks a tie.
 *
 * What it does not check: whether a given owner type may author a given slot
 * kind. Decision 082 confines `REQUIRED_FUNDING` to bucket owners and leaves
 * §5.4's group lower-priority bullet without established V1 meaning, and
 * Decision 084 records that neither is enforced here. Accepting a collection is
 * therefore never a finding that every rule in it is legitimately authored.
 *
 * Identifiers are compared for equality only. Nothing here parses one, derives
 * meaning from its shape, or infers ordering from it (PFOS-ENG-00 §14). Scopes
 * are held in containers keyed by discrete values rather than in a
 * delimiter-joined composite key: §14 fixes no identifier format and §29.1
 * treats imported content as untrusted, so an identifier containing the chosen
 * delimiter could otherwise fabricate or conceal a collision. Decision 084 makes
 * that constraint normative while leaving the representation free.
 *
 * One collision is reported, and collisions are not aggregated. Every existing
 * Rule Engine validator returns a single error, and no accepted contract defines
 * how simultaneous validation failures are ordered or combined; Decision 084
 * follows that convention and introduces no aggregation contract.
 *
 * The error names no entity, as in validateDistinctRuleVersionEffectiveStarts
 * and validateTopPriorityRanks: both rules sharing a scope are equally part of
 * the collision, no accepted source says which is at fault, and populating
 * `affectedEntityIds` would establish the first ordering convention for the
 * error channel without a decision behind it. Its text interpolates nothing, so
 * every rejection is the same value whichever collision was met first, and the
 * returned result cannot depend on the arrangement of the input.
 *
 * The input is read, never sorted or mutated, so no caller's array is disturbed.
 *
 * Grouping is the caller's responsibility. The argument is the rules of one
 * current authored plan; this function reads no plan identifier and cannot tell
 * whether two rules belong to the same plan.
 */
export function validateDistinctAuthoredScopes(
  rules: readonly Rule[],
): Result<void, RuleDomainError> {
  const globalScopes = new Set<ResolvedSlotKind>();
  const attachedScopes = new Map<ResolvedSlotKind, Map<AttachedOwnerType, Set<EntityId>>>();

  for (const rule of rules) {
    if (rule.status !== 'ACTIVE' || rule.slotKind === 'GLOBAL_OBLIGATION') {
      continue;
    }

    if (rule.owner.ownerType === 'GLOBAL') {
      if (globalScopes.has(rule.slotKind)) {
        return err(duplicateAuthoredScope());
      }

      globalScopes.add(rule.slotKind);
      continue;
    }

    const byOwnerType =
      attachedScopes.get(rule.slotKind) ?? new Map<AttachedOwnerType, Set<EntityId>>();
    attachedScopes.set(rule.slotKind, byOwnerType);

    const ownerIds = byOwnerType.get(rule.owner.ownerType) ?? new Set<EntityId>();
    byOwnerType.set(rule.owner.ownerType, ownerIds);

    if (ownerIds.has(rule.owner.ownerId)) {
      return err(duplicateAuthoredScope());
    }

    ownerIds.add(rule.owner.ownerId);
  }

  return ok(undefined);
}

/** The single failure this validator reports; its text interpolates nothing. */
function duplicateAuthoredScope(): RuleDomainError {
  return ruleError({
    code: RULE_ERROR_CODES.RULE_DUPLICATE_AUTHORED_SCOPE,
    category: ERROR_CATEGORIES.VALIDATION,
    summary: 'Each setting can be defined only once for the same owner.',
    details:
      'Two active rules define the same kind of setting for the same owner, so the plan does ' +
      'not say which one governs.',
    suggestedResolution: 'Edit the existing rule instead of adding a second one for this owner.',
  });
}
