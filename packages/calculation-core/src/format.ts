import { Rational, createRational, mul, abs } from './rational';

export type RoundingMode = 'half-up' | 'truncate';

/**
 * Formats a Rational to a fixed-decimal string with pure BigInt arithmetic.
 * NEVER uses parseFloat, Math.round, or Number arithmetic.
 */
export function formatDecimal(
  r: Rational,
  precision: number = 4,
  rounding: RoundingMode = 'half-up'
): string {
  if (precision < 0) precision = 0;
  if (precision > 20) precision = 20;

  const isNeg = r.n < 0n;
  const num = r.n < 0n ? -r.n : r.n;
  const den = r.d;

  if (num === 0n) {
    return precision > 0 ? '0.' + '0'.repeat(precision) : '0';
  }

  // To round to `precision` decimals:
  // We compute (num * 10^precision) / den and inspect the remainder
  const scale = 10n ** BigInt(precision);
  let scaledNum = num * scale;
  let quotient = scaledNum / den;
  const remainder = scaledNum % den;

  if (rounding === 'half-up') {
    // If remainder * 2 >= den, round up
    if (remainder * 2n >= den) {
      quotient += 1n;
    }
  }

  // quotient now contains the integer representation of the rounded scaled value
  // e.g., if precision = 4, quotient = 123456 -> "12.3456"
  const quotientStr = quotient.toString();
  let result = '';

  if (precision === 0) {
    result = quotientStr;
  } else {
    if (quotientStr.length <= precision) {
      const padded = quotientStr.padStart(precision, '0');
      result = '0.' + padded;
    } else {
      const wholePart = quotientStr.slice(0, quotientStr.length - precision);
      const fracPart = quotientStr.slice(quotientStr.length - precision);
      result = wholePart + '.' + fracPart;
    }
  }

  return (isNeg ? '-' : '') + result;
}

/**
 * Formats a Rational as an exact fraction string, e.g. "3/8" or "15"
 */
export function formatFraction(r: Rational): string {
  if (r.d === 1n) {
    return r.n.toString();
  }
  return `${r.n.toString()}/${r.d.toString()}`;
}

/**
 * Formats 100-based share: share * 100
 */
export function format100Based(r: Rational, precision: number = 4): string {
  const scaled = mul(r, createRational(100n, 1n));
  return formatDecimal(scaled, precision);
}

/**
 * Formats 1000-based share: share * 1000
 */
export function format1000Based(r: Rational, precision: number = 4): string {
  const scaled = mul(r, createRational(1000n, 1n));
  return formatDecimal(scaled, precision);
}

/**
 * Formats percentage: share * 100 with "%" suffix
 */
export function formatPercentage(r: Rational, precision: number = 4): string {
  return `${format100Based(r, precision)}%`;
}

/**
 * Detects repeating decimals using long-division remainder cycle detection.
 * Returns { isRepeating: boolean, integerPart: string, nonRepeating: string, repeating: string }
 */
export function formatRepeating(r: Rational, maxDigits: number = 30): {
  isRepeating: boolean;
  representation: string;
} {
  const isNeg = r.n < 0n;
  const num = abs(r).n;
  const den = r.d;

  const intPart = (num / den).toString();
  let rem = num % den;

  if (rem === 0n) {
    return {
      isRepeating: false,
      representation: (isNeg ? '-' : '') + intPart,
    };
  }

  // Remainder to index in digits
  const seenRemainders = new Map<string, number>();
  const digits: string[] = [];

  while (rem !== 0n && digits.length < maxDigits) {
    const remKey = rem.toString();
    if (seenRemainders.has(remKey)) {
      const repeatStart = seenRemainders.get(remKey)!;
      const nonRep = digits.slice(0, repeatStart).join('');
      const rep = digits.slice(repeatStart).join('');
      return {
        isRepeating: true,
        representation: `${isNeg ? '-' : ''}${intPart}.${nonRep}(${rep})`,
      };
    }

    seenRemainders.set(remKey, digits.length);
    rem *= 10n;
    const d = rem / den;
    digits.push(d.toString());
    rem = rem % den;
  }

  // Non-repeating or exceeded maxDigits
  return {
    isRepeating: false,
    representation: `${isNeg ? '-' : ''}${intPart}.${digits.join('')}`,
  };
}
