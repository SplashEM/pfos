import type { ResolvedSlotKind } from './resolved-slot-kind';
import type { RuleId } from './rule-identifiers';
import type { RuleOwner } from './rule-owner';

/**
 * An authored rule: its stable identity, its owner, and the kind of resolved
 * structure it contributes to (Decision 081; Decision 082).
 *
 * A `Rule` is the stable logical rule. It persists across edits, and each edit
 * creates a new `RuleVersion` rather than mutating the historical meaning of the
 * previous one (§18, §19.1, §19.2; Decision 022; Decision 078). `owner` and
 * `slotKind` are stable on the same terms: changing either creates a different
 * logical rule rather than retroactively changing what every historical version
 * governed, which §19.1 forbids.
 *
 * These three fields are the whole of the stable authored rule, and together
 * `owner` and `slotKind` completely identify its V1 authored scope
 * (Decision 082). Everything else is versioned configuration, derived, or not
 * yet decided:
 *
 * - a bucket identifier is stable addressing only where it is the rule's owner,
 *   so a top-priority member set, a pool's destinations, shares, ranks, fixed
 *   amounts and eligibility are all `RuleVersion` configuration and no bucket
 *   identifier is added here (Decision 082);
 * - `ruleCategory` is absent: a §5 category can feed more than one resolved slot
 *   kind, so it cannot name the address, and no accepted source maps one to the
 *   other (Decision 080; Decision 081);
 * - `ruleType` is absent: a rule type, policy type or funding type is what an
 *   ordinary edit changes, and Decision 074 already places those in
 *   configuration, so storing one here would force either mutating stable
 *   identity or minting a second rule (Decision 081);
 * - the §6 precedence level is absent because it is derived from the owner;
 *   `precedenceLevelOf` in ./rule-owner is the projection (Decision 081);
 * - the effective period is absent because Decision 078 places it on the
 *   version, so a rule-only reader cannot evaluate applicability.
 *
 * This is a complete authored address, not an exact resolved one. For a
 * group-owned or global-owned scope default the resolved destinations still
 * depend on the evaluation context, which is a property of inheritance under
 * Decision 080 rather than a gap here (Decision 082).
 *
 * No uniqueness invariant is stated or enforced over these fields. Decision 082
 * characterizes the condition but authorises no validator and registers no error
 * code, because `Rule.status` and lifecycle — which determine the set of rules
 * such a check would run over — are undefined and deliberately not introduced
 * here, along with `currentVersionId`, `versionNumber`, `supersedesVersionId`,
 * `changeReason` and the `RuleVersion` configuration payload.
 */
export interface Rule {
  readonly ruleId: RuleId;
  readonly owner: RuleOwner;
  readonly slotKind: ResolvedSlotKind;
}
