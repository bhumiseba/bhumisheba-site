import { Rational, ZERO, add, mul, div, eq } from './rational';

/**
 * Exactly allocates a total quantity among beneficiaries proportional to their weights.
 * Formula: a_i = total * (w_i / sum_weights)
 * Invariant: sum(a_i) === total exactly.
 */
export function allocateProportional(total: Rational, weights: readonly Rational[]): Rational[] {
  if (weights.length === 0) return [];
  if (weights.length === 1) return [total];

  let sumWeights = ZERO;
  for (const w of weights) {
    sumWeights = add(sumWeights, w);
  }

  if (eq(sumWeights, ZERO)) {
    return weights.map(() => ZERO);
  }

  return weights.map((w) => mul(total, div(w, sumWeights)));
}

/**
 * Largest-Remainder Method (Hare-Niemeyer) for display-only rounding adjustments.
 * Clearly labeled display-only per Decision D-04 & UI spec.
 */
export function allocateLargestRemainder(
  totalDisplayUnits: bigint,
  shares: readonly Rational[]
): bigint[] {
  if (shares.length === 0) return [];

  // Compute unrounded integer floors and fractional remainders
  const floors: bigint[] = [];
  const remainders: { index: number; rem: Rational }[] = [];

  let sumFloor = 0n;

  for (let i = 0; i < shares.length; i++) {
    const s = shares[i];
    // Exact multiplied amount: s * totalDisplayUnits
    const scaledNum = s.n * totalDisplayUnits;
    const scaledDen = s.d;
    const floor = scaledNum / scaledDen;
    const remNum = scaledNum % scaledDen;

    floors.push(floor);
    sumFloor += floor;
    remainders.push({
      index: i,
      rem: { n: remNum, d: scaledDen },
    });
  }

  const deficit = totalDisplayUnits - sumFloor;
  if (deficit > 0n) {
    // Sort descending by remainder
    remainders.sort((a, b) => {
      // a.rem > b.rem <=> a.rem.n * b.rem.d > b.rem.n * a.rem.d
      const diff = a.rem.n * b.rem.d - b.rem.n * a.rem.d;
      if (diff > 0n) return -1;
      if (diff < 0n) return 1;
      return 0;
    });

    const toAdd = Number(deficit);
    for (let k = 0; k < toAdd && k < remainders.length; k++) {
      floors[remainders[k].index] += 1n;
    }
  }

  return floors;
}
