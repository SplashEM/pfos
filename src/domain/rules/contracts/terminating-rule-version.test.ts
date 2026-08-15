import { describe, expect, it } from 'vitest';

import { financialDate, type FinancialDate } from '@domain/shared/dates/financial-date';
import { asEntityId } from '@domain/shared/ids/entity-id';

import { selectRuleVersionEffectiveOn } from '../services/rule-version-selection';
import type { RuleVersionEffectivePeriodLike } from '../validation/rule-version-effective-starts';
import type { TerminatingRuleVersion } from './terminating-rule-version';

/** Builds a date, failing loudly if the test supplied an invalid one. */
function date(year: number, month: number, day: number): FinancialDate {
  const result = financialDate(year, month, day);
  if (!result.ok) {
    throw new Error(`Invalid date in test setup: ${result.error.code}`);
  }
  return result.value;
}

/** Decision 085's worked timeline: the June stop of a rule configured in January. */
const JUNE_STOP: TerminatingRuleVersion = {
  kind: 'TERMINATING',
  ruleVersionId: asEntityId('rule-version-2'),
  ruleId: asEntityId('rule-1'),
  period: { effectiveFrom: date(2026, 6, 1) },
};

/**
 * The predecessor is a bare `RuleVersionEffectivePeriodLike`, not a configured
 * version. Decision 085 fixes only the terminating arm, so no configured arm
 * exists to build one from, and the shipped shape is all selection reads.
 */
const JANUARY_PREDECESSOR: RuleVersionEffectivePeriodLike = {
  ruleVersionId: asEntityId('rule-version-1'),
  period: { effectiveFrom: date(2026, 1, 1) },
};

/** Unwraps a successful selection, failing loudly if it was rejected. */
function selected<T extends RuleVersionEffectivePeriodLike>(
  versions: readonly T[],
  evaluationDate: FinancialDate,
): T | undefined {
  const result = selectRuleVersionEffectiveOn(versions, evaluationDate);
  if (!result.ok) {
    throw new Error(`Expected a selection, but it failed with ${result.error.code}.`);
  }
  return result.value;
}

