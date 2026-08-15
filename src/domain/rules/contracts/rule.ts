import type { ResolvedSlotKind } from './resolved-slot-kind';
import type { RuleId } from './rule-identifiers';
import type { RuleOwner } from './rule-owner';
import type { RuleStatus } from './rule-status';

/**
 * An authored rule: its stable identity, its owner, the kind of resolved
 * structure it contributes to, and whether it belongs to the current plan
 * (Decision 081; Decision 082; Decision 083).
 *
 * A `Rule` is the stable logical rule. It persists across edits, and each edit
 * creates a new `RuleVersion` rather than mutating the historical meaning of the
 * previous one (§18, §19.1, §19.2; Decision 022; Decision 078). `owner` and
 * `slotKind` are stable on the same terms: changing either creates a different
 * logical rule rather than retroactively changing what every historical version
 * governed, which §19.1 forbids.
 *
 * `status` is the one field that is not addressing. It records whether the rule
 * belongs to the user's current authored plan or is retained only as historical
 * and audit state (Decision 083). It carries no date, it is not a
 * version-selection input, and it is not read during resolution: current status
 * is not historical financial truth, so a `RETIRED` rule must not be excluded
 * from resolution for an earlier evaluation date.
 *
 * Decision 083 names the authored-scope uniqueness domain as the one structural
 * use of `status`, but authorising that validator and naming the code it reports
 * belong to a separate decision, so neither exists yet and nothing here reads
 * `status`.
 *
 * These four fields are the whole of the authored rule, and together `owner` and
 * `slotKind` completely identify its V1 authored scope (Decision 082).
 * Everything else is versioned configuration, derived, or not yet decided:
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
 * No dated lifecycle field is added. Decision 083 requires a stop to be a
 * prospective, dated, append-only event in the version timeline, so no
 * `retiredAt`, `stoppedAt` or retirement effective date belongs here — that
 * would be a second dated dimension beside the version period, the hazard
 * Decision 081 rejected for the precedence level. The terminating
 * representation itself is deferred to the `RuleVersion` payload decision, as
 * are `currentVersionId`, `versionNumber`, `supersedesVersionId` and
 * `changeReason`.
 */
export interface Rule {
  readonly ruleId: RuleId;
  readonly owner: RuleOwner;
  readonly slotKind: ResolvedSlotKind;
  readonly status: RuleStatus;
}
