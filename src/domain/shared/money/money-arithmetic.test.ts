import { money } from '@test/builders/money';
import { describe, expect, it } from 'vitest';

import type { DomainError } from '../errors/domain-error';
import { ERROR_CODES } from '../errors/error-codes';
import type { Result } from '../errors/result';
import { abs, add, compare, max, min, negate, subtract, sum } from './money-arithmetic';
import type { Money } from './money';

/** Unwraps a success, failing loudly if the operation was rejected. */
function valueOf<T>(result: Result<T, DomainError>): T {
  if (!result.ok) {
    throw new Error(`Expected success, received ${result.error.code}.`);
  }
  return result.value;
}

/** Unwraps a rejection, failing loudly if the operation unexpectedly succeeded. */
function codeOf(result: Result<unknown, DomainError>): string {
  if (result.ok) {
    throw new Error('Expected a rejection, but the operation succeeded.');
  }
  return result.error.code;
}

/**
 * Fabricates an amount in another currency.
 *
 * Version 1 is USD-only, so the mismatch guards cannot be reached through the
 * type system. This cast exists purely to exercise them, keeping the branches
 * live for the day a second currency is added (PFOS-01 §54). Production code
 * must never construct Money this way.
 */
function foreignMoney(cents: number): Money {
  return { cents, currency: 'EUR' } as unknown as Money;
}

describe('add', () => {
  it('adds two positive amounts', () => {
    expect(valueOf(add(money(150), money(275))).cents).toBe(425);
  });

  it('adds a negative amount', () => {
    expect(valueOf(add(money(500), money(-200))).cents).toBe(300);
  });

  it('can produce a negative result', () => {
    expect(valueOf(add(money(100), money(-300))).cents).toBe(-200);
  });

  it('rejects a total beyond the safe range', () => {
    expect(codeOf(add(money(Number.MAX_SAFE_INTEGER), money(1)))).toBe(
      ERROR_CODES.MONEY_UNSAFE_INTEGER,
    );
  });

  it('rejects a currency mismatch', () => {
    expect(codeOf(add(money(100), foreignMoney(100)))).toBe(ERROR_CODES.MONEY_CURRENCY_MISMATCH);
  });
});

describe('subtract', () => {
  it('subtracts a smaller amount', () => {
    expect(valueOf(subtract(money(500), money(200))).cents).toBe(300);
  });

  it('produces a negative result when subtracting a larger amount', () => {
    expect(valueOf(subtract(money(200), money(500))).cents).toBe(-300);
  });

  it('rejects a result beyond the safe range', () => {
    expect(codeOf(subtract(money(-Number.MAX_SAFE_INTEGER), money(1)))).toBe(
      ERROR_CODES.MONEY_UNSAFE_INTEGER,
    );
  });

  it('rejects a currency mismatch', () => {
    expect(codeOf(subtract(money(100), foreignMoney(100)))).toBe(
      ERROR_CODES.MONEY_CURRENCY_MISMATCH,
    );
  });
});

describe('compare', () => {
  it('reports -1 when the first amount is smaller', () => {
    expect(valueOf(compare(money(100), money(200)))).toBe(-1);
  });

  it('reports 0 when the amounts are equal', () => {
    expect(valueOf(compare(money(200), money(200)))).toBe(0);
  });

  it('reports 1 when the first amount is larger', () => {
    expect(valueOf(compare(money(300), money(200)))).toBe(1);
  });

  it('orders negative amounts below zero', () => {
    expect(valueOf(compare(money(-100), money(0)))).toBe(-1);
  });

  it('rejects a currency mismatch', () => {
    expect(codeOf(compare(money(100), foreignMoney(100)))).toBe(
      ERROR_CODES.MONEY_CURRENCY_MISMATCH,
    );
  });
});

describe('min', () => {
  it('returns the smaller amount', () => {
    expect(valueOf(min(money(300), money(100))).cents).toBe(100);
  });

  it('returns the first amount when both are equal', () => {
    const first = money(200);
    expect(valueOf(min(first, money(200)))).toBe(first);
  });

  it('handles negative amounts', () => {
    expect(valueOf(min(money(-300), money(100))).cents).toBe(-300);
  });

  it('rejects a currency mismatch', () => {
    expect(codeOf(min(money(100), foreignMoney(100)))).toBe(ERROR_CODES.MONEY_CURRENCY_MISMATCH);
  });
});

describe('max', () => {
  it('returns the larger amount', () => {
    expect(valueOf(max(money(300), money(100))).cents).toBe(300);
  });

  it('returns the first amount when both are equal', () => {
    const first = money(200);
    expect(valueOf(max(first, money(200)))).toBe(first);
  });

  it('handles negative amounts', () => {
    expect(valueOf(max(money(-300), money(-100))).cents).toBe(-100);
  });

  it('rejects a currency mismatch', () => {
    expect(codeOf(max(money(100), foreignMoney(100)))).toBe(ERROR_CODES.MONEY_CURRENCY_MISMATCH);
  });
});

describe('sum', () => {
  it('returns zero for an empty list', () => {
    expect(valueOf(sum([], 'USD'))).toEqual({ cents: 0, currency: 'USD' });
  });

  it('returns the single value of a one-element list', () => {
    expect(valueOf(sum([money(750)], 'USD')).cents).toBe(750);
  });

  it('adds several amounts', () => {
    expect(valueOf(sum([money(100), money(200), money(300)], 'USD')).cents).toBe(600);
  });

  it('handles mixed signs', () => {
    expect(valueOf(sum([money(500), money(-200), money(-100)], 'USD')).cents).toBe(200);
  });

  it('rejects an element in another currency', () => {
    expect(codeOf(sum([money(100), foreignMoney(100)], 'USD'))).toBe(
      ERROR_CODES.MONEY_CURRENCY_MISMATCH,
    );
  });

  it('rejects a running total that leaves the safe range', () => {
    expect(codeOf(sum([money(Number.MAX_SAFE_INTEGER), money(1)], 'USD'))).toBe(
      ERROR_CODES.MONEY_UNSAFE_INTEGER,
    );
  });
});

describe('negate', () => {
  it('turns a positive amount negative', () => {
    expect(negate(money(500)).cents).toBe(-500);
  });

  it('turns a negative amount positive', () => {
    expect(negate(money(-500)).cents).toBe(500);
  });

  it('leaves zero as positive zero rather than negative zero', () => {
    expect(Object.is(negate(money(0)).cents, 0)).toBe(true);
  });

  it('preserves the currency', () => {
    expect(negate(money(500)).currency).toBe('USD');
  });

  it('freezes the result', () => {
    expect(Object.isFrozen(negate(money(500)))).toBe(true);
  });
});

describe('abs', () => {
  it('makes a negative amount positive', () => {
    expect(abs(money(-500)).cents).toBe(500);
  });

  it('leaves a positive amount unchanged', () => {
    expect(abs(money(500)).cents).toBe(500);
  });

  it('leaves zero at zero', () => {
    expect(abs(money(0)).cents).toBe(0);
  });

  it('preserves the currency', () => {
    expect(abs(money(-500)).currency).toBe('USD');
  });

  it('freezes the result', () => {
    expect(Object.isFrozen(abs(money(-500)))).toBe(true);
  });
});
