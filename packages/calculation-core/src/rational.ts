import { Rational, SerializedRational } from './types';
export type { Rational, SerializedRational };

/**
 * Computes the greatest common divisor of two BigInt numbers.
 * Invariant: returns positive BigInt (or 0n if both are 0n).
 */
export function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x;
}

/**
 * Creates a normalized Rational from BigInt or string/number inputs.
 * Normalization guarantees:
 * 1. Denominator d > 0n
 * 2. gcd(|n|, d) === 1n
 * 3. 0 is uniquely represented as 0n / 1n
 */
export function createRational(
  numerator: bigint | number | string,
  denominator: bigint | number | string = 1n
): Rational {
  let n = typeof numerator === 'bigint' ? numerator : BigInt(String(numerator).trim());
  let d = typeof denominator === 'bigint' ? denominator : BigInt(String(denominator).trim());

  if (d === 0n) {
    throw new Error('Division by zero: denominator cannot be zero in Rational.');
  }

  if (d < 0n) {
    n = -n;
    d = -d;
  }

  if (n === 0n) {
    return { n: 0n, d: 1n };
  }

  const g = gcd(n, d);
  return {
    n: n / g,
    d: d / g,
  };
}

export const ZERO: Rational = Object.freeze({ n: 0n, d: 1n });
export const ONE: Rational = Object.freeze({ n: 1n, d: 1n });

export function add(a: Rational, b: Rational): Rational {
  // a.n/a.d + b.n/b.d = (a.n * b.d + b.n * a.d) / (a.d * b.d)
  if (a.n === 0n) return b;
  if (b.n === 0n) return a;
  const num = a.n * b.d + b.n * a.d;
  const den = a.d * b.d;
  return createRational(num, den);
}

export function sub(a: Rational, b: Rational): Rational {
  if (b.n === 0n) return a;
  const num = a.n * b.d - b.n * a.d;
  const den = a.d * b.d;
  return createRational(num, den);
}

export function mul(a: Rational, b: Rational): Rational {
  if (a.n === 0n || b.n === 0n) return ZERO;
  const num = a.n * b.n;
  const den = a.d * b.d;
  return createRational(num, den);
}

export function div(a: Rational, b: Rational): Rational {
  if (b.n === 0n) {
    throw new Error('Division by zero: cannot divide by zero Rational.');
  }
  if (a.n === 0n) return ZERO;
  const num = a.n * b.d;
  const den = a.d * b.n;
  return createRational(num, den);
}

export function neg(a: Rational): Rational {
  if (a.n === 0n) return ZERO;
  return { n: -a.n, d: a.d };
}

export function abs(a: Rational): Rational {
  if (a.n >= 0n) return a;
  return { n: -a.n, d: a.d };
}

export function inv(a: Rational): Rational {
  if (a.n === 0n) {
    throw new Error('Inverse of zero does not exist.');
  }
  return createRational(a.d, a.n);
}

export function cmp(a: Rational, b: Rational): number {
  // a.n/a.d cmp b.n/b.d <=> a.n * b.d cmp b.n * a.d
  const diff = a.n * b.d - b.n * a.d;
  if (diff < 0n) return -1;
  if (diff > 0n) return 1;
  return 0;
}

export function eq(a: Rational, b: Rational): boolean {
  return a.n === b.n && a.d === b.d;
}

export function lt(a: Rational, b: Rational): boolean {
  return cmp(a, b) < 0;
}

export function lte(a: Rational, b: Rational): boolean {
  return cmp(a, b) <= 0;
}

export function gt(a: Rational, b: Rational): boolean {
  return cmp(a, b) > 0;
}

export function gte(a: Rational, b: Rational): boolean {
  return cmp(a, b) >= 0;
}

export function isZero(a: Rational): boolean {
  return a.n === 0n;
}

export function isPositive(a: Rational): boolean {
  return a.n > 0n;
}

export function isNegative(a: Rational): boolean {
  return a.n < 0n;
}

export function serializeRational(r: Rational): SerializedRational {
  return {
    n: r.n.toString(),
    d: r.d.toString(),
  };
}

export function deserializeRational(s: SerializedRational): Rational {
  return createRational(BigInt(s.n), BigInt(s.d));
}
