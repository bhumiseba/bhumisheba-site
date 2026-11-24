import { Rational, createRational, ZERO } from './rational';

export class RationalParseError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'RationalParseError';
  }
}

/**
 * Parses an ASCII string into an exact BigInt Rational without floating point.
 * Supported formats:
 * - Integer: "12", "-5", "0"
 * - Decimal: "12.345", "-0.004", ".75"
 * - Fraction: "3/8", "-5/12"
 * - Mixed Fraction: "1 3/8", "-2 1/4"
 */
export function parseRational(input: string): Rational {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new RationalParseError('ইনপুট খালি রাখা যাবে না', 'EMPTY_INPUT');
  }

  // Prevent denial-of-service / excessive digit length (D-11 limit: max 40 digits)
  if (trimmed.length > 60) {
    throw new RationalParseError('সংখ্যার দৈর্ঘ্য অতিরিক্ত বড়', 'INPUT_TOO_LONG');
  }

  // Check for mixed fraction: e.g. "1 3/8" or "-2 1/4"
  const spaceParts = trimmed.split(/\s+/);
  if (spaceParts.length === 2) {
    const wholeStr = spaceParts[0];
    const fracStr = spaceParts[1];
    if (!fracStr.includes('/')) {
      throw new RationalParseError('মিশ্র ভগ্নাংশের ফরম্যাট সঠিক নয় (যেমন: ১ ৩/৮)', 'INVALID_MIXED_FRACTION');
    }
    const isNegative = wholeStr.startsWith('-');
    const cleanWholeStr = isNegative ? wholeStr.slice(1) : wholeStr;
    const wholeVal = parseInteger(cleanWholeStr);
    const fracVal = parseFraction(fracStr);

    if (fracVal.n < 0n) {
      throw new RationalParseError('মিশ্র ভগ্নাংশে ঋণাত্মক অংশ গ্রহণযোগ্য নয়', 'NEGATIVE_FRACTION_PART');
    }

    const totalNum = wholeVal * fracVal.d + fracVal.n;
    const finalNum = isNegative ? -totalNum : totalNum;
    return createRational(finalNum, fracVal.d);
  }

  // Check for simple fraction: "3/8"
  if (trimmed.includes('/')) {
    return parseFraction(trimmed);
  }

  // Check for decimal: "12.345" or ".75"
  if (trimmed.includes('.')) {
    return parseDecimal(trimmed);
  }

  // Plain integer
  const intVal = parseInteger(trimmed);
  return createRational(intVal, 1n);
}

function parseInteger(str: string): bigint {
  if (!/^-?\d+$/.test(str)) {
    throw new RationalParseError(`অকার্যকর পূর্ণসংখ্যা: ${str}`, 'INVALID_INTEGER');
  }
  return BigInt(str);
}

function parseFraction(str: string): Rational {
  const parts = str.split('/');
  if (parts.length !== 2) {
    throw new RationalParseError(`অকার্যকর ভগ্নাংশ: ${str}`, 'INVALID_FRACTION');
  }
  const numStr = parts[0].trim();
  const denStr = parts[1].trim();

  if (!/^-?\d+$/.test(numStr) || !/^-?\d+$/.test(denStr)) {
    throw new RationalParseError(`ভগ্নাংশের লব ও হর সংখ্যা হতে হবে: ${str}`, 'INVALID_FRACTION_PARTS');
  }

  const num = BigInt(numStr);
  const den = BigInt(denStr);

  if (den === 0n) {
    throw new RationalParseError('ভগ্নাংশের হর শূন্য (০) হতে পারে না', 'ZERO_DENOMINATOR');
  }

  return createRational(num, den);
}

/**
 * Pure BigInt decimal string parser.
 * "12.345" -> 12345 / 1000
 * "-0.05" -> -5 / 100
 * ".5" -> 5 / 10
 */
function parseDecimal(str: string): Rational {
  const parts = str.split('.');
  if (parts.length !== 2) {
    throw new RationalParseError(`অকার্যকর দশমিক সংখ্যা: ${str}`, 'INVALID_DECIMAL');
  }

  let wholeStr = parts[0].trim();
  const fracStr = parts[1].trim();

  if (fracStr.length === 0) {
    throw new RationalParseError(`দশমিকের পর কোনো সংখ্যা নেই: ${str}`, 'EMPTY_DECIMAL_PART');
  }

  if (!/^\d+$/.test(fracStr)) {
    throw new RationalParseError(`দশমিকের অংশে শুধু অংক থাকবে: ${str}`, 'INVALID_DECIMAL_DIGITS');
  }

  let isNegative = false;
  if (wholeStr.startsWith('-')) {
    isNegative = true;
    wholeStr = wholeStr.slice(1);
  } else if (wholeStr.startsWith('+')) {
    wholeStr = wholeStr.slice(1);
  }

  if (wholeStr.length > 0 && !/^\d+$/.test(wholeStr)) {
    throw new RationalParseError(`পূর্ণসংখ্যা অংশে অকার্যকর চিহ্ন: ${str}`, 'INVALID_WHOLE_PART');
  }

  const whole = wholeStr.length > 0 ? BigInt(wholeStr) : 0n;
  const decimalsCount = BigInt(fracStr.length);
  const denominator = 10n ** decimalsCount;
  const fractionNum = BigInt(fracStr);

  const numerator = whole * denominator + fractionNum;
  return createRational(isNegative ? -numerator : numerator, denominator);
}
