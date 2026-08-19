import { afterEach, describe, expect, it } from 'vitest';

import { DEFAULT_PAYCHECK_PLAN, type EditablePaycheckPlan } from './paycheck-plan';
import {
  clearEditablePaycheckPlan,
  loadEditablePaycheckPlan,
  saveEditablePaycheckPlan,
  PAYCHECK_PLAN_SETTINGS_VERSION,
  PAYCHECK_PLAN_STORAGE_KEY,
} from './paycheck-plan-storage';

const EDITED: EditablePaycheckPlan = {
  givingPercent: '12',
  emergencyFundPerPaycheck: '600',
  leftoverLabel: 'Everyday spending',
};

/** Writes a raw string to the slot, bypassing the save path. */
function writeRaw(raw: string): void {
  localStorage.setItem(PAYCHECK_PLAN_STORAGE_KEY, raw);
}

afterEach(() => {
  localStorage.clear();
});

describe('loading saved preview settings', () => {
  it('uses the default plan when nothing is stored', () => {
    expect(loadEditablePaycheckPlan()).toEqual(DEFAULT_PAYCHECK_PLAN);
  });

  it('returns a saved plan exactly as it was written', () => {
    saveEditablePaycheckPlan(EDITED);

    expect(loadEditablePaycheckPlan()).toEqual(EDITED);
  });

  it('falls back to the defaults when the stored value is not JSON', () => {
    writeRaw('{ this is not json');

    expect(loadEditablePaycheckPlan()).toEqual(DEFAULT_PAYCHECK_PLAN);
  });

  it('falls back to the defaults when the stored value is not an object', () => {
    writeRaw('"just a string"');

    expect(loadEditablePaycheckPlan()).toEqual(DEFAULT_PAYCHECK_PLAN);
  });

  it('falls back to the defaults when the version does not match', () => {
    writeRaw(
      JSON.stringify({
        schemaVersion: PAYCHECK_PLAN_SETTINGS_VERSION + 1,
        ...EDITED,
      }),
    );

    expect(loadEditablePaycheckPlan()).toEqual(DEFAULT_PAYCHECK_PLAN);
  });

  it('falls back to the defaults when the version is absent', () => {
    writeRaw(JSON.stringify(EDITED));

    expect(loadEditablePaycheckPlan()).toEqual(DEFAULT_PAYCHECK_PLAN);
  });

  /*
   * Whole-record validity. A partly restored plan would mix values a person
   * chose with values they did not, and nothing on screen would say which was
   * which, so one missing field discards all of them.
   */
  it('falls back to the defaults when a field is missing', () => {
    writeRaw(
      JSON.stringify({
        schemaVersion: PAYCHECK_PLAN_SETTINGS_VERSION,
        givingPercent: '12',
        leftoverLabel: 'Everyday spending',
      }),
    );

    expect(loadEditablePaycheckPlan()).toEqual(DEFAULT_PAYCHECK_PLAN);
  });

  it('falls back to the defaults when a field is not text', () => {
    writeRaw(
      JSON.stringify({
        schemaVersion: PAYCHECK_PLAN_SETTINGS_VERSION,
        givingPercent: 12,
        emergencyFundPerPaycheck: '600',
        leftoverLabel: 'Everyday spending',
      }),
    );

    expect(loadEditablePaycheckPlan()).toEqual(DEFAULT_PAYCHECK_PLAN);
  });

  /*
   * Loading never judges whether a value is financially usable. A stored
   * percentage of 150 is restored and explained when Preview is pressed, by the
   * same domain check a freshly typed 150 meets.
   */
  it('restores values without judging whether they are usable', () => {
    const unusable: EditablePaycheckPlan = {
      givingPercent: '150',
      emergencyFundPerPaycheck: '-5',
      leftoverLabel: 'Somewhere',
    };

    saveEditablePaycheckPlan(unusable);

    expect(loadEditablePaycheckPlan()).toEqual(unusable);
  });
});

describe('saving preview settings', () => {
  it('writes an application-owned record carrying its own version', () => {
    saveEditablePaycheckPlan(EDITED);

    const raw = localStorage.getItem(PAYCHECK_PLAN_STORAGE_KEY);
    expect(raw).not.toBeNull();

    expect(JSON.parse(raw ?? '')).toEqual({
      schemaVersion: PAYCHECK_PLAN_SETTINGS_VERSION,
      givingPercent: '12',
      emergencyFundPerPaycheck: '600',
      leftoverLabel: 'Everyday spending',
    });
  });

  /* Nothing resolved, allocated or confirmed may reach this slot. */
  it('writes exactly four fields and nothing financial', () => {
    saveEditablePaycheckPlan(EDITED);

    const raw = localStorage.getItem(PAYCHECK_PLAN_STORAGE_KEY) ?? '';
    const stored: unknown = JSON.parse(raw);

    expect(Object.keys(stored as Record<string, unknown>).sort()).toEqual([
      'emergencyFundPerPaycheck',
      'givingPercent',
      'leftoverLabel',
      'schemaVersion',
    ]);
    expect(raw).not.toContain('resolvedRuleSet');
    expect(raw).not.toContain('bucketId');
    expect(raw).not.toContain('ruleVersionId');
    expect(raw).not.toContain('cents');
  });

  it('replaces the previous settings rather than accumulating them', () => {
    saveEditablePaycheckPlan(EDITED);
    saveEditablePaycheckPlan(DEFAULT_PAYCHECK_PLAN);

    expect(loadEditablePaycheckPlan()).toEqual(DEFAULT_PAYCHECK_PLAN);
    expect(localStorage.length).toBe(1);
  });

  it('uses one namespaced key', () => {
    saveEditablePaycheckPlan(EDITED);

    expect(localStorage.key(0)).toBe('pfos.preview-plan');
  });
});

describe('clearing preview settings', () => {
  it('returns to the defaults', () => {
    saveEditablePaycheckPlan(EDITED);
    clearEditablePaycheckPlan();

    expect(loadEditablePaycheckPlan()).toEqual(DEFAULT_PAYCHECK_PLAN);
  });

  it('is harmless when nothing was saved', () => {
    expect(() => {
      clearEditablePaycheckPlan();
    }).not.toThrow();
  });
});
