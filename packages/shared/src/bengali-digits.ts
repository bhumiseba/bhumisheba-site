/**
 * Bengali digit conversion and input normalization utilities
 * Ensures 100% Bengali digits across the entire application.
 */

const EN_TO_BN_MAP: Record<string, string> = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

const BN_TO_EN_MAP: Record<string, string> = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
  '৷': '.',
  '।': '.',
};

/**
 * Normalizes user text for BigInt parsing:
 * Converts all Bengali digits (০-৯) to ASCII digits (0-9).
 */
export function normalizeUserInput(text: string): string {
  if (!text) return '';
  let cleaned = text.normalize('NFC').trim();
  cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, '');

  let result = '';
  for (const char of cleaned) {
    if (BN_TO_EN_MAP[char] !== undefined) {
      result += BN_TO_EN_MAP[char];
    } else {
      result += char;
    }
  }
  return result;
}

/**
 * Converts an ASCII number or string into 100% Bengali digits (০-৯).
 * Non-digit characters remain intact.
 */
export function toBengaliDigits(input: string | number | bigint): string {
  if (input === null || input === undefined) return '';
  const str = input.toString();
  let result = '';
  for (const char of str) {
    if (EN_TO_BN_MAP[char] !== undefined) {
      result += EN_TO_BN_MAP[char];
    } else {
      result += char;
    }
  }
  return result;
}

/**
 * Alias for toBengaliDigits.
 */
export const toBn = toBengaliDigits;

/**
 * Converts Bengali digits in string to ASCII digits.
 */
export function toAsciiDigits(input: string): string {
  return normalizeUserInput(input);
}

/**
 * Formats a formatted numeric string to 100% Bengali digits.
 */
export function formatDisplayNumber(value: string | number | bigint, locale: 'bn' | 'en' = 'bn'): string {
  // Enforcing 100% Bengali numbers per project requirement
  return toBengaliDigits(value);
}