describe('TerminatingRuleVersion', () => {
  it('carries exactly the four fields fixed by Decision 085', () => {
    expect(Object.keys(JUNE_STOP)).toEqual(['kind', 'ruleVersionId', 'ruleId', 'period']);
  });

  /*
   * The Record is over `keyof TerminatingRuleVersion`, which the compiler
   * requires to hold exactly one key per field: a fifth field would leave a key
   * missing here and a removed one would leave a key excess. This states the
   * shape of the type rather than of the value above, without inspecting source
   * text.
   */
  it('names no field beyond those four in its type', () => {
    const fields: Record<keyof TerminatingRuleVersion, true> = {
      kind: true,
      ruleVersionId: true,
      ruleId: true,
      period: true,
    };
    expect(Object.keys(fields).sort()).toEqual(['kind', 'period', 'ruleId', 'ruleVersionId']);
  });

  /*
   * Decision 085: the period is narrowed to a start alone, so a bounded stop is
   * unrepresentable. The compile-time block below holds the rejection; this
   * records that a stop's period holds exactly one field.
   */
  it('carries a start and nothing else in its period', () => {
    const fields: Record<keyof TerminatingRuleVersion['period'], true> = { effectiveFrom: true };

    expect(Object.keys(JUNE_STOP.period)).toEqual(['effectiveFrom']);
    expect(Object.keys(fields)).toEqual(['effectiveFrom']);
  });

  /*
   * Decision 085: `kind` is the discriminant of a future union, and only this
   * literal is fixed. It is a literal type, not a widened string, which is what
   * lets a future union narrow on it.
   */
  it('discriminates on the TERMINATING literal', () => {
    const kind: 'TERMINATING' = JUNE_STOP.kind;

    expect(kind).toBe('TERMINATING');
  });

  /*
   * Decision 085: the period field is named `period`, matching the shipped
   * `RuleVersionEffectivePeriodLike`, whose documentation records that a future
   * `RuleVersion` will satisfy it structurally without either type changing.
   * This assignment is that promise, discharged by the compiler.
   */
  it('satisfies RuleVersionEffectivePeriodLike structurally', () => {
    const asPeriodLike: RuleVersionEffectivePeriodLike = JUNE_STOP;

    expect(asPeriodLike.ruleVersionId).toBe('rule-version-2');
    expect(asPeriodLike.period.effectiveFrom).toEqual(date(2026, 6, 1));
    expect(asPeriodLike.period.effectiveTo).toBeUndefined();
  });

  /*
   * Decision 085: `selectRuleVersionEffectiveOn` is generic over that shape and
   * returns the caller's own object, so a terminating version flows through
   * Decision 079 selection unchanged — including its `kind`, which selection
   * neither defines nor reads.
   */
  it('is returned by the selector as itself, not as a projection', () => {
    const result = selected([JUNE_STOP], date(2026, 6, 1));

    expect(result).toBe(JUNE_STOP);
    expect(result?.kind).toBe('TERMINATING');
  });

  it('is not effective before its start', () => {
    expect(selected([JUNE_STOP], date(2026, 5, 31))).toBeUndefined();
  });

  /*
   * Decision 078: both boundaries are inclusive, so a stop dated June 1 is in
   * force on June 1 itself.
   */
  it('is effective on its start', () => {
    expect(selected([JUNE_STOP], date(2026, 6, 1))).toBe(JUNE_STOP);
  });

  /*
   * Decision 085: a stop carries no `effectiveTo`, so it never elapses and an
   * older open-ended version can never be selected again behind it.
   */
  it('remains effective indefinitely after its start', () => {
    expect(selected([JUNE_STOP], date(2036, 12, 31))).toBe(JUNE_STOP);
  });

  /*
   * Decision 085's worked timeline. Decision 079 is unchanged: before the stop
   * date the predecessor is the only effective candidate, and from the stop date
   * onward both are effective and the later start wins.
   */
  it('takes over from an open-ended predecessor on the stop date', () => {
    const timeline: readonly RuleVersionEffectivePeriodLike[] = [JANUARY_PREDECESSOR, JUNE_STOP];

    expect(selected(timeline, date(2026, 5, 31))).toBe(JANUARY_PREDECESSOR);
    expect(selected(timeline, date(2026, 6, 1))).toBe(JUNE_STOP);
    expect(selected(timeline, date(2026, 8, 31))).toBe(JUNE_STOP);
  });

  /*
   * Decision 085: several terminating versions may occur over one rule's
   * lifetime, and a stop is an event in one rule's timeline, so it names the
   * rule it stops with that rule's stable identity.
   */
  it('names the stable rule its timeline belongs to', () => {
    const laterStop: TerminatingRuleVersion = {
      kind: 'TERMINATING',
      ruleVersionId: asEntityId('rule-version-4'),
      ruleId: asEntityId('rule-1'),
      period: { effectiveFrom: date(2026, 12, 1) },
    };

    expect(laterStop.ruleId).toBe(JUNE_STOP.ruleId);
    expect(laterStop.ruleVersionId).not.toBe(JUNE_STOP.ruleVersionId);
  });
});

/**
 * Never executed; see the equivalent block in ./rule.test.ts. tsc fails if a
 * directive below is unused, which is what asserts that the line it guards does
 * not compile. Nothing invalid is constructed at run time.
 */
function acceptsStop(version: TerminatingRuleVersion): TerminatingRuleVersion {
  return version;
}

const COMPILE_TIME_ONLY: boolean = false;

