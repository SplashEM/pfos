import { describe, expect, it } from 'vitest';

import { err, flatMap, isErr, isOk, map, ok, type Result } from './result';

describe('ok', () => {
  it('wraps a value as a success', () => {
    expect(ok(42)).toEqual({ ok: true, value: 42 });
  });

  it('wraps an object value', () => {
    expect(ok({ cents: 100 })).toEqual({ ok: true, value: { cents: 100 } });
  });

  it('wraps a falsy value without treating it as absent', () => {
    expect(ok(0)).toEqual({ ok: true, value: 0 });
  });
});

describe('err', () => {
  it('wraps a value as a failure', () => {
    expect(err('boom')).toEqual({ ok: false, error: 'boom' });
  });

  it('wraps a structured error', () => {
    expect(err({ code: 'BOOM' })).toEqual({ ok: false, error: { code: 'BOOM' } });
  });
});

describe('isOk', () => {
  it('reports true for a success', () => {
    expect(isOk(ok(1))).toBe(true);
  });

  it('reports false for a failure', () => {
    expect(isOk(err('boom'))).toBe(false);
  });

  it('narrows to the success branch', () => {
    const result: Result<number, string> = ok(7);
    if (isOk(result)) {
      expect(result.value).toBe(7);
    } else {
      throw new Error('Expected the guard to narrow to a success.');
    }
  });
});

describe('isErr', () => {
  it('reports true for a failure', () => {
    expect(isErr(err('boom'))).toBe(true);
  });

  it('reports false for a success', () => {
    expect(isErr(ok(1))).toBe(false);
  });

  it('narrows to the failure branch', () => {
    const result: Result<number, string> = err('boom');
    if (isErr(result)) {
      expect(result.error).toBe('boom');
    } else {
      throw new Error('Expected the guard to narrow to a failure.');
    }
  });
});

describe('map', () => {
  it('transforms a success value', () => {
    expect(map(ok(5), (value) => value * 2)).toEqual({ ok: true, value: 10 });
  });

  it('can change the value type', () => {
    expect(map(ok(5), (value) => String(value))).toEqual({ ok: true, value: '5' });
  });

  it('returns the original failure unchanged', () => {
    const failure: Result<number, string> = err('boom');
    expect(map(failure, (value) => value * 2)).toEqual(failure);
  });

  it('does not invoke the transform on a failure', () => {
    let calls = 0;
    const failure: Result<number, string> = err('boom');

    map(failure, (value) => {
      calls += 1;
      return value * 2;
    });

    expect(calls).toBe(0);
  });

  it('invokes the transform exactly once on a success', () => {
    let calls = 0;

    map(ok(5), (value) => {
      calls += 1;
      return value * 2;
    });

    expect(calls).toBe(1);
  });
});

describe('flatMap', () => {
  it('chains a successful operation', () => {
    expect(flatMap(ok(5), (value) => ok(value * 2))).toEqual({ ok: true, value: 10 });
  });

  it('propagates a failure produced by the transform', () => {
    expect(flatMap(ok(5), () => err('rejected'))).toEqual({ ok: false, error: 'rejected' });
  });

  it('returns the original failure unchanged', () => {
    const failure: Result<number, string> = err('boom');
    expect(flatMap(failure, (value) => ok(value * 2))).toEqual(failure);
  });

  it('does not invoke the transform on a failure', () => {
    let calls = 0;
    const failure: Result<number, string> = err('boom');

    flatMap(failure, (value) => {
      calls += 1;
      return ok(value * 2);
    });

    expect(calls).toBe(0);
  });

  it('short-circuits a chain at the first failure', () => {
    let secondCalls = 0;

    const first = flatMap(ok(5), () => err('first failed'));
    const second = flatMap(first, (value: number) => {
      secondCalls += 1;
      return ok(value);
    });

    expect(second).toEqual({ ok: false, error: 'first failed' });
    expect(secondCalls).toBe(0);
  });
});

describe('error genericity', () => {
  it('carries a string error', () => {
    const result: Result<number, string> = err('boom');
    expect(isErr(result)).toBe(true);
  });

  it('carries a structured error', () => {
    const result: Result<number, { readonly code: string }> = err({ code: 'BOOM' });
    if (!isErr(result)) {
      throw new Error('Expected a failure.');
    }
    expect(result.error.code).toBe('BOOM');
  });
});
