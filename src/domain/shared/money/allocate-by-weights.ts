import { domainError, type DomainError } from '../errors/domain-error';
import { ERROR_CATEGORIES } from '../errors/error-category';
import { ERROR_CODES, type ErrorCode } from '../errors/error-codes';
import { err, ok, type Result } from '../errors/result';
import type { Money } from './money';

function divisionError(code: ErrorCode, summary: string, details: string): DomainError {
  return domainError({
    code,
    category: ERROR_CATEGORIES.VALIDATION,
    summary,
    details,
  });
}

/**
 * Sums the weights exactly.
 *
 * BigInt is used so the summation itself cannot lose precision. An oversized
 * sum is not a validation rule of its own: it is caught by the product guard
 * below, or is harmless when the total is zero.
 */
function totalWeight(weights: readonly number[]): bigint {
  let total = 0n;
  for (const weight of weights) {
    total += BigInt(weight);
  }
  return total;
}

/**
 * The single monetary division primitive (Decision 071; PFOS-ENG-00 §12).
 *
 * The denominator is the sum of the supplied weights. Every other division in
 * PFOS is a special case of this one function:
 *
 *   - an even split supplies a weight of 1 per destination;
 *   - an authored percentage pool supplies basis points summing to 10,000;
 *   - a single obligation supplies the complementary pair [rate, 10000 - rate];
 *   - post-capacity redistribution supplies whatever the survivors weigh,
 *     which is legitimately less than 10,000.
 *
 * There is deliberately no check that the weights total 10,000. Requiring it
 * would make the fourth case impossible to express and would force weights to
 * be renormalised, which is not exact in integers. Validating an authored
 * percentage pool belongs to the Rule Engine, not to Money.
 *
 * This function knows nothing about buckets, priorities, capacities, rules or
 * eligibility. It receives an ordered array of integers and returns amounts in
 * the same order. Ordering is the caller's responsibility; the tie-break here
 * is purely positional.
 */
export function allocateByWeights(
  total: Money,
  weights: readonly number[],
): Result<readonly Money[], DomainError> {
  if (weights.length === 0) {
    return err(
      divisionError(
        ERROR_CODES.MONEY_DIVISION_EMPTY_WEIGHTS,
        'Money cannot be divided without at least one destination.',
        'Received an empty weight list.',
      ),
    );
  }

  for (const weight of weights) {
    if (!Number.isSafeInteger(weight) || weight < 0) {
      return err(
        divisionError(
          ERROR_CODES.MONEY_DIVISION_INVALID_WEIGHT,
          'Every weight must be a whole number that is zero or greater.',
          `Received ${String(weight)}.`,
        ),
      );
    }
  }

  const denominator = totalWeight(weights);

  if (denominator < 1n) {
    return err(
      divisionError(
        ERROR_CODES.MONEY_DIVISION_ZERO_TOTAL_WEIGHT,
        'Money cannot be divided when every destination has a weight of zero.',
        'The supplied weights total zero.',
      ),
    );
  }

  if (total.cents < 0) {
    return err(
      divisionError(
        ERROR_CODES.MONEY_DIVISION_NEGATIVE_TOTAL,
        'A negative amount cannot be divided proportionally.',
        'Divide the absolute amount and negate the results.',
      ),
    );
  }

  /*
   * BigInt is confined to this kernel. It keeps the intermediate products
   * exact regardless of the guard below, and never crosses a boundary: every
   * value returned from this function is a number.
   */
  const totalCents = BigInt(total.cents);

  if (totalCents * denominator > BigInt(Number.MAX_SAFE_INTEGER)) {
    return err(
      divisionError(
        ERROR_CODES.MONEY_DIVISION_UNSAFE_PRODUCT,
        'That amount and those weights are too large to divide exactly.',
        `${String(total.cents)} cents by weight sum ${String(denominator)} is out of range.`,
      ),
    );
  }

  const bases: number[] = [];
  const remainders: bigint[] = [];

  for (const weight of weights) {
    const numerator = totalCents * BigInt(weight);
    bases.push(Number(numerator / denominator));
    remainders.push(numerator % denominator);
  }

  let assigned = 0;
  for (const base of bases) {
    assigned += base;
  }

  /*
   * Each share falls short of its exact value by less than one cent, so the
   * residual is always smaller than the number of destinations. Exactly
   * `residual` destinations receive one extra cent and none needs two, which
   * is what makes the output total the input total exactly.
   */
  const residual = total.cents - assigned;

  const ranking = remainders.map((remainder, index) => ({ remainder, index }));
  ranking.sort((left, right) => {
    if (left.remainder > right.remainder) {
      return -1;
    }
    if (left.remainder < right.remainder) {
      return 1;
    }
    return left.index - right.index;
  });

  const receivesExtraCent = new Set<number>();
  for (let position = 0; position < residual; position += 1) {
    const entry = ranking[position];
    if (entry !== undefined) {
      receivesExtraCent.add(entry.index);
    }
  }

  const shares = bases.map((base, index) =>
    Object.freeze({
      cents: base + (receivesExtraCent.has(index) ? 1 : 0),
      currency: total.currency,
    }),
  );

  return ok(Object.freeze(shares));
}