if (COMPILE_TIME_ONLY) {
  acceptsStop(
    // @ts-expect-error - Decision 085: a stop is an explicit discriminated variant.
    {
      ruleVersionId: asEntityId('rule-version-2'),
      ruleId: asEntityId('rule-1'),
      period: { effectiveFrom: date(2026, 6, 1) },
    },
  );

  acceptsStop({
    // @ts-expect-error - Decision 085: only the TERMINATING literal is fixed by this contract.
    kind: 'CONFIGURED',
    ruleVersionId: asEntityId('rule-version-2'),
    ruleId: asEntityId('rule-1'),
    period: { effectiveFrom: date(2026, 6, 1) },
  });

  acceptsStop({
    // @ts-expect-error - Decision 085: the discriminant is spelled exactly as fixed.
    kind: 'terminating',
    ruleVersionId: asEntityId('rule-version-2'),
    ruleId: asEntityId('rule-1'),
    period: { effectiveFrom: date(2026, 6, 1) },
  });

  acceptsStop(
    // @ts-expect-error - Decision 078: a version carries its own identity.
    {
      kind: 'TERMINATING',
      ruleId: asEntityId('rule-1'),
      period: { effectiveFrom: date(2026, 6, 1) },
    },
  );

  acceptsStop(
    // @ts-expect-error - Decision 085: a stop is an event in one rule's timeline and names that rule.
    {
      kind: 'TERMINATING',
      ruleVersionId: asEntityId('rule-version-2'),
      period: { effectiveFrom: date(2026, 6, 1) },
    },
  );

  acceptsStop(
    // @ts-expect-error - Decision 083: a stop is dated, so its period is required.
    {
      kind: 'TERMINATING',
      ruleVersionId: asEntityId('rule-version-2'),
      ruleId: asEntityId('rule-1'),
    },
  );

  acceptsStop({
    kind: 'TERMINATING',
    ruleVersionId: asEntityId('rule-version-2'),
    ruleId: asEntityId('rule-1'),
    // @ts-expect-error - Decision 083: a stop carries a date, never an undated flag.
    period: {},
  });

  acceptsStop({
    ...JUNE_STOP,
    period: {
      effectiveFrom: date(2026, 6, 1),
      /*
       * Decision 085: a bounded stop would drop out of `isEffectiveOn` when its
       * bound elapsed, so an older open-ended configured version would be
       * selected again and stopped terms would resume with no authored act.
       */
      // @ts-expect-error - Decision 085: a stop is open-ended and carries no end.
      effectiveTo: date(2026, 8, 31),
    },
  });

  acceptsStop({
    ...JUNE_STOP,
    /*
     * Decision 085: the field name is fixed by shipped code, which
     * `RuleVersionEffectivePeriodLike` reads as `period`.
     */
    // @ts-expect-error - Decision 085: the field is `period`, not `effectivePeriod`.
    effectivePeriod: { effectiveFrom: date(2026, 6, 1) },
  });

  acceptsStop({
    ...JUNE_STOP,
    /*
     * Decision 085: a terminating version carries no configuration field at all,
     * so a stop holding financial configuration is unrepresentable rather than
     * merely invalid.
     */
    // @ts-expect-error - Decision 085: a stop carries no configuration.
    configuration: {},
  });

  acceptsStop({
    ...JUNE_STOP,
    // @ts-expect-error - Decision 085: the configured payload and its union arm remain deferred.
    configurationKind: 'FIXED_MONTHLY',
  });

  acceptsStop({
    ...JUNE_STOP,
    /*
     * Decision 085: an `enabled` flag requires the deferred payload, and reading
     * silence as an instruction is the §29.1 untrusted-import hazard.
     */
    // @ts-expect-error - Decision 085: enablement is not how a rule is stopped.
    enabled: false,
  });

  acceptsStop({
    ...JUNE_STOP,
    /*
     * Decision 085: an independent boolean permits a version that carries a live
     * configuration alongside its own stop — two fields that can disagree.
     */
    // @ts-expect-error - Decision 085: the stop is the variant, not a flag on a version.
    terminatesRule: true,
  });

  acceptsStop({
    ...JUNE_STOP,
    /*
     * Decision 083: a status carries no date and belongs to the Rule. A stopped
     * rule stays ACTIVE, so a status here would be a second lifecycle dimension.
     */
    // @ts-expect-error - Decision 083: lifecycle status belongs to the Rule, not to a version.
    status: 'RETIRED',
  });

  acceptsStop({
    // @ts-expect-error - PFOS-ENG-00 §14: an identifier is opaque and branded, never a bare string.
    ruleVersionId: 'rule-version-2',
    kind: 'TERMINATING',
    ruleId: asEntityId('rule-1'),
    period: { effectiveFrom: date(2026, 6, 1) },
  });

  /*
   * Compatibility runs one way only. A terminating version satisfies the shipped
   * selection shape, but that shape is not a terminating version: it names no
   * discriminant and no rule.
   */
  const periodLike: RuleVersionEffectivePeriodLike = JUNE_STOP;

  // @ts-expect-error - Decision 085: the shipped selection shape is not itself a stop.
  acceptsStop(periodLike);

  const stop: TerminatingRuleVersion = { ...JUNE_STOP };

  // @ts-expect-error - Decision 083: a stop is append-only and non-mutating; the variant is fixed.
  stop.kind = 'TERMINATING';

  // @ts-expect-error - PFOS-ENG-00 §14: a version's identity is stable.
  stop.ruleVersionId = asEntityId('rule-version-3');

  // @ts-expect-error - Decision 085: a stop belongs to one rule's timeline for good.
  stop.ruleId = asEntityId('rule-2');

  // @ts-expect-error - Decision 083: a stop's date is not re-dated in place; a later version is appended.
  stop.period = { effectiveFrom: date(2026, 7, 1) };

  // @ts-expect-error - Decision 083: the start is readonly, so history is not rewritten through it.
  stop.period.effectiveFrom = date(2026, 7, 1);
}
